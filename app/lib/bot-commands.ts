import * as Discord from "discord.js"
import { range, startCase } from "es-toolkit"
import { matchSorter } from "match-sorter"
import { aspectNames, aspects, type AspectName } from "~/data/aspects.ts"
import {
	attributeNames,
	attributes,
	getAttributeBySkill,
	getSkill,
} from "~/data/attributes.ts"
import {
	Character,
	getAspectPowerDice,
	getAspectValue,
	getAttributeValue,
	getCharacterUrl,
	getSkillPowerDice,
} from "~/data/characters.ts"
import {
	numericDie,
	parseDiceRollStringInput,
	powerDie,
	rollDice,
} from "./dice.ts"
import { logger } from "./logger.ts"
import { prisma } from "./prisma.ts"

export interface ChatCommand extends Discord.ChatInputApplicationCommandData {
	run: (interaction: Discord.ChatInputCommandInteraction) => Promise<void>
	autocomplete?: (interaction: Discord.AutocompleteInteraction) => Promise<void>
}

export interface MessageCommand extends Discord.MessageApplicationCommandData {
	run: (
		interaction: Discord.MessageContextMenuCommandInteraction,
	) => Promise<void>
}

export interface UserCommand extends Discord.UserApplicationCommandData {
	run: (interaction: Discord.UserContextMenuCommandInteraction) => Promise<void>
}

export type Command = ChatCommand | MessageCommand | UserCommand

