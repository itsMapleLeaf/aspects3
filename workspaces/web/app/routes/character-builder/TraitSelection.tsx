import { listTraits } from "@workspace/backend/data/traits.ts"
import { IconTooltip } from "~/components/ui/IconTooltip.tsx"

const aspectColors = {
	light: "text-yellow-300",
	water: "text-blue-300",
	wind: "text-emerald-300",
	fire: "text-red-300",
	darkness: "text-purple-300",
} as const

type TraitSelectionProps = {
	selectedTraits: string[]
	onTraitToggle: (traitName: string) => void
}

export function TraitSelection({
	selectedTraits,
	onTraitToggle,
}: TraitSelectionProps) {
	return (
		<>
			{listTraits().map((trait) => {
				const isSelected = selectedTraits.includes(trait.name)
				const isDisabled = !isSelected && selectedTraits.length >= 3

				return (
					<div
						key={trait.name}
						className={`flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 transition ${
							isSelected
								? "bg-primary-900/20 border-primary-700"
								: isDisabled
									? "border-gray-700 bg-gray-900/20 opacity-50"
									: "border-gray-700 hover:border-gray-600 hover:bg-gray-900/20"
						} `}
					>
						<div>
							<h3 className="mb-1 font-medium">{trait.name}</h3>
							<div className="flex flex-wrap gap-x-2 gap-y-1">
								{trait.attributes.map((attribute) => (
									<div key={attribute.name} className="flex items-center gap-1">
										<span className="text-primary-400 text-sm">
											{attribute.name}
										</span>
										<IconTooltip
											content={attribute.description}
											className="size-4"
										/>
									</div>
								))}
								<span className={`text-primary-400 text-sm`}>
									{trait.aspect.name}
								</span>
							</div>
						</div>

						<input
							type="checkbox"
							checked={isSelected}
							disabled={isDisabled}
							onChange={() => onTraitToggle(trait.name)}
							className="size-5 accent-pink-300"
						/>
					</div>
				)
			})}
		</>
	)
}
