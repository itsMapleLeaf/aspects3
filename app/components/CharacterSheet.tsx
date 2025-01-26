import { Icon } from "@iconify/react"
import { type } from "arktype"
import { clamp } from "es-toolkit"
import type { ReactNode } from "react"
import { Input } from "~/components/Input"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "~/data/attributes"
import { traits } from "~/data/traits"
import { useLocalStorage } from "~/hooks/useLocalStorage"
import { TraitSelection } from "./TraitSelection"

type CharacterData = typeof CharacterData.infer
const CharacterData = type({
	name: "string < 256 = ''",
	attributes: type(`Record<string, number>`).default(() => ({})),
	hits: "number >= 0 = 0",
	fatigue: "number >= 0 = 0",
	comeback: "number >= 0 = 0",
	traits: type("string[]").default(() => []),
	proficientSkills: type("string[]").default(() => []),
})

const defaultCharacter: CharacterData = {
	name: "",
	attributes: {
		intellect: 1,
		sense: 1,
		agility: 1,
		strength: 1,
		wit: 1,
	},
	hits: 0,
	fatigue: 0,
	comeback: 0,
	traits: [],
	proficientSkills: [],
}

function getAttributeValue(name: AttributeName, character: CharacterData) {
	return clamp(Math.floor(character.attributes[name] ?? 1), 1, 6)
}

