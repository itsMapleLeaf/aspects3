export function loader() {
	return Response.json(
		{
			name: "Aspects of Nature" + (import.meta.env.DEV ? " [dev]" : ""),
			version: "0.0.1",
			manifest_version: 1,
			action: {
				title: "Aspects of Nature" + (import.meta.env.DEV ? " [dev]" : ""),
				icon: "/favicon.svg",
				popover: "/character-builder",
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
