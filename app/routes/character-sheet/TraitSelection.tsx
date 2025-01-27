import { Icon } from "@iconify/react"
import { Tooltip } from "~/components/Tooltip.tsx"
import { attributes } from "~/data/attributes"
import { traits } from "~/data/traits"

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
			{traits.map((trait) => {
				const isSelected = selectedTraits.includes(trait.name)
				const isDisabled = !isSelected && selectedTraits.length >= 3

				return (
					<div
						key={trait.name}
						className={`
							flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg border transition
							${
								isSelected
									? "bg-primary-900/20 border-primary-700"
									: isDisabled
									? "opacity-50 bg-gray-900/20 border-gray-700"
									: "hover:bg-gray-900/20 hover:border-gray-600 border-gray-700"
							}
						`}
					>
						<div>
							<h3 className="font-medium mb-1">{trait.name}</h3>
							<div className="flex gap-4">
								{trait.attributes.map(({ attribute, description }) => (
									<div key={attribute} className="flex items-center gap-1">
										<span className="text-sm text-primary-400">
											{attributes[attribute].name}
										</span>
										<Tooltip content={description}>
											<Icon
												icon="mingcute:information-line"
												className="size-4 text-gray-500"
											/>
										</Tooltip>
									</div>
								))}
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
