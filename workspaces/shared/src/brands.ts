export type Branded<T, Brand> = T & { "~brand": Brand }

export const branded = <T, Brand>(
	transform: <const Input extends T>(input: Input) => Input = (input) => input,
) => {
	const createBrand = <const Input extends T>(input: Input) =>
		transform(input) as Branded<Input, Brand>

	return createBrand as typeof createBrand & {
		type: Branded<T, Brand>
	}
}
