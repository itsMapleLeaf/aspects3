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
		<div className="grid gap-4 grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3">
			{traits.map((trait) => (
				<button
					key={trait.name}
					className={`
						text-left px-3 py-2.5 rounded-lg border transition flex flex-col
						${
							selectedTraits.includes(trait.name)
								? "bg-primary-900/20 border-primary-700"
								: selectedTraits.length >= 3
								? "opacity-50 bg-gray-900/20 border-gray-700"
								: "hover:bg-gray-900/20 hover:border-gray-600 border-gray-700"
						}
					`}
					onClick={() => {
						if (
							!selectedTraits.includes(trait.name) &&
							selectedTraits.length >= 3
						)
							return
						onTraitToggle(trait.name)
					}}
					disabled={
						!selectedTraits.includes(trait.name) && selectedTraits.length >= 3
					}
				>
					<h3 className="font-medium mb-2">{trait.name}</h3>
					<div className="flex flex-col gap-3">
						{trait.attributes.map(({ attribute, description }) => (
							<div key={attribute}>
								<p className="font-medium text-sm text-primary-400">
									{attributes[attribute].name}
								</p>
								<p className="text-sm text-gray-400">{description}</p>
							</div>
						))}
					</div>
				</button>
			))}
		</div>
	)
}
