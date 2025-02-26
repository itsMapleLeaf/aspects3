import * as Ariakit from "@ariakit/react"
import { useAuthActions } from "@convex-dev/auth/react"
import {
	CharacterModel,
	parseCharacterFieldsUnsafe,
	type CharacterFields,
} from "@workspace/backend/data/character"
import { aspectNames } from "@workspace/data/aspects"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "@workspace/data/attributes"
import { traits } from "@workspace/data/traits"
import { useConvexAuth } from "convex/react"
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
import { UploadButton, useUploadThing } from "~/routes/api.images/components.ts"
import { AspectArts } from "~/routes/character-builder/AspectArts.tsx"
import { AspectInput } from "~/routes/character-builder/AspectInput.tsx"
import { AttributeInput } from "~/routes/character-builder/AttributeInput.tsx"
import { useCopyCharacterShareUrl } from "~/routes/character-builder/share.tsx"
import { StatMeter } from "~/routes/character-builder/StatMeter.tsx"
import { TraitSelection } from "~/routes/character-builder/TraitSelection.tsx"
import { CloudSaveDialog } from "./CloudSaveCta.tsx"

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

function getAvailableProficiencies(
	attribute: AttributeName,
	selectedTraits: string[],
) {
	const tempCharacter = CharacterModel.empty().fields
	tempCharacter.traits = selectedTraits
	return new CharacterModel(tempCharacter).getAvailableProficiencies(attribute)
}

function getSkillPowerDice(character: CharacterFields, skillName: string) {
	return new CharacterModel(character).getSkillPowerDice(skillName)
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
					<AttributeInputList
						attributes={character.attributes}
						onChange={updateAttribute}
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

			<div className="mt-6 space-y-6">
				<ToggleSection
					title="Skills"
					tooltip="Various actions you can make in the game."
				>
					<div className="grid grid-cols-1 gap-8 @md:grid-cols-2 @2xl:grid-cols-3">
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
	character: CharacterFields
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

type SkillListProps = {
	attribute: AttributeName
	character: CharacterFields
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
					<span className="ml-2 text-sm text-gray-400">
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
										{canToggle && (
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
