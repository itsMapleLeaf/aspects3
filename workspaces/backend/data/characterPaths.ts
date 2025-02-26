export type CharacterPath = {
	name: string
	description: string
}

const characterPaths = new Map<string, CharacterPath>(
	[
		{
			name: "Manipulator",
			description: `Cunning, they exploit weaknesses to gain advantage.`,
		},
		{
			name: "Commander",
			description: `Focuses on support for allies, selfless and compassionate leader.`,
		},
		{
			name: "Strategist",
			description: `Adaptable, thrives in strategic situations.`,
		},
		{
			name: "Destroyer",
			description: `Relentless and fierce, driven by sheer power and destruction.`,
		},
		{
			name: "Guardian",
			description: `Protective and steadfast, prioritizes safety above all.`,
		},
	].map((path) => [path.name.toLowerCase(), path]),
)

export function listCharacterPaths() {
	return [...characterPaths.values()]
}

export function getCharacterPath(name: string) {
	return characterPaths.get(name.toLowerCase())
}
