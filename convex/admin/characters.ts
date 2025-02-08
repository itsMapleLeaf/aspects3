import { createAccount, retrieveAccount } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { invariant } from "es-toolkit"
import { CharacterSchema } from "../../app/data/characters.zod.ts"
import { internal } from "../_generated/api"
import type { DataModel } from "../_generated/dataModel"
import { internalMutation } from "../_generated/server"
import schema from "../schema.ts"
import { adminAction, adminQuery } from "./utils.lib.ts"

export const saveByUrl = adminAction({
	args: {
		discordUser: v.object({
			username: v.string(),
			displayName: v.string(),
		}),
		url: v.string(),
	},
	handler: async (ctx, { discordUser, url }) => {
		let auth = await retrieveAccount(ctx, {
			provider: "discord",
			account: { id: discordUser.username },
		})

		if (!auth) {
			auth = await createAccount<DataModel>(ctx, {
				provider: "discord",
				account: { id: discordUser.username },
				profile: { name: discordUser.displayName },
			})
		}

		const encoded = new URL(url).searchParams.get("data")
		invariant(encoded, "No data found in url")

		const decoded = atob(encoded)
		const parsed = JSON.parse(decoded)
		const validateResult = await CharacterSchema["~validate"](parsed)
		if (validateResult.issues) {
			throw new Error("Invalid character data", {
				cause: validateResult.issues,
			})
		}

		await ctx.runMutation(internal.admin.characters.upsertByOwner, {
			character: {
				...validateResult.value,
				ownerId: auth.user._id,
			},
		})
	},
})

export const upsertByOwner = internalMutation({
	args: {
		character: schema.tables.characters.validator,
	},
	handler: async (ctx, { character }) => {
		const existing = await ctx.db
			.query("characters")
			.withIndex("ownerId_name", (q) =>
				q.eq("ownerId", character.ownerId).eq("name", character.name),
			)
			.first()

		if (existing) {
			await ctx.db.replace(existing._id, character)
		} else {
			await ctx.db.insert("characters", character)
		}
	},
})

export const getLatestByOwner = adminQuery({
	args: {
		discordUser: v.object({
			username: v.string(),
			displayName: v.string(),
		}),
	},
	handler: async (ctx, { discordUser }) => {
		const account = await ctx.db
			.query("authAccounts")
			.withIndex("providerAndAccountId", (q) =>
				q
					.eq("provider", "discord")
					.eq("providerAccountId", discordUser.username),
			)
			.first()

		if (!account) return null

		return await ctx.db
			.query("characters")
			.withIndex("ownerId_name", (q) => q.eq("ownerId", account.userId))
			.order("desc")
			.first()
	},
})