function getAttributeBonus(attribute: AttributeName, selectedTraits: string[]) {
	return selectedTraits.reduce((bonus, traitName) => {
		const trait = traits.find((t) => t.name === traitName)
		if (!trait) return bonus
		return (
			bonus + (trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
		)
	}, 0)
}

function getSkillValue(
	attribute: AttributeName,
	skill: string,
	character: CharacterData,
) {
	const attributeBase = getAttributeValue(attribute, character)
	const attributeBonus = getAttributeBonus(attribute, character.traits)
	const proficiencyBonus = character.proficientSkills.includes(skill) ? 1 : 0
	return attributeBase + attributeBonus + proficiencyBonus
}

function getAvailableProficiencies(
	attribute: AttributeName,
	selectedTraits: string[],
) {
	return selectedTraits.reduce((count, traitName) => {
		const trait = traits.find((t) => t.name === traitName)
		if (!trait) return count
		return (
			count + (trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
		)
	}, 0)
}

export function CharacterSheet() {
	const [character, setCharacter] = useLocalStorage(
		"aspects-character",
		defaultCharacter,
		CharacterData.assert,
	)

	const attributeTotal = Object.values(character.attributes).reduce(
		(sum, val = 1) => sum + val,
		0,
	)

	const toughness =
		getAttributeValue("strength", character) +
		getAttributeValue("agility", character)

	const resolve =
		getAttributeValue("sense", character) +
		getAttributeValue("intellect", character) +
		getAttributeValue("wit", character)

	function updateAttribute(attr: AttributeName & string, value: number) {
		const newValue = Math.max(1, Math.min(6, value))
		setCharacter((prev) => ({
			...prev,
			attributes: {
				...prev.attributes,
				[attr]: newValue,
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
		<div className="max-w-4xl mx-auto py-6 px-4 @container">
			<h2 className="text-3xl font-light text-gray-100 mb-4">
				Character Sheet
			</h2>

			<Input
				label="Name"
				value={character.name}
				onChange={(e) =>
					setCharacter((prev) => ({ ...prev, name: e.target.value }))
				}
			/>

			<div className="grid gap-4 @md:grid-flow-col auto-cols-fr">
				<Section title="Attributes" description={`Total: ${attributeTotal}/18`}>
					<div className="grid gap-4 md:grid-cols-2">
						{attributeNames.map((attribute) => {
							const bonus = getAttributeBonus(attribute, character.traits)
							const base = getAttributeValue(attribute, character)
							return (
								<Input
									key={attribute}
									label={attributes[attribute].name}
									hint={attributes[attribute].description}
									type="number"
									min="1"
									max="6"
									value={base}
									onChange={(event) =>
										updateAttribute(attribute, event.target.valueAsNumber)
									}
									suffix={
										bonus > 0 ? (
											<span>
												+ {bonus} = <strong>{base + bonus}</strong>
											</span>
										) : undefined
									}
								/>
							)
						})}
					</div>
				</Section>

				<Section title="Status">
					<div className="grid gap-4 md:grid-cols-2 content-start">
						<Input
							label="Hits"
							type="number"
							min="0"
							max={toughness}
							value={character.hits}
							onChange={(event) =>
								setCharacter((prev) => ({
									...prev,
									hits: Math.min(toughness, event.target.valueAsNumber),
								}))
							}
							suffix={`/ ${toughness}`}
						/>

						<Input
							label="Fatigue"
							type="number"
							min={0}
							max={resolve}
							value={character.fatigue}
							onChange={(event) => {
								setCharacter((prev) => ({
									...prev,
									fatigue: Math.min(resolve, event.target.valueAsNumber),
								}))
							}}
							suffix={`/ ${resolve}`}
						/>
						<Input
							label="Comeback"
							type="number"
							min="0"
							value={character.comeback}
							onChange={(event) =>
								setCharacter((prev) => ({
									...prev,
									comeback: Math.max(0, event.target.valueAsNumber),
								}))
							}
						/>
					</div>
				</Section>
			</div>

			<Section title="Traits" description={traitsDescription}>
				<TraitSelection
					selectedTraits={character.traits}
					onTraitToggle={toggleTrait}
				/>
			</Section>

			<Section title="Skills">
				<div className="grid gap-8 md:grid-cols-3">
					{attributeNames.map((attribute) => {
						const bonus = getAttributeBonus(attribute, character.traits)
						const base = getAttributeValue(attribute, character)
						const availableProficiencies = getAvailableProficiencies(
							attribute,
							character.traits,
						)
						const usedProficiencies = attributes[attribute].skills.filter(
							(skill) => character.proficientSkills.includes(skill),
						).length

						return (
							<div key={attribute} className="space-y-2">
								<h3 className="font-medium capitalize">
									{attributes[attribute].name}
									{bonus > 0 && (
										<span className="text-sm text-gray-400 ml-2">
											({base} + {bonus})
										</span>
									)}
									{availableProficiencies > 0 && (
										<span className="text-sm text-gray-400 ml-2">
											Pick {availableProficiencies - usedProficiencies} skills
										</span>
									)}
								</h3>
								<ul className="space-y-1">
									{attributes[attribute].skills.map((skill) => {
										const isProficient =
											character.proficientSkills.includes(skill)
										const canToggle =
											isProficient || usedProficiencies < availableProficiencies
										const value = getSkillValue(attribute, skill, character)

										return (
											<li key={skill}>
												<button
													type="button"
													disabled={!canToggle && !isProficient}
													onClick={() => {
														setCharacter((prev) => ({
															...prev,
															proficientSkills: isProficient
																? prev.proficientSkills.filter(
																		(s) => s !== skill,
																  )
																: [...prev.proficientSkills, skill],
														}))
													}}
													className={`w-full flex justify-between items-center px-2 py-1 rounded transition ${
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
													<span>{value}</span>
												</button>
											</li>
										)
									})}
								</ul>
							</div>
						)
					})}
				</div>
			</Section>
		</div>
	)
}

type SectionProps = {
	title: string
	description?: string
	children: ReactNode
	className?: string
}

function Section({
	title,
	description,
	children,
	className = "",
}: SectionProps) {
	return (
		<section className={`mt-6 ${className}`}>
			<header className="mb-3 flex items-baseline justify-between gap-4 flex-wrap">
				<h3 className="text-2xl font-light">{title}</h3>
				{description && <p className="text-gray-400">{description}</p>}
			</header>
			{children}
		</section>
	)
}
