import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { omit } from "es-toolkit"
import type { Id } from "../_generated/dataModel"
import { mutation, query, type QueryCtx } from "../_generated/server"
import { ensureAuthUserId } from "../auth.ts"
import { ensureDoc } from "../db.ts"
import schema from "../schema.ts"

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

export const listOwned = query({
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
	args: omit(schema.tables.characters.validator.fields, ["ownerId"]),
	handler: async (ctx, args) => {
		const userId = await ensureAuthUserId(ctx)
		return await ctx.db.insert("characters", {
			...args,
			ownerId: userId,
		})
	},
})

export const update = mutation({
	args: {
		id: v.id("characters"),
		data: v.object(
			partial(omit(schema.tables.characters.validator.fields, ["ownerId"])),
		),
	},
	handler: async (ctx, args) => {
		await ensureViewerOwnedCharacter(ctx, args.id)
		await ctx.db.patch(args.id, args.data)
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
		return await ctx.db.insert("characters", {
			...omit(character, ["_id", "_creationTime"]),
			name: `${character.name} (copy)`,
			ownerId: character.ownerId,
		})
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
