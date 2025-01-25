import type { ReactNode } from "react"
import { Card } from "~/components/Card"
import { Input } from "~/components/Input"
import { useLocalStorage } from "~/hooks/useLocalStorage"

const attributeNames = [
	"intellect",
	"sense",
	"agility",
	"strength",
	"wit",
] as const

type Attribute = (typeof attributeNames)[number]

type CharacterData = {
	name: string
	attributes: Record<Attribute, number>
	hits: number
	resolve: number
	comeback: number
}

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
	resolve: 0,
	comeback: 0,
}

const attributeLabels: Record<
	Attribute,
	{ name: string; description: string }
> = {
	intellect: {
		name: "Intellect",
		description: "breadth of knowledge and how to apply it",
	},
	sense: {
		name: "Sense",
		description: "strength of mind, ability to focus and perceive",
	},
	agility: {
		name: "Agility",
		description: "nimbleness, adaptability, swiftness",
	},
	strength: {
		name: "Strength",
		description: "physical prowess, strength of body",
	},
	wit: {
		name: "Wit",
		description: "social skills, insight, manipulation",
	},
}

const skillsByAttribute: Record<Attribute, string[]> = {
	strength: ["Strike", "Block", "Throw", "Lift", "Endure"],
	intellect: ["Intuit", "Recall", "Aid", "Operate", "Tinker"],
	agility: ["Dash", "Jump", "Climb", "Dodge", "Maneuver"],
	wit: ["Charm", "Intimidate", "Deceive", "Read", "Sneak"],
	sense: ["Spy", "Listen", "Feel", "Shoot", "Focus"],
}

export function CharacterSheet() {
	const [character, setCharacter] = useLocalStorage(
		"aspects-character",
		defaultCharacter,
	)

	const attributeTotal = Object.values(character.attributes).reduce(
		(sum, val) => sum + val,
		0,
	)

	const toughness = character.attributes.strength + character.attributes.agility

	const maxResolve =
		character.attributes.sense +
		character.attributes.intellect +
		character.attributes.wit

	function updateAttribute(attr: Attribute, value: number) {
		const newValue = Math.max(1, Math.min(6, value))
		setCharacter((prev) => ({
			...prev,
			attributes: {
				...prev.attributes,
				[attr]: newValue,
			},
		}))
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<Card title="Character Sheet">
				<div className="@container grid gap-4">
					<Input
						label="Name"
						value={character.name}
						onChange={(e) =>
							setCharacter((prev) => ({ ...prev, name: e.target.value }))
						}
					/>

					<div className="grid gap-4 @md:grid-flow-col auto-cols-fr">
						<section>
							<h3 className="text-lg font-medium mb-4">
								Attributes (Total: {attributeTotal}/18)
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{attributeNames.map((attribute) => (
									<Input
										key={attribute}
										label={attributeLabels[attribute].name}
										hint={attributeLabels[attribute].description}
										type="number"
										min="1"
										max="6"
										value={character.attributes[attribute]}
										onChange={() => updateAttribute(attribute, maxResolve)}
									/>
								))}
							</div>
						</section>

						<section>
							<h3 className="text-lg font-medium mb-4">Status</h3>
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

								<OutOf value={maxResolve}>
									<Input
										label="Resolve"
										type="number"
										className="flex-1"
										min={0}
										max={character.resolve}
										onChange={(event) => {
											setCharacter((prev) => ({
												...prev,
												resolve: Math.min(
													maxResolve,
													event.target.valueAsNumber,
												),
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
						</section>
					</div>
				</div>
			</Card>

			<Card title="Skills">
				<div className="grid gap-8 md:grid-cols-3">
					{attributeNames.map((attribute) => (
						<div key={attribute} className="space-y-2">
							<h3 className="font-medium capitalize">
								{attributeLabels[attribute].name}
							</h3>
							<ul className="space-y-1">
								{skillsByAttribute[attribute].map((skill) => (
									<li key={skill} className="flex justify-between">
										<span>{skill}</span>
										<span>{character.attributes[attribute]}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Card>
		</div>
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
