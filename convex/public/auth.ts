import { getAuthUserId } from "@convex-dev/auth/server"
import { pick } from "es-toolkit"
import { query } from "../_generated/server"

export const me = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		const user = userId && (await ctx.db.get(userId))
		return user && pick(user, ["name", "image"])
	},
})
