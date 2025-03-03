import * as Ariakit from "@ariakit/react"
import { useAuthActions } from "@convex-dev/auth/react"
import {
	listAttributes,
	type Attribute,
} from "@workspace/backend/data/attributes"
import {
	CharacterModel,
	getCharacterAttributeScore,
	getCharacterSkillPowerDiceCount,
	isCharacterProficient,
	parseCharacterFieldsUnsafe,
	type CharacterFields,
} from "@workspace/backend/data/character"
import {
	characterLevelCount,
	getCharacterLevel,
} from "@workspace/backend/data/characterLevels.ts"
import { listCharacterPaths } from "@workspace/backend/data/characterPaths.ts"
import { listTraits } from "@workspace/backend/data/traits.ts"
import { aspectNames } from "@workspace/data/aspects"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "@workspace/data/attributes"
import { useConvexAuth } from "convex/react"
import { intersection, range } from "es-toolkit"
import { type ComponentProps, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { useDiceTray } from "~/components/DiceTray.tsx"
import { Button } from "~/components/ui/Button.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { IconTooltip } from "~/components/ui/IconTooltip.tsx"
import { Input } from "~/components/ui/Input.tsx"
import { SquareIconButton } from "~/components/ui/SquareIconButton.tsx"
import { TextArea } from "~/components/ui/TextArea.tsx"
import { Tooltip } from "~/components/ui/Tooltip.tsx"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import {
	UploadButton,
	useUploadThing,
} from "../_layout.api.images/components.ts"
import { AspectInput } from "./AspectInput.tsx"
import { AspectSkillList } from "./AspectSkillList.tsx"
import { AttributeInput } from "./AttributeInput.tsx"
import { CloudSaveDialog } from "./CloudSaveCta.tsx"
import { PathSelection } from "./PathSelection.tsx"
import { useCopyCharacterShareUrl } from "./share.tsx"
import { StatMeter } from "./StatMeter.tsx"
import { TraitSelection } from "./TraitSelection.tsx"

// Helper functions to replace the imported ones
function getAttributeValue(name: AttributeName, character: CharacterFields) {
	return new CharacterModel(character).getAttributeValue(name)
}

function getAttributeTotal(attributes: Record<string, string>) {
	const tempCharacter = CharacterModel.empty().fields
	tempCharacter.attributes = attributes
	return new CharacterModel(tempCharacter).attributeTotal
}

function getAspectTotal(aspects: Record<string, string>) {
	const tempCharacter = CharacterModel.empty().fields
	tempCharacter.aspects = aspects
	return new CharacterModel(tempCharacter).aspectTotal
}

function getToughness(character: CharacterFields) {
	return new CharacterModel(character).toughness
}

function getResolve(character: CharacterFields) {
	return new CharacterModel(character).resolve
}

export function CharacterEditor({
	character,
	onChange,
	actions,
}: {
	character: CharacterFields
	onChange: (character: CharacterFields) => void
	actions: ReactNode
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

	function togglePath(pathName: string) {
		onChange({
			...character,
			paths: character.paths?.includes(pathName)
				? character.paths.filter((p) => p !== pathName)
				: [...(character.paths ?? []), pathName],
		})
	}

	const selectedTraits = listTraits()
		.filter((trait) =>
			character.traits.some((selected) => selected === trait.name),
		)
		.map((trait) => trait.name)

	const remainingTraits = 3 - selectedTraits.length

	const traitsDescription =
		remainingTraits > 0 ? `Choose ${remainingTraits} more` : undefined

	// ensure paths in character data are Real
	const selectedPaths = intersection(
		character.paths,
		listCharacterPaths().map((p) => p.name),
	)
	const remainingPaths = 2 - selectedPaths.length
	const pathsDescription =
		remainingPaths > 0 ? `Choose ${remainingPaths} more` : undefined

	return (
		<>
			<div className="flex items-center gap-2">
				<NameInput
					className="flex-1"
					name={character.name}
					onChange={(name) => onChange({ ...character, name })}
				/>
				{actions}
			</div>

			<div className="@xl:hidden">
				<CharacterImage
					imageUrl={character.imageUrl}
					onChangeUrl={(imageUrl) => onChange({ ...character, imageUrl })}
				/>
			</div>

			<div className="grid grid-cols-1 gap-8 @xl:grid-cols-[1fr_auto]">
				<div className="@container min-w-0 space-y-6">
					<Ariakit.SelectProvider
						value={String(character.levelIndex)}
						setValue={(value) =>
							onChange({ ...character, levelIndex: Number(value) })
						}
					>
						<div className="flex items-center gap-3">
							<Ariakit.SelectLabel className="heading-xl">
								Level
							</Ariakit.SelectLabel>
							<Ariakit.Select className="button-solid min-w-16 justify-center text-center">
								{character.levelIndex + 1}
							</Ariakit.Select>
						</div>
						<Ariakit.SelectPopover
							className="menu-panel"
							gutter={8}
							portal
							unmountOnHide
						>
							{range(characterLevelCount).map((n) => (
								<Ariakit.SelectItem
									key={n}
									value={String(n)}
									className="menu-item"
								>
									Level {n + 1}
								</Ariakit.SelectItem>
							))}
						</Ariakit.SelectPopover>
					</Ariakit.SelectProvider>

					<AttributeInputList
						attributes={character.attributes}
						onChange={updateAttribute}
						character={character}
					/>

					<AspectInputList character={character} onChange={updateAspect} />

					<div className="grid grid-cols-2 gap-4 @md:grid-cols-3">
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

				<div className="hidden w-80 @xl:block">
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
				<div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
					<TraitSelection
						selectedTraits={selectedTraits}
						onTraitToggle={toggleTrait}
					/>
				</div>
			</ToggleSection>

			<ToggleSection
				title="Paths"
				tooltip="Character archetypes that define your approach to challenges."
				description={pathsDescription}
			>
				<div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
					<PathSelection
						selectedPaths={selectedPaths}
						onPathToggle={togglePath}
					/>
				</div>
			</ToggleSection>

			<div className="mt-6 space-y-6">
				<SkillListSection
					character={character}
					onToggleSkill={(skill) => {
						onChange({
							...character,
							proficientSkills: character.proficientSkills.includes(skill)
								? character.proficientSkills.filter((s) => s !== skill)
								: [...character.proficientSkills, skill],
						})
					}}
				></SkillListSection>

				<ToggleSection
					title="Aspect Skills"
					tooltip="Abilities performed through aspect manipulation, determined by your chosen paths."
				>
					<AspectSkillList character={character} />
				</ToggleSection>
			</div>
		</>
	)
}

export function CharacterEditorLayout(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"@container flex flex-col gap-2 py-6",
				props.className,
			)}
		/>
	)
}

