import { createAccount, retrieveAccount } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { omit } from "es-toolkit"
import { internal } from "../_generated/api"
import type { DataModel } from "../_generated/dataModel"
import { internalMutation } from "../_generated/server"
import schema from "../schema.ts"
import { adminAction, adminQuery } from "./utils.lib.ts"

export const save = adminAction({
	args: {
		discordUser: v.object({
			id: v.string(),
			username: v.string(),
			displayName: v.string(),
		}),
		character: v.object(
			omit(schema.tables.characters.validator.fields, ["ownerId"]),
		),
	},
	handler: async (ctx, { discordUser, character }) => {
		let auth

		try {
			auth = await retrieveAccount(ctx, {
				provider: "discord",
				account: { id: discordUser.id },
			})
		} catch (error) {
			console.warn("retrieveAccount failed", error)
		}

		if (!auth) {
			auth = await createAccount<DataModel>(ctx, {
				provider: "discord",
				account: { id: discordUser.id },
				profile: {
					name: discordUser.displayName,
					discordUsername: discordUser.username,
				},
			})
		}

		await ctx.runMutation(internal.admin.characters.upsertByOwner, {
			character: {
				...character,
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
			id: v.string(),
			username: v.string(),
			displayName: v.string(),
		}),
	},
	handler: async (ctx, { discordUser }) => {
		const account = await ctx.db
			.query("authAccounts")
			.withIndex("providerAndAccountId", (q) =>
				q.eq("provider", "discord").eq("providerAccountId", discordUser.id),
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
