import OBR from "@owlbear-rodeo/sdk"
import {
	useEffect,
	useId,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"
import { Icon } from "~/components/ui/Icon.tsx"

/*
materials needed as player:
- At least one character sheet (may play multiple characters or have versions of one, they should be switchable)
- Dice

materials needed as DM:
- Maps (covered by owlbear)
- Several character sheets
- NPC sheets (like character sheets, but token resources (hits/fatigue) are unique)
- Dice

feature set:
- Character browser
	- For GM: List all characters in room
	- For Player: only show their own character(s)
- Character sheet viewer
	- Header
		- "Back to Character List" button
		- Quick dropdown character switcher
	- Name
	- Level
	- Image
	- Settings
		- NPC?
			- if false (default), tokens are synced with the sheet resources
			- if true, tokens track own resources
	- Stats
		- Attribute Scores
		- Aspect scores
		- Aspect skills
	- Resources
		- Hits / Max
		- Fatigue / Max
		- Comeback
	- Lore
		- Lineage
		- Role
		- Experiences
- Dice roller + history

todo:
- [ ] show the name of selected tokens
*/

type Character = {
	id: string
	name: string
	level: number
	hits: number
	fatigue: number
	comeback: number
}

function createCharacter(name: string): Character {
	return {
		id: crypto.randomUUID(),
		name,
		level: 1,
		hits: 0,
		fatigue: 0,
		comeback: 0,
	}
}

export function OwlbearExtensionClient() {
	// const [player, setPlayer] = useState<Player>()
	// useOwlbearReadyEffect(() => {
	// 	return OBR.player.onChange((player) => {
	// 		setPlayer(player)
	// 	})
	// })

	// const [sceneItems, setSceneItems] = useState<Map<string, SceneItem>>(
	// 	new Map(),
	// )
	// useOwlbearReadyEffect(() => {
	// 	return OBR.scene.items.onChange((items) => {
	// 		setSceneItems(new Map(items.map((item) => [item.id, item])))
	// 	})
	// })

	// const selectedSceneItems =
	// 	player?.selection?.flatMap((id) => sceneItems.get(id) ?? []) ?? []

	const [characters, setCharacters] = useState(() => {
		const map = new Map<string, Character>()
		for (const name of ["Luna", "Larissa", "Dusk"]) {
			const character = createCharacter(name)
			map.set(character.id, character)
		}
		return map
	})

	function updateCharacter(id: string, patch: Partial<Character>) {
		setCharacters((characters) => {
			const currentCharacter =
				characters.get(id) ?? createCharacter("Unknown Character")
			return new Map(characters).set(id, {
				...currentCharacter,
				...patch,
			})
		})
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
					<button type="button" className={cardButtonStyle}>
						<Icon icon="mingcute:user-add-2-fill" className="size-6" />
						<h2 className="heading-xl">New Character</h2>
					</button>
				</main>
			)}

			{view.name === "character" &&
				(() => {
					const character =
						characters.get(view.id) ?? createCharacter("New Character")
					return (
						<>
							<header className="bg-gray-900">
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
							<main className="grid gap-3 p-3">
								<div className="flex gap-3">
									<InputField
										label="Name"
										className="flex-1"
										value={character.name}
										onChange={(event) => {
											updateCharacter(character.id, {
												name: event.target.value,
											})
										}}
									/>
									<InputField
										label="Level"
										type="number"
										className="w-16"
										min={1}
										max={13}
										value={character.level}
										onChange={(event) =>
											updateCharacter(character.id, {
												level: event.target.valueAsNumber || 1,
											})
										}
									/>
								</div>
								<div className="flex gap-3">
									<InputField
										label="Hits"
										type="number"
										className="flex-1"
										min={0}
										value={character.hits}
										onChange={(event) =>
											updateCharacter(character.id, {
												hits: event.target.valueAsNumber || 0,
											})
										}
									/>
									<InputField
										label="Fatigue"
										type="number"
										className="flex-1"
										min={0}
										value={character.fatigue}
										onChange={(event) =>
											updateCharacter(character.id, {
												fatigue: event.target.valueAsNumber || 0,
											})
										}
									/>
									<InputField
										label="Comeback"
										type="number"
										className="flex-1"
										min={0}
										value={character.fatigue}
										onChange={(event) =>
											updateCharacter(character.id, {
												fatigue: event.target.valueAsNumber || 0,
											})
										}
									/>
								</div>
								<ToggleSection title="Stats">Stats</ToggleSection>
								<ToggleSection title="Lore">Lore</ToggleSection>
							</main>
						</>
					)
				})()}
		</>
	)
}

function ToggleSection({
	title,
	className,
	children,
	...props
}: ComponentProps<"details"> & { title: ReactNode }) {
	return (
		<details className={twMerge("group", className)} {...props}>
			<summary className="heading-2xl hover:text-primary-200 flex cursor-default list-none items-center justify-between gap-1 transition select-none">
				{title}
				<Icon
					icon="mingcute:left-fill"
					className="size-6 transition group-open:-rotate-90"
				/>
			</summary>
			{children}
		</details>
	)
}

function Field({
	label,
	className,
	children,
	htmlFor,
	...props
}: ComponentProps<"div"> & { label: string; htmlFor?: string }) {
	return (
		<div className={twMerge("flex flex-col gap-0.5", className)} {...props}>
			<label htmlFor={htmlFor} className="text-sm/4 font-semibold">
				{label}
			</label>
			{children}
		</div>
	)
}

function InputField({
	label,
	className,
	...props
}: ComponentProps<"input"> & { label: string }) {
	const id = useId()
	return (
		<Field
			label={label}
			className={className}
			htmlFor={props.id ?? id}
			{...props}
		>
			<input
				{...props}
				className="w-full min-w-0 rounded border border-gray-800 bg-gray-900 px-3 py-1.5 transition focus:border-gray-700 focus:outline-none"
			/>
		</Field>
	)
}

function useOwlbearReadyEffect(
	callback: () => (() => void) | undefined | void,
) {
	useEffect(() => {
		if (OBR.isReady) {
			console.debug("sync ready")
			return callback()
		}

		let callbackCleanup: (() => void) | undefined | void

		const cleanup = OBR.onReady(() => {
			console.debug("async ready")
			callbackCleanup = callback()
		}) as unknown as () => void

		return () => {
			cleanup()
			callbackCleanup?.()
		}
	}, [callback])
}
