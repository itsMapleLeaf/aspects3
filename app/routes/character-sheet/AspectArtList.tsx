import { aspects } from "~/data/aspects.ts"
import type { Character } from "~/data/characters.ts"
import { getAttributeValue } from "~/data/characters.ts"

const aspectColors = {
	light: "text-yellow-300 bg-yellow-500/5 border-yellow-500/20",
	water: "text-blue-300 bg-blue-500/5 border-blue-500/20",
	wind: "text-emerald-300 bg-emerald-500/5 border-emerald-500/20",
	fire: "text-red-300 bg-red-500/5 border-red-500/20",
	darkness: "text-purple-300 bg-purple-500/5 border-purple-500/20",
} as const

const inactiveColors = "text-gray-400 bg-gray-900/20 border-gray-700"

export function AspectArtList({ character }: { character: Character }) {
	return (
		<>
			{Object.entries(aspects).map(([aspectName, aspect]) => {
				const aspectPoints = Number(character.aspects[aspectName])
				const attributeValue = getAttributeValue(aspect.attribute, character)
				const total = aspectPoints + attributeValue
				const hasAspect = aspectPoints > 0
				const colors = aspectColors[aspectName as keyof typeof aspectColors]

				return (
					<div key={aspectName} className="space-y-2">
						<h3
							className={`
								text-lg font-medium capitalize transition-colors
								${hasAspect ? colors.split(" ")[0] : inactiveColors.split(" ")[0]}
							`}
						>
							{aspect.name}
							{hasAspect && <span className="ml-2 opacity-75">({total})</span>}
						</h3>
						<div className="space-y-1.5">
							{aspect.actions.map((action) => (
								<div
									key={action.name}
									className={`
										flex flex-col gap-1 px-3 py-2 rounded-lg border transition-all
										${hasAspect ? colors : inactiveColors}
										${!hasAspect && "opacity-50"}
									`}
								>
									<span className="font-medium capitalize">{action.name}</span>
									<p className="text-sm opacity-75">{action.description}</p>
								</div>
							))}
						</div>
					</div>
				)
			})}
		</>
	)
}
