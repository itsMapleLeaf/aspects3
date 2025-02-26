export type Aspect = {
	name: string
	description: string
	attribute: string
}

const aspects = new Map<string, Aspect>(
	[
		{
			name: "Light",
			description: "physical light, healing, strengthening",
			attribute: "intellect",
		},
		{
			name: "Water",
			description: "water, ice, frost, cold, protection",
			attribute: "sense",
		},
		{
			name: "Wind",
			description: "air, sound, weather, speed, acrobatics",
			attribute: "agility",
		},
		{
			name: "Fire",
			description: "flame, heat, tectonics",
			attribute: "strength",
		},
		{
			name: "Darkness",
			description: "psychology, illusions, reality bending",
			attribute: "wit",
		},
	].map((aspect) => [aspect.name.toLowerCase(), aspect]),
)

export function listAspects() {
	return [...aspects.values()]
}

export function getAspect(name: string) {
	return aspects.get(name.toLowerCase())
}
