import type { AttributeName } from "~/data/attributes"

export type Trait = {
	name: string
	attributes: [TraitAttribute, TraitAttribute]
}

export type TraitAttribute = {
	attribute: AttributeName
	description: string
}

export const traits: Trait[] = [
	{
		name: "Long Tail",
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
	},
	{
		name: "Horns/Antlers",
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
	},
	{
		name: "Furred Ears",
		attributes: [
			{
				attribute: "sense",
				description: "enhanced hearing from the fur's sensitivity",
			},
			{ attribute: "wit", description: "expressive movement for social cues" },
		],
	},
	{
		name: "Sharp Teeth/Fangs",
		attributes: [
			{ attribute: "strength", description: "natural weapons" },
			{
				attribute: "wit",
				description:
					"intimidation factor in social situations, but a draw for some",
			},
		],
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
	},
	{
		name: "Claws",
		attributes: [
			{ attribute: "strength", description: "acts as a weapon of its own" },
			{ attribute: "wit", description: "intimidating display/social presence" },
		],
	},
]

traits.sort((a, b) => a.name.localeCompare(b.name))
