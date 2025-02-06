import { useState, useTransition, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { prefillDice } from "~/components/DiceTray.tsx"
import { Button } from "~/components/ui/Button.tsx"
import { Checkbox } from "~/components/ui/Checkbox.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
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
	defaultCharacter,
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
import { StatMeter } from "~/routes/character-builder/StatMeter.tsx"
import { useCharacterStorage } from "~/routes/character-builder/useCharacterStorage.ts"
import { pipe, timeoutPromise } from "~/utils.ts"
import { UploadButton } from "../api.images/components.ts"
import { AspectArts } from "./AspectArts.tsx"
import { AspectInput } from "./AspectInput.tsx"
import { AttributeInput } from "./AttributeInput.tsx"
import { TraitSelection } from "./TraitSelection.tsx"

export default function CharacterBuilder() {
	const {
		character,
		setCharacter,
		hasFileSystemAccess,
		hasFile,
		autoSave,
		setAutoSave,
		save,
		open,
		createNew,
	} = useCharacterStorage(defaultCharacter)

	function updateAttribute(attr: AttributeName & string, value: string) {
		setCharacter((prev) => ({
			...prev,
			attributes: {
				...prev.attributes,
				[attr]: value,
			},
		}))
	}

	function updateAspect(aspect: string, value: string) {
		setCharacter((prev) => ({
			...prev,
			aspects: {
				...prev.aspects,
				[aspect]: value,
			},
		}))
	}

	function toggleTrait(traitName: string) {
		setCharacter((prev) => ({
			...prev,
			traits: prev.traits.includes(traitName)
				? prev.traits.filter((t) => t !== traitName)
				: [...prev.traits, traitName],
		}))
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
		<div className="py-6 @container flex flex-col gap-2">
			<div className="grid grid-cols-[1fr_auto] gap-2">
				<div className="flex gap-2 flex-wrap-reverse">
					<Button
						onClick={createNew}
						icon={<Icon icon="mingcute:file-new-fill" />}
					>
						New
					</Button>
					<Button onClick={save} icon={<Icon icon="mingcute:save-2-fill" />}>
						Save...
					</Button>
					<Button
						onClick={open}
						icon={<Icon icon="mingcute:folder-open-fill" />}
					>
						Open...
					</Button>
					<ShareButton character={character} />
				</div>

				{hasFileSystemAccess && hasFile && (
					<Checkbox
						label="Auto-save"
						className="whitespace-nowrap self-end @xl:-col-end-1 @xl:col-span-1 @xl:justify-self-end @xl:self-start"
						checked={autoSave}
						onChange={(event) => setAutoSave(event.target.checked)}
					/>
				)}

				<div className="col-span-2 @xl:col-[1] @xl:row-[1]">
					<NameInput
						name={character.name}
						onChange={(name) => setCharacter((prev) => ({ ...prev, name }))}
					/>
				</div>

				<div className="col-span-2 @xl:row-[2] @xl:col-span-1">
					<TraitList traits={selectedTraits} />
				</div>
			</div>

			<div className="@xl:hidden">
				<CharacterImage
					imageUrl={character.imageUrl}
					onChangeUrl={(imageUrl) =>
						setCharacter((prev) => ({ ...prev, imageUrl }))
					}
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
							onChange={(hits) => setCharacter((prev) => ({ ...prev, hits }))}
						/>
						<FatigueBar
							character={character}
							onChange={(fatigue) =>
								setCharacter((prev) => ({ ...prev, fatigue }))
							}
						/>
						<ComebackCounter
							value={character.comeback ?? "0"}
							onChange={(comeback) =>
								setCharacter((prev) => ({ ...prev, comeback }))
							}
						/>
					</div>

					<TextArea
						label="Details"
						placeholder="Character backstory, personality, or other notes."
						value={character.details}
						onChange={(event) =>
							setCharacter((prev) => ({ ...prev, details: event.target.value }))
						}
					/>
				</div>

				<div className="hidden @xl:block w-80">
					<CharacterImage
						imageUrl={character.imageUrl}
						onChangeUrl={(imageUrl) =>
							setCharacter((prev) => ({ ...prev, imageUrl }))
						}
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
									setCharacter((prev) => ({
										...prev,
										proficientSkills: prev.proficientSkills.includes(skill)
											? prev.proficientSkills.filter((s) => s !== skill)
											: [...prev.proficientSkills, skill],
									}))
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
		</div>
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
					{tooltip && (
						<Tooltip content={tooltip}>
							<Icon
								icon="mingcute:information-line"
								className="size-5 text-gray-400"
							/>
						</Tooltip>
					)}
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
	return <p className="text-gray-400 -mt-1">{formattedTraits}</p>
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
					const powerDice = getSkillPowerDice(attribute, skill.name, character)
					const attributeValue = getAttributeValue(attribute, character)

					return (
						<li key={skill.name}>
							<div
								className={`w-full gap-1 flex items-center -mx-2 px-2 py-1 rounded transition`}
							>
								<span className="flex flex-1 items-center gap-1.5">
									{skill.name}
									<Tooltip content={skill.description}>
										<Icon
											icon="mingcute:information-line"
											className="w-4 h-4 text-gray-400"
											aria-hidden
										/>
									</Tooltip>
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
										prefillDice({
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
	return (
		<div className="space-y-2">
			{imageUrl ? (
				<a
					href={imageUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="block aspect-[3/4] w-full border border-gray-700 rounded-lg bg-black/20 overflow-hidden"
				>
					<img
						src={imageUrl}
						alt="Character"
						className="w-full h-full object-cover"
					/>
				</a>
			) : (
				<div className="aspect-[3/4] w-full border border-gray-700 rounded-lg bg-black/20 flex items-center justify-center"></div>
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
						allowedContent: () => "Max 4MB",
					}}
					onClientUploadComplete={([result]) => {
						if (!result) return
						onChangeUrl(result.url)
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
