import { z } from "zod"

// this is temporary and only exists because arktype errors in convex
export const CharacterSchema = z.object({
	name: z.string().max(256).default(""),
	details: z.string().default(""),
	attributes: z.record(z.string()).default({}),
	hits: z.string().default(""),
	fatigue: z.string().default(""),
	comeback: z.string().default(""),
	traits: z.array(z.string()).default([]),
	proficientSkills: z.array(z.string()).default([]),
	aspects: z.record(z.string()).default({}),
	imageUrl: z.string().default(""),
})

export type Character = z.infer<typeof CharacterSchema>
