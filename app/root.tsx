import { ConvexAuthProvider } from "@convex-dev/auth/react"
import font from "@fontsource-variable/quicksand?url"
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router"
import { Navigation } from "~/components/Navigation"
import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import { DiceTray } from "./components/DiceTray.tsx"
import { convexClient } from "./lib/convex.ts"
import { getPageMeta } from "./meta.ts"

export const meta: Route.MetaFunction = () => getPageMeta()

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{ rel: "stylesheet", href: font },
	{ rel: "stylesheet", href: stylesheet },
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="print:bg-gray-100">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{import.meta.env.PROD && (
					<script
						defer
						src="/data.js"
						data-website-id="9df97a88-b10c-4b2a-9c6f-19016b520a0a"
					/>
				)}
				<Meta />
				<Links />
			</head>
			<body>
				<Navigation />
				<DiceTray>
					<div className="page-container">{children}</div>
				</DiceTray>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function Root() {
	return (
		<ConvexAuthProvider client={convexClient}>
			<Outlet />
		</ConvexAuthProvider>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!"
	let details = "An unexpected error occurred."
	let stack: string | undefined

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error"
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message
		stack = error.stack
	}

	return (
		<main className="pt-8 mx-auto">
			<h1 className="font-light text-4xl">{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	)
}
