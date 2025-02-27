import { Doc } from "@workspace/backend/convex/_generated/dataModel"
import { AspectName, aspects } from "@workspace/data/aspects"
import {
	AttributeName as AttributeNameOld,
	getAttributeBySkill,
} from "@workspace/data/attributes"
import { findTrait, traits } from "@workspace/data/traits"
import { parseNumber } from "@workspace/shared/utils"
import { type } from "arktype"
import type { WithoutSystemFields } from "convex/server"
import { v } from "convex/values"
import { clamp, pick } from "es-toolkit"
import { type Attribute } from "./attributes.ts"
import { countCharacterLevels } from "./characterLevels.ts"

export const characterFieldsValidator = v.object({
	key: v.string(),
	name: v.string(),
	levelIndex: v.optional(v.number()),
	details: v.string(),
	attributes: v.record(v.string(), v.string()),
	hits: v.string(),
	fatigue: v.string(),
	comeback: v.string(),
	traits: v.array(v.string()),
	proficientSkills: v.array(v.string()),
	aspects: v.record(v.string(), v.string()),
	paths: v.optional(v.array(v.string())),
	imageUrl: v.string(),
})

export type CharacterFields = typeof CharacterFieldsParser.inferOut
const CharacterFieldsParser = type({
	key: type("string").default(() => crypto.randomUUID()),
	name: "string < 256 = ''",
	levelIndex: type("number")
		.pipe((it) => clamp(Math.floor(it), 0, countCharacterLevels()))
		.default(6),
	details: "string = ''",
	attributes: type(`Record<string, string>`).default(() => ({})),
	hits: "string = ''",
	fatigue: "string = ''",
	comeback: "string = ''",
	traits: type("string[]").default(() => []),
	proficientSkills: type("string[]").default(() => []),
	aspects: type(`Record<string, string>`).default(() => ({})),
	paths: type("string[]").default(() => []),
	imageUrl: "string = ''",
}).onUndeclaredKey("delete")

export function parseCharacterFieldsUnsafe(raw: unknown): CharacterFields {
	// workaround: onUndeclaredKey is broken and doesn't strip unknown keys
	// ensure the list of keys here match the type above
	return pick(CharacterFieldsParser.assert(raw), [
		"key",
		"name",
		"levelIndex",
		"details",
		"attributes",
		"hits",
		"fatigue",
		"comeback",
		"traits",
		"proficientSkills",
		"aspects",
		"paths",
		"imageUrl",
	])
}

export function parseRemoteCharacterFields(
	doc: WithoutSystemFields<Doc<"characters">>,
): CharacterFields {
	return parseCharacterFieldsUnsafe(doc.fields ?? doc)
}

export function createEmptyCharacterFields(): CharacterFields {
	return {
		key: crypto.randomUUID(),
		name: "",
		levelIndex: 0,
		details: "",
		attributes: {
			intellect: "1",
			sense: "1",
			agility: "1",
			strength: "1",
			wit: "1",
		},
		hits: "",
		fatigue: "",
		comeback: "",
		traits: [],
		proficientSkills: [],
		aspects: {},
		paths: [],
		imageUrl: "",
	}
}

export function getCharacterAttributeScore(
	character: CharacterFields,
	attribute: Attribute,
) {
	return parseNumber(character.attributes[attribute.name.toLowerCase()] ?? "")
}

export function getCharacterSkillPowerDiceCount(
	character: CharacterFields,
	attribute: Attribute,
	skill: Attribute["skills"][number],
) {
	let count = 0

	for (const traitName of character.traits) {
		const trait = findTrait(traitName)
		if (!trait) continue

		if (
			trait.attributes.some(
				(tr) => tr.attribute === attribute.name.toLowerCase(),
			)
		) {
			count += 1
		}
	}

	if (isCharacterProficient(character, skill)) {
		count += 2
	}

	return count
}

export function isCharacterProficient(
	character: CharacterFields,
	skill: Attribute["skills"][number],
) {
	return character.proficientSkills.includes(skill.name)
}

export class CharacterModel {
	readonly fields: CharacterFields

	constructor(data: CharacterFields) {
		this.fields = data
	}

	static fromUnsafeData(raw: unknown) {
		return new CharacterModel(parseCharacterFieldsUnsafe(raw))
	}

	static fromRemote(doc: WithoutSystemFields<Doc<"characters">>) {
		return new CharacterModel(parseRemoteCharacterFields(doc))
	}

	static empty() {
		return new CharacterModel(createEmptyCharacterFields())
	}

	getAttributeValue(name: AttributeNameOld) {
		return parseNumber(this.fields.attributes[name] ?? "1", 1, 6)
	}

	getTraitPowerDice(attribute: AttributeNameOld) {
		return this.fields.traits.reduce((count, traitName) => {
			const trait = traits.find((t) => t.name === traitName)
			if (!trait) return count
			return (
				count +
				(trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
			)
		}, 0)
	}

	getSkillPowerDice(skillName: string) {
		const [attribute] = getAttributeBySkill(skillName)
		if (!attribute) return 0

		const traitDice = this.getTraitPowerDice(attribute)
		const proficiencyDice = this.fields.proficientSkills.includes(skillName)
			? 1
			: 0
		return traitDice + proficiencyDice
	}

	getAvailableProficiencies(attribute: AttributeNameOld) {
		return this.fields.traits.reduce((count, traitName) => {
			const trait = traits.find((t) => t.name === traitName)
			if (!trait) return count
			return (
				count +
				(trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
			)
		}, 0)
	}

	get hits() {
		return parseNumber(this.fields.hits)
	}

	get toughness() {
		return (
			this.getAttributeValue("strength") + this.getAttributeValue("agility")
		)
	}

	get fatigue() {
		return parseNumber(this.fields.fatigue)
	}

	get resolve() {
		return (
			this.getAttributeValue("sense") +
			this.getAttributeValue("intellect") +
			this.getAttributeValue("wit")
		)
	}

	get comeback() {
		return parseNumber(this.fields.comeback)
	}

	get attributeTotal() {
		return Object.values(this.fields.attributes).reduce(
			(sum, val = "1") => sum + parseNumber(val, 1, 6),
			0,
		)
	}

	get aspectTotal() {
		return Object.values(this.fields.aspects).reduce(
			(sum, val = "0") => sum + parseNumber(val, 0, 6),
			0,
		)
	}

	getAspectValue(name: string) {
		const baseValue = parseNumber(this.fields.aspects[name] ?? "0", 0, 6)
		const aspect = aspects[name as AspectName]
		if (!aspect) return baseValue
		return baseValue + this.getAttributeValue(aspect.attribute)
	}

	getAspectPowerDice(aspectName: AspectName) {
		return traits
			.filter((trait) => this.fields.traits.includes(trait.name))
			.filter((trait) => trait.aspect === aspectName).length
	}

	get url() {
		const encoded = btoa(JSON.stringify(this.fields))

		const baseUrl = import.meta.env.DEV
			? "http://localhost:5173"
			: "https://aspects-of-nature.netlify.app"

		const url = new URL("/character-builder", baseUrl)
		url.searchParams.set("data", encoded)
		return url
	}
}
