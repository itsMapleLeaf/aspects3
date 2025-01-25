import { attributeDetails } from "~/data/attributes"
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
		<div className="grid gap-4">
			{traits.map((trait) => (
				<div
					key={trait.name}
					className={`
              p-4 rounded-lg border transition cursor-pointer
              ${
								selectedTraits.includes(trait.name)
									? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700"
									: selectedTraits.length >= 3
									? "opacity-50 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
									: "hover:bg-gray-50 dark:hover:bg-gray-900/20 border-gray-200 dark:border-gray-700"
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
				>
					<div className="flex flex-wrap gap-x-8 gap-y-2">
						<h3 className="font-medium">{trait.name}</h3>
						<div className="flex-1 grid gap-2 @md:grid-cols-2">
							{trait.attributes.map(({ attribute, description }) => (
								<div key={attribute} className="space-y-1">
									<p className="font-medium text-sm text-primary-600 dark:text-primary-400">
										{attributeDetails[attribute].name}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
