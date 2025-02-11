import { Outlet } from "react-router"

export default function RouteComponent() {
	return (
		<div
			className="
				prose pt-8 pb-12 max-w-[unset]!
				not-print:prose-invert
				text-lg text-gray-50 print:text-gray-950
				prose-headings:font-light print:prose-headings:text-gray-900 print:prose-headings:font-semibold
				prose-h1:hidden print:prose-h1:block
				print:**:[.footnotes]:text-gray-900
			"
		>
			<Outlet />
		</div>
	)
}
