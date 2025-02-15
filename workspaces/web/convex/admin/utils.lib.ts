import {
	customAction,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions"
import { v } from "convex/values"
import { action, mutation, query } from "../_generated/server"

function customFunctionConfig<Ctx, Args extends { adminSecret: string }>() {
	return {
		args: {
			adminSecret: v.string(),
		},
		input: async (ctx: Ctx, { adminSecret, ...args }: Args) => {
			checkAdminSecret(adminSecret)
			return { ctx, args }
		},
	}
}

function checkAdminSecret(adminSecret: string) {
	if (adminSecret !== process.env.ADMIN_SECRET) {
		throw new Error("Unauthorized")
	}
}

export const adminQuery = customQuery(query, customFunctionConfig())
export const adminMutation = customMutation(mutation, customFunctionConfig())
export const adminAction = customAction(action, customFunctionConfig())
