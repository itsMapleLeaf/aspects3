import { getAspect, type Aspect } from "./aspects.ts"
import { getAttribute, type Attribute } from "./attributes.ts"

export type Trait = {
	name: string
	readonly aspect: Aspect
	readonly attributes: Attribute[]
}

const traitRecord = {
	"Antennas": {
		name: "Antennas",
		get aspect() {
			return getAspect("darkness")
		},
		get attributes() {
			return [getAttribute("intellect"), getAttribute("sense")]
		},
	},
	"Bioluminescence": {
		name: "Bioluminescence",
		get aspect() {
			return getAspect("fire")
		},
		get attributes() {
			return [getAttribute("intellect"), getAttribute("wit")]
		},
	},
	"Claws": {
		name: "Claws",
		get aspect() {
			return getAspect("darkness")
		},
		get attributes() {
			return [getAttribute("agility"), getAttribute("strength")]
		},
	},
	"Fins": {
		name: "Fins",
		get aspect() {
			return getAspect("light")
		},
		get attributes() {
			return [getAttribute("agility"), getAttribute("sense")]
		},
	},
	"Furred ears": {
		name: "Furred ears",
		get aspect() {
			return getAspect("wind")
		},
		get attributes() {
			return [getAttribute("sense"), getAttribute("wit")]
		},
	},
	"Horns / Antlers": {
		name: "Horns / Antlers",
		get aspect() {
			return getAspect("water")
		},
		get attributes() {
			return [getAttribute("intellect"), getAttribute("strength")]
		},
	},
	"Long tail": {
		name: "Long tail",
		get aspect() {
			return getAspect("water")
		},
		get attributes() {
			return [getAttribute("agility"), getAttribute("wit")]
		},
	},
	"Scales": {
		name: "Scales",
		get aspect() {
			return getAspect("light")
		},
		get attributes() {
			return [getAttribute("sense"), getAttribute("strength")]
		},
	},
	"Sharp teeth / Fangs": {
		name: "Sharp teeth / Fangs",
		get aspect() {
			return getAspect("wind")
		},
		get attributes() {
			return [getAttribute("strength"), getAttribute("wit")]
		},
	},
	"Wings": {
		name: "Wings",
		get aspect() {
			return getAspect("fire")
		},
		get attributes() {
			return [getAttribute("agility"), getAttribute("intellect")]
		},
	},
} satisfies Record<string, Trait>

const traitMap = new Map(Object.entries(traitRecord))

export function listTraits(): Trait[] {
	return [...traitMap.values()]
}

export function findTrait(name: string) {
	return traitMap.get(name)
}
