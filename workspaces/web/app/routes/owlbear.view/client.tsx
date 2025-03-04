import OBR from "@owlbear-rodeo/sdk"
import { useEffect, useId, useState, type ComponentProps } from "react"
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

	const [view, setView] = useState<
		{ name: "characterList" } | { name: "character"; id: string }
	>({ name: "characterList" })

	const cardButtonStyle = twMerge(
		"flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 py-2 px-3 text-start hover:border-gray-700 hover:text-primary-200 transition",
	)

	return (
		<>
			{view.name === "characterList" && (
				<div className="grid gap-3 p-3">
					{["Luna", "Larissa", "Dusk"].map((name) => (
						<button
							type="button"
							key={name}
							className={cardButtonStyle}
							onClick={() => setView({ name: "character", id: name })}
						>
							<Icon icon="mingcute:right-fill" className="size-6" />
							<h2 className="heading-xl">{name}</h2>
						</button>
					))}
					<button type="button" className={cardButtonStyle}>
						<Icon icon="mingcute:user-add-2-fill" className="size-6" />
						<h2 className="heading-xl">New Character</h2>
					</button>
				</div>
			)}
			{view.name === "character" && (
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
					<div className="grid gap-3 p-3">
						<div className="flex gap-3">
							<InputField
								label="Name"
								className="flex-1"
								defaultValue={view.id}
							/>
							<InputField label="Level" className="w-16" defaultValue={3} />
						</div>
					</div>
				</>
			)}
		</>
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
				className="rounded border border-gray-800 bg-gray-900 px-3 py-1.5 transition focus:border-gray-700 focus:outline-none"
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
