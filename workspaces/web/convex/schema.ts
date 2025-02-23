import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	...authTables,

	users: defineTable({
		...authTables.users.validator.fields,
		discordUsername: v.optional(v.string()),
		guildCharacters: v.optional(
			v.record(
				v.string(), // discord guild id
				v.id("characters"),
			),
		),
	})
		.index("email", ["email"])
		.index("phone", ["phone"]),

	characters: defineTable({
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
		key: v.string(), // client-defined key for consistent upsert
		ownerId: v.id("users"),
		roomId: v.optional(v.union(v.id("rooms"), v.null())),
	})
		.index("ownerId", ["ownerId"])
		.index("ownerId_name", ["ownerId", "name"])
		.index("ownerId_key", ["ownerId", "key"])
		.index("roomId", ["roomId", "name"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.id("users"),
	})
		.index("ownerId", ["ownerId"])
		.index("slug", ["slug"]),
})
