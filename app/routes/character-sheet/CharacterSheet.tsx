import { Icon } from "@iconify/react"
import { type ReactNode } from "react"
import { Button } from "~/components/Button.tsx"
import { Checkbox } from "~/components/Checkbox.tsx"
import { Input } from "~/components/Input.tsx"
import { StatMeter } from "~/components/StatMeter.tsx"
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
import { useCharacterStorage } from "~/hooks/useCharacterStorage.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { AspectArts } from "./AspectArts.tsx"
import { AspectInput } from "./AspectInput.tsx"
import { AttributeInput } from "./AttributeInput.tsx"
import { TraitSelection } from "./TraitSelection.tsx"

export function CharacterSheet() {
	const {
		character,
		setCharacter,
		hasFileSystemAccess,
		hasFile,
		autoSave,
		setAutoSave,
		save,
		open,
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
		<div className="page-container py-6 @container">
			<div className="grid gap-8 grid-cols-1 @lg:grid-cols-[1fr_auto]">
				<div className="space-y-6 min-w-0 @container">
					<NameInput
						name={character.name}
						traits={selectedTraits}
						onChange={(name) => setCharacter((prev) => ({ ...prev, name }))}
					/>

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
				</div>

				<div className="w-80 space-y-4">
					<div className="flex gap-2 justify-end">
						{hasFileSystemAccess && hasFile && (
							<Checkbox
								label="Auto-save"
								checked={autoSave}
								onChange={(event) => setAutoSave(event.target.checked)}
							/>
						)}
						<Button onClick={save} icon={<Icon icon="mingcute:save-line" />}>
							Save...
						</Button>
						<Button
							onClick={open}
							icon={<Icon icon="mingcute:folder-open-line" />}
						>
							Open...
						</Button>
					</div>

					<div className="h-80 border border-gray-700 rounded-lg bg-black/20 flex items-center justify-center">
						<p className="text-center text-gray-400">character image here</p>
					</div>
				</div>
			</div>

			<ToggleSection title="Traits" description={traitsDescription}>
				<div className="grid gap-4 grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3">
					<TraitSelection
						selectedTraits={selectedTraits}
						onTraitToggle={toggleTrait}
					/>
				</div>
			</ToggleSection>

			<div className="mt-6 space-y-6">
				<ToggleSection title="Skills">
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

				<ToggleSection title="Aspect Arts">
					<AspectArts character={character} />
				</ToggleSection>
			</div>
		</div>
	)
}

type ToggleSectionProps = {
	title: string
	description?: string
	children: ReactNode
	className?: string
}

function ToggleSection({
	title,
	description,
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
				<h3 className="text-2xl font-light flex-1">{title}</h3>
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

type NameInputProps = {
	name: string
	traits: string[]
	onChange: (name: string) => void
}

function NameInput({ name, traits: selectedTraits, onChange }: NameInputProps) {
	const formattedTraits = formatTraitList(selectedTraits)

	return (
		<div>
			<Input
				type="text"
				value={name}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Unnamed Character"
				className="text-xl"
			/>
			{formattedTraits && (
				<p className="mt-1 text-gray-400">{formattedTraits}</p>
			)}
		</div>
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
		<section>
			<h3 className="text-lg font-light mb-1">
				Attributes ({attributeTotal}/18)
			</h3>
			<div className="grid gap-2 grid-cols-1 @-[12rem]:grid-cols-2 @xs:grid-cols-3 @md:grid-cols-5">
				{attributeNames.map((attribute) => (
					<AttributeInput
						key={attribute}
						attribute={attribute}
						label={attributes[attribute].name}
						value={characterAttributes[attribute] ?? "1"}
						onChange={(value) => onChange(attribute, value.toString())}
					/>
				))}
			</div>
		</section>
	)
}

type AspectInputListProps = {
	character: Character
	onChange: (aspect: string, value: string) => void
}

function AspectInputList({ character, onChange }: AspectInputListProps) {
	const aspectTotal = getAspectTotal(character.aspects)

	return (
		<section>
			<h3 className="text-lg font-light mb-1">Aspects ({aspectTotal}/6)</h3>
			<div className="grid gap-2 grid-cols-1 @-[12rem]:grid-cols-2 @xs:grid-cols-3 @md:grid-cols-5">
				{aspectNames.map((aspect) => (
					<AspectInput
						key={aspect}
						aspect={aspect}
						character={character}
						onChange={(value) => onChange(aspect, value)}
					/>
				))}
			</div>
		</section>
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
		character.proficientSkills.includes(skill),
	).length

	const neededProficiencies = availableProficiencies - usedProficiencies

	return (
		<div className="space-y-2">
			<h3 className="font-medium">
				{attributes[attribute].name}
				{neededProficiencies > 0 && (
					<span className="text-sm text-gray-400 ml-2">
						Pick {neededProficiencies} skill
						{neededProficiencies === 1 ? "" : "s"}
					</span>
				)}
			</h3>

			<ul className="space-y-1">
				{attributes[attribute].skills.map((skill) => {
					const isProficient = character.proficientSkills.includes(skill)
					const canToggle =
						isProficient || usedProficiencies < availableProficiencies
					const powerDice = getSkillPowerDice(attribute, skill, character)

					return (
						<li key={skill}>
							<button
								type="button"
								disabled={!canToggle && !isProficient}
								onClick={() => onToggleSkill(skill)}
								className={`w-full flex justify-between items-center -mx-2 px-2 py-1 rounded transition ${
									isProficient
										? "bg-primary-500/20 hover:bg-primary-500/30"
										: canToggle
										? "hover:bg-gray-500/20"
										: ""
								}`}
							>
								<span className="flex items-center gap-2">
									{skill}
									{isProficient && (
										<Icon
											icon="mingcute:check-fill"
											className="w-4 h-4 text-primary-400"
											aria-hidden
										/>
									)}
								</span>
								<span className="flex items-center">
									<span className="ml-3">
										{getAttributeValue(attribute, character)}
									</span>
									{powerDice > 0 && (
										<span className="text-primary-400 ml-1.5">
											+{powerDice}
										</span>
									)}
								</span>
							</button>
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
