import { groupBy } from "es-toolkit"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/ui/Button.tsx"
import type { Character } from "./character.ts"
import { actions, aspectSkills, aspects, attributes } from "./data.ts"

interface ActionsListProps {
	character: Character
	className?: string
}

export function ActionsList({ character, className }: ActionsListProps) {
	const actionsByAttribute = groupBy(
		Object.values(actions),
		(action) => action.attribute.name,
	)

	const aspectSkillsByAspect = groupBy(
		Object.values(aspectSkills),
		(skill) => skill.aspect.name,
	)

	return (
		<div className={twMerge("flex flex-col gap-4", className)}>
			<div className="flex flex-wrap gap-x-6 gap-y-2">
				{Object.values(attributes).map((attribute) => (
					<section key={attribute.name}>
						<h3 className="mb-0.5 text-sm font-semibold">{attribute.name}</h3>
						<ul className="flex flex-wrap gap-2">
							{actionsByAttribute[attribute.name]?.map((action) => (
								<Button size="sm" title={action.description}>
									{action.name}
								</Button>
							))}
						</ul>
					</section>
				))}
			</div>
			<div className="flex flex-wrap gap-x-6 gap-y-2">
				{Object.values(aspects).map((aspect) => (
					<section key={aspect.name}>
						<h3 className="mb-0.5 text-sm font-semibold">{aspect.name}</h3>
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
									<Button size="sm" title={skill.effect}>
										{skill.name}
									</Button>
								))}
						</ul>
					</section>
				))}
			</div>
		</div>
	)
}
