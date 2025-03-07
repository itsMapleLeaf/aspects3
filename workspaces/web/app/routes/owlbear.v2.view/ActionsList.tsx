import { groupBy } from "es-toolkit"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/ui/Button.tsx"
import type { Character } from "./character.ts"
import { getComputedCharacter } from "./character.ts"
import { actions, aspectSkills, aspects, attributes } from "./data.ts"

interface ActionsListProps {
	character: Character
	className?: string
	onRollAction: (actionName: string, diceCount: number) => void
}

export function ActionsList({
	character,
	className,
	onRollAction,
}: ActionsListProps) {
	const actionsByAttribute = groupBy(
		Object.values(actions),
		(action) => action.attribute.name,
	)

	const aspectSkillsByAspect = groupBy(
		Object.values(aspectSkills),
		(skill) => skill.aspect.name,
	)

	// Get computed character stats
	const characterStats = getComputedCharacter(character)

	function handleActionClick(actionName: string, attributeName: string) {
		// Calculate dice count based on attribute
		const attributeKey =
			attributeName.toLowerCase() as keyof typeof characterStats
		// Base dice count on the related attribute's value
		const diceCount = characterStats[attributeKey] || 1

		if (onRollAction) {
			onRollAction(
				`${character.name || "Unknown Character"}: ${actionName} (${attributeName})`,
				diceCount,
			)
		}
	}

	function handleAspectSkillClick(skillName: string, aspectName: string) {
		// Calculate dice count based on aspect
		const aspectKey = aspectName.toLowerCase() as keyof typeof characterStats
		// Base dice count on the related aspect's value
		const diceCount = characterStats[aspectKey] || 1

		if (onRollAction) {
			onRollAction(
				`${character.name || "Unknown Character"}: ${skillName} (${aspectName})`,
				diceCount,
			)
		}
	}

	return (
		<div className={twMerge("flex flex-col gap-4", className)}>
			<div className="flex flex-wrap gap-x-6 gap-y-2">
				{Object.values(attributes).map((attribute) => {
					const attributeKey =
						attribute.name.toLowerCase() as keyof typeof characterStats
					const attributeValue = characterStats[attributeKey] || 0

					return (
						<section key={attribute.name}>
							<h3 className="mb-0.5 text-sm font-semibold">
								{attribute.name} ({attributeValue})
							</h3>
							<ul className="flex flex-wrap gap-2">
								{actionsByAttribute[attribute.name]?.map((action) => (
									<Button
										key={action.name}
										size="sm"
										title={`${action.description} (${attributeValue} dice)`}
										onClick={() =>
											handleActionClick(action.name, attribute.name)
										}
									>
										{action.name}
									</Button>
								))}
							</ul>
						</section>
					)
				})}
			</div>

			<div className="flex flex-wrap gap-x-6 gap-y-2">
				{Object.values(aspects).map((aspect) => {
					const aspectKey =
						aspect.name.toLowerCase() as keyof typeof characterStats
					const aspectValue = characterStats[aspectKey] || 0
					const disabled = aspectValue === 0

					return (
						<section key={aspect.name} className={disabled ? "opacity-50" : ""}>
							<h3 className="mb-0.5 text-sm font-semibold">
								{aspect.name} ({aspectValue})
							</h3>
							<ul className="flex flex-wrap gap-2">
								{aspectSkillsByAspect[aspect.name]
									?.filter((skill) =>
										skill.drives.some(
											(drive) =>
												drive.name.toLowerCase() ===
												character.drive?.toLowerCase(),
										),
									)
									?.map((skill) => (
										<Button
											key={skill.name}
											size="sm"
											title={`${skill.effect} (${aspectValue} dice)`}
											onClick={() => {
												if (disabled) return
												handleAspectSkillClick(skill.name, aspect.name)
											}}
										>
											{skill.name}
										</Button>
									))}
							</ul>
						</section>
					)
				})}
			</div>
		</div>
	)
}
