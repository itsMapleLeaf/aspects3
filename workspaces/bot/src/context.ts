import { api } from "@workspace/backend/convex/_generated/api.js"
import { parseRemoteCharacterFields } from "@workspace/backend/data/character.ts"
import { Character } from "@workspace/data/characters"
import { ConvexHttpClient } from "convex/browser"

type DiscordUser = {
	id: string
	username: string
	globalName: string | null
}

export interface CommandContext {
	findCharacterByUser: (args: {
		user: DiscordUser
		guild: { id: string }
	}) => Promise<Character | null>
	upsertUserWithCharacter: (args: {
		user: DiscordUser
		guild: { id: string }
		character: Character
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
			return character ? parseRemoteCharacterFields(character) : null
		},
		async upsertUserWithCharacter({ user, guild, character }) {
			console.log({ character })
			console.log({ validated: Character.assert(character) })
			await convex.action(api.admin.characters.save, {
				adminSecret,
				discordUser: {
					id: user.id,
					username: user.username,
					displayName: user.globalName || user.username,
				},
				discordGuildId: guild.id,
				// calling the validator to normalize the data, strip extra fields, and avoid arg validation errors
				character: Character.assert(character),
			})
		},
	}
}
