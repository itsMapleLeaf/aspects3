import { createAccount, retrieveAccount } from "@convex-dev/auth/server"
import { ConvexError, v } from "convex/values"
import { characterFieldsValidator } from "../../data/character.ts"
import { internal } from "../_generated/api"
import type { DataModel } from "../_generated/dataModel"
import { internalMutation } from "../_generated/server"
import { adminAction, adminQuery } from "./utils.lib.ts"

export const save = adminAction({
	args: {
		discordUser: v.object({
			id: v.string(),
			username: v.string(),
			displayName: v.string(),
		}),
		discordGuildId: v.string(),
		character: characterFieldsValidator,
	},
	handler: async (
		ctx,
		{ discordUser, discordGuildId, character: characterFields },
	) => {
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

		await ctx.runMutation(internal.admin.characters.saveMutation, {
			fields: characterFields,
			ownerId: auth.user._id,
			discordGuildId,
		})
	},
})

export const saveMutation = internalMutation({
	args: {
		fields: characterFieldsValidator,
		ownerId: v.id("users"),
		discordGuildId: v.string(),
	},
	handler: async (ctx, { ownerId, fields, discordGuildId }) => {
		const user = await ctx.db.get(ownerId)
		if (!user) {
			throw new ConvexError({
				message: `Character owner not found`,
				character: fields,
			})
		}

		const existing = await ctx.db
			.query("characters")
			.withIndex("ownerId_key", (q) =>
				q.eq("ownerId", ownerId).eq("fields.key", fields.key),
			)
			.first()

		let characterId
		if (existing) {
			await ctx.db.patch(existing._id, {
				fields,
				ownerId,
			})
			characterId = existing._id
		} else {
			characterId = await ctx.db.insert("characters", {
				ownerId,
				fields,
			})
		}

		await ctx.db.patch(user._id, {
			guildCharacters: {
				...user.guildCharacters,
				[discordGuildId]: characterId,
			},
		})
	},
})

export const getLatestByOwner = adminQuery({
	args: {
		discordUser: v.object({
			id: v.string(),
			username: v.string(),
			displayName: v.string(),
		}),
		discordGuildId: v.string(),
	},
	handler: async (ctx, { discordUser, discordGuildId }) => {
		const account = await ctx.db
			.query("authAccounts")
			.withIndex("providerAndAccountId", (q) =>
				q.eq("provider", "discord").eq("providerAccountId", discordUser.id),
			)
			.first()

		if (!account) return null

		const user = await ctx.db.get(account.userId)
		if (!user) return null

		const characterId = user.guildCharacters?.[discordGuildId]
		const character = characterId && (await ctx.db.get(characterId))
		if (character) return character

		// legacy: if the guild character ID isn't set, try to find the latest character owned by the user
		return await ctx.db
			.query("characters")
			.withIndex("ownerId", (q) => q.eq("ownerId", account.userId))
			.order("desc")
			.first()
	},
})
