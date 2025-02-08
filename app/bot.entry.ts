import * as Discord from "discord.js"
import { addCommands } from "./bot/commands.ts"
import { createInteractionRouter } from "./lib/interactions/router.ts"
import { console } from "./lib/logger.ts"

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
	console.error("Please set the DISCORD_BOT_TOKEN environment variable.")
	process.exit(1)
}

const router = createInteractionRouter()
addCommands(router)

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
	}
})

client.login(token)
