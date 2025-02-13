import type { ComponentProps } from "react"

export function Callout(props: ComponentProps<"aside">) {
	return (
		<aside
			className="border-primary-300 print:border-primary-800 border-l-2 pl-4 *:[p]:my-0"
			{...props}
		/>
	)
}
