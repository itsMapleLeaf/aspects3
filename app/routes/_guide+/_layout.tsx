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

				prose-a:transition-colors
				prose-a:hover:text-primary-300
				prose-a:hover:no-underline

				prose-headings:font-light print:prose-headings:text-gray-900 print:prose-headings:font-semibold
				prose-headings:pt-20 prose-headings:-mt-16
				prose-headings:target:text-primary-300

				prose-headings:[&>a]:text-[0.8em]
				prose-headings:[&>a]:no-underline
				prose-headings:[&>a]:opacity-0
				prose-headings:[&>a]:transition
				prose-headings:hover:[&>a]:opacity-100

				prose-headings:[&>a>.icon-link]:after:content-['#']
				prose-headings:[&>a>.icon-link]:after:ml-2
				prose-headings:[&>a>.icon-link]:after:font-light
				prose-headings:[&>a>.icon-link]:after:transition
				prose-headings:[&>a>.icon-link]:after:opacity-75
				prose-headings:[&>a:hover>.icon-link]:after:opacity-100

				print:**:[.footnotes]:text-gray-900

				**:target:text-primary-300
				**:target:outline-offset-2
				**:target:outline
				prose-headings:target:outline-none
			"
		>
			<title>{documentTitle}</title>
			<h1>{pageTitle}</h1>
			<Outlet />
		</div>
	)
}
