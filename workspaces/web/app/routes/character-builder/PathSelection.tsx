import { listCharacterPaths } from "@workspace/backend/data/characterPaths.ts"

type PathSelectionProps = {
	selectedPaths: string[]
	onPathToggle: (pathName: string) => void
}

export function PathSelection({
	selectedPaths,
	onPathToggle,
}: PathSelectionProps) {
	return (
		<>
			{listCharacterPaths().map((path) => {
				const isSelected = selectedPaths.includes(path.name)
				const isDisabled = !isSelected && selectedPaths.length >= 2

				return (
					<div
						key={path.name}
						className={`flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 transition ${
							isSelected
								? "bg-primary-900/20 border-primary-700 cursor-pointer"
								: isDisabled
									? "border-gray-700 bg-gray-900/20 opacity-50"
									: "cursor-pointer border-gray-700 hover:border-gray-600 hover:bg-gray-900/20"
						} `}
						onClick={() => {
							if (!isDisabled) {
								onPathToggle(path.name)
							}
						}}
					>
						<div className="flex-1">
							<h3 className="mb-1 font-medium">{path.name}</h3>
							<div className="text-sm text-gray-400">{path.description}</div>
						</div>

						<input
							type="checkbox"
							checked={isSelected}
							disabled={isDisabled}
							onChange={(event) => {
								// Prevent the click event from firing twice
								event.stopPropagation()
								onPathToggle(path.name)
							}}
							className="size-5 accent-pink-300"
							onClick={(event) => event.stopPropagation()}
						/>
					</div>
				)
			})}
		</>
	)
}
