import { useState } from "react"
import { Card } from "~/components/Card"
import { Input } from "~/components/Input"

type Attribute = "intellect" | "sense" | "agility" | "strength" | "wit"

type CharacterData = {
	name: string
	attributes: Record<Attribute, number>
	hits: number
	comeback: number
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
	const [character, setCharacter] = useState<CharacterData>({
		name: "",
		attributes: {
			intellect: 1,
			sense: 1,
			agility: 1,
			strength: 1,
			wit: 1,
		},
		hits: 0,
		comeback: 0,
	})

	const attributeTotal = Object.values(character.attributes).reduce(
		(sum, val) => sum + val,
		0,
	)

	const toughness = character.attributes.strength + character.attributes.agility

	const resolve =
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
				<div className="space-y-6">
					<Input
						label="Name"
						value={character.name}
						onChange={(e) =>
							setCharacter((prev) => ({ ...prev, name: e.target.value }))
						}
						fullWidth
					/>

					<div>
						<h3 className="text-lg font-medium mb-4">
							Attributes (Total: {attributeTotal}/18)
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							{Object.entries(attributeLabels).map(
								([attr, { name, description }]) => (
									<div key={attr} className="space-y-1">
										<Input
											label={name}
											hint={description}
											type="number"
											min="1"
											max="6"
											value={character.attributes[attr as Attribute]}
											onChange={(e) =>
												updateAttribute(
													attr as Attribute,
													parseInt(e.target.value),
												)
											}
										/>
									</div>
								),
							)}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<Input
							label="Hits"
							type="number"
							min="0"
							max={toughness}
							value={character.hits}
							onChange={(e) =>
								setCharacter((prev) => ({
									...prev,
									hits: Math.min(toughness, parseInt(e.target.value) || 0),
								}))
							}
						/>
						<Input label="Toughness" type="number" value={toughness} readOnly />
						<Input label="Resolve" type="number" value={resolve} readOnly />
					</div>

					<Input
						label="Comeback"
						type="number"
						min="0"
						value={character.comeback}
						onChange={(e) =>
							setCharacter((prev) => ({
								...prev,
								comeback: Math.max(0, parseInt(e.target.value) || 0),
							}))
						}
					/>
				</div>
			</Card>

			<Card title="Skills">
				<div className="grid gap-8 md:grid-cols-3">
					{Object.entries(skillsByAttribute).map(([attr, skills]) => (
						<div key={attr} className="space-y-2">
							<h3 className="font-medium capitalize">
								{attributeLabels[attr as Attribute].name}
							</h3>
							<ul className="space-y-1">
								{skills.map((skill) => (
									<li key={skill} className="flex justify-between">
										<span>{skill}</span>
										<span>{character.attributes[attr as Attribute]}</span>
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
