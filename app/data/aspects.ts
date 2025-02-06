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
	description: string
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
		description: "physical light, healing, strengthening",
		attribute: "intellect",
		actions: [
			{
				name: "restore",
				description: "heal any 2 hits",
				failure: "1 hit",
			},
			{
				name: "sacrifice",
				description:
					"try to heal any 4 hits, then take 1 hit if any hits were healed",
				failure: "heal any 2 hits (still take 1)",
			},
			{
				name: "inspire",
				description: "add 2 power dice to a target's next roll",
				failure: "add 1 power die",
			},
			{
				name: "justice",
				description:
					"add 1 to a character's chosen attribute or aspect value for their next check with that attribute or aspect",
				failure: "the attribute or aspect is random",
			},
		],
	},
	water: {
		name: "Water",
		description: "water, ice, frost, cold, protection",
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
				name: "pacify",
				description:
					"a chosen target may not deal more than 1 hit until your next action",
				failure: "2 hits",
			},
		],
	},
	wind: {
		name: "Wind",
		description: "air, sound, weather, speed, acrobatics",
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
				name: "surge",
				description: "apply another character's next action three times",
				failure: "two times",
			},
			{
				name: "multicast",
				description:
					"add 2 additional targets to another character's next action",
				failure: "1 additional target",
			},
		],
	},
	fire: {
		name: "Fire",
		description: "flame, heat, tectonics",
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
				name: "blind fury",
				description:
					"deal a ranged hit to 2 random enemies or 5 random characters",
				failure: "you must choose 5 random characters",
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
		description: "psychology, illusions, reality bending",
		attribute: "wit",
		actions: [
			{
				name: "imperil",
				description: "add 2 risk dice to a target's next roll",
				failure: "add 1 risk die",
			},
			{
				name: "transfer",
				description: "try to remove any 2 hits, then deal any 2 hits",
				failure: "remove 1, deal 1",
			},
			{
				name: "cancel",
				description: "prevent a target's next action",
				failure: "the target is random",
			},
			{
				name: "foresight",
				description:
					"reveal any action, then you may take 1 additional fatigue (once) to let another target character change their action",
				failure: "you may not allow a character to change their action",
			},
			// {
			// 	name: "disappear",
			// 	description:
			// 		"turn invisible, you cannot take hits until your next action",
			// 	failure: "you must succeed an Agility check to prevent any hit",
			// },
		],
	},
}
