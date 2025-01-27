import { type ComponentProps } from "react"
import { parseNumber } from "~/utils.ts"

type NumberInputProps = {
	value: string
	onChange: (value: string) => void
	min?: number
	max?: number
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">

export function NumberInput({
	value,
	onChange,
	min = 0,
	max = 6,
	className = "",
	...props
}: NumberInputProps) {
	function updateValue(delta: number) {
		const currentValue = parseNumber(value, min, max)
		const newValue = Math.max(min, Math.min(max, currentValue + delta))
		if (newValue !== currentValue) {
			onChange(newValue.toString())
		}
	}

	function inputRef(element: HTMLInputElement | null) {
		if (!element) return

		const controller = new AbortController()
		element.addEventListener(
			"wheel",
			(event) => {
				if (!element.matches(":focus")) return
				event.preventDefault()
				updateValue(event.deltaY < 0 ? 1 : -1)
			},
			{ signal: controller.signal, passive: false },
		)

		return () => controller.abort()
	}

	return (
		<input
			ref={inputRef}
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
			onKeyDown={(event) => {
				if (event.key === "ArrowUp") {
					event.preventDefault()
					updateValue(1)
				} else if (event.key === "ArrowDown") {
					event.preventDefault()
					updateValue(-1)
				}
			}}
			className={className}
			{...props}
		/>
	)
}
