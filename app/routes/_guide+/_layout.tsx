import { type } from "arktype"
import { Outlet, useMatches } from "react-router"
import { getDocumentTitle } from "../../meta.ts"

const RouteHandle = type({
	"title?": "string",
})

function getPageTitle(matches: ({ handle?: unknown } | undefined)[]) {
	const handle = matches
		.toReversed()
		.map((match) => match?.handle)
		.find(RouteHandle.allows)
	return handle?.title
}

export default function RouteComponent() {
	const pageTitle = getPageTitle(useMatches()) ?? ""
	const documentTitle = getDocumentTitle(pageTitle)

	return (
		<div
			className="
				prose pt-8 pb-12 max-w-[unset]!
				not-print:prose-invert
				text-lg text-gray-50 print:text-gray-950
				prose-headings:font-light print:prose-headings:text-gray-900 print:prose-headings:font-semibold
				print:**:[.footnotes]:text-gray-900
			"
		>
			<title>{documentTitle}</title>
			<h1>{pageTitle}</h1>
			<Outlet />
		</div>
	)
}
