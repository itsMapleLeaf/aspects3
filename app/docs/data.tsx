import { aspects, type AspectName } from "~/data/aspects.ts"
import { attributes, type AttributeName } from "~/data/attributes.ts"
import { traits } from "~/data/traits.ts"

export function TraitList() {
	return (
		<>
			{[...traits]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((trait) => (
					<section key={trait.name}>
						<h3>{trait.name}</h3>
						<ul>
							<li>
								attributes:{" "}
								{trait.attributes.map((a) => a.attribute).join(", ")}
							</li>
							<li>aspect: {trait.aspect}</li>
						</ul>
					</section>
				))}
		</>
	)
}

export function AttributeList() {
	return (
		<>
			{(
				Object.entries(attributes) as [
					AttributeName,
					(typeof attributes)[AttributeName],
				][]
			).map(([id, attribute]) => (
				<section key={id} className="mb-4">
					<h3 className="font-medium mb-1">{attribute.name}</h3>
					<p className="mb-2">{attribute.description}</p>
					<ul className="list-disc list-inside">
						{attribute.skills.map((skill) => (
							<li key={skill.name}>
								<strong>{skill.name}</strong> - {skill.description}
							</li>
						))}
					</ul>
				</section>
			))}
		</>
	)
}

export function AspectList() {
	return (
		<>
			{(
				Object.entries(aspects) as [AspectName, (typeof aspects)[AspectName]][]
			).map(([id, aspect]) => (
				<section key={id} className="mb-4">
					<h3 className="font-medium mb-1">{aspect.name}</h3>
					<p className="mb-2">
						vibe: {aspect.description}
						<br />
						attribute: {aspect.attribute}
					</p>
					<ul className="list-disc list-inside">
						{aspect.actions.map((action) => (
							<li>
								<strong>{action.name}</strong> - {action.description}
								{action.failure && <span>; on failure, {action.failure}</span>}
							</li>
						))}
					</ul>
				</section>
			))}
		</>
	)
}