export const commands: Command[] = [
	{
		name: "characters",
		description: "Commands to manage characters",
		options: [
			{
				type: Discord.ApplicationCommandOptionType.Subcommand,
				name: "set",
				description: "Set your character from a URL",
				options: [
					{
						name: "url",
						description: "The URL of the character",
						type: Discord.ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				type: Discord.ApplicationCommandOptionType.Subcommand,
				name: "show",
				description: "Show your current character",
				options: [
					{
						name: "public",
						description:
							"Whether to show the character to everyone - private by default",
						type: Discord.ApplicationCommandOptionType.Boolean,
						required: false,
					},
				],
			},
			{
				type: Discord.ApplicationCommandOptionType.Subcommand,
				name: "unset",
				description: "Unset your character",
			},
		],
		run: async (interaction) => {
			const sub = interaction.options.getSubcommand(true)

			if (sub === "set") {
				await interaction.deferReply({
					flags: [Discord.MessageFlags.Ephemeral],
				})

				try {
					const url = new URL(interaction.options.getString("url", true))

					const dataParam = url.searchParams.get("data")
					if (!dataParam) {
						await interaction.editReply({
							content: `Invalid URL. Visit the character builder and click the "Share" button to get a valid URL.`,
						})
						return
					}

					const data = Character.assert(JSON.parse(atob(dataParam)))

					await prisma.user.upsert({
						where: { discordUserId: interaction.user.id },
						create: {
							discordUserId: interaction.user.id,
							characters: {
								create: { data },
							},
						},
						update: {
							characters: {
								deleteMany: {},
								create: { data },
							},
						},
					})

					await interaction.editReply(getCharacterDisplayMessageOptions(data))
				} catch (error) {
					logger.error("Failed to set character")
					logger.error(error)
					await interaction.editReply({
						content: "Sorry, something went wrong. Try again.",
					})
				}
			}

			if (sub === "show") {
				const isPublic = interaction.options.getBoolean("public") ?? false

				await interaction.deferReply({
					flags: isPublic ? [] : [Discord.MessageFlags.Ephemeral],
				})

				const character = await prisma.character.findFirst({
					where: { owner: { discordUserId: interaction.user.id } },
				})

				if (!character) {
					await interaction.editReply({
						content: "You don't have a character set.",
					})
					return
				}

				const data = Character.assert(character.data)

				await interaction.editReply(getCharacterDisplayMessageOptions(data))
			}
		},
	},

	{
		name: "roll",
		description: "Make a dice roll",

		options: [
			{
				name: "dice",
				description: "The dice to roll, e.g. '2d6 1d12'",
				type: Discord.ApplicationCommandOptionType.String,
				required: true,
			},
		],

		run: async (interaction) => {
			const input = interaction.options.getString("dice", true)

			const dice = [...parseDiceRollStringInput(input)].flatMap((result) =>
				result.valid
					? range(result.count).map(() => numericDie(result.sides))
					: [],
			)

			const results = [...rollDice(dice)]
			const total = results.reduce((sum, result) => sum + result.value, 0)

			let content = `Rolling **${input}**\n##`
			if (results.length >= 2) {
				content += ` ${results
					.map((result) => `${result.symbol || ""}${result.value}`)
					.join("  ")}  ⇒ `
			}
			content += ` **${total}**`

			await interaction.reply(content)
		},
	},

	{
		name: "skill",
		description: "Perform a skill check",
		options: [
			{
				name: "skill",
				description: "The skill to roll",
				type: Discord.ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],

		autocomplete: async (interaction) => {
			const characterRow = await prisma.character.findFirst({
				where: { owner: { discordUserId: interaction.user.id } },
			})
			const character = characterRow && Character.assert(characterRow.data)

			const focused = interaction.options.getFocused(true)
			if (focused.name !== "skill") return

			let options = attributeNames.flatMap((attribute) => {
				return attributes[attribute].skills.map((skill) => {
					let name = skill.name
					if (character) {
						const attributeValue = getAttributeValue(attribute, character)
						const powerCount = getSkillPowerDice(character, skill.name)
						name += ` (${attributeValue})`
						if (powerCount > 0) {
							name += ` (+${powerCount} power)`
						}
					}
					return {
						name: name,
						value: skill.name,
					}
				})
			})

			options = matchSorter(options, focused.value, {
				keys: ["name", "value"],
			})

			await interaction.respond(options.slice(0, 25))
		},

		run: async (interaction) => {
			const deferred = await interaction.deferReply()

			const characterRow = await prisma.character.findFirst({
				where: { owner: { discordUserId: interaction.user.id } },
			})

			if (!characterRow) {
				await deferred.edit({
					content:
						"You don't have a character set. Run `/characters set` to set one.",
				})
				return
			}

			const character = Character.assert(characterRow.data)

			const skillInput = interaction.options.getString("skill", true)
			const skill = getSkill(skillInput)
			const attributeName = skill && getAttributeBySkill(skill.name)[0]

			if (!attributeName) {
				logger.error({ skillInput }, "Invalid skill")
				await deferred.edit({
					content: "Sorry, something went wrong. Try again.",
				})
				return
			}

			const attributeValue = getAttributeValue(attributeName, character)
			const powerCount = getSkillPowerDice(character, skill.name)
			const url = getCharacterUrl(character)

			const label = `Rolling **${skill.name}** for [**${character.name}**](${url.href}) (${attributeValue})`
			const dice = [numericDie(6), ...range(powerCount).map(() => powerDie())]
			const results = [...rollDice(dice)]
			const total = results.reduce((sum, result) => sum + result.value, 0)
			const success = total <= attributeValue

			let content = `${label}\n##`
			if (results.length >= 2) {
				content += ` ${results
					.map((result) => `${result.symbol || ""}${result.value}`)
					.join("  ")}  ⇒ `
			}
			content += ` **${total}**`
			content += ` ${success ? "✓" : "✕"}`

			await deferred.edit({ content })
		},
	},

	{
		name: "aspect",
		description: "Perform an aspect check",
		options: [
			{
				name: "aspect",
				description: "The aspect to roll",
				type: Discord.ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],

		autocomplete: async (interaction) => {
			const characterRow = await prisma.character.findFirst({
				where: { owner: { discordUserId: interaction.user.id } },
			})
			const character = characterRow && Character.assert(characterRow.data)

			const focused = interaction.options.getFocused(true)
			if (focused.name !== "aspect") return

			let options = aspectNames.map((aspectName) => {
				let name = aspects[aspectName].name
				if (character) {
					const aspectValue = getAspectValue(aspectName, character)
					name += ` (${aspectValue})`
				}
				return {
					name: name,
					value: aspectName,
				}
			})

			options = matchSorter(options, focused.value, {
				keys: ["name", "value"],
			})

			await interaction.respond(options.slice(0, 25))
		},

		run: async (interaction) => {
			const deferred = await interaction.deferReply()

			const characterRow = await prisma.character.findFirst({
				where: { owner: { discordUserId: interaction.user.id } },
			})

			if (!characterRow) {
				await deferred.edit({
					content:
						"You don't have a character set. Run `/characters set` to set one.",
				})
				return
			}

			const character = Character.assert(characterRow.data)

			const aspectName = interaction.options.getString(
				"aspect",
				true,
			) as AspectName

			if (!aspectNames.includes(aspectName)) {
				logger.error({ aspectName }, "Invalid aspect")
				await deferred.edit({
					content: "Sorry, something went wrong. Try again.",
				})
				return
			}

			const aspectValue = getAspectValue(aspectName, character)
			const powerCount = getAspectPowerDice(aspectName, character)

			const label = `Rolling **${aspects[aspectName].name}** (${aspectValue})`
			const dice = [numericDie(12), ...range(powerCount).map(() => powerDie())]
			const results = [...rollDice(dice)]
			const total = results.reduce((sum, result) => sum + result.value, 0)
			const success = total <= aspectValue

			let content = `${label}\n##`
			if (results.length >= 2) {
				content += ` ${results
					.map((result) => `${result.symbol || ""}${result.value}`)
					.join("  ")}  ⇒ `
			}
			content += ` **${total}**`
			content += ` ${success ? "✓" : "✕"}`

			await deferred.edit({ content })
		},
	},
]

function getCharacterDisplayMessageOptions(data: Character) {
	return {
		content: `You are playing as [**${data.name}**](${
			getCharacterUrl(data).href
		})`,
		embeds: [createCharacterEmbed(data)],
	} satisfies Discord.BaseMessageOptions
}

export async function registerCommands(client: Discord.Client<true>) {
	await client.application.commands.set(
		commands.map(({ run, ...data }) => data),
	)
}

export async function handleInteraction(interaction: Discord.Interaction) {
	for (const command of commands) {
		if (
			(command.type === undefined ||
				command.type === Discord.ApplicationCommandType.ChatInput) &&
			interaction.isChatInputCommand() &&
			interaction.commandName === command.name
		) {
			await command.run(interaction)
		}
		if (
			command.type === Discord.ApplicationCommandType.Message &&
			interaction.isMessageContextMenuCommand() &&
			interaction.commandName === command.name
		) {
			await command.run(interaction)
		}
		if (
			command.type === Discord.ApplicationCommandType.User &&
			interaction.isUserContextMenuCommand() &&
			interaction.commandName === command.name
		) {
			await command.run(interaction)
		}
		if (
			(command.type === Discord.ApplicationCommandType.ChatInput ||
				command.type === undefined) &&
			interaction.isAutocomplete() &&
			interaction.commandName === command.name
		) {
			await command.autocomplete?.(interaction)
		}
	}
}

function createCharacterEmbed(data: Character): Discord.APIEmbed {
	const url = getCharacterUrl(data)

	const traitList = new Intl.ListFormat(undefined, {
		type: "conjunction",
	}).format(data.traits)

	return {
		title: data.name,
		description: data.details,
		url: url.href,
		image: {
			url: data.imageUrl,
		},
		fields: [
			{
				name: "Attributes",
				value: Object.entries(data.attributes)
					.map(
						([attribute, value]) =>
							`${startCase(attribute)}: ${Discord.bold(value)}`,
					)
					.join("\n"),
				inline: true,
			},
			{
				name: "Aspects",
				value: Object.entries(data.aspects)
					.map(([aspect, value]) => {
						const aspectInfo = aspects[aspect as AspectName]
						const attributeValue = getAttributeValue(aspectInfo.attribute, data)
						const totalValue = getAspectValue(aspect, data)
						return `${aspectInfo.name}: **${totalValue}**`
					})
					.join("\n"),
				inline: true,
			},
			{
				name: "Traits",
				value:
					traitList.slice(0, 1).toUpperCase() +
					traitList.slice(1).toLowerCase(),
			},
			{
				name: "Proficient Skills",
				value: new Intl.ListFormat(undefined, { type: "conjunction" }).format(
					data.proficientSkills,
				),
			},
		],
	}
}
