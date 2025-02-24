import { authTables } from "@convex-dev/auth/server"
import { deprecated } from "convex-helpers/validators"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { mapValues } from "es-toolkit"
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
		...mapValues(characterFieldsValidator.fields, () => deprecated),
		ownerId: v.id("users"),
		roomId: v.optional(v.union(v.id("rooms"), v.null())),
		fields: v.optional(characterFieldsValidator),
	})
		.index("ownerId", ["ownerId"])
		.index("ownerId_name", ["ownerId", "fields.name", "name"])
		.index("ownerId_key", ["ownerId", "fields.key", "fields.name", "name"])
		.index("roomId", ["roomId", "fields.name", "name"]),

	rooms: defineTable({
		name: v.string(),
		slug: v.string(),
		ownerId: v.id("users"),
	})
		.index("ownerId", ["ownerId"])
		.index("slug", ["slug"]),
})
