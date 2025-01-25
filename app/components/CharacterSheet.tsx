import { type } from "arktype"
import { clamp } from "es-toolkit"
import type { ReactNode } from "react"
import { Input } from "~/components/Input"
import {
	attributeNames,
	attributes,
	type AttributeName,
} from "~/data/attributes"
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
}

function getAttribute(name: AttributeName, character: CharacterData) {
	return clamp(Math.floor(character.attributes[name] ?? 1), 1, 6)
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
		getAttribute("strength", character) + getAttribute("agility", character)

	const resolve =
		getAttribute("sense", character) +
		getAttribute("intellect", character) +
		getAttribute("wit", character)

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
						{attributeNames.map((attribute) => (
							<Input
								key={attribute}
								label={attributes[attribute].name}
								hint={attributes[attribute].description}
								type="number"
								min="1"
								max="6"
								value={character.attributes[attribute]}
								onChange={(event) =>
									updateAttribute(attribute, event.target.valueAsNumber)
								}
							/>
						))}
					</div>
				</Section>

				<Section title="Status">
					<div className="grid gap-4 md:grid-cols-2 content-start">
						<OutOf value={toughness}>
							<Input
								label="Hits"
								type="number"
								className="flex-1"
								min="0"
								max={toughness}
								value={character.hits}
								onChange={(event) =>
									setCharacter((prev) => ({
										...prev,
										hits: Math.min(toughness, event.target.valueAsNumber),
									}))
								}
							/>
						</OutOf>

						<OutOf value={resolve}>
							<Input
								label="Fatigue"
								type="number"
								className="flex-1"
								min={0}
								max={resolve}
								value={character.fatigue}
								onChange={(event) => {
									setCharacter((prev) => ({
										...prev,
										fatigue: Math.min(resolve, event.target.valueAsNumber),
									}))
								}}
							/>
						</OutOf>
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
					{attributeNames.map((attribute) => (
						<div key={attribute} className="space-y-2">
							<h3 className="font-medium capitalize">
								{attributes[attribute].name}
							</h3>
							<ul className="space-y-1">
								{attributes[attribute].skills.map((skill) => (
									<li key={skill} className="flex justify-between">
										<span>{skill}</span>
										<span>{character.attributes[attribute]}</span>
									</li>
								))}
							</ul>
						</div>
					))}
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

function OutOf({ value, children }: { value: ReactNode; children: ReactNode }) {
	return (
		<div className="flex items-end gap-2">
			{children}
			<p className="py-2 my-px">
				<span aria-hidden>/</span> <span className="sr-only">out of</span>{" "}
				<span className="py-3">{value}</span>
			</p>
		</div>
	)
}
