import * as Discord from "discord.js"
import { range, startCase } from "es-toolkit"
import { matchSorter } from "match-sorter"
import { aspectNames, aspects, type AspectName } from "~/data/aspects.ts"
import { attributes, getAttributeBySkill } from "~/data/attributes.ts"
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
	riskDie,
	rollDice,
	type Die,
} from "./dice.ts"
import { logger } from "./logger.ts"
import { prisma } from "./prisma.ts"
import { parseNumber } from "./utils.ts"

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
				description: "The dice, aspect, or skill to roll",
				type: Discord.ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],
		run: async (interaction) => {
			const deferred = await interaction.deferReply({
				// flags: [Discord.MessageFlags.Ephemeral],
			})

			const input = interaction.options.getString("dice", true)

			const inputSkillAttribute = getAttributeBySkill(input)[0]

			const inputAspect = aspectNames.includes(input)
				? (input as AspectName)
				: undefined

			const characterRow = await prisma.character.findFirst({
				where: { owner: { discordUserId: interaction.user.id } },
			})

			if ((inputAspect || inputSkillAttribute) && !characterRow) {
				await deferred.edit({
					content: "You don't have a character set. Run `/characters set`",
				})
				await deferred.delete()
				return
			}

			const character = characterRow && Character.assert(characterRow.data)
			const characterUrl = character && getCharacterUrl(character)

			let label
			let dice: Die[] = []
			let target

			if (inputSkillAttribute && character) {
				const attributeValue =
					inputSkillAttribute &&
					getAttributeValue(inputSkillAttribute, character)

				if (!attributeValue) {
					logger.error(
						{ input, attribute: inputSkillAttribute },
						"Invalid skill/attribute",
					)
					await deferred.edit({
						content: `Sorry, something went wrong. Try again.`,
					})
					await deferred.delete()
					return
				}

				const powerCount = getSkillPowerDice(character, input)

				label = `${character.name} rolled **${input}** (${attributeValue})`
				if (powerCount > 0) {
					label += ` (+${powerCount} power)`
				}

				dice = [numericDie(6), ...range(powerCount).map(() => powerDie())]
				target = attributeValue
			} else if (inputAspect && character) {
				const aspectName = aspects[inputAspect].name
				const aspectValue = getAspectValue(inputAspect, character)
				const powerCount = getAspectPowerDice(inputAspect, character)
				const riskCount =
					parseNumber(character.aspects[inputAspect] ?? "") > 0 ? 0 : 1

				label = `${character.name} rolled **${aspectName}** (${aspectValue})`
				if (powerCount > 0) {
					label += ` (+${powerCount} power)`
				}
				if (riskCount > 0) {
					label += ` (+${riskCount} risk)`
				}

				dice = [
					numericDie(12),
					...range(powerCount).map(() => powerDie()),
					...range(riskCount).map(() => riskDie()),
				]
				target = aspectValue
			} else {
				label = `Rolling **${input}**`

				dice = [...parseDiceRollStringInput(input)].flatMap((result) =>
					result.valid
						? range(result.count).map(() => numericDie(result.sides))
						: [],
				)
			}

			const results = [...rollDice(dice)]
			const total = results.reduce((sum, result) => sum + result.value, 0)
			const success = target == null ? undefined : total <= target

			let content = `${label}\n##`
			if (results.length >= 2) {
				content += ` ${results
					.map((result) => `${result.symbol || ""}${result.value}`)
					.join("  ")}  ⇒ `
			}
			content += ` **${total}**`
			if (target != null) {
				const icon = total <= target ? "✓" : "✕"
				content += ` ${icon}`
			}

			await interaction.followUp(content)
		},
		autocomplete: async (interaction) => {
			const focused = interaction.options.getFocused(true)
			if (focused.name === "dice") {
				const options = [
					...Object.values(attributes).flatMap((attr) =>
						attr.skills.map((skill) => ({
							name: skill.name,
							value: skill.name,
						})),
					),
					...Object.entries(aspects).map(([key, aspect]) => ({
						name: aspect.name,
						value: key,
					})),
				]

				await interaction.respond(
					matchSorter(options, focused.value, {
						keys: ["name", "value"],
					}).slice(0, 25),
				)
			}
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
			console.log("autocomplete", command.name)
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
