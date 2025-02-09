import { ConvexError } from "convex/values"
import type { Id, TableNames } from "./_generated/dataModel"
import type { QueryCtx } from "./_generated/server"

export async function ensureDoc<TableName extends TableNames>(
	ctx: QueryCtx,
	id: Id<TableName>,
) {
	const doc = await ctx.db.get(id)
	if (!doc) {
		throw new ConvexError(`Failed to find document with ID "${id}"`)
	}
	return doc
}
