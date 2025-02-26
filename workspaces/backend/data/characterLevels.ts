export type CharacterLevel = {
	level: number
	attributePoints: number
	aspectPoints: number
	proficientSkills: number
}

const characterLevels: CharacterLevel[] = [
	{
		level: 1,
		attributePoints: 15,
		aspectPoints: 3,
		proficientSkills: 3,
	},
	{
		level: 2,
		attributePoints: 15,
		aspectPoints: 3,
		proficientSkills: 3,
	},
	{
		level: 3,
		attributePoints: 16,
		aspectPoints: 4,
		proficientSkills: 3,
	},
	{
		level: 4,
		attributePoints: 16,
		aspectPoints: 4,
		proficientSkills: 4,
	},
	{
		level: 5,
		attributePoints: 17,
		aspectPoints: 5,
		proficientSkills: 4,
	},
	{
		level: 6,
		attributePoints: 17,
		aspectPoints: 5,
		proficientSkills: 4,
	},
	{
		level: 7,
		attributePoints: 18,
		aspectPoints: 6,
		proficientSkills: 5,
	},
	{
		level: 8,
		attributePoints: 18,
		aspectPoints: 6,
		proficientSkills: 5,
	},
	{
		level: 9,
		attributePoints: 19,
		aspectPoints: 7,
		proficientSkills: 5,
	},
	{
		level: 10,
		attributePoints: 19,
		aspectPoints: 7,
		proficientSkills: 6,
	},
	{
		level: 11,
		attributePoints: 20,
		aspectPoints: 8,
		proficientSkills: 6,
	},
	{
		level: 12,
		attributePoints: 20,
		aspectPoints: 8,
		proficientSkills: 6,
	},
	{
		level: 13,
		attributePoints: 21,
		aspectPoints: 9,
		proficientSkills: 7,
	},
]

export function countCharacterLevels() {
	return characterLevels.length
}

export function listCharacterLevels() {
	return [...characterLevels]
}
