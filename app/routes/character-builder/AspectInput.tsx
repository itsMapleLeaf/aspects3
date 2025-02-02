import { aspects, type AspectName } from "~/data/aspects.ts"
import type { Character } from "~/data/characters.ts"
import { getAttributeValue } from "~/data/characters.ts"
import { StatInput } from "./StatInput.tsx"

const aspectColors = {
	light: "border-amber-900 bg-amber-800/20 ring-amber-500/50",
	water: "border-blue-900 bg-blue-800/20 ring-blue-500/50",
	wind: "border-emerald-900 bg-emerald-800/20 ring-emerald-500/50",
	fire: "border-red-900 bg-red-800/20 ring-red-500/50",
	darkness: "border-purple-900 bg-purple-800/20 ring-purple-500/50",
} as const

type AspectInputProps = {
	aspect: AspectName
	character: Character
	onChange: (value: string) => void
}

export function AspectInput({ aspect, character, onChange }: AspectInputProps) {
	const aspectInfo = aspects[aspect as keyof typeof aspects]
	const attributeValue = getAttributeValue(aspectInfo.attribute, character)
	const aspectValue = Number(character.aspects[aspect] ?? "0")
	const total = aspectValue + attributeValue
	const color = aspectColors[aspect as keyof typeof aspectColors]

	return (
		<div className={aspectValue === 0 ? "opacity-50" : undefined}>
			<StatInput
				value={character.aspects[aspect] ?? "0"}
				onChange={onChange}
				label={`${aspectInfo.name} (${total})`}
				description={aspectInfo.description}
				min={0}
				className={color}
			/>
		</div>
	)
}
