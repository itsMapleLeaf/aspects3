import { useId, type ComponentProps } from "react"
import { IconTooltip } from "~/components/ui/IconTooltip.tsx"
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
	const id = useId()
	return (
		<div className="flex flex-col items-center gap-1">
			<NumberInput
				value={value}
				onChange={onChange}
				min={min}
				className={`transition w-full h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 ${className}`}
				id={id}
			/>
			<div className="text-center flex items-center gap-1">
				<label htmlFor={id} className="text-sm font-semibold">
					{label}
				</label>
				{description && (
					<IconTooltip content={description} className="size-4" />
				)}
			</div>
		</div>
	)
}
