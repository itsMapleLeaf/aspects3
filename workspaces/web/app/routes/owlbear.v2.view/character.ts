import { type } from "arktype"
import { experiences, lineages, roles } from "./data.ts"

/*
materials needed as player:
- At least one character sheet (may play multiple characters or have versions of one, they should be switchable)
- Dice

materials needed as DM:
- Maps (covered by owlbear)
- Several character sheets
- NPC sheets (like character sheets, but token resources (hits/fatigue) are unique)
- Dice

feature set:
- Character browser
	 - For GM: List all characters in room
	 - For Player: only show their own character(s)
- Character sheet viewer
	 - Header
		  - "Back to Character List" button
		  - Quick dropdown character switcher
	 - Name
	 - Level
	 - Image
	 - Settings
		  - NPC?
				- if false (default), tokens are synced with the sheet resources
				- if true, tokens track own resources
	 - Stats
		  - Attribute Scores
		  - Aspect scores
		  - Aspect skills
	 - Resources
		  - Hits / Max
		  - Fatigue / Max
		  - Comeback
	 - Lore
		  - Lineage
		  - Role
		  - Experiences
- Dice roller + history
*/

export type Character = typeof Character.inferOut
export const Character = type({
	"id": "string = ''",
	"name": "string = ''",
	"level": "number = 1",
	"hits": "number = 0",
	"fatigue": "number = 0",
	"comeback": "number = 0",
	"lineage?": "string | null",
	"role?": "string | null",
	"drive?": "string | null",
	"experiences?": "string[]",
	"strengthBonus": "number = 0",
	"senseBonus": "number = 0",
	"dexterityBonus": "number = 0",
	"presenceBonus": "number = 0",
	"fireBonus": "number = 0",
	"waterBonus": "number = 0",
	"windBonus": "number = 0",
	"lightBonus": "number = 0",
	"darknessBonus": "number = 0",
})

export function createCharacter(name: string): Character {
	return {
		id: crypto.randomUUID(),
		name,
		level: 1,
		hits: 0,
		fatigue: 0,
		comeback: 0,
		strengthBonus: 0,
		senseBonus: 0,
		dexterityBonus: 0,
		presenceBonus: 0,
		fireBonus: 0,
		waterBonus: 0,
		windBonus: 0,
		lightBonus: 0,
		darknessBonus: 0,
	}
}

export interface ComputedCharacter {
	strength: number
	sense: number
	dexterity: number
	presence: number
	fire: number
	water: number
	wind: number
	light: number
	darkness: number
	maxHits: number
	maxFatigue: number
}

export function getComputedCharacter(character: Character): ComputedCharacter {
	const stats = {
		strength: 1 + character.strengthBonus,
		sense: 1 + character.senseBonus,
		dexterity: 1 + character.dexterityBonus,
		presence: 1 + character.presenceBonus,
		fire: 0 + character.fireBonus,
		water: 0 + character.waterBonus,
		wind: 0 + character.windBonus,
		light: 0 + character.lightBonus,
		darkness: 0 + character.darknessBonus,
	}

	if (character.lineage) {
		const selectedLineage = lineages.find((l) => l.name === character.lineage)
		if (selectedLineage) {
			for (const attr of selectedLineage.attributes) {
				stats[attr.name.toLowerCase() as keyof typeof stats] += 1
			}
		}
	}

	if (character.role) {
		const selectedRole = roles[character.role as keyof typeof roles]
		if (selectedRole) {
			const attrName = selectedRole.attribute.name.toLowerCase()
			stats[attrName as keyof typeof stats] += 3
		}
	}

	if (character.experiences) {
		for (const expId of character.experiences) {
			const exp = experiences[expId as keyof typeof experiences]
			if (exp) {
				const attrName = exp.attribute.name.toLowerCase()
				stats[attrName as keyof typeof stats] += 2

				if (exp.aspects.length === 1) {
					const aspectName = exp.aspects[0]!.name.toLowerCase()
					stats[aspectName as keyof typeof stats] += 2
				} else if (exp.aspects.length === 2) {
					for (const aspect of exp.aspects) {
						const aspectName = aspect.name.toLowerCase()
						stats[aspectName as keyof typeof stats] += 1
					}
				}
			}
		}
	}

	const maxHits = stats.strength + stats.dexterity + 3
	const maxFatigue = stats.sense + stats.presence

	return { ...stats, maxHits, maxFatigue }
}
