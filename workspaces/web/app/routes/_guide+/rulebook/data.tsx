import { aspects, listAspects, type AspectName } from "~/data/aspects.ts"
import {
	attributes,
	listAttributes,
	type AttributeName,
} from "~/data/attributes.ts"
import { traits } from "~/data/traits.ts"

export function AttributeList() {
	return (
		<ul>
			{listAttributes().map((attribute) => (
				<li key={attribute.id}>
					<strong>{attribute.name}</strong> - <em>{attribute.description}</em>
				</li>
			))}
		</ul>
	)
}

export function AspectList() {
	return (
		<ul>
			{listAspects().map((aspect) => (
				<li key={aspect.id}>
					<strong>{aspect.name}</strong> ({attributes[aspect.attribute].name}) -{" "}
					<em>{aspect.description}</em>
				</li>
			))}
		</ul>
	)
}

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

export function SkillList() {
	return (
		<>
			{(
				Object.entries(attributes) as [
					AttributeName,
					(typeof attributes)[AttributeName],
				][]
			).map(([id, attribute]) => (
				<section key={id}>
					<h4>{attribute.name}</h4>
					<ul>
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

export function AspectSkillList() {
	return (
		Object.entries(aspects) as [AspectName, (typeof aspects)[AspectName]][]
	).map(([id, aspect]) => (
		<section key={id}>
			<h4>{aspect.name}</h4>
			<ul>
				{aspect.actions.map((action) => (
					<li key={action.name}>
						<strong>{action.name}</strong> - {action.description}
						{action.failure && <span>; on failure, {action.failure}</span>}
					</li>
				))}
			</ul>
		</section>
	))
}
