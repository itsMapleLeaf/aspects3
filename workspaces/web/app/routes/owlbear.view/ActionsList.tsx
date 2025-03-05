import { groupBy } from "es-toolkit"
import { twMerge } from "tailwind-merge"
import { Button } from "~/components/ui/Button.tsx"
import { actions, attributes } from "./data.ts"

interface ActionsListProps {
	className?: string
}

export function ActionsList({ className }: ActionsListProps) {
	const actionsByAttribute = groupBy(
		Object.values(actions),
		(action) => action.attribute.name,
	)

	return (
		<div className={twMerge("flex flex-wrap gap-x-6 gap-y-2", className)}>
			{Object.values(attributes).map((attribute) => (
				<section key={attribute.name}>
					<h3 className="mb-0.5 text-sm font-semibold">{attribute.name}</h3>
					<ul className="flex flex-wrap gap-2">
						{actionsByAttribute[attribute.name]?.map((action) => (
							<Button size="sm">{action.name}</Button>
						))}
					</ul>
				</section>
			))}
		</div>
	)
}
