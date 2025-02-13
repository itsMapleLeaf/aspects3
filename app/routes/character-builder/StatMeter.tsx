import { type ComponentProps, useId, useState } from "react"
import { parseNumber } from "~/lib/utils"
import { NumberInput } from "~/routes/character-builder/NumberInput"

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
	const inputId = useId()

	if (isEditing) {
		return (
			<div className="flex flex-col items-center gap-1">
				<NumberInput
					id={inputId}
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
					className={`h-12 w-full rounded-lg border text-center text-2xl transition focus:ring-2 focus:outline-none ${colorClasses} ${className}`}
					autoFocus
				/>
				<label className="text-sm font-semibold" htmlFor={inputId}>
					{label}
				</label>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center gap-1">
			<button
				id={inputId}
				type="button"
				onClick={() => {
					setIsEditing(true)
					onChange(parseNumber(value, 0, max).toString())
				}}
				className={`relative h-12 w-full overflow-clip rounded-lg border text-center text-2xl transition ${colorClasses} ${className} `}
			>
				{max != null && (
					<div
						className={`absolute inset-0 transition-[width] ${
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
			<label className="text-sm font-semibold" htmlFor={inputId}>
				{label}
			</label>
		</div>
	)
}
