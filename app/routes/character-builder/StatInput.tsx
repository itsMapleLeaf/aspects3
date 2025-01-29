import { Icon } from "@iconify/react"
import { type ComponentProps } from "react"
import { Tooltip } from "~/components/Tooltip.tsx"
import { NumberInput } from "./NumberInput.tsx"

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
}: StatInputProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<NumberInput
				value={value}
				onChange={onChange}
				min={min}
				className={`transition w-full h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 ${className}`}
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
