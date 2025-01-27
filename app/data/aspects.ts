import type { AttributeName } from "./attributes.ts"

export type AspectName = (typeof aspectNames)[number]
export const aspectNames = [
	"light",
	"water",
	"wind",
	"fire",
	"darkness",
] as const

export type AspectInfo = {
	name: string
	vibe: string
	attribute: AttributeName
	actions: {
		name: string
		description: string
	}[]
}

export const aspects: Record<AspectName, AspectInfo> = {
	light: {
		name: "Light",
		vibe: "justice, order, knowledge",
		attribute: "intellect",
		actions: [
			{ name: "restore", description: "heal 2 hits" },
			{
				name: "peacekeeper",
				description: "a chosen target may not deal more than 1 hit this round",
			},
			{
				name: "multicast",
				description: "add two additional targets to your next action",
			},
			{
				name: "sacrifice",
				description: "try to remove any hit, then take a hit",
			},
			{
				name: "inspire",
				description: "add two power dice to a target's next roll",
			},
		],
	},
	water: {
		name: "Water",
		vibe: "tranquility, focus, awareness",
		attribute: "sense",
		actions: [
			{
				name: "shield",
				description: "a target may not take more than 1 damage this round",
			},
			{
				name: "protect",
				description:
					"choose two targets, if either of them take hits this round, prevent it, and take a hit",
			},
			{
				name: "castle",
				description:
					"prevent all allies' hits this round, you have one less action next round",
			},
			{
				name: "foresight",
				description:
					"reveal any action, then you may take 1 additional fatigue (once) to let another target character change their action",
			},
		],
	},
	wind: {
		name: "Wind",
		vibe: "swiftness, dexterity, adaptability",
		attribute: "agility",
		actions: [
			{
				name: "evade",
				description: "prevent all hits on self this round",
			},
			{
				name: "adapt",
				description: "make another action with two of your attributes swapped",
			},
			{
				name: "cyclone",
				description:
					"deal a ranged hit to 1 random enemy or 3 random characters",
			},
			{
				name: "surge",
				description: "apply your next action three times",
			},
		],
	},
	fire: {
		name: "Fire",
		vibe: "power, destruction, force",
		attribute: "strength",
		actions: [
			{
				name: "flame strike",
				description: "deal 2 hits to one target",
			},
			{
				name: "flame arc",
				description: "deal a hit to two targets",
			},
			{
				name: "inferno",
				description: "your next action deals 3x hits",
			},
		],
	},
	darkness: {
		name: "Darkness",
		vibe: "manipulation, leverage, stealth",
		attribute: "wit",
		actions: [
			{
				name: "weaken",
				description: "add two risk dice to a target's next roll",
			},
			{
				name: "drain",
				description: "try to remove a hit, then deal any hit",
			},
			{
				name: "cancel",
				description: "prevent a target's next action",
			},
			{
				name: "disappear",
				description:
					"turn invisible; you cannot take hits until your next action",
			},
		],
	},
}
