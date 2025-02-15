import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { omit, startCase } from "es-toolkit"
import { adjective, noun, spaceSlug } from "space-slug"
import { toSlug } from "../../app/lib/utils.ts"
import type { Id } from "../_generated/dataModel"
import { mutation, query, type QueryCtx } from "../_generated/server"
import { ensureAuthUserId } from "../auth.ts"
import { ensureDoc } from "../db.ts"
import schema from "../schema.ts"

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("rooms")
			.withIndex("slug", (q) => q.eq("slug", args.slug))
			.first()
	},
})

export const listOwned = query({
	handler: async (ctx) => {
		try {
			const userId = await ensureAuthUserId(ctx)
			return await ctx.db
				.query("rooms")
				.withIndex("ownerId", (q) => q.eq("ownerId", userId))
				.collect()
		} catch (error) {
			console.warn(error)
			return []
		}
	},
})

export const create = mutation({
	handler: async (ctx) => {
		const userId = await ensureAuthUserId(ctx)

		const name = spaceSlug([adjective(), adjective(), noun()], {
			separator: " ",
			transform: startCase,
		})

		const slug = toSlug(name)

		await ctx.db.insert("rooms", {
			name,
			slug,
			ownerId: userId,
		})

		return slug
	},
})

export const update = mutation({
	args: {
		id: v.id("rooms"),
		data: v.object(
			partial(omit(schema.tables.rooms.validator.fields, ["ownerId"])),
		),
	},
	handler: async (ctx, args) => {
		await ensureViewerOwnedRoom(ctx, args.id)
		await ctx.db.patch(args.id, args.data)
	},
})

export { delete_ as delete }
const delete_ = mutation({
	args: {
		id: v.id("rooms"),
	},
	handler: async (ctx, args) => {
		await ensureViewerOwnedRoom(ctx, args.id)
		await ctx.db.delete(args.id)
	},
})

async function ensureViewerOwnedRoom(ctx: QueryCtx, roomId: Id<"rooms">) {
	const userId = await ensureAuthUserId(ctx)
	const room = await ensureDoc(ctx, roomId)
	if (userId !== room.ownerId) throw new Error("Unauthorized")
	return { room, userId }
}
