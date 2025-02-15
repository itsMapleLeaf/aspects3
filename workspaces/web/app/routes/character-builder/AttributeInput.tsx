import { type AttributeName, attributes } from "@workspace/shared/attributes"
import { type ComponentProps } from "react"
import { StatInput } from "./StatInput.tsx"

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
}: AttributeInputProps) {
	return (
		<StatInput
			value={value}
			onChange={onChange}
			label={label}
			description={attributes[attribute].description}
			min={1}
			className={`${ATTRIBUTE_COLORS[attribute]} ${className}`}
		/>
	)
}
