import { prefillDice } from "~/components/DiceTray.tsx"
import { Button } from "~/components/ui/Button.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { aspects } from "~/data/aspects.ts"
import type { Character } from "~/data/characters.ts"
import { getAspectPowerDice, getAttributeValue } from "~/data/characters.ts"
import { parseNumber } from "~/utils.ts"

const aspectColors = {
	light: "text-yellow-300",
	water: "text-blue-300",
	wind: "text-emerald-300",
	fire: "text-red-300",
	darkness: "text-purple-300",
} as const

const aspectBgColors = {
	light: "bg-yellow-500/5 border-yellow-500/20",
	water: "bg-blue-500/5 border-blue-500/20",
	wind: "bg-emerald-500/5 border-emerald-500/20",
	fire: "bg-red-500/5 border-red-500/20",
	darkness: "bg-purple-500/5 border-purple-500/20",
} as const

const inactiveColors = "text-gray-400 bg-gray-900/20 border-gray-700"

type AspectArtListProps = {
	character: Character
	showAttunedOnly: boolean
}

export function AspectArtList({
	character,
	showAttunedOnly,
}: AspectArtListProps) {
	return (
		<>
			{Object.entries(aspects).map(([aspectName, aspect]) => {
				const aspectPoints = parseNumber(character.aspects[aspectName] ?? "")
				const attributeValue = getAttributeValue(aspect.attribute, character)
				const total = aspectPoints + attributeValue
				const hasAspect = aspectPoints > 0
				const color = aspectColors[aspectName as keyof typeof aspectColors]
				const bgColor =
					aspectBgColors[aspectName as keyof typeof aspectBgColors]
				const powerDice = getAspectPowerDice(
					aspectName as keyof typeof aspects,
					character,
				)

				if (showAttunedOnly && !hasAspect) return null

				const modifiers = [
					hasAspect ? "1 fatigue" : "2 fatigue",
					!hasAspect && "+1 risk",
					powerDice > 0 && `+${powerDice} power`,
				].filter(Boolean)

				return (
					<div
						key={aspectName}
						className={`space-y-2 ${!hasAspect && "opacity-70"}`}
					>
						<div>
							<h3
								className={`
									text-lg font-medium capitalize transition-colors flex items-center gap-2
									${color} ${!hasAspect && "opacity-50"}
								`}
							>
								{aspect.name}
								<span className="opacity-75">({total})</span>
							</h3>
							<p className={`text-sm ${color} opacity-75`}>
								{modifiers.join(", ")}
							</p>
						</div>
						<div className="space-y-1.5">
							{aspect.actions.map((action) => (
								<div
									key={action.name}
									className={`
										flex flex-col gap-1 px-3 py-2 rounded-lg border transition-all
										${color} ${bgColor}
									`}
								>
									<div className="flex gap-2">
										<span className={`font-medium flex-1 capitalize ${color}`}>
											{action.name}
										</span>
										<Button
											icon={<Icon icon="mingcute:box-3-fill" />}
											appearance="ghost"
											shape="circle"
											onClick={() => {
												prefillDice({
													target: total,
													dice: [
														{ name: "aspect", count: 1 },
														{ name: "power", count: powerDice },
														{ name: "risk", count: hasAspect ? 0 : 1 },
													],
												})
											}}
										/>
									</div>
									<p className={`text-sm  opacity-75`}>{action.description}</p>
									{action.failure && (
										<p className="text-sm opacity-75">
											<span className="text-red-400">failure</span> -{" "}
											{action.failure}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)
			})}
		</>
	)
}
