import * as Ariakit from "@ariakit/react"
import { Character, createEmptyCharacter } from "@workspace/shared/characters"
import { useConvex } from "convex/react"
import { useEffect, useState, useTransition } from "react"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import { Icon } from "../../components/ui/Icon.tsx"
import { SquareIconButton } from "../../components/ui/SquareIconButton.tsx"
import {
	CharacterEditor,
	CharacterEditorLayout,
	CharacterEditorMenu,
} from "./editor.tsx"
import { useCharacterFromDataParam } from "./useCharacterFromDataParam.ts"

export function RemoteCharacterEditor({
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

	async function cloneSelectedCharacter() {
		if (!selectedCharacter) return

		const clonedCharacter = await convex.mutation(api.public.characters.clone, {
			id: selectedCharacter._id,
		})

		setUpdatedCharacters(
			(prev) => new Map([...prev, [clonedCharacter.key, clonedCharacter]]),
		)
		setSelectedCharacterKey(clonedCharacter.key)
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
							characters={[
								...new Map([
									...characters.map(
										(character) => [character.key, character] as const,
									),
									// includes local characters in the list so that they're selectable before being synced
									...updatedCharacters,
								]).values(),
							]}
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