export function CharacterEditorHeader(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"flex flex-wrap items-start justify-between gap-2",
				props.className,
			)}
		/>
	)
}

export function CharacterEditorMenu({
	character,
	onNew,
	onImport,
	onDelete,
	onClone,
}: {
	character: CharacterFields
	onNew: () => void
	onImport: (character: CharacterFields) => void
	onDelete: (() => void) | null
	onClone: (() => void) | null
}) {
	const share = useCopyCharacterShareUrl(character)
	const auth = useConvexAuth()
	const { signOut } = useAuthActions()

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
					...parseCharacterFieldsUnsafe(parsed),
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
		<Ariakit.MenuProvider placement="bottom-end">
			<SquareIconButton
				icon={<Icon icon="mingcute:menu-fill" />}
				render={<Ariakit.MenuButton />}
			>
				Menu
			</SquareIconButton>

			<Ariakit.Menu
				className="menu-panel"
				portal
				gutter={8}
				unmountOnHide={false} // keep nested dialog open
			>
				<Ariakit.MenuItem className="menu-item" onClick={onNew}>
					<Icon icon="mingcute:file-new-fill" /> New
				</Ariakit.MenuItem>
				<Ariakit.MenuItem className="menu-item" onClick={downloadCharacter}>
					<Icon icon="mingcute:file-export-fill" /> Export...
				</Ariakit.MenuItem>
				<Ariakit.MenuItem className="menu-item" onClick={importCharacter}>
					<Icon icon="mingcute:file-import-fill" /> Import...
				</Ariakit.MenuItem>

				{onClone && (
					<Ariakit.MenuItem className="menu-item" onClick={onClone}>
						<Icon icon="mingcute:copy-2-fill" /> Clone
					</Ariakit.MenuItem>
				)}

				<Ariakit.MenuItem
					className="menu-item"
					onClick={share.copyUrl}
					disabled={share.success}
					hideOnClick={false}
				>
					{share.success ? (
						<Icon icon="mingcute:check-fill" />
					) : share.pending ? (
						<Icon icon="mingcute:loading-3-fill" />
					) : (
						<Icon icon="mingcute:link-fill" />
					)}
					{share.success
						? "Copied URL"
						: share.pending
							? "Copying..."
							: "Share"}
				</Ariakit.MenuItem>

				{onDelete && (
					<Ariakit.MenuItem className="menu-item" onClick={onDelete}>
						<Icon icon="mingcute:delete-3-fill" /> Delete
					</Ariakit.MenuItem>
				)}

				{auth.isAuthenticated ? (
					<Ariakit.MenuItem className="menu-item" onClick={signOut}>
						<Icon icon="mingcute:exit-door-fill" /> Sign out
					</Ariakit.MenuItem>
				) : (
					<CloudSaveDialog>
						<Ariakit.MenuItem
							render={<CloudSaveDialog.Button />}
							className="menu-item"
							onClick={signOut}
						>
							<Icon icon="mingcute:upload-3-fill" /> Cloud save
						</Ariakit.MenuItem>
					</CloudSaveDialog>
				)}
			</Ariakit.Menu>
		</Ariakit.MenuProvider>
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
			className={`group mt-6 ${className}`}
			open={visible}
			onToggle={(event) => setVisible(event.currentTarget.open)}
		>
			<summary className="before:bg-primary-800/20 relative isolate mb-3 flex w-full flex-wrap items-center gap-4 rounded-lg text-start select-none before:absolute before:-inset-x-3 before:-inset-y-1.5 before:-z-10 before:rounded-lg before:opacity-0 before:transition hover:before:opacity-100">
				<h3 className="flex flex-1 items-center gap-1.5 text-2xl font-light">
					{title}
					{tooltip && <IconTooltip content={tooltip} className="size-5" />}
				</h3>
				{description && <p className="text-gray-400">{description}</p>}
				<Icon
					icon="mingcute:up-line"
					className="size-6 transition duration-200 group-open:-rotate-180"
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
			<h3 className="mb-1 flex items-center gap-2 text-lg font-light">
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
			<div className="grid grid-cols-1 gap-2 @-[12rem]:grid-cols-2 @xs:grid-cols-3 @md:grid-cols-5">
				{children}
			</div>
		</section>
	)
}

