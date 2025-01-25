export type AttributeName = (typeof attributeNames)[number]
export const attributeNames = [
	"intellect",
	"sense",
	"agility",
	"strength",
	"wit",
] as const

export type AttributeInfo = {
	name: string
	description: string
	skills: string[]
}

export const attributes: Record<AttributeName, AttributeInfo> = {
	intellect: {
		name: "Intellect",
		description: "breadth of knowledge and how to apply it",
		skills: ["Intuit", "Recall", "Aid", "Operate", "Tinker"],
	},
	sense: {
		name: "Sense",
		description: "strength of mind, ability to focus and perceive",
		skills: ["Spy", "Listen", "Feel", "Shoot", "Focus"],
	},
	agility: {
		name: "Agility",
		description: "nimbleness, adaptability, swiftness",
		skills: ["Dash", "Jump", "Climb", "Dodge", "Maneuver"],
	},
	strength: {
		name: "Strength",
		description: "physical prowess, strength of body",
		skills: ["Strike", "Block", "Throw", "Lift", "Endure"],
	},
	wit: {
		name: "Wit",
		description: "social skills, insight, manipulation",
		skills: ["Charm", "Intimidate", "Deceive", "Read", "Sneak"],
	},
}
