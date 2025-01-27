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
		failure: string
	}[]
}

export const aspects: Record<AspectName, AspectInfo> = {
	light: {
		name: "Light",
		vibe: "justice, order, knowledge",
		attribute: "intellect",
		actions: [
			{
				name: "restore",
				description: "heal 2 hits",
				failure: "1 hit",
			},
			{
				name: "peacekeeper",
				description:
					"a chosen target may not deal more than 1 hit until your next action",
				failure: "2 hits",
			},
			{
				name: "multicast",
				description: "add 2 additional targets to your next action",
				failure: "1 additional target",
			},
			{
				name: "sacrifice",
				description: "try to remove any 2 hits, then take 1 hit",
				failure: "remove any 1 hit",
			},
			{
				name: "inspire",
				description: "add 2 power dice to a target's next roll",
				failure: "add 1 power die",
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
				description:
					"a target may not take more than 1 damage until your next action",
				failure: "2 damage",
			},
			{
				name: "protect",
				description:
					"choose two targets. until your next action, if either of them take hits this round, prevent it, and take a hit",
				failure: "choose one target",
			},
			{
				name: "castle",
				description:
					"prevent all allies' hits until your next action, you must skip your next action",
				failure: "you must skip your next 2 actions",
			},
			{
				name: "foresight",
				description:
					"reveal any action, then you may take 1 additional fatigue (once) to let another target character change their action",
				failure: "you may not allow a character to change their action",
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
				failure: "prevent hits up to your Agility",
			},
			{
				name: "adapt",
				description:
					"immediately make another action with two of your attributes swapped",
				failure:
					"make your next action with two attributes swapped (not immediate)",
			},
			{
				name: "cyclone",
				description:
					"deal a ranged hit to 2 random enemies or 5 random characters",
				failure: "you must choose 5 random characters",
			},
			{
				name: "surge",
				description: "apply your next action three times",
				failure: "two times",
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
				description: "deal 3 hits to one target",
				failure: "2 hits",
			},
			{
				name: "flame arc",
				description: "deal 1 hit to 3 targets",
				failure: "2 targets",
			},
			{
				name: "inferno",
				description: "your next action deals triple the hits",
				failure: "double the hits",
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
				description: "add 2 risk dice to a target's next roll",
				failure: "add 1 risk die",
			},
			{
				name: "drain",
				description: "try to remove any 2 hits, then deal any 2 hits",
				failure: "remove 1, deal 1",
			},
			{
				name: "cancel",
				description: "prevent a target's next action",
				failure: "the target is random",
			},
			{
				name: "disappear",
				description:
					"turn invisible, you cannot take hits until your next action",
				failure: "you must succeed an Agility check to prevent any hit",
			},
		],
	},
}
