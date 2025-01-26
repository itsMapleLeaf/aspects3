import { Icon } from "@iconify/react"
import { type ComponentProps } from "react"
import { Tooltip } from "./Tooltip.tsx"

type StatInputProps = {
	value: string
	onChange: (value: string) => void
	label: string
	description?: string
	min?: number
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">

export function StatInput({
	value,
	onChange,
	label,
	description,
	min = 0,
	className = "",
	...props
}: StatInputProps) {
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
				className={`transition w-full h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 ${className}`}
				{...props}
			/>
			<div className="text-center flex items-center gap-1">
				<div className="text-sm font-semibold">{label}</div>
				{description && (
					<Tooltip content={description}>
						<Icon
							icon="mingcute:information-line"
							className="w-4 h-4 text-gray-400 hover:text-gray-100 transition"
							aria-hidden
						/>
					</Tooltip>
				)}
			</div>
		</div>
	)
}
