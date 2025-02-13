import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router"
import { Character } from "~/data/characters.ts"

export function useCharacterFromDataParam(
	onParsed: (character: Character) => void,
) {
	const [searchParams, setSearchParams] = useSearchParams()
	const dataParam = searchParams.get("data")

	const onParsedRef = useRef(onParsed)
	useEffect(() => {
		onParsedRef.current = onParsed
	})

	useEffect(() => {
		if (dataParam) {
			const decoded = atob(dataParam)
			const parsed = JSON.parse(decoded)
			const character = Character.assert(parsed)

			onParsedRef.current(character)

			setSearchParams((params) => {
				params.delete("data")
				return params
			})
		}
	}, [dataParam])
}
