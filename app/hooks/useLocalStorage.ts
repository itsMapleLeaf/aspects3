import { type } from "arktype"
import { useEffect, useState } from "react"

function loadFromStorage<T>(key: string): T | null {
	try {
		if (typeof window === "undefined") return null
		const saved = window.localStorage.getItem(key)
		if (!saved) return null
		return JSON.parse(saved)
	} catch {
		return null
	}
}

function saveToStorage<T>(key: string, value: T) {
	try {
		if (typeof window === "undefined") return
		window.localStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		console.warn("[saveToStorage]", error)
	}
}

const JsonFromString = type("string.json.parse")

export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
	validate: (input: unknown) => T,
) {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(key)
			const parsed = JsonFromString.assert(saved)
			setValue(validate(parsed))
		} catch (error) {
			console.warn("failed to parse", error)
		}
	}, [key])

	useEffect(() => {
		if (value !== defaultValue) {
			saveToStorage(key, value)
		}
	}, [key, value, defaultValue])

	return [value, setValue] as const
}
