import OBR from "@owlbear-rodeo/sdk"
import { ArkErrors, type } from "arktype"
import {
	startTransition,
	useEffect,
	useId,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { drives, experiences, lineages, roles } from "./data.ts"

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
*/

const Character = type({
	"id": "string = ''",
	"name": "string = ''",
	"level": "number = 1",
	"hits": "number = 0",
	"fatigue": "number = 0",
	"comeback": "number = 0",
	"lineage?": "string | null",
	"role?": "string | null",
	"drive?": "string | null",
	"experiences?": "string[]",
	"strengthBonus": "number = 0",
	"senseBonus": "number = 0",
	"dexterityBonus": "number = 0",
	"presenceBonus": "number = 0",
	"fireBonus": "number = 0",
	"waterBonus": "number = 0",
	"windBonus": "number = 0",
	"lightBonus": "number = 0",
	"darknessBonus": "number = 0",
})

type Character = typeof Character.inferOut

function createCharacter(name: string): Character {
	return {
		id: crypto.randomUUID(),
		name,
		level: 1,
		hits: 0,
		fatigue: 0,
		comeback: 0,
		strengthBonus: 0,
		senseBonus: 0,
		dexterityBonus: 0,
		presenceBonus: 0,
		fireBonus: 0,
		waterBonus: 0,
		windBonus: 0,
		lightBonus: 0,
		darknessBonus: 0,
	}
}

const metadataCharactersKey = "dev.mapleleaf.aspects/characters"

type RoomMetadata = typeof RoomMetadata.inferOut
const RoomMetadata = type({
	[metadataCharactersKey]: type.Record("string", Character).default(() => ({})),
})

export function OwlbearExtensionClient() {
	const [ready, setReady] = useState(false)

	useEffect(() => {
		return OBR.onReady(() => {
			setReady(true)
		})
	}, [])

	return ready ? (
		<ReadyView />
	) : (
		<ContentState.Loading>
			If this shows for more than 5 seconds, try refreshing the page.
		</ContentState.Loading>
	)
}

function ReadyView() {
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

function CharacterEditor({
	character,
	onUpdate,
}: {
	character: Character
	onUpdate: (patch: Partial<Character>) => void
}) {
	const stats = {
		strength: 1,
		sense: 1,
		dexterity: 1,
		presence: 1,

		fire: 0,
		water: 0,
		wind: 0,
		light: 0,
		darkness: 0,
	}

	if (character.lineage) {
		const selectedLineage = lineages.find((l) => l.name === character.lineage)
		if (selectedLineage) {
			for (const attr of selectedLineage.attributes) {
				stats[attr.name.toLowerCase() as keyof typeof stats] += 1
			}
		}
	}

	if (character.role) {
		const selectedRole = roles[character.role as keyof typeof roles]
		if (selectedRole) {
			const attrName = selectedRole.attribute.name.toLowerCase()
			stats[attrName as keyof typeof stats] += 3
		}
	}

	if (character.experiences) {
		for (const expId of character.experiences) {
			const exp = experiences[expId as keyof typeof experiences]
			if (exp) {
				const attrName = exp.attribute.name.toLowerCase()
				stats[attrName as keyof typeof stats] += 2

				if (exp.aspects.length === 1) {
					const aspectName = exp.aspects[0]!.name.toLowerCase()
					stats[aspectName as keyof typeof stats] += 2
				} else if (exp.aspects.length === 2) {
					for (const aspect of exp.aspects) {
						const aspectName = aspect.name.toLowerCase()
						stats[aspectName as keyof typeof stats] += 1
					}
				}
			}
		}
	}

	const maxHits = stats.strength + stats.dexterity + 3
	const maxFatigue = stats.sense + stats.presence

	return (
		<main className="grid gap-6 p-3">
			<div className="grid grid-cols-1 gap-3">
				<div className="flex gap-3">
					<InputField
						label="Name"
						className="flex-1"
						value={character.name}
						onSubmitValue={(value) => {
							onUpdate({ name: value })
						}}
					/>
					<InputField
						label="Level"
						type="number"
						className="w-16"
						min={1}
						max={13}
						value={character.level}
						onSubmitValue={(event) =>
							onUpdate({
								level: Number(event) || 0,
							})
						}
					/>
				</div>

				<div className="flex gap-3">
					<InputField
						label={`Hits / ${maxHits}`}
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.hits}
						onSubmitValue={(event) =>
							onUpdate({
								hits: Number(event) || 0,
							})
						}
					/>
					<InputField
						label={`Fatigue / ${maxFatigue}`}
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.fatigue}
						onSubmitValue={(event) =>
							onUpdate({
								fatigue: Number(event) || 0,
							})
						}
					/>
					<InputField
						label="Comeback"
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.comeback}
						onSubmitValue={(event) =>
							onUpdate({
								comeback: Number(event) || 0,
							})
						}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="grid content-start gap-3">
						<StatField
							label="Strength"
							type="number"
							className="min-w-0 flex-1"
							value={character.strengthBonus || 0}
							addition={stats.strength}
							onSubmitValue={(value) => onUpdate({ strengthBonus: value })}
						/>
						<StatField
							label="Sense"
							type="number"
							className="min-w-0 flex-1"
							value={character.senseBonus || 0}
							addition={stats.sense}
							onSubmitValue={(value) => onUpdate({ senseBonus: value })}
						/>
						<StatField
							label="Dexterity"
							type="number"
							className="min-w-0 flex-1"
							value={character.dexterityBonus || 0}
							addition={stats.dexterity}
							onSubmitValue={(value) => onUpdate({ dexterityBonus: value })}
						/>
						<StatField
							label="Presence"
							type="number"
							className="min-w-0 flex-1"
							value={character.presenceBonus || 0}
							addition={stats.presence}
							onSubmitValue={(value) => onUpdate({ presenceBonus: value })}
						/>
					</div>

					<div className="grid content-start gap-3">
						<StatField
							label="Fire"
							type="number"
							className="min-w-0 flex-1"
							value={character.fireBonus || 0}
							addition={stats.fire}
							onSubmitValue={(value) => onUpdate({ fireBonus: value })}
						/>
						<StatField
							label="Water"
							type="number"
							className="min-w-0 flex-1"
							value={character.waterBonus || 0}
							addition={stats.water}
							onSubmitValue={(value) => onUpdate({ waterBonus: value })}
						/>
						<StatField
							label="Wind"
							type="number"
							className="min-w-0 flex-1"
							value={character.windBonus || 0}
							addition={stats.wind}
							onSubmitValue={(value) => onUpdate({ windBonus: value })}
						/>
						<StatField
							label="Light"
							type="number"
							className="min-w-0 flex-1"
							value={character.lightBonus || 0}
							addition={stats.light}
							onSubmitValue={(value) => onUpdate({ lightBonus: value })}
						/>
						<StatField
							label="Darkness"
							type="number"
							className="min-w-0 flex-1"
							value={character.darknessBonus || 0}
							addition={stats.darkness}
							onSubmitValue={(value) => onUpdate({ darknessBonus: value })}
						/>
					</div>
				</div>
			</div>

			<ToggleSection title="Actions">todo</ToggleSection>

			<ToggleSection title="Lineage">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your lineage, which determines your physical appearance and
					traits. Hover over each one for examples.
				</p>
				<div className="grid grid-cols-2 gap-3">
					{lineages.map((lineage) => (
						<OptionCard
							type="radio"
							key={lineage.name}
							label={lineage.name}
							description={lineage.attributes
								.map((it) => `+1 ${it.name}`)
								.join(", ")}
							title={lineage.example}
							checked={character.lineage === lineage.name}
							onChange={() => onUpdate({ lineage: lineage.name })}
						/>
					))}
				</div>
			</ToggleSection>

			<ToggleSection title="Role">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your role in this society. Hover over each one for examples.
				</p>
				<div className="grid grid-cols-2 gap-3">
					{Object.entries(roles).map(([roleId, role]) => (
						<OptionCard
							type="radio"
							key={roleId}
							label={role.name}
							description={`+3 ${role.attribute.name}`}
							checked={character.role === roleId}
							onChange={() => onUpdate({ role: roleId })}
							// show name on title in case it gets truncated
							title={`${role.name} - ${role.examples}`}
						/>
					))}
				</div>
			</ToggleSection>

			<ToggleSection title="Drive">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your character's drive, the primary motivation that pushes them
					to action. Your chosen drive determines your aspect skills.
				</p>

				{character.role && (
					<>
						<h3 className="text-md mb-1 font-semibold text-gray-200">
							Suggested for the role "
							{character.role &&
								roles[character.role as keyof typeof roles]?.name}
							"
						</h3>
						<div className="mb-4 grid grid-cols-2 gap-3">
							{Object.entries(roles)
								.find(([id]) => id === character.role)?.[1]
								?.drives.map((drive) => (
									<OptionCard
										type="radio"
										key={drive.name}
										label={drive.name}
										description={drive.description}
										checked={character.drive === drive.name}
										onChange={() => onUpdate({ drive: drive.name })}
									/>
								))}
						</div>
					</>
				)}

				<h3 className="text-md mb-1 font-semibold text-gray-200">
					Other drives
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{Object.values(drives)
						.filter(
							(drive) =>
								!character.role ||
								!Object.entries(roles)
									.find(([id]) => id === character.role)?.[1]
									?.drives.includes(drive),
						)
						.map((drive) => (
							<OptionCard
								type="checkbox"
								key={drive.name}
								label={drive.name}
								description={drive.description}
								checked={character.drive === drive.name}
								onChange={() => onUpdate({ drive: drive.name })}
							/>
						))}
				</div>
			</ToggleSection>

			<ToggleSection
				title={`Experiences (${character.experiences?.length || 0}/3)`}
			>
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose three experiences from your character's past. Each experience
					adds +2 to the named attribute and increases your aspect attunement.
				</p>

				<div className="grid gap-3">
					{Object.entries(experiences).map(([id, exp]) => (
						<OptionCard
							type="checkbox"
							key={id}
							label={exp.description}
							description={[
								`${exp.attribute.name} +2`,
								exp.aspects.length === 1
									? exp.aspects.map((it) => it.name).join("") + " +2"
									: exp.aspects.map((it) => it.name + " +1").join(", "),
							]}
							checked={character.experiences?.includes(id) ?? false}
							onChange={() => {
								const currentExperiences = character.experiences || []
								if (currentExperiences.includes(id)) {
									onUpdate({
										experiences: currentExperiences.filter((exp) => exp !== id),
									})
								} else {
									onUpdate({
										experiences: [...currentExperiences, id],
									})
								}
							}}
						/>
					))}
				</div>
			</ToggleSection>
		</main>
	)
}

