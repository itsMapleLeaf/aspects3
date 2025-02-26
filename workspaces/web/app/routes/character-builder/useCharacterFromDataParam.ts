import {
	parseCharacterFields,
	type CharacterFields,
} from "@workspace/backend/data/character"
import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router"

export function useCharacterFromDataParam(
	onParsed: (character: CharacterFields) => void,
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
			const character = parseCharacterFields(parsed)

			onParsedRef.current(character)

			setSearchParams((params) => {
				params.delete("data")
				return params
			})
		}
	}, [dataParam])
}