function NameInput({
	name,
	onChange,
	className,
}: {
	name: string
	onChange: (name: string) => void
	className?: string
}) {
	return (
		<Input
			aria-label="Character Name"
			type="text"
			value={name}
			onChange={(event) => onChange(event.target.value)}
			placeholder="Unnamed Character"
			className={twMerge("text-xl", className)}
		/>
	)
}

type AttributeInputListProps = {
	attributes: Record<string, string>
	onChange: (attribute: AttributeName & string, value: string) => void
	character: CharacterFields
}

function AttributeInputList({
	attributes: characterAttributes,
	onChange,
	character,
}: AttributeInputListProps) {
	const attributeTotal = getAttributeTotal(characterAttributes)
	const level = getCharacterLevel(character.levelIndex)
	const maxAttributePoints = level.attributePoints

	return (
		<StatSection
			title={`Attributes (${attributeTotal}/${maxAttributePoints})`}
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
	character: CharacterFields
	onChange: (aspect: string, value: string) => void
}

function AspectInputList({ character, onChange }: AspectInputListProps) {
	const aspectTotal = getAspectTotal(character.aspects)
	const level = getCharacterLevel(character.levelIndex)
	const maxAspectPoints = level.aspectPoints

	return (
		<StatSection
			title={`Aspects (${aspectTotal}/${maxAspectPoints})`}
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
	character: CharacterFields
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
	character: CharacterFields
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

function SkillListSection({
	character,
	onToggleSkill,
}: {
	character: CharacterFields
	onToggleSkill: (skill: string) => void
}) {
	const level = getCharacterLevel(character.levelIndex)

	return (
		<ToggleSection
			title="Skills"
			description={`${character.proficientSkills.length}/${level.proficientSkills} Proficiencies`}
		>
			<div className="grid grid-cols-1 gap-8 @md:grid-cols-2 @2xl:grid-cols-3">
				{listAttributes().map((attribute) => (
					<div key={attribute.name} className="space-y-2">
						<h3 className="font-medium">{attribute.name}</h3>
						<AttributeSkillList
							character={character}
							attribute={attribute}
							onToggleSkill={onToggleSkill}
						/>
					</div>
				))}
			</div>
		</ToggleSection>
	)
}

function AttributeSkillList({
	character,
	attribute,
	onToggleSkill,
}: {
	character: CharacterFields
	attribute: Attribute
	onToggleSkill: (skill: string) => void
}): ReactNode {
	const diceTray = useDiceTray()

	return (
		<ul>
			{attribute.skills.map((skill) => {
				const powerDice = getCharacterSkillPowerDiceCount(
					character,
					attribute,
					skill,
				)
				const isProficient = isCharacterProficient(character, skill)
				const attributeValue = getCharacterAttributeScore(character, attribute)
				return (
					<li key={skill.name}>
						<div
							className={`-mx-2 flex w-full items-center gap-1 rounded px-2 py-1 transition`}
						>
							<span className="flex flex-1 items-center gap-1.5">
								{skill.name}
								<IconTooltip
									content={skill.description}
									className="translate-y-px"
								/>
							</span>

							<span className="grid grid-flow-col items-center text-end tabular-nums">
								<span>{attributeValue}</span>

								{powerDice > 0 && (
									<span className="text-primary-400 w-7">+{powerDice}</span>
								)}

								<div className="flex w-7 justify-end">
									<div
										className={`size-5 rounded-full border transition ${
											isProficient
												? "border-primary-400 bg-primary-400/20"
												: "border-gray-400 hover:bg-gray-300/20"
										} `}
									>
										<input
											type="checkbox"
											checked={isProficient}
											onChange={() => onToggleSkill(skill.name)}
											className="size-full opacity-0"
										/>
									</div>
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
					className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg border border-gray-700 bg-black/20"
				>
					<img
						src={imageUrl}
						alt=""
						className="absolute inset-0 size-full object-cover opacity-0 blur-lg brightness-50"
						ref={fadeOnLoad}
					/>
					<img
						src={imageUrl}
						alt=""
						className="absolute inset-0 size-full object-contain opacity-0"
						ref={fadeOnLoad}
					/>
				</a>
			) : (
				<div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-gray-700 bg-black/20">
					<div className="aspect-square w-full max-w-32 opacity-25">
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
					className="ut-button:button-solid ut-button:w-[unset] ut-button:h-[unset] ut-button:py-2 ut-button:px-3 ut-button:focus-within:ring-offset-0 ut-button:focus-within:ring-primary-500/50 ut-button:ut-uploading:after:bg-primary-500/50 hover:ut-button:button-solid-active ut-allowed-content:text-gray-400 ut-allowed-content:font-semibold ut-allowed-content:transition hover:ut-allowed-content:text-primary-300/90 flex-col-reverse items-start"
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
