import { Checkbox } from "~/components/ui/Checkbox.tsx"
import type { Character } from "~/data/characters.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { AspectArtList } from "./AspectArtList.tsx"

type AspectArtsProps = {
	character: Character
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
