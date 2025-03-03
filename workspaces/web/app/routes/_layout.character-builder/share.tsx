import { type CharacterFields } from "@workspace/backend/data/character"
import { pipe, timeoutPromise } from "@workspace/shared/utils"
import { useState, useTransition } from "react"

export function useCopyCharacterShareUrl(character: CharacterFields) {
	const [pending, startTransition] = useTransition()
	const [success, setSuccess] = useState(false)

	const copyUrl = () => {
		startTransition(async () => {
			try {
				const url = pipe(
					character,
					(data) => JSON.stringify(data),
					(data) => btoa(data),
					(data) => new URL(`/character-builder?data=${data}`, location.origin),
				)
				await navigator.clipboard.writeText(url.href)
				setSuccess(true)
				await timeoutPromise(2000)
				setSuccess(false)
			} catch (error) {
				alert(error)
			}
		})
	}

	return { pending, success, copyUrl }
}
