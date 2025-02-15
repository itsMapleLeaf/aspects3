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
	skills: Array<{
		name: string
		description: string
	}>
}

export const attributes: Record<AttributeName, AttributeInfo> = {
	intellect: {
		name: "Intellect",
		description: "breadth of knowledge and how to apply it",
		skills: [
			{
				name: "Intuit",
				description: "understand complex concepts or make logical deductions",
			},
			{
				name: "Recall",
				description: "remember facts, details, or past experiences",
			},
			{ name: "Aid", description: "provide medical treatment or assistance" },
			{ name: "Operate", description: "use complex tools or machinery" },
			{ name: "Tinker", description: "repair, modify, or craft items" },
		],
	},
	sense: {
		name: "Sense",
		description: "strength of mind, ability to focus and perceive",
		skills: [
			{ name: "Spy", description: "spot hidden details or distant objects" },
			{ name: "Listen", description: "detect and identify sounds" },
			{
				name: "Feel",
				description: "notice changes in temperature, pressure, or vibrations",
			},
			{ name: "Shoot", description: "attack accurately with ranged weapons" },
			{
				name: "Focus",
				description: "maintain concentration or resist distractions",
			},
		],
	},
	agility: {
		name: "Agility",
		description: "nimbleness, adaptability, swiftness",
		skills: [
			{ name: "Dash", description: "move quickly in bursts or sprint" },
			{ name: "Jump", description: "leap across gaps or over obstacles" },
			{
				name: "Climb",
				description: "scale walls, trees, or other vertical surfaces",
			},
			{ name: "Dodge", description: "avoid incoming attacks or hazards" },
			{
				name: "Maneuver",
				description: "perform acrobatic movements or maintain balance",
			},
		],
	},
	strength: {
		name: "Strength",
		description: "physical prowess, strength of body",
		skills: [
			{
				name: "Strike",
				description: "attack with melee weapons or bare hands",
			},
			{
				name: "Block",
				description: "defend against physical attacks with your body or shield",
			},
			{ name: "Throw", description: "hurl objects or people with force" },
			{ name: "Lift", description: "carry heavy objects or move obstacles" },
			{
				name: "Endure",
				description: "resist physical strain, exhaustion, or harsh conditions",
			},
		],
	},
	wit: {
		name: "Wit",
		description: "social skills, insight, manipulation",
		skills: [
			{ name: "Charm", description: "persuade or influence others positively" },
			{
				name: "Intimidate",
				description: "threaten or pressure others through fear",
			},
			{ name: "Deceive", description: "lie convincingly or misdirect" },
			{
				name: "Read",
				description: "understand others' emotions and intentions",
			},
			{ name: "Sneak", description: "move quietly and remain undetected" },
		],
	},
}

export function listAttributes() {
	return attributeNames.map((id) => ({ ...attributes[id], id }))
}

export function getSkill(name: string) {
	for (const attribute of Object.values(attributes)) {
		const skill = attribute.skills.find(
			(s) => s.name.toLowerCase() === name.toLowerCase(),
		)
		if (skill) return skill
	}
}

export function getAttributeBySkill(skillName: string) {
	for (const [id, attribute] of Object.entries(attributes)) {
		if (
			attribute.skills.some(
				(s) => s.name.toLowerCase() === skillName.toLowerCase(),
			)
		) {
			return [id as AttributeName, attribute] as const
		}
	}
	return [] as const
}
