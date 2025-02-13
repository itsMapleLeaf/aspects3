import { clamp, randomInt } from "es-toolkit"

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

export function timeoutEffect<Args extends unknown[]>(
	delay: number,
	callback: (...args: Args) => void,
	...args: Args
) {
	const timeout = setTimeout(callback, delay, ...args)
	return () => {
		clearTimeout(timeout)
	}
}

export function timeoutPromise(delay: number) {
	return new Promise((resolve) => setTimeout(resolve, delay))
}

export function pipe<A, B, C>(value: A, ab: (x: A) => B, bc: (x: B) => C): C
export function pipe<A, B, C, D>(
	value: A,
	ab: (x: A) => B,
	bc: (x: B) => C,
	cd: (x: C) => D,
): D
export function pipe<A, B, C, D, E>(
	value: A,
	ab: (x: A) => B,
	bc: (x: B) => C,
	cd: (x: C) => D,
	de: (x: D) => E,
): E
export function pipe(
	value: unknown,
	...fns: Array<(input: unknown) => unknown>
) {
	return fns.reduce((value, fn) => fn(value), value)
}

export function createEmitter<T>() {
	const listeners = new Set<(value: T) => void>()
	return {
		listen: (listener: (value: T) => void) => {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
		emit: (value: T) => {
			for (const listener of listeners) listener(value)
		},
	}
}

export function randomItem<T>(items: Iterable<T>) {
	const itemsArray = Array.from(items)
	return itemsArray[randomInt(itemsArray.length)]
}

export function toSlug(name: string) {
	return [...name.matchAll(/[a-z]+/gi)]
		.map((match) => match[0].toLowerCase())
		.join("-")
}
