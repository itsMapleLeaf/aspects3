import * as Ariakit from "@ariakit/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useConvex, useConvexAuth, useQuery } from "convex/react"
import {
	useEffect,
	useRef,
	useState,
	useTransition,
	type ComponentProps,
	type ReactNode,
} from "react"
import { useSearchParams } from "react-router"
import { twMerge } from "tailwind-merge"
import { useDiceTray } from "~/components/DiceTray.tsx"
import { Button } from "~/components/ui/Button.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { IconTooltip } from "~/components/ui/IconTooltip.tsx"
import { Input } from "~/components/ui/Input.tsx"
import { TextArea } from "~/components/ui/TextArea.tsx"
import { Tooltip } from "~/components/ui/Tooltip.tsx"
import { aspectNames } from "~/data/aspects.ts"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "~/data/attributes.ts"
import {
	Character,
	createEmptyCharacter,
	formatTraitList,
	getAspectTotal,
	getAttributeTotal,
	getAttributeValue,
	getAvailableProficiencies,
	getResolve,
	getSkillPowerDice,
	getToughness,
} from "~/data/characters.ts"
import { traits } from "~/data/traits.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { pipe, timeoutPromise } from "~/lib/utils.ts"
import { StatMeter } from "~/routes/character-builder/StatMeter.tsx"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import { getPageMeta } from "../../meta.ts"
import { UploadButton, useUploadThing } from "../api.images/components.ts"
import { AspectArts } from "./AspectArts.tsx"
import { AspectInput } from "./AspectInput.tsx"
import { AttributeInput } from "./AttributeInput.tsx"
import { CloudSaveCta } from "./CloudSaveCta.tsx"
import { TraitSelection } from "./TraitSelection.tsx"

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

				<div className="flex gap-2 items-end justify-end flex-wrap flex-1">
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

function CharacterEditorLayout(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"py-6 @container flex flex-col gap-2",
				props.className,
			)}
		/>
	)
}

function CharacterEditorHeader(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"flex flex-wrap items-start gap-2 justify-between",
				props.className,
			)}
		/>
	)
}

function CharacterEditorActions({
	character,
	onNew,
	onImport,
}: {
	character: Character
	onNew: () => void
	onImport: (character: Character) => void
}) {
	function downloadCharacter() {
		const serialized = JSON.stringify(character, null, 2)
		const url = URL.createObjectURL(
			new Blob([serialized], { type: "application/json" }),
		)

		const suggestedName =
			character.name.split(/\s+/).slice(0, 1).join("").toLocaleLowerCase() ||
			"character"

		const a = document.createElement("a")
		a.href = url
		a.download = `${suggestedName}.json`
		a.click()
		URL.revokeObjectURL(url)
	}

	function importCharacter() {
		const input = document.createElement("input")
		input.type = "file"
		input.accept = ".json,application/json"
		input.addEventListener("change", async () => {
			const file = input.files?.[0]
			if (!file) return
			try {
				const data = await file.text()
				const parsed = JSON.parse(data)
				const character = {
					...Character.assert(parsed),
					key: crypto.randomUUID(),
				}
				onImport(character)
			} catch (error) {
				alert(`Import failed: ${error}`)
			}
		})
		input.click()
	}

	return (
		<div className="flex gap-2 items-end flex-wrap-reverse flex-1">
			<Button onClick={onNew} icon={<Icon icon="mingcute:file-new-fill" />}>
				New
			</Button>
			<Button
				onClick={downloadCharacter}
				icon={<Icon icon="mingcute:file-export-fill" />}
			>
				Export...
			</Button>
			<Button
				onClick={importCharacter}
				icon={<Icon icon="mingcute:file-import-fill" />}
			>
				Import...
			</Button>
			<ShareButton character={character} />
		</div>
	)
}

