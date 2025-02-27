import { branded } from "@workspace/shared/brands"

export type AttributeName = typeof AttributeName.type
export const AttributeName = branded<string, "AttributeName">()

export type SkillName = typeof SkillName.type
export const SkillName = branded<string, "SkillName">()

export type Attribute = {
	name: AttributeName
	description: string
	skills: Array<{
		name: SkillName
		description: string
	}>
}

const attributeRecord = {
	intellect: {
		name: AttributeName("Intellect"),
		description: "breadth of knowledge and how to apply it",
		skills: [
			{
				name: SkillName("Intuit"),
				description: "understand complex concepts or make logical deductions",
			},
			{
				name: SkillName("Recall"),
				description: "remember facts, details, or past experiences",
			},
			{
				name: SkillName("Aid"),
				description: "provide medical treatment or assistance",
			},
			{
				name: SkillName("Operate"),
				description: "use complex tools or machinery",
			},
			{
				name: SkillName("Tinker"),
				description: "repair, modify, or craft items",
			},
		],
	},
	sense: {
		name: AttributeName("Sense"),
		description: "strength of mind, ability to focus and perceive",
		skills: [
			{
				name: SkillName("Spy"),
				description: "spot hidden details or distant objects",
			},
			{ name: SkillName("Listen"), description: "detect and identify sounds" },
			{
				name: SkillName("Feel"),
				description: "notice changes in temperature, pressure, or vibrations",
			},
			{
				name: SkillName("Shoot"),
				description: "attack accurately with ranged weapons",
			},
			{
				name: SkillName("Focus"),
				description: "maintain concentration or resist distractions",
			},
		],
	},
	agility: {
		name: AttributeName("Agility"),
		description: "nimbleness, adaptability, swiftness",
		skills: [
			{
				name: SkillName("Dash"),
				description: "move quickly in bursts or sprint",
			},
			{
				name: SkillName("Jump"),
				description: "leap across gaps or over obstacles",
			},
			{
				name: SkillName("Climb"),
				description: "scale walls, trees, or other vertical surfaces",
			},
			{
				name: SkillName("Dodge"),
				description: "avoid incoming attacks or hazards",
			},
			{
				name: SkillName("Maneuver"),
				description: "perform acrobatic movements or maintain balance",
			},
		],
	},
	strength: {
		name: AttributeName("Strength"),
		description: "physical prowess, strength of body",
		skills: [
			{
				name: SkillName("Strike"),
				description: "attack with melee weapons or bare hands",
			},
			{
				name: SkillName("Block"),
				description: "defend against physical attacks with your body or shield",
			},
			{
				name: SkillName("Throw"),
				description: "hurl objects or people with force",
			},
			{
				name: SkillName("Lift"),
				description: "carry heavy objects or move obstacles",
			},
			{
				name: SkillName("Endure"),
				description: "resist physical strain, exhaustion, or harsh conditions",
			},
		],
	},
	wit: {
		name: AttributeName("Wit"),
		description: "social skills, insight, manipulation",
		skills: [
			{
				name: SkillName("Charm"),
				description: "persuade or influence others positively",
			},
			{
				name: SkillName("Intimidate"),
				description: "threaten or pressure others through fear",
			},
			{
				name: SkillName("Deceive"),
				description: "lie convincingly or misdirect",
			},
			{
				name: SkillName("Read"),
				description: "understand others' emotions and intentions",
			},
			{
				name: SkillName("Sneak"),
				description: "move quietly and remain undetected",
			},
		],
	},
} satisfies Record<string, Attribute>

const attributeMap = new Map<string, Attribute>(Object.entries(attributeRecord))

export function listAttributes(): Attribute[] {
	return [...attributeMap.values()]
}

export function getAttribute(key: keyof typeof attributeRecord): Attribute {
	return attributeRecord[key]
}

export function findAttribute(name: string): Attribute | undefined {
	return attributeMap.get(name.toLowerCase())
}
