import { type ComponentProps, useState } from "react"
import { NumberInput } from "~/routes/character-sheet/NumberInput.tsx"
import { parseNumber } from "~/utils.ts"

type StatMeterProps = {
	value: string
	max?: number
	label: string
	onChange: (value: string) => void
	color: "red" | "purple" | "blue"
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">

const COLORS = {
	red: "border-red-900 bg-red-800/20 ring-red-500/50",
	purple: "border-violet-900 bg-violet-800/20 ring-violet-500/50",
	blue: "border-blue-900 bg-blue-800/20 ring-blue-500/50",
} as const

export function StatMeter({
	value,
	max,
	label,
	onChange,
	color,
	className = "",
}: StatMeterProps) {
	const [isEditing, setIsEditing] = useState(false)
	const colorClasses = COLORS[color]
	const numericValue = parseInt(value) || 0
	const fillPercentage =
		max != null ? Math.min(100, (numericValue / max) * 100) : 0

	if (isEditing) {
		return (
			<div className="flex flex-col items-center gap-1">
				<NumberInput
					value={value}
					onChange={onChange}
					onBlur={() => setIsEditing(false)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault()
							setIsEditing(false)
						}
					}}
					min={0}
					max={max}
					className={`transition w-full h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 ${colorClasses} ${className}`}
					autoFocus
				/>
				<div className="text-sm font-semibold">{label}</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center gap-1">
			<button
				type="button"
				onClick={() => setIsEditing(true)}
				className={`
					relative w-full h-12 text-center text-2xl border rounded-lg transition
					${colorClasses} ${className}
				`}
			>
				{max != null && (
					<div
						className={`absolute inset-0 rounded-lg transition-[width] ${
							color === "red"
								? "bg-red-500/20"
								: color === "purple"
								? "bg-violet-500/20"
								: "bg-blue-500/20"
						}`}
						style={{ width: `${fillPercentage}%` }}
					/>
				)}
				<span className="relative">
					{parseNumber(value, 0, max)}
					{max != null && ` / ${max}`}
				</span>
			</button>
			<div className="text-sm font-semibold">{label}</div>
		</div>
	)
}
