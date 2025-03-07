import OBR from "@owlbear-rodeo/sdk"
import { ArkErrors, type } from "arktype"
import { useEffect, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { ActionsList } from "./ActionsList.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import { CharacterListActions } from "./CharacterListActions.tsx"
import { CharacterResourceFields } from "./CharacterResourceFields.tsx"
import {
	DicePanel,
	DiceRoll as DiceRollSchema,
	useDicePanelStore,
	type DiceRoll,
} from "./DicePanel.tsx"
import { ToggleSection } from "./ToggleSection.tsx"
import { Character, createCharacter } from "./character.ts"
import { owlbearExtensionNamespace } from "./extension.ts"
import { broadcastNotification } from "./notifications.ts"

const metadataCharactersKey = `${owlbearExtensionNamespace}/characters`
const metadataDiceRollsKey = `${owlbearExtensionNamespace}/diceRolls`

type RoomMetadata = typeof RoomMetadata.inferOut
const RoomMetadata = type({
	[metadataCharactersKey]: type.Record("string", Character).default(() => ({})),
	[metadataDiceRollsKey]: type(DiceRollSchema)
		.array()
		.default(() => []),
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
	const [diceRolls, setDiceRolls] = useState<DiceRoll[]>([])
	const [isDicePanelOpen, setIsDicePanelOpen] = useState(false)
	const dicePanelStore = useDicePanelStore()

	const [view, setView] = useState<
		{ name: "characterList" } | { name: "character"; id: string }
	>({ name: "characterList" })

	useEffect(() => {
		async function handleMetadataChange(metadataRaw: unknown) {
			const parsed = RoomMetadata(metadataRaw)
			if (parsed instanceof ArkErrors) {
				console.error("Failed to parse room metadata:", parsed.summary)
				return
			}

			setCharacters(new Map(Object.entries(parsed[metadataCharactersKey])))
			setDiceRolls(parsed[metadataDiceRollsKey])
		}

		OBR.room.getMetadata().then(handleMetadataChange)
		return OBR.room.onMetadataChange(handleMetadataChange)
	}, [])

	async function saveMetadata({
		characters,
		rolls,
	}: {
		characters?: Map<string, Character>
		rolls?: DiceRoll[]
	}) {
		const newRolls = rolls
			?.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, 20)

		await OBR.room.setMetadata({
			...(newRolls && {
				[metadataDiceRollsKey]: newRolls,
			}),
			...(characters && {
				[metadataCharactersKey]: Object.fromEntries(characters),
			}),
		})

		if (characters) setCharacters(characters)
		if (newRolls) setDiceRolls(newRolls)
	}

	async function addNewCharacter() {
		const character = createCharacter("New Character")
		const newCharacters = new Map(characters).set(character.id, character)
		await saveMetadata({ characters: newCharacters })
		return character
	}

	async function cloneCharacter(characterToClone: Character) {
		const clone = {
			...characterToClone,
			id: crypto.randomUUID(),
			name: `${characterToClone.name} (Copy)`,
		}
		const newCharacters = new Map(characters).set(clone.id, clone)
		await saveMetadata({ characters: newCharacters })
		return clone
	}

	async function deleteCharacter(id: string) {
		const character = characters.get(id)
		if (!character) return

		const confirmMessage = `Are you sure you want to delete "${character.name}"? This cannot be undone.`

		if (!confirm(confirmMessage)) return

		if (view.name === "character" && view.id === id) {
			setView({ name: "characterList" })
		}

		const newCharacters = new Map(characters)
		newCharacters.delete(id)
		await saveMetadata({ characters: newCharacters })
	}

	async function updateCharacter(id: string, patch: Partial<Character>) {
		const currentCharacter =
			characters.get(id) ?? createCharacter("Unknown Character")

		const newCharacters = new Map(characters).set(id, {
			...currentCharacter,
			...patch,
		})

		await saveMetadata({ characters: newCharacters })
	}

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

	async function handleRoll({
		characterId,
		fatigue,
		results,
		isSuccess,
		comebackSpent,
		label,
	}: {
		characterId: string
		fatigue: number
		results: number[]
		isSuccess: boolean
		comebackSpent: number
		label: string
	}): Promise<void> {
		let character = characterId ? characters.get(characterId) : null

		if (character) {
			const updates: Partial<Character> = {}

			if (fatigue > 0) {
				updates.fatigue = character.fatigue + fatigue
			}

			if (comebackSpent > 0) {
				updates.comeback = Math.max(0, character.comeback - comebackSpent)
			} else if (!isSuccess) {
				updates.comeback = character.comeback + 1
			}

			character = { ...character, ...updates }
		}

		await saveMetadata({
			characters: character
				? new Map(characters).set(character.id, character)
				: undefined,
			rolls: [
				{
					id: crypto.randomUUID(),
					timestamp: Date.now(),
					label,
					diceCount: results.length,
					results,
					characterName: character?.name,
					comebackUsed: comebackSpent > 0 ? comebackSpent : undefined,
				},
				...diceRolls,
			],
		})

		const successes = results.reduce((sum, value) => {
			if (value >= 10 && value <= 11) return sum + 1
			if (value === 12) return sum + 2
			return sum
		}, 0)

		const successText = isSuccess
			? `${successes} ${successes === 1 ? "success" : "successes"}`
			: "failed"

		const characterText = character ? `${character.name} rolled ` : ""

		await broadcastNotification({
			text: `${characterText}${label || "Dice Roll"} — ${successText}`,
			variant: isSuccess ? "SUCCESS" : "DEFAULT",
		})
	}

	const cardButtonStyle = twMerge(
		"flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 py-2 px-3 text-start hover:border-gray-700 hover:text-primary-200 transition",
	)

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
							onClick={async () => {
								const character = await addNewCharacter()
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

			<DicePanel
				store={dicePanelStore}
				isOpen={isDicePanelOpen}
				setOpen={setIsDicePanelOpen}
				diceRolls={diceRolls}
				onRoll={handleRoll}
				characters={characters}
			/>
		</>
	)
}
