import { type ComponentProps } from "react"
import { type AttributeName } from "~/data/attributes"

const ATTRIBUTE_COLORS: Record<AttributeName, string> = {
	intellect: "border-orange-900 bg-orange-800/20 ring-orange-500/50",
	sense: "border-cyan-900 bg-cyan-800/20 ring-cyan-500/50",
	agility: "border-green-900 bg-green-800/20 ring-green-500/50",
	strength: "border-rose-900 bg-rose-800/20 ring-rose-500/50",
	wit: "border-violet-900 bg-violet-800/20 ring-violet-500/50",
}

type AttributeInputProps = {
	attribute: AttributeName
	label: string
	value: string
	onChange: (value: string) => void
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">

export function AttributeInput({
	attribute,
	label,
	value,
	onChange,
	className = "",
	...props
}: AttributeInputProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<input
				type="text"
				inputMode="numeric"
				pattern="[0-9]*"
				value={value}
				onChange={(event) => {
					const newValue = event.target.value
					if (newValue === "" || !isNaN(parseInt(newValue))) {
						onChange(newValue)
					}
				}}
				className={`transition w-full h-12 text-center text-2xl border rounded-lg bg-black/20 focus:outline-none focus:ring-2 ${ATTRIBUTE_COLORS[attribute]} ${className}`}
				{...props}
			/>
			<span
				className="text-sm font-semibold"
				style={{ color: `rgb(var(--${attribute}-color))` }}
			>
				{label}
			</span>
		</div>
	)
}
