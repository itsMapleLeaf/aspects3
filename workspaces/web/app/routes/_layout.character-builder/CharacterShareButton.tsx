import { type CharacterFields } from "@workspace/backend/data/character"
import { pipe, timeoutPromise } from "@workspace/shared/utils"
import { useState, useTransition } from "react"
import { Button } from "../../components/ui/Button.tsx"
import { Icon } from "../../components/ui/Icon.tsx"

export function CharacterShareButton({
	character,
}: {
	character: CharacterFields
}) {
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

	if (success) {
		return (
			<Button
				disabled
				icon={<Icon icon="mingcute:check-fill" />}
				onClick={copyUrl}
			>
				Copied URL!
			</Button>
		)
	}

	return (
		<Button
			pending={pending}
			icon={<Icon icon="mingcute:link-fill" />}
			onClick={copyUrl}
		>
			Share
		</Button>
	)
}
