import { api } from "@workspace/backend/convex/_generated/api.js"
import { type CharacterFields } from "@workspace/backend/data/character"
import { ConvexHttpClient } from "convex/browser"

interface DiscordUser {
	id: string
	username: string
	globalName: string | null
}

export interface CommandContext {
	findCharacterByUser: (args: {
		user: DiscordUser
		guild: { id: string }
	}) => Promise<CharacterFields | null>
	upsertUserWithCharacter: (args: {
		user: DiscordUser
		guild: { id: string }
		character: CharacterFields
	}) => Promise<void>
}

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
const adminSecret = process.env.ADMIN_SECRET as string

export function createConvexContext(): CommandContext {
	return {
		async findCharacterByUser({ user, guild }) {
			const character = await convex.query(
				api.admin.characters.getLatestByOwner,
				{
					adminSecret,
					discordUser: {
						id: user.id,
						username: user.username,
						displayName: user.globalName || user.username,
					},
					discordGuildId: guild.id,
				},
			)
			return character?.fields ?? null
		},
		async upsertUserWithCharacter({ user, guild, character }) {
			await convex.action(api.admin.characters.save, {
				adminSecret,
				discordUser: {
					id: user.id,
					username: user.username,
					displayName: user.globalName || user.username,
				},
				discordGuildId: guild.id,
				character,
			})
		},
	}
}
