import OBR from "@owlbear-rodeo/sdk"
import { ArkErrors, type } from "arktype"
import { startTransition, useEffect, useState, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
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

	function handleMetadataChange(metadataRaw: unknown) {
		const metadata = RoomMetadata(metadataRaw)
		if (metadata instanceof ArkErrors) {
			console.error(metadata)
			return
		}
		setCharacters(new Map(Object.entries(metadata[metadataCharactersKey])))
	}

	useEffect(() => {
		// set characters from metadata
		OBR.room.getMetadata().then(handleMetadataChange)
	}, [])

	useEffect(() => {
		return OBR.room.onMetadataChange(handleMetadataChange)
	}, [handleMetadataChange])

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

	return (
		<>
			{view.name === "characterList" && (
				<main className="grid gap-3 p-3">
					{[...characters.values()].map((character) => (
						<button
							type="button"
							key={character.id}
							className={cardButtonStyle}
							onClick={() => setView({ name: "character", id: character.id })}
						>
							<Icon icon="mingcute:right-fill" className="size-6" />
							<h2 className="heading-xl">{character.name}</h2>
						</button>
					))}
					<button
						type="button"
						className={cardButtonStyle}
						onClick={() => {
							const character = addNewCharacter()
							setView({ name: "character", id: character.id })
						}}
					>
						<Icon icon="mingcute:user-add-2-fill" className="size-6" />
						<h2 className="heading-xl">New Character</h2>
					</button>
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
					/>
				</>
			)}
		</>
	)
}
