import { NumberInput } from "./NumberInput.tsx"

type DotBarProps = {
	value: string
	max: number
	label: string
	placeholder?: string
	color?: "red" | "purple" | "gray"
	onChange: (value: string) => void
}

export function DotBar({
	value,
	max,
	label,
	placeholder = "0",
	color = "gray",
	onChange,
}: DotBarProps) {
	const colorClasses = {
		red: "bg-red-400/20 border-red-400",
		purple: "bg-violet-400/20 border-violet-400",
		gray: "bg-gray-400/20 border-gray-400",
	}

	return (
		<div className="flex items-end">
			<div className="flex-1 space-y-1">
				<div className="text-sm font-semibold">{label}</div>
				<div className="flex items-center gap-1 flex-wrap">
					{Array.from({ length: max }, (_, i) => {
						const current = parseInt(value) || 0
						const active = i < current
						return (
							<button
								key={i}
								type="button"
								onClick={() => {
									if (i === current - 1) {
										onChange(i.toString())
									} else {
										onChange((i + 1).toString())
									}
								}}
								className={`w-5 h-5 rounded-full border transition ${
									active
										? colorClasses[color]
										: "border-gray-700 hover:border-gray-600"
								}`}
								aria-label={`Set ${label} to ${i + 1}`}
							/>
						)
					})}
				</div>
			</div>

			<div className="flex items-center bg-black/20 rounded relative tabular-nums">
				<NumberInput
					value={value}
					onChange={onChange}
					max={max}
					placeholder={placeholder}
					className="w-20 text-right border border-gray-700 bg-gray-800 rounded-md px-2 py-1 pr-10"
				/>
				<span className="text-gray-400 absolute w-8 right-1 pointer-events-none">
					/ {max}
				</span>
			</div>
		</div>
	)
}
