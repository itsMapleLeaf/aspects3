import { useEffect, useLayoutEffect, useState } from "react"

export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
	validate: (input: unknown) => T,
) {
	const [value, setValue] = useState<T>(defaultValue)
	const [loaded, setLoaded] = useState(false)

	useLayoutEffect(() => {
		if (loaded) return
		try {
			const saved = window.localStorage.getItem(key)
			if (saved) {
				setValue(validate(JSON.parse(saved)))
			}
			setLoaded(true)
		} catch (error) {
			console.warn("failed to parse", error)
		}
	}, [key, validate, loaded])

	useEffect(() => {
		if (!loaded) return
		window.localStorage.setItem(key, JSON.stringify(value))
	}, [key, value, loaded])

	return [value, setValue] as const
}
