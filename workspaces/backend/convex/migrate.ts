import { parseRemoteCharacterFields } from "../data/character.ts"
import { mutation } from "./_generated/server"

export default mutation(async (ctx, args) => {
	for await (const character of ctx.db.query("characters")) {
		const fields = parseRemoteCharacterFields(character)
		await ctx.db.replace(character._id, {
			ownerId: character.ownerId,
			roomId: character.roomId,
			fields,
		})
	}
})
