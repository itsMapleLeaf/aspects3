import { Character, createEmptyCharacter } from "@workspace/shared/characters"
import { useConvexAuth, useQuery } from "convex/react"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { api } from "../../../convex/_generated/api"
import { getPageMeta } from "../../meta.ts"
import {
	CharacterEditor,
	CharacterEditorLayout,
	CharacterEditorMenu,
} from "./editor.tsx"
import { RemoteCharacterEditor } from "./RemoteCharacterEditor.tsx"
import { useCharacterFromDataParam } from "./useCharacterFromDataParam.ts"

export function meta() {
	return getPageMeta("Character Builder")
}

export default function CharacterBuilderRoute() {
	const auth = useConvexAuth()
	const characters = useQuery(api.public.characters.listOwned)
	return auth.isLoading ? (
		<p>Loading...</p>
	) : !auth.isAuthenticated ? (
		<LocalCharacterEditor />
	) : characters == null ? (
		<p>Loading...</p>
	) : (
		<RemoteCharacterEditor characters={characters} />
	)
}

function LocalCharacterEditor() {
	const [character, setCharacter] = useLocalStorage(
		"character",
		createEmptyCharacter(),
		Character.assert,
	)

	useCharacterFromDataParam(setCharacter)

	return (
		<CharacterEditorLayout>
			<CharacterEditor
				character={character}
				onChange={setCharacter}
				actions={
					<CharacterEditorMenu
						character={character}
						onNew={() => setCharacter(createEmptyCharacter())}
						onImport={setCharacter}
						onDelete={null}
						onClone={null}
					/>
				}
			/>
		</CharacterEditorLayout>
	)
}
