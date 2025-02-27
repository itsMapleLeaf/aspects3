import type { AspectName } from "./aspects.ts"
import type { AttributeName } from "./attributes.ts"

export type Trait = {
	name: string
	attributes: [TraitAttribute, TraitAttribute]
	aspect: AspectName
}

export type TraitAttribute = {
	attribute: AttributeName
	description: string
}

export const traits: Trait[] = [
	{
		name: "Long tail",
		attributes: [
			{
				attribute: "sense",
				description: "an additional appendage for sensory information",
			},
			{
				attribute: "agility",
				description: "helps with balance and quick direction changes",
			},
		],
		aspect: "wind",
	},
	{
		name: "Fins",
		attributes: [
			{ attribute: "agility", description: "streamlined movement" },
			{
				attribute: "sense",
				description: "sensitive to water pressure and movement",
			},
		],
		aspect: "water",
	},
	{
		name: "Wings",
		attributes: [
			{ attribute: "agility", description: "aerial maneuverability" },
			{
				attribute: "intellect",
				description: "complex navigation and wind reading",
			},
		],
		aspect: "wind",
	},
	{
		name: "Horns / antlers",
		attributes: [
			{
				attribute: "strength",
				description: "natural weapons and structural strength",
			},
			{
				attribute: "sense",
				description: "enhanced spatial awareness of head space/clearance",
			},
		],
		aspect: "light",
	},
	{
		name: "Antennas",
		attributes: [
			{
				attribute: "intellect",
				description: "process complex sensory information",
			},
			{
				attribute: "sense",
				description: "detect subtle environmental changes",
			},
		],
		aspect: "darkness",
	},
	{
		name: "Furred ears",
		attributes: [
			{
				attribute: "sense",
				description: "enhanced hearing from the fur's sensitivity",
			},
			{ attribute: "wit", description: "expressive movement for social cues" },
		],
		aspect: "light",
	},
	{
		name: "Sharp teeth / fangs",
		attributes: [
			{ attribute: "strength", description: "natural weapons" },
			{
				attribute: "wit",
				description:
					"intimidation factor in social situations, but a draw for some",
			},
		],
		aspect: "fire",
	},
	{
		name: "Bioluminescence",
		attributes: [
			{
				attribute: "intellect",
				description: "control over complex biological processes",
			},
			{
				attribute: "wit",
				description: "can make one's appearance more charming or intimidating",
			},
		],
		aspect: "darkness",
	},
	{
		name: "Scales",
		attributes: [
			{ attribute: "strength", description: "natural armor" },
			{
				attribute: "intellect",
				description: "enhanced temperature regulation/awareness",
			},
		],
		aspect: "water",
	},
	{
		name: "Claws",
		attributes: [
			{ attribute: "strength", description: "acts as a weapon of its own" },
			{ attribute: "wit", description: "intimidating display/social presence" },
		],
		aspect: "fire",
	},
]

traits.sort((a, b) => a.name.localeCompare(b.name))

export function findTrait(name: string) {
	return traits.find((it) => it.name === name)
}
