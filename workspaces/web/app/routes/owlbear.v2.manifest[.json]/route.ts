export function loader() {
	return Response.json(
		{
			name: "Aspects of Nature (beta)" + (import.meta.env.DEV ? " [dev]" : ""),
			version: "0.0.1",
			manifest_version: 1,
			action: {
				title:
					"Aspects of Nature (beta)" + (import.meta.env.DEV ? " [dev]" : ""),
				icon: "/favicon.svg",
				popover: "/owlbear/v2/view",
				height: 900,
				width: 600,
			},
		},
		{
			headers: {
				"Access-Control-Allow-Origin": "https://www.owlbear.rodeo",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			},
		},
	)
}
