import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import {
	characterFieldsValidator,
	parseRemoteCharacterFields,
} from "../../data/character.ts"
import type { Id } from "../_generated/dataModel"
import { mutation, query, type QueryCtx } from "../_generated/server"
import { ensureAuthUserId } from "../auth.ts"
import { ensureDoc } from "../db.ts"

export const get = query({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		try {
			const id = ctx.db.normalizeId("characters", args.id)
			if (!id) return null
			const { character } = await ensureViewerOwnedCharacter(ctx, id)
			return character
		} catch (error) {
			console.warn(error)
			return null
		}
	},
})

export const getByKey = query({
	args: {
		key: v.string(),
	},
	handler: async (ctx, args) => {
		try {
			const userId = await ensureAuthUserId(ctx)
			return await ctx.db
				.query("characters")
				.withIndex("ownerId_key", (q) =>
					q.eq("ownerId", userId).eq("fields.key", args.key),
				)
				.first()
		} catch (error) {
			console.warn(error)
			return null
		}
	},
})

export const getFallback = query({
	args: {},
	handler: async (ctx) => {
		try {
			const userId = await ensureAuthUserId(ctx)
			return await ctx.db
				.query("characters")
				.withIndex("ownerId_name", (q) => q.eq("ownerId", userId))
				.first()
		} catch (error) {
			console.warn(error)
			return null
		}
	},
})

export const listOwned = query({
	args: {},
	handler: async (ctx) => {
		try {
			const userId = await ensureAuthUserId(ctx)
			return await ctx.db
				.query("characters")
				.withIndex("ownerId_name", (q) => q.eq("ownerId", userId))
				.collect()
		} catch (error) {
			console.warn(error)
			return []
		}
	},
})

export const create = mutation({
	args: characterFieldsValidator,
	handler: async (ctx, args) => {
		const userId = await ensureAuthUserId(ctx)
		return await ctx.db.insert("characters", {
			ownerId: userId,
			fields: args,
		})
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		data: v.object(partial(characterFieldsValidator.fields)),
		roomId: v.optional(v.id("rooms")),
	},
	handler: async (ctx, { id, data, ...patch }) => {
		const { character } = await ensureViewerOwnedCharacter(ctx, id)
		await ctx.db.patch(id, {
			fields: { ...parseRemoteCharacterFields(character), ...data, ...patch },
		})
	},
})

export const upsert = mutation({
	args: characterFieldsValidator,
	handler: async (ctx, args) => {
		const userId = await ensureAuthUserId(ctx)

		const existing = await ctx.db
			.query("characters")
			.withIndex("ownerId_key", (q) =>
				q.eq("ownerId", userId).eq("fields.key", args.key),
			)
			.first()

		if (existing) {
			await ctx.db.patch(existing._id, {
				fields: args,
			})
		} else {
			await ctx.db.insert("characters", {
				ownerId: userId,
				fields: args,
			})
		}
	},
})

export { delete_ as delete }
const delete_ = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		await ensureViewerOwnedCharacter(ctx, args.id)
		await ctx.db.delete(args.id)
	},
})

export const clone = mutation({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const { character } = await ensureViewerOwnedCharacter(ctx, args.id)

		const newCharacter = {
			ownerId: character.ownerId,
			fields: {
				...parseRemoteCharacterFields(character),
				key: crypto.randomUUID(),
			},
		}

		const clonedId = await ctx.db.insert("characters", newCharacter)

		return {
			...newCharacter,
			_id: clonedId as Id<"characters">,
			_creationTime: Date.now(),
		}
	},
})

async function ensureViewerOwnedCharacter(
	ctx: QueryCtx,
	characterId: Id<"characters">,
) {
	const userId = await ensureAuthUserId(ctx)
	const character = await ensureDoc(ctx, characterId)
	if (userId !== character.ownerId) throw new Error("Unauthorized")
	return { character, userId }
}
