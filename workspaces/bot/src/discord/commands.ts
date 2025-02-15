import * as Discord from "discord.js"
import type { Except } from "type-fest"
import { logger } from "../logger.ts"
import type { InteractionRoute } from "./interactions.ts"

export interface Command {
	readonly data: Discord.ApplicationCommandData
	handle: (
		interaction: Discord.CommandInteraction | Discord.AutocompleteInteraction,
	) => Promise<void>
}

export class CommandRouter implements InteractionRoute {
	readonly #commands = new Map<string, Command>()

	use(command: Command) {
		this.#commands.set(command.data.name, command)
		return this
	}

	attach(client: Discord.Client) {
		client.on("ready", async (readyClient) => {
			await this.registerApplicationCommands(readyClient)
		})
		return this
	}

	async registerApplicationCommands(client: Discord.Client<true>) {
		await client.application.commands.set(
			Array.from(this.#commands.values()).flatMap((route) => route.data),
		)
	}

	async handle(interaction: Discord.Interaction) {
		if (!interaction.isCommand() && !interaction.isAutocomplete()) return

		const command = this.#commands.get(interaction.commandName)

		const log = logger.child({
			commandName: interaction.commandName,
			userId: interaction.user.id,
		})

		if (!command) {
			log.error("Command not found")
			return
		}

		log.info("Running command")
		const now = performance.now()
		try {
			await command.handle(interaction)
		} catch (error) {
			log.error(error, "Command failed")
		} finally {
			log.info({ duration: performance.now() - now }, "Command completed")
		}
	}
}

export interface SlashCommandArgs
	extends Except<Discord.ChatInputApplicationCommandData, "type" | "options"> {
	handler: (interaction: Discord.CommandInteraction) => Promise<void>
}

export class SlashCommand implements Command {
	readonly args

	constructor(args: SlashCommandArgs) {
		this.args = args
	}

	get data(): Discord.ApplicationCommandData {
		return {
			...this.args,
			type: Discord.ApplicationCommandType.ChatInput,
		}
	}

	async handle(
		interaction: Discord.CommandInteraction | Discord.AutocompleteInteraction,
	) {
		if (interaction.isCommand()) {
			await this.args.handler(interaction)
		} else {
			throw new Error("Invalid interaction type")
		}
	}
}
