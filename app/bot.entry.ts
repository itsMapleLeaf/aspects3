import * as Discord from "discord.js"
import { handleInteraction, registerCommands } from "./lib/bot-commands.ts"
import { console } from "./lib/logger.ts"

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
	console.error("Please set the DISCORD_BOT_TOKEN environment variable.")
	process.exit(1)
}

const client = new Discord.Client({
	intents: [],
})

client.on("ready", async (client) => {
	console.info("Registering commands")
	await registerCommands(client)
	console.info("Ready")
})

client.on("interactionCreate", async (interaction) => {
	try {
		await handleInteraction(interaction)
	} catch (error) {
		console.error("Failed to run command")
		console.error(error)
	}
})

client.login(token)
