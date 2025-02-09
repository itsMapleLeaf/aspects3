import { ConvexHttpClient } from "convex/browser"
import { Character } from "~/data/characters.ts"
import { api } from "../../convex/_generated/api"

type DiscordUser = {
	id: string
	username: string
	globalName: string | null
}

export interface CommandContext {
	findCharacterByUser: (user: DiscordUser) => Promise<Character | null>
	upsertUserWithCharacter: (params: {
		user: DiscordUser
		character: Character
	}) => Promise<void>
}

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
const adminSecret = process.env.ADMIN_SECRET as string

export function createConvexContext(): CommandContext {
	return {
		async findCharacterByUser(user) {
			// calling the validator to normalize the data, strip extra fields, and avoid arg validation errors
			return Character.assert(
				await convex.query(api.admin.characters.getLatestByOwner, {
					adminSecret,
					discordUser: {
						id: user.id,
						username: user.username,
						displayName: user.globalName || user.username,
					},
				}),
			)
		},
		async upsertUserWithCharacter({ user, character }) {
			console.log({ character })
			console.log({ validated: Character.assert(character) })
			await convex.action(api.admin.characters.save, {
				adminSecret,
				discordUser: {
					id: user.id,
					username: user.username,
					displayName: user.globalName || user.username,
				},
				// calling the validator to normalize the data, strip extra fields, and avoid arg validation errors
				character: Character.assert(character),
			})
		},
	}
}
