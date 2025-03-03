export function loader() {
	return Response.json(
		{
			name: "Aspects of Nature" + (import.meta.env.DEV ? " [dev]" : ""),
			version: "0.0.1",
			manifest_version: 1,
			action: {
				title: "Aspects of Nature" + (import.meta.env.DEV ? " [dev]" : ""),
				icon: "/favicon.svg",
				popover: "/owlbear/view",
				height: 900,
				width: 500,
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
