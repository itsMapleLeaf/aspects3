import { clamp } from "es-toolkit"

export function parseNumber(value: string, min = 0, max = Infinity) {
	const parsed = parseInt(value)
	return isNaN(parsed) ? min : clamp(parsed, min, max)
}

export function ensure<T>(value: T): NonNullable<T> {
	if (value == null) {
		const error = new Error(`value was ${value}`)
		Error.captureStackTrace(error)
		throw error
	}
	return value
}
