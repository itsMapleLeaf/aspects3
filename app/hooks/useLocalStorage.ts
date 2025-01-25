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

export function useLocalStorage<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		const saved = loadFromStorage<T>(key)
		if (saved !== null) {
			setValue(saved)
		}
	}, [key])

	useEffect(() => {
		if (value !== defaultValue) {
			saveToStorage(key, value)
		}
	}, [key, value, defaultValue])

	return [value, setValue] as const
}
