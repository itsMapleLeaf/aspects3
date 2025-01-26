import { Icon } from "@iconify/react"
import { type } from "arktype"
import { clamp } from "es-toolkit"
import { type ReactNode } from "react"
import { AttributeInput } from "~/components/AttributeInput"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "~/data/attributes"
import { traits } from "~/data/traits"
import { useLocalStorage } from "~/hooks/useLocalStorage"
import { DotBar } from "./DotBar.js"
import { Input } from "./Input.js"
import { TraitSelection } from "./TraitSelection"

type CharacterData = typeof CharacterData.infer
const CharacterData = type({
	name: "string < 256 = ''",
	attributes: type(`Record<string, string>`).default(() => ({})),
	hits: "string = ''",
	fatigue: "string = ''",
	comeback: "string = ''",
	traits: type("string[]").default(() => []),
	proficientSkills: type("string[]").default(() => []),
})

const defaultCharacter: CharacterData = {
	name: "",
	attributes: {
		intellect: "1",
		sense: "1",
		agility: "1",
		strength: "1",
		wit: "1",
	},
	hits: "",
	fatigue: "",
	comeback: "",
	traits: [],
	proficientSkills: [],
}

export function parseNumber(value: string, min = 0, max = Infinity) {
	const parsed = parseInt(value)
	return isNaN(parsed) ? min : clamp(parsed, min, max)
}

function getAttributeValue(name: AttributeName, character: CharacterData) {
	return parseNumber(character.attributes[name] ?? "1", 1, 6)
}

function getTraitPowerDice(attribute: AttributeName, selectedTraits: string[]) {
	return selectedTraits.reduce((count, traitName) => {
		const trait = traits.find((t) => t.name === traitName)
		if (!trait) return count
		return (
			count + (trait.attributes.some((a) => a.attribute === attribute) ? 1 : 0)
		)
	}, 0)
}

function getSkillPowerDice(
	attribute: AttributeName,
	skill: string,
	character: CharacterData,
) {
	const traitDice = getTraitPowerDice(attribute, character.traits)
	const proficiencyDice = character.proficientSkills.includes(skill) ? 1 : 0
	return traitDice + proficiencyDice
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

function startCase(str: string) {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ")
}

export function CharacterSheet() {
	const [character, setCharacter] = useLocalStorage(
		"aspects-character",
		defaultCharacter,
		CharacterData.assert,
	)

	const attributeTotal = Object.values(character.attributes).reduce(
		(sum, val = "1") => sum + parseNumber(val, 1, 6),
		0,
	)

	const toughness =
		getAttributeValue("strength", character) +
		getAttributeValue("agility", character)

	const resolve =
		getAttributeValue("sense", character) +
		getAttributeValue("intellect", character) +
		getAttributeValue("wit", character)

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

	const traitList = character.traits
		.map((t) => traits.find((trait) => trait.name === t))
		.filter((trait): trait is NonNullable<typeof trait> => Boolean(trait))
		.map((trait) => trait.name)

	const formattedTraits =
		traitList.length > 0
			? new Intl.ListFormat("en", {
					style: "long",
					type: "conjunction",
			  })
					.format(traitList)
					.toLocaleLowerCase()
			: ""

	return (
		<div className="max-w-4xl mx-auto py-6 px-4 @container">
			<div className="grid gap-8 grid-cols-1 @lg:grid-cols-[1fr_auto]">
				<div className="space-y-6 min-w-0 @container">
					<div>
						<Input
							type="text"
							value={character.name}
							onChange={(e) =>
								setCharacter((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Unnamed Character"
							className="text-xl"
						/>
						{traitList.length > 0 && (
							<p className="mt-1 text-gray-400">{formattedTraits}</p>
						)}
					</div>

					<section>
						<h3 className="text-sm font-semibold">
							Attributes ({attributeTotal}/18)
						</h3>
						<div className="grid gap-2 grid-cols-1 @-[12rem]:grid-cols-2 @xs:grid-cols-3 @md:grid-cols-5">
							{attributeNames.map((attribute) => (
								<AttributeInput
									key={attribute}
									attribute={attribute}
									label={attributes[attribute].name}
									value={character.attributes[attribute] ?? "1"}
									onChange={(value) =>
										updateAttribute(attribute, value.toString())
									}
								/>
							))}
						</div>
					</section>

					<div className="space-y-4">
						<DotBar
							label="Hits"
							value={character.hits}
							placeholder="0"
							max={toughness}
							onChange={(value) =>
								setCharacter((prev) => ({ ...prev, hits: value }))
							}
							color="red"
						/>
						<DotBar
							label="Fatigue"
							value={character.fatigue}
							placeholder="0"
							max={resolve}
							onChange={(value) =>
								setCharacter((prev) => ({ ...prev, fatigue: value }))
							}
							color="purple"
						/>
					</div>
				</div>

				<div className="w-80 h-80 border border-gray-700 rounded-lg bg-black/20 flex items-center justify-center">
					<p className="text-center text-gray-400">character image here</p>
				</div>
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
						const availableProficiencies = getAvailableProficiencies(
							attribute,
							character.traits,
						)
						const usedProficiencies = attributes[attribute].skills.filter(
							(skill) => character.proficientSkills.includes(skill),
						).length

						const neededProficiencies =
							availableProficiencies - usedProficiencies

						return (
							<div key={attribute} className="space-y-2">
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
										const isProficient =
											character.proficientSkills.includes(skill)

										const canToggle =
											isProficient || usedProficiencies < availableProficiencies

										const powerDice = getSkillPowerDice(
											attribute,
											skill,
											character,
										)

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
