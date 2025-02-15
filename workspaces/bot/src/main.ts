import * as Discord from "discord.js"
import { addCommands } from "./commands.ts"
import { createConvexContext } from "./context.ts"
import { console } from "./logger.ts"
import { createInteractionRouter } from "./router.ts"

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
	console.error("Please set the DISCORD_BOT_TOKEN environment variable.")
	process.exit(1)
}

const router = createInteractionRouter()

addCommands(router, createConvexContext())

const client = new Discord.Client({
	intents: [],
})

client.on("ready", async (client) => {
	await router.registerCommands(client)
	console.info(
		`Logged in as ${client.user.displayName} (@${client.user.username})`,
	)
})

client.on("interactionCreate", async (interaction) => {
	try {
		await router.handle(interaction)
	} catch (error) {
		console.error("Failed to run command")
		console.error(error)

		if (interaction.isRepliable() && interaction.deferred) {
			await interaction.editReply("Sorry, something went wrong. Try again.")
		} else if (interaction.isRepliable() && !interaction.replied) {
			await interaction.reply("Sorry, something went wrong. Try again.")
		}
	}
})

client.login(token)
