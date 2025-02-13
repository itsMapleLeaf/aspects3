import * as Ariakit from "@ariakit/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvex, useConvexAuth, useQuery } from "convex/react"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Button } from "~/components/ui/Button.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { Character, createEmptyCharacter } from "~/data/characters.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import { getPageMeta } from "../../meta.ts"
import { CloudSaveCta } from "./CloudSaveCta.tsx"
import {
	CharacterEditor,
	CharacterEditorActions,
	CharacterEditorHeader,
	CharacterEditorLayout,
} from "./editor.tsx"

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

function RemoteCharacterEditor({
	characters,
}: {
	characters: Doc<"characters">[]
}) {
	const convex = useConvex()

	const [selectedCharacterKey, setSelectedCharacterKey] = useState<string>()
	const selectedCharacter = selectedCharacterKey
		? characters.find((c) => c.key === selectedCharacterKey)
		: characters[0]

	const [updatedCharacters, setUpdatedCharacters] = useState<
		Map<string, Character>
	>(new Map())

	const updatedCharacter = selectedCharacterKey
		? updatedCharacters.get(selectedCharacterKey)
		: null

	useCharacterFromDataParam((character) => {
		setUpdatedCharacters(
			(prev) => new Map([...prev, [character.key, character]]),
		)
		setSelectedCharacterKey(character.key)
	})

	useEffect(() => {
		if (updatedCharacter) {
			convex.mutation(
				api.public.characters.upsert,
				Character.assert(updatedCharacter),
			)
		}
	}, [updatedCharacter])

	function deleteSelectedCharacter() {
		if (!selectedCharacter) return

		const yes = confirm(
			"Are you sure you want to delete this character? This action cannot be undone.",
		)
		if (!yes) return

		setUpdatedCharacters((prev) => {
			const next = new Map(prev)
			next.delete(selectedCharacter.key)
			return next
		})
		setSelectedCharacterKey(undefined)

		convex.mutation(api.public.characters.delete, {
			id: selectedCharacter._id,
		})
	}

	const character =
		updatedCharacter ?? selectedCharacter ?? createEmptyCharacter()

	function setCharacter(character: Character) {
		setUpdatedCharacters(
			(prev) => new Map([...prev, [character.key, character]]),
		)
		setSelectedCharacterKey(character.key)
	}

	return (
		<CharacterEditorLayout>
			<CharacterEditorHeader>
				<CharacterEditorActions
					character={character}
					onNew={() => {
						setCharacter(createEmptyCharacter())
					}}
					onImport={setCharacter}
				/>

				<div className="flex flex-1 flex-wrap items-end justify-end gap-2">
					<SignOutButton />

					<Button
						icon={<Icon icon="mingcute:delete-3-fill" />}
						onClick={deleteSelectedCharacter}
						appearance="ghost"
					>
						Delete
					</Button>

					<CharacterSelect
						characters={[
							...new Map([
								...characters.map(
									(character) => [character.key, character] as const,
								),
								// includes local characters in the list so that they're selectable before being synced
								...updatedCharacters,
							]).values(),
						]}
						selectedCharacterKey={(updatedCharacter ?? selectedCharacter)?.key}
						onChange={(character) => setSelectedCharacterKey(character.key)}
					/>
				</div>
			</CharacterEditorHeader>

			<CharacterEditor
				character={character}
				onChange={(character) => {
					setUpdatedCharacters(
						(prev) => new Map([...prev, [character.key, character]]),
					)
				}}
			/>
		</CharacterEditorLayout>
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
			<CharacterEditorHeader>
				<CharacterEditorActions
					character={character}
					onNew={() => setCharacter(createEmptyCharacter())}
					onImport={setCharacter}
				/>
				<CloudSaveCta />
			</CharacterEditorHeader>
			<CharacterEditor character={character} onChange={setCharacter} />
		</CharacterEditorLayout>
	)
}

function useCharacterFromDataParam(onParsed: (character: Character) => void) {
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

function CharacterSelect({
	characters,
	selectedCharacterKey,
	onChange,
}: {
	characters: Character[]
	selectedCharacterKey: string | undefined
	onChange: (character: Character) => void
}) {
	const selectedCharacter = characters?.find(
		(character) => character.key === selectedCharacterKey,
	)

	return (
		<Ariakit.SelectProvider
			placement="bottom-end"
			value={selectedCharacterKey}
			setValue={(newKey) => {
				const newCharacter = characters?.find(
					(character) => character.key === newKey,
				)
				if (newCharacter) {
					onChange(Character.assert(newCharacter))
				}
			}}
		>
			<Ariakit.Select render={<Button />} className="w-48 truncate">
				<span className="min-w-0 flex-1 text-start">
					{selectedCharacter == null
						? "No character selected"
						: selectedCharacter.name || "Unnamed Character"}
				</span>
				<Icon icon="mingcute:down-fill" className="ml-auto" />
			</Ariakit.Select>
			<Ariakit.SelectPopover
				portal
				unmountOnHide
				gutter={8}
				className="panel flex max-h-[min(--spacing(80),calc(100dvh_-_--spacing(4)))] min-w-[max(var(--popover-anchor-width),180px)] translate-y-1 flex-col gap-1 overflow-y-auto p-1 opacity-0 transition data-enter:translate-y-0 data-enter:opacity-100"
			>
				{characters?.map((character) => (
					<Ariakit.SelectItem
						key={character.key}
						value={character.key}
						className="hover:bg-primary-800/25 flex shrink-0 cursor-default items-center gap-2 rounded-sm px-3 py-2 transition"
					>
						{character.name || "Unnamed Character"}
					</Ariakit.SelectItem>
				))}
			</Ariakit.SelectPopover>
		</Ariakit.SelectProvider>
	)
}

function SignOutButton() {
	const { signOut } = useAuthActions()
	return (
		<Button
			icon={<Icon icon="mingcute:exit-door-fill" />}
			appearance="ghost"
			onClick={signOut}
		>
			Sign out
		</Button>
	)
}
