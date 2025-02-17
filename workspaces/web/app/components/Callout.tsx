import type { ComponentProps } from "react"

export function Callout(props: ComponentProps<"aside">) {
	return (
		<aside
			className="border-primary-300 print:border-primary-800 my-6 space-y-3! border-l-2 py-1 pl-4 [&_p]:m-0"
			{...props}
		/>
	)
}
