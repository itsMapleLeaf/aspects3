import * as Discord from "discord.js"
import { logger } from "../logger.ts"

export type InteractionRouter = ReturnType<typeof createInteractionRouter>

export function createInteractionRouter() {
	const commands = new Map<string, ChatCommand>()

	return {
		command: (scope: ParentChatCommandScope) => {
			const command = createParentChatCommand(scope)
			commands.set(command.data.name, command)
		},

		registerCommands: async (client: Discord.Client<true>) => {
			const commandList = []

			for (const [name, command] of commands) {
				let isParent = false

				for (const option of command.data.options ?? []) {
					if (option.type === Discord.ApplicationCommandOptionType.Subcommand) {
						commandList.push(`/${name} ${option.name}`)
						isParent = true
					}
				}

				if (!isParent) {
					commandList.push(`/${name}`)
				}
			}

			logger.info(
				{ commands: commandList },
				`Registering ${commandList.length} commands`,
			)

			await client.application.commands.set(
				[...commands.values()].map((command) => command.data),
			)
		},

		handle: async (interaction: Discord.Interaction) => {
			if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
				const command = commands.get(interaction.commandName)
				if (!command) {
					logger.error({ interaction: interaction.toJSON() }, "Unknown command")
					return
				}

				await command.handle(interaction)
			}
		},
	}
}

type ChatCommand = {
	readonly data: Discord.ChatInputApplicationCommandData
	readonly handle: (
		interaction:
			| Discord.ChatInputCommandInteraction
			| Discord.AutocompleteInteraction,
	) => Promise<void>
}

type ChatCommandScope = (options: OptionCreatorMap) => {
	name: string
	description: string
	run: (interaction: Discord.ChatInputCommandInteraction) => Promise<void>
}

function createChatCommand(scope: ChatCommandScope): ChatCommand {
	const options = new Map<string, ChatCommandOption>()

	const { run, ...data } = scope({
		string: ({ autocomplete, ...data }) => {
			options.set(data.name, {
				data: { ...data, type: Discord.ApplicationCommandOptionType.String },
				autocomplete,
			})
		},
		number: ({ autocomplete, ...data }) => {
			options.set(data.name, {
				data: { ...data, type: Discord.ApplicationCommandOptionType.Number },
				autocomplete,
			})
		},
	})

	return {
		data: {
			...data,
			options: [...options.values()].map((option) => option.data),
		},
		handle: async (interaction) => {
			if (interaction.isChatInputCommand()) {
				logger.info({ interaction: interaction.toJSON() }, "Running command")
				await run(interaction)
			} else {
				const focused = interaction.options.getFocused(true)
				const option = options.get(focused.name)
				if (!option?.autocomplete) {
					logger.error(
						{ interaction: interaction.toJSON() },
						"Unknown autocomplete option",
					)
				}
				await interaction.respond(
					(await option?.autocomplete?.(focused.value, interaction)) ?? [],
				)
			}
		},
	}
}

type ParentChatCommandScope = () => {
	name: string
	description: string
	subcommands: SubCommandsScope
}

type SubCommandsScope = (sub: {
	command: (factory: ChatCommandScope) => void
}) => void

function createParentChatCommand(scope: ParentChatCommandScope) {
	const spec = scope()
	const subcommands = new Map<string, ChatCommand>()

	spec.subcommands({
		command: (spec) => {
			const subcommand = createChatCommand(spec)
			subcommands.set(subcommand.data.name, subcommand)
		},
	})

	return {
		data: {
			name: spec.name,
			description: spec.description,
			options: [...subcommands.values()].map(
				({ data: { options, ...data } }) => ({
					...data,
					type: Discord.ApplicationCommandOptionType.Subcommand as const,
				}),
			),
		},
		handle: async (
			interaction:
				| Discord.ChatInputCommandInteraction
				| Discord.AutocompleteInteraction,
		) => {
			const subcommand = subcommands.get(
				interaction.options.getSubcommand(true),
			)

			if (!subcommand) {
				logger.error(
					{ interaction: interaction.toJSON() },
					"Unknown subcommand",
				)
				return
			}

			logger.info(
				{ interaction: interaction.toJSON() },
				"Running subcommand...",
			)
			await subcommand.handle(interaction)
			logger.info(
				{ interaction: interaction.toJSON() },
				"Running subcommand... done",
			)
		},
	}
}

type OptionCreatorMap = {
	string: (args: AutocompleteChatCommandOptionArgs<string>) => void
	number: (args: AutocompleteChatCommandOptionArgs<number>) => void
}

type ChatCommandOptionArgs = {
	name: string
	description: string
}

type AutocompleteChatCommandOptionArgs<T extends string | number> =
	ChatCommandOptionArgs & {
		autocomplete?: (
			input: string,
			interaction: Discord.AutocompleteInteraction,
		) => Promise<Discord.ApplicationCommandOptionChoiceData<T>[]>
	}

type ChatCommandOption = {
	readonly data: Discord.ApplicationCommandOptionData
	autocomplete?: (
		input: string,
		interaction: Discord.AutocompleteInteraction,
	) => Promise<Discord.ApplicationCommandOptionChoiceData[]>
}
