export type Aspect = {
	name: string
	description: string
	attribute: string
}

const aspectRecord = {
	light: {
		name: "Light",
		description: "physical light, healing, strengthening",
		attribute: "intellect",
	},
	water: {
		name: "Water",
		description: "water, ice, frost, cold, protection",
		attribute: "sense",
	},
	wind: {
		name: "Wind",
		description: "air, sound, weather, speed, acrobatics",
		attribute: "agility",
	},
	fire: {
		name: "Fire",
		description: "flame, heat, tectonics",
		attribute: "strength",
	},
	darkness: {
		name: "Darkness",
		description: "psychology, illusions, reality bending",
		attribute: "wit",
	},
} satisfies Record<string, Aspect>

const aspectMap = new Map<string, Aspect>(Object.entries(aspectRecord))

export function listAspects(): Aspect[] {
	return [...aspectMap.values()]
}

export function findAspect(name: string): Aspect | undefined {
	return aspectMap.get(name.toLowerCase())
}

export function getAspect(key: keyof typeof aspectRecord): Aspect {
	return aspectRecord[key]
}
