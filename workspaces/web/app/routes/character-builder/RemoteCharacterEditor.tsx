import * as Ariakit from "@ariakit/react"
import { api } from "@workspace/backend/convex/_generated/api"
import type { Doc } from "@workspace/backend/convex/_generated/dataModel"
import { Character, createEmptyCharacter } from "@workspace/data/characters"
import { useConvex } from "convex/react"
import { useEffect, useState, useTransition } from "react"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { Icon } from "../../components/ui/Icon.tsx"
import { SquareIconButton } from "../../components/ui/SquareIconButton.tsx"
import {
	CharacterEditor,
	CharacterEditorLayout,
	CharacterEditorMenu,
} from "./editor.tsx"
import { useCharacterFromDataParam } from "./useCharacterFromDataParam.ts"

export function RemoteCharacterEditor({
	characters: remoteCharacterList,
}: {
	characters: Doc<"characters">[]
}) {
	const convex = useConvex()

	const remoteCharacters = new Map(
		remoteCharacterList.flatMap((c) =>
			c.fields ? [[c.fields.key, c.fields]] : [],
		),
	)

	const [updatedCharacters, setUpdatedCharacters] = useState<
		Map<string, Character>
	>(new Map())

	const characters = new Map([...remoteCharacters, ...updatedCharacters])

	const [selectedCharacterKey, setSelectedCharacterKey] = useLocalStorage(
		"RemoteCharacterEditor:selectedCharacterKey",
		null,
		(input) => (input === null ? null : String(input)),
	)

	const selectedCharacter = selectedCharacterKey
		? characters.get(selectedCharacterKey)
		: [...characters.values()][0]

	useCharacterFromDataParam((character) => {
		setUpdatedCharacters(
			(prev) => new Map([...prev, [character.key, character]]),
		)
		setSelectedCharacterKey(character.key)
	})

	const updatedCharacter = selectedCharacterKey
		? updatedCharacters.get(selectedCharacterKey)
		: null

	useEffect(() => {
		if (updatedCharacter) {
			convex.mutation(api.public.characters.upsert, updatedCharacter)
		}
	}, [updatedCharacter])

	function deleteSelectedCharacter() {
		if (!selectedCharacter) return

		const remoteCharacter = remoteCharacterList.find(
			(c) => c.fields?.key === selectedCharacter.key,
		)
		if (!remoteCharacter) return

		const yes = confirm(
			"Are you sure you want to delete this character? This action cannot be undone.",
		)
		if (!yes) return

		setUpdatedCharacters((prev) => {
			const next = new Map(prev)
			next.delete(selectedCharacter.key)
			return next
		})
		setSelectedCharacterKey(null)

		convex.mutation(api.public.characters.delete, {
			id: remoteCharacter._id,
		})
	}

	async function cloneSelectedCharacter() {
		if (!selectedCharacter) return

		const remoteCharacter = remoteCharacterList.find(
			(c) => c.fields?.key === selectedCharacter.key,
		)
		if (!remoteCharacter) return

		const clonedCharacter = await convex.mutation(api.public.characters.clone, {
			id: remoteCharacter._id,
		})

		setUpdatedCharacters(
			(prev) =>
				new Map([
					...prev,
					[clonedCharacter.fields.key, clonedCharacter.fields],
				]),
		)
		setSelectedCharacterKey(clonedCharacter.fields.key)
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
			<CharacterEditor
				actions={
					<>
						<CharacterSwitcher
							characters={[...characters.values()]}
							onSelect={(character) => setSelectedCharacterKey(character.key)}
						/>
						<CharacterEditorMenu
							character={character}
							onNew={() => setCharacter(createEmptyCharacter())}
							onImport={setCharacter}
							onDelete={deleteSelectedCharacter}
							onClone={selectedCharacter ? cloneSelectedCharacter : null}
						/>
					</>
				}
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

function CharacterSwitcher({
	characters,
	onSelect,
}: {
	characters: Character[]
	onSelect: (character: Character) => void
}) {
	const [open, setOpen] = useState(false)
	return (
		<Ariakit.MenuProvider placement="bottom-end" open={open} setOpen={setOpen}>
			<SquareIconButton
				icon={<Icon icon="mingcute:user-setting-fill" />}
				render={<Ariakit.MenuButton />}
			>
				Switch character
			</SquareIconButton>

			<Ariakit.Menu className="menu-panel" portal unmountOnHide gutter={8}>
				{characters.map((character) => (
					<CharacterSwitcherItem
						key={character.key}
						character={character}
						onClick={() => {
							onSelect(character)
							setOpen(false)
						}}
					/>
				))}
			</Ariakit.Menu>
		</Ariakit.MenuProvider>
	)
}

function CharacterSwitcherItem({
	character,
	onClick,
}: {
	character: Character
	onClick: (character: Character) => void
}) {
	const [pending, startTransition] = useTransition()
	return (
		<Ariakit.MenuItem
			key={character.key}
			className="menu-item"
			hideOnClick={false}
			onClick={() => {
				startTransition(() => {
					onClick(character)
				})
			}}
		>
			<div className="flex-1">{character.name || "Unnamed Character"}</div>
			{pending && (
				<Icon icon="mingcute:loading-3-fill" className="size-6 animate-spin" />
			)}
		</Ariakit.MenuItem>
	)
}