function CharacterEditor({
	character,
	onChange,
}: {
	character: Character
	onChange: (character: Character) => void
}) {
	function updateAttribute(attr: AttributeName & string, value: string) {
		onChange({
			...character,
			attributes: {
				...character.attributes,
				[attr]: value,
			},
		})
	}

	function updateAspect(aspect: string, value: string) {
		onChange({
			...character,
			aspects: {
				...character.aspects,
				[aspect]: value,
			},
		})
	}

	function toggleTrait(traitName: string) {
		onChange({
			...character,
			traits: character.traits.includes(traitName)
				? character.traits.filter((t) => t !== traitName)
				: [...character.traits, traitName],
		})
	}

	const selectedTraits = traits
		.filter((trait) =>
			character.traits.some((selected) => selected === trait.name),
		)
		.map((trait) => trait.name)

	const remainingTraits = 3 - selectedTraits.length

	const traitsDescription =
		remainingTraits > 0 ? `Choose ${remainingTraits} more` : undefined

	return (
		<>
			<div className="grid gap-2">
				<NameInput
					name={character.name}
					onChange={(name) => onChange({ ...character, name })}
				/>
				<TraitList traits={selectedTraits} />
			</div>

			<div className="@xl:hidden">
				<CharacterImage
					imageUrl={character.imageUrl}
					onChangeUrl={(imageUrl) => onChange({ ...character, imageUrl })}
				/>
			</div>

			<div className="grid gap-8 grid-cols-1 @xl:grid-cols-[1fr_auto]">
				<div className="space-y-6 min-w-0 @container">
					<AttributeInputList
						attributes={character.attributes}
						onChange={updateAttribute}
					/>

					<AspectInputList character={character} onChange={updateAspect} />

					<div className="grid grid-cols-2 @md:grid-cols-3 gap-4">
						<HitsBar
							character={character}
							onChange={(hits) => onChange({ ...character, hits })}
						/>
						<FatigueBar
							character={character}
							onChange={(fatigue) => onChange({ ...character, fatigue })}
						/>
						<ComebackCounter
							value={character.comeback ?? "0"}
							onChange={(comeback) => onChange({ ...character, comeback })}
						/>
					</div>

					<TextArea
						label="Details"
						placeholder="Character backstory, personality, or other notes."
						value={character.details}
						onChange={(event) =>
							onChange({
								...character,
								details: event.target.value,
							})
						}
					/>
				</div>

				<div className="hidden @xl:block w-80">
					<CharacterImage
						imageUrl={character.imageUrl}
						onChangeUrl={(imageUrl) => onChange({ ...character, imageUrl })}
					/>
				</div>
			</div>

			<ToggleSection
				title="Traits"
				tooltip="Character features that offer attribute bonuses."
				description={traitsDescription}
			>
				<div className="grid gap-4 grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3">
					<TraitSelection
						selectedTraits={selectedTraits}
						onTraitToggle={toggleTrait}
					/>
				</div>
			</ToggleSection>

			<div className="mt-6 space-y-6">
				<ToggleSection
					title="Skills"
					tooltip="Various actions you can make in the game."
				>
					<div className="grid gap-8 grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3">
						{attributeNames.map((attribute) => (
							<SkillList
								key={attribute}
								attribute={attribute}
								character={character}
								onToggleSkill={(skill) => {
									onChange({
										...character,
										proficientSkills: character.proficientSkills.includes(skill)
											? character.proficientSkills.filter((s) => s !== skill)
											: [...character.proficientSkills, skill],
									})
								}}
							/>
						))}
					</div>
				</ToggleSection>

				<ToggleSection
					title="Aspect Arts"
					tooltip="Abilities performed through aspect manipulation."
				>
					<AspectArts character={character} />
				</ToggleSection>
			</div>
		</>
	)
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
				<span className="flex-1 text-start min-w-0">
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
				className="
					panel
					min-w-[max(var(--popover-anchor-width),180px)]
					max-h-[min(--spacing(80),calc(100dvh_-_--spacing(4)))]
					overflow-y-auto
					flex flex-col gap-1 p-1
					transition
					translate-y-1 data-enter:translate-y-0
					opacity-0 data-enter:opacity-100
				"
			>
				{characters?.map((character) => (
					<Ariakit.SelectItem
						key={character.key}
						value={character.key}
						className="flex shrink-0 items-center gap-2 px-3 py-2 hover:bg-primary-800/25 rounded-sm cursor-default transition"
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

type ToggleSectionProps = {
	title: string
	description?: string
	tooltip?: string
	children: ReactNode
	className?: string
}

function ToggleSection({
	title,
	description,
	tooltip,
	children,
	className = "",
}: ToggleSectionProps) {
	const [visible, setVisible] = useLocalStorage(
		`ToggleSection:${title}`,
		true,
		Boolean,
	)

	return (
		<details
			className={`mt-6 group ${className}`}
			open={visible}
			onToggle={(event) => setVisible(event.currentTarget.open)}
		>
			<summary
				className="
					mb-3 flex w-full items-center gap-4 text-start flex-wrap rounded-lg
					relative isolate
					before:absolute before:rounded-lg before:bg-primary-800/20 before:-inset-x-3 before:-inset-y-1.5 before:-z-10
					before:opacity-0
					hover:before:opacity-100
					before:transition
					select-none
				"
			>
				<h3 className="text-2xl font-light flex-1 items-center flex gap-1.5">
					{title}
					{tooltip && <IconTooltip content={tooltip} className="size-5" />}
				</h3>
				{description && <p className="text-gray-400">{description}</p>}
				<Icon
					icon="mingcute:up-line"
					className="size-6 group-open:-rotate-180 transition duration-200"
				/>
			</summary>
			{children}
		</details>
	)
}

type StatSectionProps = {
	title: ReactNode
	hint?: ReactNode
	children: React.ReactNode
}

function StatSection({ title, hint, children }: StatSectionProps) {
	return (
		<section>
			<h3 className="flex items-center gap-2 text-lg font-light mb-1">
				{title}
				{hint && (
					<Tooltip content={hint}>
						<Icon
							icon="mingcute:information-line"
							className="size-4 text-gray-400"
						/>
					</Tooltip>
				)}
			</h3>
			<div className="grid gap-2 grid-cols-1 @-[12rem]:grid-cols-2 @xs:grid-cols-3 @md:grid-cols-5">
				{children}
			</div>
		</section>
	)
}

type NameInputProps = {
	name: string
	onChange: (name: string) => void
}

function NameInput({ name, onChange }: NameInputProps) {
	return (
		<Input
			aria-label="Character Name"
			type="text"
			value={name}
			onChange={(event) => onChange(event.target.value)}
			placeholder="Unnamed Character"
			className="text-xl flex-1"
		/>
	)
}

function TraitList({ traits }: { traits: string[] }) {
	const formattedTraits = formatTraitList(traits)
	return <p className="text-gray-400 min-h-6 -mt-1">{formattedTraits}</p>
}

type AttributeInputListProps = {
	attributes: Record<string, string>
	onChange: (attribute: AttributeName & string, value: string) => void
}

function AttributeInputList({
	attributes: characterAttributes,
	onChange,
}: AttributeInputListProps) {
	const attributeTotal = getAttributeTotal(characterAttributes)

	return (
		<StatSection
			title={`Attributes (${attributeTotal}/18)`}
			hint="Core stats defining your physical and mental abilities."
		>
			{attributeNames.map((attribute) => (
				<AttributeInput
					key={attribute}
					attribute={attribute}
					label={attributes[attribute].name}
					value={characterAttributes[attribute] ?? "1"}
					onChange={(value) => onChange(attribute, value.toString())}
				/>
			))}
		</StatSection>
	)
}

type AspectInputListProps = {
	character: Character
	onChange: (aspect: string, value: string) => void
}

function AspectInputList({ character, onChange }: AspectInputListProps) {
	const aspectTotal = getAspectTotal(character.aspects)

	return (
		<StatSection
			title={`Aspects (${aspectTotal}/6)`}
			hint="Expertise levels in each aspect, elements you can bend to your will."
		>
			{aspectNames.map((aspect) => (
				<AspectInput
					key={aspect}
					aspect={aspect}
					character={character}
					onChange={(value) => onChange(aspect, value)}
				/>
			))}
		</StatSection>
	)
}

type HitsBarProps = {
	character: Character
	onChange: (value: string) => void
}

function HitsBar({ character, onChange }: HitsBarProps) {
	const toughness = getToughness(character)

	return (
		<StatMeter
			label="Hits"
			value={character.hits}
			max={toughness}
			onChange={onChange}
			color="red"
		/>
	)
}

type FatigueBarProps = {
	character: Character
	onChange: (value: string) => void
}

function FatigueBar({ character, onChange }: FatigueBarProps) {
	const resolve = getResolve(character)

	return (
		<StatMeter
			label="Fatigue"
			value={character.fatigue}
			max={resolve}
			onChange={onChange}
			color="purple"
		/>
	)
}

type SkillListProps = {
	attribute: AttributeName
	character: Character
	onToggleSkill: (skill: string) => void
}

function SkillList({ attribute, character, onToggleSkill }: SkillListProps) {
	const availableProficiencies = getAvailableProficiencies(
		attribute,
		character.traits,
	)
	const usedProficiencies = attributes[attribute].skills.filter((skill) =>
		character.proficientSkills.includes(skill.name),
	).length

	const neededProficiencies = availableProficiencies - usedProficiencies

	const diceTray = useDiceTray()

	return (
		<div className="space-y-2">
			<h3 className="font-medium">
				{attributes[attribute].name}
				{neededProficiencies > 0 && (
					<span className="text-sm text-gray-400 ml-2">
						Pick {neededProficiencies}{" "}
						{neededProficiencies === 1 ? "proficiency" : "proficiencies"}
					</span>
				)}
			</h3>

			<ul>
				{attributes[attribute].skills.map((skill) => {
					const isProficient = character.proficientSkills.includes(skill.name)
					const canToggle =
						isProficient || usedProficiencies < availableProficiencies
					const powerDice = getSkillPowerDice(character, skill.name)
					const attributeValue = getAttributeValue(attribute, character)

					return (
						<li key={skill.name}>
							<div
								className={`w-full gap-1 flex items-center -mx-2 px-2 py-1 rounded transition`}
							>
								<span className="flex flex-1 items-center gap-1.5">
									{skill.name}
									<IconTooltip
										content={skill.description}
										className="translate-y-px"
									/>
								</span>
								<span className="tabular-nums grid text-end grid-flow-col items-center">
									<span>{attributeValue}</span>
									{powerDice > 0 && (
										<span className="text-primary-400 w-7">+{powerDice}</span>
									)}

									<div className="flex justify-end w-7">
										{canToggle && (
											<div
												className={`
												size-5 rounded-full border transition
												${
													isProficient
														? "border-primary-400 bg-primary-400/20"
														: "border-gray-400 hover:bg-gray-300/20"
												}
											`}
											>
												<input
													type="checkbox"
													checked={isProficient}
													onChange={() => onToggleSkill(skill.name)}
													className="size-full opacity-0"
												/>
											</div>
										)}
									</div>
								</span>
								<Button
									icon={<Icon icon="mingcute:box-3-fill" />}
									appearance="ghost"
									shape="circle"
									onClick={() => {
										diceTray.prefill({
											target: attributeValue,
											dice: [
												{ name: "skill", count: 1 },
												{ name: "power", count: powerDice },
											],
										})
									}}
								/>
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

type ComebackCounterProps = {
	value: string
	onChange: (value: string) => void
}

function ComebackCounter({ value, onChange }: ComebackCounterProps) {
	return (
		<StatMeter
			label="Comeback"
			value={value}
			onChange={onChange}
			color="blue"
		/>
	)
}

type CharacterImageProps = {
	imageUrl: string
	onChangeUrl: (url: string) => void
}

function CharacterImage({ imageUrl, onChangeUrl }: CharacterImageProps) {
	const { routeConfig } = useUploadThing("imageUploader")

	const fadeOnLoad = (image: HTMLImageElement | null) => {
		if (!image) return

		if (image.complete) {
			image.style.opacity = "1"
			return
		}

		image.style.opacity = "0"

		const controller = new AbortController()

		image.addEventListener(
			"load",
			() => {
				image.animate([{ opacity: "0" }, { opacity: "1" }], {
					duration: 200,
					fill: "forwards",
				})
			},
			{ signal: controller.signal },
		)

		image.addEventListener(
			"error",
			() => {
				image.style.opacity = "1"
			},
			{ once: true },
		)

		return () => controller.abort()
	}

	return (
		<div className="space-y-2">
			{imageUrl ? (
				<a
					href={imageUrl}
					key={imageUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="block w-full aspect-[3/4] relative border border-gray-700 rounded-lg bg-black/20 overflow-hidden"
				>
					<img
						src={imageUrl}
						alt=""
						className="absolute size-full inset-0 object-cover brightness-50 blur-lg opacity-0"
						ref={fadeOnLoad}
					/>
					<img
						src={imageUrl}
						alt=""
						className="absolute size-full inset-0 object-contain opacity-0"
						ref={fadeOnLoad}
					/>
				</a>
			) : (
				<div className="w-full aspect-[3/4] border border-gray-700 rounded-lg bg-black/20 flex items-center justify-center">
					<div className="w-full max-w-32 aspect-square opacity-25">
						<Icon icon="mingcute:pic-fill" className="size-full" />
					</div>
				</div>
			)}
			<div className="flex items-end gap-2">
				<Input
					type="url"
					value={imageUrl}
					onChange={(event) => onChangeUrl(event.target.value)}
					label="Image URL"
					placeholder="https://example.com/image.jpg"
					className="flex-1"
				/>
				<UploadButton
					endpoint="imageUploader"
					config={{ cn: twMerge }}
					className="
						flex-col-reverse items-start

						ut-button:button-solid
						ut-button:w-[unset]
						ut-button:h-[unset]
						ut-button:py-2
						ut-button:px-3
						ut-button:focus-within:ring-offset-0
						ut-button:focus-within:ring-primary-500/50
						ut-button:ut-uploading:after:bg-primary-500/50
						hover:ut-button:button-solid-active

						ut-allowed-content:text-gray-400
						ut-allowed-content:font-semibold
						ut-allowed-content:transition
						hover:ut-allowed-content:text-primary-300/90
					"
					content={{
						button: (args) =>
							args.isUploading
								? `${args.uploadProgress}%`
								: args.ready
								? "Upload"
								: "Preparing...",
						allowedContent: () =>
							routeConfig?.image?.maxFileSize &&
							`Max ${routeConfig.image.maxFileSize}`,
					}}
					onClientUploadComplete={([result]) => {
						if (!result) return
						onChangeUrl(result.ufsUrl)
					}}
				/>
			</div>
		</div>
	)
}

function ShareButton({ character }: { character: Character }) {
	const [pending, startTransition] = useTransition()
	const [success, setSuccess] = useState(false)

	const copyUrl = () => {
		startTransition(async () => {
			try {
				const url = pipe(
					character,
					(data) => JSON.stringify(data),
					(data) => btoa(data),
					(data) => new URL(`/character-builder?data=${data}`, location.origin),
				)
				await navigator.clipboard.writeText(url.href)
				setSuccess(true)
				await timeoutPromise(2000)
				setSuccess(false)
			} catch (error) {
				alert(error)
			}
		})
	}

	if (success) {
		return (
			<Button
				disabled
				icon={<Icon icon="mingcute:check-fill" />}
				onClick={copyUrl}
			>
				Copied URL!
			</Button>
		)
	}

	return (
		<Button
			pending={pending}
			icon={<Icon icon="mingcute:link-fill" />}
			onClick={copyUrl}
		>
			Share
		</Button>
	)
}