function OptionCard({
	type,
	label,
	description,
	className,
	checked,
	onChange,
	...props
}: ComponentProps<"label"> & {
	type: "checkbox" | "radio"
	label: ReactNode
	description: string | string[]
	checked: boolean
	onChange: () => void
}) {
	return (
		<label
			className={twMerge(
				"has-checked:bg-primary-dark has-checked:border-primary-900/75 has-checked:hover:border-primary-900 flex flex-col justify-evenly rounded border border-gray-800 bg-gray-900 px-2 py-1.5 transition-colors select-none hover:border-gray-700",
				className,
			)}
			{...props}
		>
			<input
				type={type}
				className="sr-only"
				checked={checked}
				onChange={() => onChange()}
			/>
			<header
				className="group flex items-center gap-1.5"
				data-checked={checked}
			>
				<h3 className="heading-xl min-w-0 flex-1 truncate text-lg">{label}</h3>
				<Icon
					icon="mingcute:check-circle-fill"
					className="text-primary-200/50 shrink-0 opacity-0 transition-opacity group-data-[checked=true]:opacity-100"
				/>
			</header>
			<p className="text-sm text-gray-400">
				{Array.isArray(description)
					? description.map((line, index) => (
							<span key={index} className="block">
								{line}
								{index < description.length - 1 && <br />}
							</span>
						))
					: description}
			</p>
		</label>
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
}: ComponentProps<"input"> & {
	label: string
	onSubmitValue: (value: string) => void
}) {
	const id = useId()
	return (
		<Field
			{...props}
			label={label}
			className={className}
			htmlFor={props.id ?? id}
		>
			<SubmitInput
				{...props}
				id={props.id ?? id}
				className="min-w-0 flex-1 rounded border border-gray-800 bg-gray-900 px-2 py-1 transition focus:border-gray-700 focus:outline-none"
			/>
		</Field>
	)
}

