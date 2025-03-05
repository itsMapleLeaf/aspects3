import { type } from "arktype"

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
