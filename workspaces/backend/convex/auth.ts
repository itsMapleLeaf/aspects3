import Discord from "@auth/core/providers/discord"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import type { QueryCtx } from "./_generated/server"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Discord],
})

export async function ensureAuthUserId(ctx: QueryCtx) {
	const userId = await getAuthUserId(ctx)
	if (!userId) throw new Error("Not logged in")
	return userId
}