function StatField({
	label,
	className,
	addition,
	value,
	onSubmitValue,
	...props
}: ComponentProps<"input"> & {
	label: string
	value: number
	addition: number
	onSubmitValue: (value: number) => void
}) {
	const id = useId()

	return (
		<div
			className={twMerge("flex items-center gap-1.5 tabular-nums", className)}
			{...props}
		>
			<label htmlFor={id} className="w-18 text-end text-sm font-semibold">
				{label}
			</label>
			<strong className="w-4 text-end text-lg">{value + addition}</strong>
			<span className="mx-1 h-5 w-px bg-gray-700"></span>
			<SubmitInput
				id={id}
				value={value}
				type="number"
				min={0}
				onSubmitValue={(value) => {
					onSubmitValue(Number(value) || 0)
				}}
				{...props}
				className="w-14 min-w-0 rounded border border-gray-800 bg-gray-900 px-2 py-1 transition focus:border-gray-700 focus:outline-none"
			/>
			<p className="shrink-0 cursor-default text-gray-400" title="lore bonuses">
				+{addition}
			</p>
		</div>
	)
}

function SubmitInput({
	onSubmitValue,
	...props
}: ComponentProps<"input"> & {
	onSubmitValue: (value: string) => void
}) {
	const [tempValue, setTempValue] = useState<string>()
	return (
		<input
			{...props}
			value={tempValue ?? props.value}
			onFocus={(event) => {
				setTempValue(event.currentTarget.value)
			}}
			onBlur={() => {
				if (tempValue) {
					setTempValue(undefined)
					onSubmitValue(tempValue)
				}
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" && tempValue) {
					event.preventDefault()
					setTempValue(undefined)
					onSubmitValue(tempValue)
					event.currentTarget.blur()
				}
			}}
			onChange={(event) => {
				if (tempValue != null) {
					setTempValue(event.currentTarget.value)
				} else {
					props.onChange?.(event)
				}
			}}
		/>
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
