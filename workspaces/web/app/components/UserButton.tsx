import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Icon } from "./ui/Icon.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./ui/Menu.tsx"

export function UserButton() {
	const me = useQuery(api.public.auth.me)
	const { signOut } = useAuthActions()
	return me == null ? null : (
		<Menu>
			<MenuButton className="opacity-75 transition-opacity hover:opacity-100">
				<img src={me.image} alt="" className="size-8 rounded-full" />
				<span className="sr-only">Account actions</span>
			</MenuButton>
			<MenuPanel>
				<p className="flex flex-col px-3 py-1.5">
					<small className="-mb-1">Signed in as</small>
					<strong className="font-medium">{me.name}</strong>
				</p>
				<div className="bg-primary-950 h-px w-full" />
				<MenuItem onClick={signOut}>
					<Icon icon="mingcute:exit-door-fill" aria-hidden />
					Sign out
				</MenuItem>
			</MenuPanel>
		</Menu>
	)
}
