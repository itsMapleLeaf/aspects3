import type { ComponentProps } from "react"

export function Callout(props: ComponentProps<"aside">) {
	return (
		<aside
			className="border-l-2 border-primary-300 pl-4 *:[p]:my-0 print:border-primary-800"
			{...props}
		/>
	)
}
