import type { ComponentProps } from "react"

type CheckboxProps = {
	label: string
} & ComponentProps<"input">

export function Checkbox({
	label,
	id,
	className = "",
	...props
}: CheckboxProps) {
	return (
		<div className="flex items-center gap-1.5">
			<input
				type="checkbox"
				id={id}
				className={`size-4 accent-pink-300 ${className}`}
				{...props}
			/>
			<label htmlFor={id} className="text-gray-300 text-sm font-semibold">
				{label}
			</label>
		</div>
	)
}
