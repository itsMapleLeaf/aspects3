import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Aspects of Nature" },
		{ name: "description", content: "A story & roleplay focused TTRPG system" },
	]
}

export default function Home() {
	return (
		<main className="max-w-page-body mx-auto p-6 space-y-8">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold">Aspects of Nature</h1>
				<p className="text-xl text-gray-600 dark:text-gray-400">
					A story & roleplay focused TTRPG system where cute anime characters
					with animal ears bend the elements
				</p>
			</div>

			<Card title="Features">
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
					<li>Rules lite system with low math</li>
					<li>Flexible character creation</li>
					<li>Element bending abilities</li>
					<li>Modern day contemporary fantasy setting</li>
				</ul>
			</Card>

			<div className="flex justify-center">
				<Button as="link" to="/character-sheet">
					Create Your Character
				</Button>
			</div>
		</main>
	)
}
