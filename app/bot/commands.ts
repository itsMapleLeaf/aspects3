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
} from "../lib/dice.ts"
import type { InteractionRouter } from "../lib/interactions/router.ts"
import { logger } from "../lib/logger.ts"
import { prisma } from "../lib/prisma.ts"

export function addCommands(router: InteractionRouter) {
	router.command(() => ({
		name: "characters",
		description: "Commands to manage characters",
		subcommands: (sub) => {
			sub.command((options) => {
				options.string({
					name: "url",
					description: "The shared character sheet URL",
				})

				return {
					name: "set",
					description: "Set your character from a URL",
					run: async (interaction) => {
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

							await interaction.editReply(
								getCharacterDisplayMessageOptions(data),
							)
						} catch (error) {
							logger.error("Failed to set character")
							logger.error(error)
							await interaction.editReply({
								content: "Sorry, something went wrong. Try again.",
							})
						}
					},
				}
			})

			sub.command(() => ({
				name: "show",
				description: "Show your current character",
				run: async (interaction) => {
					await interaction.deferReply({
						flags: [Discord.MessageFlags.Ephemeral],
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
				},
			}))
		},
	}))

	router.command(() => ({
		name: "roll",
		description: "Commands for rolling dice",
		subcommands: (sub) => {
			sub.command((option) => {
				const diceOption = option.string({
					name: "dice",
					description: 'The dice to roll, e.g. "2d6 1d12"',
				})

				return {
					name: "dice",
					description: "Roll plain dice",
					run: async (interaction) => {
						const input = interaction.options.getString("dice", true)

						const dice = [...parseDiceRollStringInput(input)].flatMap(
							(result) =>
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
				}
			})

			sub.command((option) => {
				option.string({
					name: "skill",
					description: "The skill to roll for",
					autocomplete: async (input, interaction) => {
						const characterRow = await prisma.character.findFirst({
							where: { owner: { discordUserId: interaction.user.id } },
						})
						const character =
							characterRow && Character.assert(characterRow.data)

						const options = attributeNames.flatMap((attribute) => {
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

						return matchSorter(options, input, { keys: ["name", "value"] })
					},
				})

				return {
					name: "skill",
					description: "Make a skill check",
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
						const dice = [
							numericDie(6),
							...range(powerCount).map(() => powerDie()),
						]
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
				}
			})

			sub.command((option) => {
				option.string({
					name: "aspect",
					description: "The aspect to roll for",
					autocomplete: async (input, interaction) => {
						const characterRow = await prisma.character.findFirst({
							where: { owner: { discordUserId: interaction.user.id } },
						})
						const character =
							characterRow && Character.assert(characterRow.data)

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

						return matchSorter(options, input, { keys: ["name", "value"] })
					},
				})

				return {
					name: "aspect",
					description: "Make an aspect check",
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
						const dice = [
							numericDie(12),
							...range(powerCount).map(() => powerDie()),
						]
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
				}
			})
		},
	}))
}

function getCharacterDisplayMessageOptions(data: Character) {
	return {
		content: `You are playing as [**${data.name}**](${
			getCharacterUrl(data).href
		})`,
		embeds: [createCharacterEmbed(data)],
	} satisfies Discord.BaseMessageOptions
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
