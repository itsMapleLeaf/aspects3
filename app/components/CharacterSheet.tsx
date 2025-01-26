import { Icon } from "@iconify/react"
import { type ReactNode } from "react"
import { AttributeInput } from "~/components/AttributeInput.tsx"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "~/data/attributes.ts"
import {
	Character,
	defaultCharacter,
	formatTraitList,
	getAttributeTotal,
	getAttributeValue,
	getAvailableProficiencies,
	getResolve,
	getSkillPowerDice,
	getToughness,
} from "~/data/characters.ts"
import { useLocalStorage } from "~/hooks/useLocalStorage.ts"
import { DotBar } from "./DotBar.tsx"
import { Input } from "./Input.tsx"
import { TraitSelection } from "./TraitSelection.tsx"

export function CharacterSheet() {
	const [character, setCharacter] = useLocalStorage(
		"aspects-character",
		defaultCharacter,
		Character.assert,
	)

	function updateAttribute(attr: AttributeName & string, value: string) {
		setCharacter((prev) => ({
			...prev,
			attributes: {
				...prev.attributes,
				[attr]: value,
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

	const remainingTraits = 3 - character.traits.length
	const traitsDescription =
		remainingTraits > 0 ? `Choose ${remainingTraits} more` : undefined

	return (
		<div className="max-w-page-body mx-auto py-6 @container">
			<div className="grid gap-8 grid-cols-1 @lg:grid-cols-[1fr_auto]">
				<div className="space-y-6 min-w-0 @container">
					<NameInput
						name={character.name}
						traits={character.traits}
						onChange={(name) => setCharacter((prev) => ({ ...prev, name }))}
					/>

					<AttributeInputList
						attributes={character.attributes}
						onChange={updateAttribute}
					/>

					<div className="space-y-4">
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
					</div>
				</div>

				<div className="w-80 h-80 border border-gray-700 rounded-lg bg-black/20 flex items-center justify-center">
					<p className="text-center text-gray-400">character image here</p>
				</div>
			</div>

			<ToggleSection title="Traits" description={traitsDescription}>
				<TraitSelection
					selectedTraits={selectedTraits}
					onTraitToggle={toggleTrait}
				/>
			</ToggleSection>

			<ToggleSection title="Skills">
				<div className="grid gap-8 md:grid-cols-3">
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

type HitsBarProps = {
	character: Character
	onChange: (value: string) => void
}

function HitsBar({ character, onChange }: HitsBarProps) {
	const toughness = getToughness(character)

	return (
		<DotBar
			label="Hits"
			value={character.hits}
			placeholder="0"
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
		<DotBar
			label="Fatigue"
			value={character.fatigue}
			placeholder="0"
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
