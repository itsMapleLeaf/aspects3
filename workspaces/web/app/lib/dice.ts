import { range } from "es-toolkit"
import { randomItem } from "./utils.ts"

const modifierSideCount = 6
const maxInputDice = 100

export type Die = {
	faces: DieFace[]
}

export type DieFace = {
	value: number
	symbol?: string
}

export function numericDie(sides: number): Die {
	return {
		faces: range(1, sides).map((value) => ({
			value,
			symbol: "🎲",
		})),
	}
}

// this is a "roll under" system where the dice roll result represents the difficult of the task,
// so power dice are negative, and risk dice are positive
export function powerDie(): Die {
	return {
		faces: range(1, modifierSideCount + 1).map((value) => ({
			value: value <= 2 ? 0 : value <= 5 ? -1 : -2,
			symbol: "⚡",
		})),
	}
}

export function riskDie(): Die {
	return {
		faces: range(1, modifierSideCount + 1).map((value) => ({
			value: value <= 2 ? 0 : value <= 5 ? 1 : 2,
			symbol: "⚠️",
		})),
	}
}

export type DiceRollParseResult =
	| { valid: true; sides: number; count: number }
	| { valid: false; input: string; message: string }

/**
 * Parses a string of dice rolls into an array of objects with sides and count
 * properties.
 *
 * @param input The string to parse, in the format of `[X]dY [...[X]dY]`.
 * @returns An array of result objects for each roll, or an error object if the
 *   input is invalid.
 */
export function* parseDiceRollStringInput(
	inputArg: string,
): Iterable<DiceRollParseResult> {
	for (const part of inputArg.trim().split(/\s+/)) {
		const [countInput, sidesInput] = part.split(/\s*[dD]\s*/)
		if (!sidesInput) {
			yield { valid: false, input: part, message: `Missing sides` }
			continue
		}

		const sides = parseInt(sidesInput, 10)
		const count = countInput ? parseInt(countInput, 10) : 1

		if (isNaN(sides) || isNaN(count)) {
			yield { valid: false, input: part, message: `Invalid dice roll format` }
			continue
		}

		if (sides < 1 || count < 1) {
			yield { valid: false, input: part, message: `Invalid dice roll value` }
			continue
		}

		if (count > maxInputDice) {
			yield {
				valid: false,
				input: part,
				message: `Too many dice (max ${maxInputDice})`,
			}
			continue
		}

		yield { valid: true, sides, count }
	}
}

export function* rollDice(dice: Die[]): Iterable<DieFace> {
	for (const die of dice) {
		const face = randomItem(die.faces)
		if (face) yield face
	}
}
