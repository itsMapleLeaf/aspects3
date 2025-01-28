import type { ComponentProps } from "react"
import { useId } from "react"

type CheckboxProps = {
	label: string
} & Omit<ComponentProps<"input">, "type">

export function Checkbox({
	label,
	id: providedId,
	className = "",
	...props
}: CheckboxProps) {
	const internalId = useId()
	const id = providedId ?? internalId

	return (
		<div className={`flex items-center gap-1.5  ${className}`}>
			<input
				type="checkbox"
				id={id}
				className={`size-4 accent-pink-300`}
				{...props}
			/>
			<label htmlFor={id} className="text-gray-300 text-sm font-semibold">
				{label}
			</label>
		</div>
	)
}
