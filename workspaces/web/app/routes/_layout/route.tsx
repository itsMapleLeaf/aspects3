import { Outlet } from "react-router"
import { DiceTray } from "~/components/DiceTray.tsx"
import { Navigation } from "~/components/Navigation.tsx"

export default function LayoutRoute() {
	return (
		<DiceTray>
			<div className="isolate">
				<Navigation className="sticky top-0 z-10 shadow-lg" />
				<div className="page-container">
					<Outlet />
				</div>
			</div>
		</DiceTray>
	)
}
