import { clamp } from "es-toolkit"

export function parseNumber(value: string, min = 0, max = Infinity) {
	const parsed = parseInt(value)
	return isNaN(parsed) ? min : clamp(parsed, min, max)
}
