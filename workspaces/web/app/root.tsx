import { ConvexAuthProvider } from "@convex-dev/auth/react"
import font from "@fontsource-variable/quicksand?url"
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache"
import { ConvexReactClient } from "convex/react"
import { useEffect, useState, type ReactNode } from "react"
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router"
import { Navigation } from "~/components/Navigation"
import type { Route } from "./+types/root.ts"
import { DiceTray } from "./components/DiceTray.tsx"
import { ToastProvider, useToastContext } from "./components/toasts.tsx"
import { getPageMeta } from "./meta.ts"
import styles from "./styles/index.css?url"

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
	{ rel: "stylesheet", href: styles },
	{
		rel: "icon",
		href: "/favicon.svg",
	},
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
				<ConvexProvider>
					<ToastProvider className="absolute inset-y-0 left-0">
						<DiceTray>
							<div className="isolate">
								<Navigation className="sticky top-0 z-10 shadow-lg" />
								<div className="page-container">{children}</div>
							</div>
						</DiceTray>
					</ToastProvider>
				</ConvexProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function Root() {
	const { showToast } = useToastContext()

	useEffect(() => {
		const controller = new AbortController()

		window.addEventListener(
			"unhandledrejection",
			(event) => {
				console.error("Unhandled rejection:", event.reason)
				if (import.meta.env.DEV) {
					showToast({
						type: "error",
						content: "An error occurred. Check the console for details.",
					})
				} else {
					showToast({
						type: "error",
						content: "Oops, something went wrong.",
					})
				}
			},
			{ signal: controller.signal },
		)

		return () => controller.abort()
	}, [showToast])

	return <Outlet />
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
		<main className="mx-auto pt-8">
			<h1 className="text-4xl font-light">{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	)
}

function ConvexProvider({ children }: { children: ReactNode }) {
	const [convex] = useState(
		() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL),
	)
	return (
		<ConvexAuthProvider client={convex}>
			<ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
		</ConvexAuthProvider>
	)
}
