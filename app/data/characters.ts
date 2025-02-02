import { type } from "arktype"
import { aspects, type AspectName } from "./aspects.ts"
import { type AttributeName } from "./attributes"
import { traits } from "./traits"

export type Character = typeof Character.infer
export const Character = type({
	name: "string < 256 = ''",
	details: "string = ''",
	attributes: type(`Record<string, string>`).default(() => ({})),
	hits: "string = ''",
	fatigue: "string = ''",
	comeback: "string = ''",
	traits: type("string[]").default(() => []),
	proficientSkills: type("string[]").default(() => []),
	aspects: type(`Record<string, string>`).default(() => ({})),
	imageUrl: "string = ''",
})

export const defaultCharacter: Character = {
	name: "",
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
	imageUrl: "",
}

export function getAttributeValue(name: AttributeName, character: Character) {
	return parseNumber(character.attributes[name] ?? "1", 1, 6)
}

export function getTraitPowerDice(
	attribute: AttributeName,
	selectedTraits: string[],
) {
	return selectedTraits.reduce((count, traitName) => {
		const trait = traits.find((t) => t.name === traitName)
		if (!trait) return count
		return (
			count + (trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
		)
	}, 0)
}

export function getSkillPowerDice(
	attribute: AttributeName,
	skill: string,
	character: Character,
) {
	const traitDice = getTraitPowerDice(attribute, character.traits)
	const proficiencyDice = character.proficientSkills.includes(skill) ? 1 : 0
	return traitDice + proficiencyDice
}

export function getAvailableProficiencies(
	attribute: AttributeName,
	selectedTraits: string[],
) {
	return selectedTraits.reduce((count, traitName) => {
		const trait = traits.find((t) => t.name === traitName)
		if (!trait) return count
		return (
			count + (trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
		)
	}, 0)
}

export function getToughness(character: Character) {
	return (
		getAttributeValue("strength", character) +
		getAttributeValue("agility", character)
	)
}

export function getResolve(character: Character) {
	return (
		getAttributeValue("sense", character) +
		getAttributeValue("intellect", character) +
		getAttributeValue("wit", character)
	)
}

export function getAttributeTotal(attributes: Record<string, string>) {
	return Object.values(attributes).reduce(
		(sum, val = "1") => sum + parseNumber(val, 1, 6),
		0,
	)
}

export function getAspectTotal(aspects: Record<string, string>) {
	return Object.values(aspects).reduce(
		(sum, val = "0") => sum + parseNumber(val, 0, 6),
		0,
	)
}

export function getAspectValue(name: string, character: Character) {
	const baseValue = parseNumber(character.aspects[name] ?? "0", 0, 6)
	const aspect = aspects[name as AspectName]
	if (!aspect) return baseValue
	return baseValue + getAttributeValue(aspect.attribute, character)
}

export function formatTraitList(selectedTraits: string[]) {
	const traitList = selectedTraits
		.map((t) => traits.find((trait) => trait.name === t))
		.filter((trait): trait is NonNullable<typeof trait> => Boolean(trait))
		.map((trait) => trait.name)

	return traitList.length > 0
		? new Intl.ListFormat("en", {
				style: "long",
				type: "conjunction",
		  })
				.format(traitList)
				.toLocaleLowerCase()
		: ""
}

function parseNumber(value: string, min: number, max: number) {
	const num = parseInt(value)
	return isNaN(num) ? min : Math.max(min, Math.min(max, num))
}

export function getAspectPowerDice(
	aspectName: AspectName,
	character: Character,
) {
	return traits
		.filter((trait) => character.traits.includes(trait.name))
		.filter((trait) => trait.aspect === aspectName).length
}
