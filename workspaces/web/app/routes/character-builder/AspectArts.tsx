import { type CharacterFields } from "@workspace/backend/data/character"
import { Checkbox } from "~/components/ui/Checkbox.tsx"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { AspectArtList } from "./AspectArtList.tsx"

type AspectArtsProps = {
	character: CharacterFields
}

export function AspectArts({ character }: AspectArtsProps) {
	const [showAttunedOnly, setShowAttunedOnly] = useLocalStorage(
		"showAttunedArts",
		false,
		Boolean,
	)

	return (
		<>
			<div className="mb-4">
				<Checkbox
					label="Show attuned arts only"
					checked={showAttunedOnly}
					onChange={(event) => setShowAttunedOnly(event.target.checked)}
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
				<AspectArtList
					character={character}
					showAttunedOnly={showAttunedOnly}
				/>
			</div>
		</>
	)
}
