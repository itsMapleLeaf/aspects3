import { type ComponentProps } from "react"
import { type AspectName, aspects } from "~/data/aspects.ts"
import { type Character, getAspectValue } from "~/data/characters.ts"
import { parseNumber } from "~/utils.ts"
import { StatInput } from "./StatInput.tsx"

const ASPECT_COLORS: Record<AspectName, string> = {
	light: "border-amber-900 bg-amber-800/20 ring-amber-500/50",
	water: "border-blue-900 bg-blue-800/20 ring-blue-500/50",
	wind: "border-emerald-900 bg-emerald-800/20 ring-emerald-500/50",
	fire: "border-red-900 bg-red-800/20 ring-red-500/50",
	darkness: "border-purple-900 bg-purple-800/20 ring-purple-500/50",
}

type AspectInputProps = {
	aspect: AspectName
	character: Character
	onChange: (value: string) => void
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">

export function AspectInput({
	aspect,
	character,
	onChange,
	className = "",
}: AspectInputProps) {
	const aspectInfo = aspects[aspect]
	const baseValue = character.aspects[aspect] ?? "0"
	const totalValue = getAspectValue(aspect, character)
	const hasPoints = baseValue !== "0"

	return (
		<div className={hasPoints ? "" : "opacity-50"}>
			<StatInput
				value={baseValue}
				onChange={onChange}
				label={`${aspectInfo.name}${
					parseNumber(baseValue) > 0 ? ` (${totalValue})` : ""
				}`}
				description={aspectInfo.vibe}
				className={`${ASPECT_COLORS[aspect]} ${className}`}
			/>
		</div>
	)
}
