import { api } from "@workspace/backend/convex/_generated/api"
import {
	CharacterModel,
	parseCharacterFieldsUnsafe,
} from "@workspace/backend/data/character"
import { useConvexAuth, useQuery } from "convex/react"
import { lazy } from "react"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { getPageMeta } from "../../meta.ts"
import {
	CharacterEditor,
	CharacterEditorLayout,
	CharacterEditorMenu,
} from "./editor.tsx"
import { useCharacterFromDataParam } from "./useCharacterFromDataParam.ts"

const RemoteCharacterEditor = lazy(async () => {
	const { RemoteCharacterEditor } = await import("./RemoteCharacterEditor.tsx")
	return { default: RemoteCharacterEditor }
})

export function meta() {
	return getPageMeta("Character Builder")
}

export default function CharacterBuilderRoute() {
	const auth = useConvexAuth()
	const characters = useQuery(api.public.characters.listOwned)
	return auth.isLoading ? (
		<ContentState.Loading />
	) : !auth.isAuthenticated ? (
		<LocalCharacterEditor />
	) : characters == null ? (
		<ContentState.Loading />
	) : (
		<RemoteCharacterEditor characters={characters} />
	)
}

function LocalCharacterEditor() {
	const [character, setCharacter] = useLocalStorage(
		"character",
		CharacterModel.empty().fields,
		parseCharacterFieldsUnsafe,
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
						onNew={() => setCharacter(CharacterModel.empty().fields)}
						onImport={setCharacter}
						onDelete={null}
						onClone={null}
					/>
				}
			/>
		</CharacterEditorLayout>
	)
}
