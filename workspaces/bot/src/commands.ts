import {
	aspectNames,
	aspects,
	type AspectName,
} from "@workspace/shared/aspects"
import {
	attributeNames,
	attributes,
	getAttributeBySkill,
	getSkill,
} from "@workspace/shared/attributes"
import {
	Character,
	getAspectPowerDice,
	getAspectValue,
	getAttributeValue,
	getCharacterUrl,
	getSkillPowerDice,
} from "@workspace/shared/characters"
import {
	numericDie,
	parseDiceRollStringInput,
	powerDie,
	riskDie,
	rollDice,
} from "@workspace/shared/dice"
import * as Discord from "discord.js"
import { range, startCase } from "es-toolkit"
import { matchSorter } from "match-sorter"
import type { CommandContext } from "./context.ts"
import { logger } from "./logger.ts"
import type { InteractionRouter } from "./router.ts"

export function addCommands(
	router: InteractionRouter,
	context: CommandContext,
) {
	router.command(() => ({
		name: "characters",
		description: "Commands to manage characters",
		subcommands: (sub) => {
			sub.command((options) => {
				options.string({
					name: "url",
					description: "The shared character sheet URL",
					required: true,
				})

				return {
					name: "set",
					description: "Set your character from a URL",
					run: async (interaction) => {
						if (!interaction.inCachedGuild()) {
							await interaction.reply({
								content: "This command can only be used in guilds.",
								ephemeral: true,
							})
							return
						}

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

							await context.upsertUserWithCharacter({
								user: interaction.user,
								guild: interaction.guild,
								character: data,
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
					if (!interaction.inCachedGuild()) {
						await interaction.reply({
							content: "This command can only be used in guilds.",
							ephemeral: true,
						})
						return
					}

					await interaction.deferReply({
						flags: [Discord.MessageFlags.Ephemeral],
					})

					const character = await context.findCharacterByUser({
						user: interaction.user,
						guild: interaction.guild,
					})

					if (!character) {
						await interaction.editReply({
							content: "You don't have a character set.",
						})
						return
					}

					await interaction.editReply(
						getCharacterDisplayMessageOptions(character),
					)
				},
			}))
		},
	}))

	router.command(() => ({
		name: "roll",
		description: "Commands for rolling dice",
		subcommands: (sub) => {
			sub.command((option) => {
				option.string({
					name: "dice",
					description: 'The dice to roll, e.g. "2d6 1d12"',
					required: true,
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
					required: true,
					autocomplete: async (input, interaction) => {
						if (!interaction.inCachedGuild()) {
							return []
						}

						const character = await context.findCharacterByUser({
							user: interaction.user,
							guild: interaction.guild,
						})

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

				option.number({
					name: "power",
					description: "The number of power dice to add",
				})

				option.number({
					name: "risk",
					description: "The number of risk dice to add",
				})

				return {
					name: "skill",
					description: "Make a skill check",
					run: async (interaction) => {
						if (!interaction.inCachedGuild()) {
							await interaction.reply({
								content: "This command can only be used in guilds.",
								ephemeral: true,
							})
							return
						}

						const deferred = await interaction.deferReply({
							flags: [Discord.MessageFlags.SuppressEmbeds],
						})

						const character = await context.findCharacterByUser({
							user: interaction.user,
							guild: interaction.guild,
						})

						if (!character) {
							await deferred.edit({
								content:
									"You don't have a character set. Run `/characters set` to set one.",
							})
							return
						}

						const skillInput = interaction.options.getString("skill", true)
						const extraPowerDice = interaction.options.getNumber("power") ?? 0
						const extraRiskDice = interaction.options.getNumber("risk") ?? 0

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
							...range(powerCount + extraPowerDice).map(() => powerDie()),
							...range(extraRiskDice).map(() => riskDie()),
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
					required: true,
					autocomplete: async (input, interaction) => {
						if (!interaction.inCachedGuild()) {
							return []
						}

						const character = await context.findCharacterByUser({
							user: interaction.user,
							guild: interaction.guild,
						})

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

				option.number({
					name: "power",
					description: "The number of power dice to add",
				})

				option.number({
					name: "risk",
					description: "The number of risk dice to add",
				})

				return {
					name: "aspect",
					description: "Make an aspect check",
					run: async (interaction) => {
						if (!interaction.inCachedGuild()) {
							await interaction.reply({
								content: "This command can only be used in guilds.",
								ephemeral: true,
							})
							return
						}

						const deferred = await interaction.deferReply({
							flags: [Discord.MessageFlags.SuppressEmbeds],
						})

						const character = await context.findCharacterByUser({
							user: interaction.user,
							guild: interaction.guild,
						})

						if (!character) {
							await deferred.edit({
								content:
									"You don't have a character set. Run `/characters set` to set one.",
							})
							return
						}

						const aspectName = interaction.options.getString(
							"aspect",
							true,
						) as AspectName

						const extraPowerDice = interaction.options.getNumber("power") ?? 0
						const extraRiskDice = interaction.options.getNumber("risk") ?? 0

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
							...range(powerCount + extraPowerDice).map(() => powerDie()),
							...range(extraRiskDice).map(() => riskDie()),
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
