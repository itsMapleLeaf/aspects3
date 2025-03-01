import { findAspect } from "@workspace/backend/data/aspects.ts"
import { listAspectSkills } from "@workspace/backend/data/aspectSkills.ts"
import { type CharacterFields } from "@workspace/backend/data/character"
import { findTrait } from "@workspace/backend/data/traits.ts"
import { parseNumber } from "@workspace/shared/utils"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { useDiceTray } from "~/components/DiceTray.tsx"
import { Icon } from "~/components/ui/Icon.tsx"
import { SquareIconButton } from "~/components/ui/SquareIconButton.tsx"

const aspectColors = {
	Light: "border-yellow-900/50 bg-yellow-950/30",
	Water: "border-blue-900/50 bg-blue-950/30",
	Wind: "border-emerald-900/50 bg-emerald-950/30",
	Fire: "border-red-900/50 bg-red-950/30",
	Darkness: "border-purple-900/50 bg-purple-950/30",
} as const

const aspectTextColors = {
	Light: "text-yellow-300",
	Water: "text-blue-300",
	Wind: "text-emerald-300",
	Fire: "text-red-300",
	Darkness: "text-purple-300",
} as const

const aspectScrollbarColors = {
	Light: `[scrollbar-color:theme(colors.yellow.900)_transparent]`,
	Water: `[scrollbar-color:theme(colors.blue.900)_transparent]`,
	Wind: `[scrollbar-color:theme(colors.emerald.900)_transparent]`,
	Fire: `[scrollbar-color:theme(colors.red.900)_transparent]`,
	Darkness: `[scrollbar-color:theme(colors.purple.900)_transparent]`,
} as const

type AspectSkillListProps = {
	character: CharacterFields
}

export function AspectSkillList({ character }: AspectSkillListProps) {
	const characterPaths = character.paths ?? []
	const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
	const diceTray = useDiceTray()

	const allSkills = listAspectSkills()

	const availableSkills = allSkills.filter((skill) => {
		return skill.paths.every((path) => characterPaths.includes(path))
	})

	const displaySkills = showOnlyAvailable ? availableSkills : allSkills

	const handleSkillClick = (
		skill: (typeof allSkills)[0],
		hasRequiredPaths: boolean,
	) => {
		const aspectBaseScore = parseNumber(
			character.aspects[skill.aspect.toLowerCase()] ?? "",
		)

		const aspect = findAspect(skill.aspect)
		const attributeScore = parseNumber(
			(aspect?.attribute && character.attributes[aspect?.attribute]) ?? "",
		)

		const aspectTotalScore = aspectBaseScore + attributeScore

		const powerDice = hasRequiredPaths ? 1 : 0
		const riskDice = aspectBaseScore > 0 ? 0 : 1

		diceTray.prefill({
			target: aspectTotalScore,
			dice: [
				{ name: "aspect", count: 1 },
				{ name: "power", count: powerDice },
				{ name: "risk", count: riskDice },
			],
		})
	}

	return (
		<div className="@container">
			<div className="mb-4 flex items-center justify-between">
				<label className="flex items-center gap-2 text-sm select-none">
					<input
						type="checkbox"
						checked={showOnlyAvailable}
						onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
						className="accent-primary-400 size-4"
					/>
					Show only path skills
				</label>
			</div>

			<div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-3">
				{displaySkills
					.sort((a, b) => a.name.localeCompare(b.name))
					.sort((a, b) => a.aspect.localeCompare(b.aspect))
					.map((skill) => {
						const hasRequiredPaths = skill.paths.every((path) =>
							characterPaths.includes(path),
						)

						const scrollbarColor =
							aspectScrollbarColors[
								skill.aspect as keyof typeof aspectScrollbarColors
							]

						const aspectBaseScore = parseNumber(
							character.aspects[skill.aspect.toLowerCase()] ?? "",
						)

						const aspect = findAspect(skill.aspect)
						const attributeScore = parseNumber(
							(aspect?.attribute && character.attributes[aspect?.attribute]) ??
								"",
						)

						const aspectTotalScore = aspectBaseScore + attributeScore

						const powerDiceCount = character.traits
							.flatMap((trait) => findTrait(trait) ?? [])
							.filter(
								(trait) =>
									trait.aspect.name.toLowerCase() ===
									skill.aspect.toLowerCase(),
							).length

						return (
							<div
								key={skill.name}
								className={twMerge(
									`flex flex-col gap-1 rounded-lg border p-4 @lg:h-80`,
									aspectColors[skill.aspect as keyof typeof aspectColors],
									hasRequiredPaths ? "" : "opacity-75",
								)}
							>
								<div className="flex items-center gap-2">
									<div className="flex flex-1 flex-wrap items-center justify-between gap-3">
										<h3 className="heading-xl">{skill.name}</h3>
										<span
											className={twMerge(
												aspectTextColors[
													skill.aspect as keyof typeof aspectTextColors
												],
												`text-sm font-medium`,
											)}
										>
											{skill.aspect} ({aspectTotalScore})
										</span>
									</div>

									<SquareIconButton
										icon={<Icon icon="mingcute:box-3-fill" />}
										size="sm"
										className="translate-y-[1px]"
										onClick={() => handleSkillClick(skill, hasRequiredPaths)}
									>
										Roll {skill.name}
									</SquareIconButton>
								</div>

								<div
									className={`-mr-4 flex flex-1 flex-col gap-2 overflow-y-auto py-1 ${scrollbarColor}`}
								>
									<div>
										<div className="text-sm/tight font-semibold text-green-300/90">
											On success
										</div>
										<p className="text-gray-300">{skill.success}</p>
									</div>

									<div>
										<div className="text-sm/tight font-semibold text-red-300/90">
											On failure
										</div>
										<p className="text-gray-300">{skill.failure}</p>
									</div>
								</div>

								{powerDiceCount > 0 && (
									<div className="mt-2 text-sm text-gray-300">
										+{powerDiceCount} power from traits
									</div>
								)}

								<div className="mt-2 border-t border-gray-700 pt-2 text-sm text-gray-300">
									<span className="font-medium text-gray-200">Paths: </span>
									{skill.paths.join(", ")}
								</div>
							</div>
						)
					})}
			</div>
		</div>
	)
}
