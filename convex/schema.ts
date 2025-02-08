import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	...authTables,

	users: defineTable({
		...authTables.users.validator.fields,
		discordUsername: v.optional(v.string()),
	})
		.index("email", ["email"])
		.index("phone", ["phone"]),

	characters: defineTable({
		ownerId: v.id("users"),
		name: v.string(),
		details: v.string(),
		attributes: v.record(v.string(), v.string()),
		hits: v.string(),
		fatigue: v.string(),
		comeback: v.string(),
		traits: v.array(v.string()),
		proficientSkills: v.array(v.string()),
		aspects: v.record(v.string(), v.string()),
		imageUrl: v.string(),
	})
		.index("ownerId", ["ownerId"])
		.index("ownerId_name", ["ownerId", "name"]),
})
