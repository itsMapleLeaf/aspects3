import { useState, type ComponentProps } from "react"

export function SubmitInput({
	onSubmitValue,
	...props
}: ComponentProps<"input"> & {
	onSubmitValue: (value: string) => void
}) {
	const [tempValue, setTempValue] = useState<string>()
	return (
		<input
			{...props}
			value={tempValue ?? props.value}
			onFocus={(event) => {
				setTempValue(event.currentTarget.value)
			}}
			onBlur={() => {
				if (tempValue) {
					setTempValue(undefined)
					onSubmitValue(tempValue)
				}
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" && tempValue) {
					event.preventDefault()
					setTempValue(undefined)
					onSubmitValue(tempValue)
					event.currentTarget.blur()
				}
			}}
			onChange={(event) => {
				if (tempValue != null) {
					setTempValue(event.currentTarget.value)
				} else {
					props.onChange?.(event)
				}
			}}
		/>
	)
}
