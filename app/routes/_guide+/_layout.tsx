import { Outlet } from "react-router"

export default function RouteComponent() {
	return (
		<div className="prose prose-invert max-w-[unset]! pt-8 pb-12 text-gray-50 text-lg prose-headings:font-light">
			<Outlet />
		</div>
	)
}
