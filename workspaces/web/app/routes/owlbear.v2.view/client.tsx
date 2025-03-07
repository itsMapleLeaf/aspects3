import OBR from "@owlbear-rodeo/sdk"
import { ArkErrors, type } from "arktype"
import { startTransition, useEffect, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { ActionsList } from "./ActionsList.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import { CharacterListActions } from "./CharacterListActions.tsx"
import { CharacterResourceFields } from "./CharacterResourceFields.tsx"
import { DicePanel, useDicePanelStore } from "./DicePanel.tsx"
import { ToggleSection } from "./ToggleSection.tsx"
import { Character, createCharacter } from "./character.ts"

const metadataCharactersKey = "dev.mapleleaf.aspects/characters"

type RoomMetadata = typeof RoomMetadata.inferOut
const RoomMetadata = type({
	[metadataCharactersKey]: type.Record("string", Character).default(() => ({})),
})

export function OwlbearExtensionClient() {
	return (
		<OwlbearReadyGuard>
			<ExtensionClientView />
		</OwlbearReadyGuard>
	)
}

function OwlbearReadyGuard({ children }: { children: ReactNode }) {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		return OBR.onReady(() => {
			setReady(true)
		})
	}, [])

	return ready ? (
		children
	) : (
		<ContentState.Loading>
			If this shows for more than 5 seconds, try refreshing the page.
		</ContentState.Loading>
	)
}

function ExtensionClientView() {
	const [characters, setCharacters] = useState(new Map<string, Character>())
	const [isDicePanelOpen, setIsDicePanelOpen] = useState(false)
	const dicePanelStore = useDicePanelStore()

	useEffect(() => {
		function handleMetadataChange(metadataRaw: unknown) {
			const metadata = RoomMetadata(metadataRaw)
			if (metadata instanceof ArkErrors) {
				console.error(metadata)
				return
			}
			setCharacters(new Map(Object.entries(metadata[metadataCharactersKey])))
		}

		OBR.room.getMetadata().then(handleMetadataChange)
		return OBR.room.onMetadataChange(handleMetadataChange)
	}, [])

	function saveCharacters(newCharacters: Map<string, Character>) {
		startTransition(async () => {
			try {
				await OBR.room.setMetadata({
					[metadataCharactersKey]: Object.fromEntries(newCharacters),
				})
			} catch (error) {
				console.error(error)
			}
		})
	}

	function addNewCharacter() {
		const character = createCharacter("New Character")
		const newCharacters = new Map(characters).set(character.id, character)
		saveCharacters(newCharacters)
		return character
	}

	function cloneCharacter(characterToClone: Character) {
		const clone = {
			...characterToClone,
			id: crypto.randomUUID(),
			name: `${characterToClone.name} (Copy)`,
		}
		const newCharacters = new Map(characters).set(clone.id, clone)
		saveCharacters(newCharacters)
		return clone
	}

	function deleteCharacter(id: string) {
		const character = characters.get(id)

		if (!character) return

		const confirmMessage = `Are you sure you want to delete "${character.name}"? This cannot be undone.`

		if (confirm(confirmMessage)) {
			const newCharacters = new Map(characters)
			newCharacters.delete(id)
			saveCharacters(newCharacters)

			if (view.name === "character" && view.id === id) {
				setView({ name: "characterList" })
			}
		}
	}

	function updateCharacter(id: string, patch: Partial<Character>) {
		const currentCharacter =
			characters.get(id) ?? createCharacter("Unknown Character")

		const newCharacters = new Map(characters).set(id, {
			...currentCharacter,
			...patch,
		})

		saveCharacters(newCharacters)
	}

	const [view, setView] = useState<
		{ name: "characterList" } | { name: "character"; id: string }
	>({ name: "characterList" })

	const cardButtonStyle = twMerge(
		"flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 py-2 px-3 text-start hover:border-gray-700 hover:text-primary-200 transition",
	)

	function handleActionRoll(
		actionName: string,
		diceCount: number,
		fatigue: number,
		characterId: string,
	) {
		dicePanelStore.setLabel(actionName)
		dicePanelStore.setCount(diceCount)
		dicePanelStore.setFatigue(fatigue)
		dicePanelStore.setSelectedCharacterId(characterId)
		setIsDicePanelOpen(true)
	}

	function openDicePanel() {
		setIsDicePanelOpen(true)
	}

	return (
		<>
			{view.name === "characterList" && (
				<main className="flex min-h-dvh flex-col gap-3 overflow-clip p-3">
					<ul className="flex min-h-0 flex-1 flex-col gap-3">
						{[...characters.values()].map((character) => (
							<li key={character.id}>
								<ToggleSection
									title={character.name}
									titlePostfix={
										<CharacterListActions
											character={character}
											onEdit={(id) => setView({ name: "character", id })}
											onClone={cloneCharacter}
											onDelete={deleteCharacter}
										/>
									}
								>
									<div className="mt-3 flex flex-col gap-3">
										<CharacterResourceFields
											character={character}
											onUpdate={(patch) => updateCharacter(character.id, patch)}
										/>
										<ActionsList
											character={character}
											onRollAction={handleActionRoll}
										/>
									</div>
								</ToggleSection>
							</li>
						))}
					</ul>
					<footer className="sticky bottom-0 -m-3 bg-gray-950 p-3">
						<button
							type="button"
							className={cardButtonStyle}
							onClick={() => {
								const character = addNewCharacter()
								setView({ name: "character", id: character.id })
							}}
						>
							<Icon icon="mingcute:user-add-2-fill" className="size-6" /> New
							Character
						</button>
					</footer>
				</main>
			)}

			{view.name === "character" && (
				<>
					<header className="sticky top-0 bg-gray-900">
						<button
							type="button"
							className="hover:text-primary-200 flex items-center gap-0.5 px-3 py-2 text-start transition"
							onClick={() => setView({ name: "characterList" })}
						>
							<Icon
								icon="mingcute:left-fill"
								className="pointer-events-none size-5 translate-y-px"
							/>
							<span>Back</span>
						</button>
					</header>
					<CharacterEditor
						character={
							characters.get(view.id) ?? createCharacter("New Character")
						}
						onUpdate={(patch) => updateCharacter(view.id, patch)}
						onRollAction={handleActionRoll}
					/>
				</>
			)}

			<button
				type="button"
				onClick={openDicePanel}
				className="hover:text-primary-300 fixed right-4 bottom-4 flex size-14 items-center justify-center rounded-full border border-gray-800 bg-gray-900 shadow-lg transition hover:border-gray-700"
				title="Show dice roller"
			>
				<Icon icon="mingcute:box-3-fill" className="size-8" />
			</button>

			<DicePanel
				store={dicePanelStore}
				isOpen={isDicePanelOpen}
				onClose={() => setIsDicePanelOpen(false)}
				onRoll={({ characterId, fatigue, isSuccess, comebackSpent }) => {
					const character = characters.get(characterId)
					if (character) {
						const updates: Partial<Character> = {}

						// Apply fatigue cost if applicable
						if (fatigue > 0) {
							updates.fatigue = character.fatigue + fatigue
						}

						// Deduct comeback points if spent
						if (comebackSpent > 0) {
							updates.comeback = Math.max(0, character.comeback - comebackSpent)
						}
						// Add comeback point if roll failed
						else if (!isSuccess) {
							updates.comeback = character.comeback + 1
						}

						updateCharacter(characterId, updates)
					}
				}}
				characters={characters}
			/>
		</>
	)
}
