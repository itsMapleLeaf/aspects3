import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { characterFieldsValidator } from "../data/character.ts"

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
		ownerId: v.id("users"),
		roomId: v.optional(v.union(v.id("rooms"), v.null())),
		fields: characterFieldsValidator,
	})
		.index("ownerId", ["ownerId", "fields.name"])
		.index("ownerId_key", ["ownerId", "fields.key", "fields.name"])
		.index("roomId", ["roomId", "fields.name"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.id("users"),
	})
		.index("ownerId", ["ownerId", "name"])
		.index("slug", ["slug", "name"]),
})
