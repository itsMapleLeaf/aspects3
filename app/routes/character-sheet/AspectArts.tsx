import type { Character } from "~/data/characters.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { AspectArtList } from "./AspectArtList.tsx"

type AspectArtsProps = {
	character: Character
}

export function AspectArts({ character }: AspectArtsProps) {
	const [showAvailableOnly, setShowAvailableOnly] = useLocalStorage(
		"showAvailableArts",
		false,
		Boolean,
	)

	return (
		<>
			<div className="flex items-center gap-1.5 mb-4">
				<input
					type="checkbox"
					id="show-available-arts"
					className="size-4 accent-pink-300"
					checked={showAvailableOnly}
					onChange={(event) => setShowAvailableOnly(event.target.checked)}
				/>
				<label
					htmlFor="show-available-arts"
					className="text-gray-300 text-sm font-semibold"
				>
					Show available arts only
				</label>
			</div>
			<div className="grid gap-4 grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3">
				<AspectArtList
					character={character}
					showAvailableOnly={showAvailableOnly}
				/>
			</div>
		</>
	)
}
