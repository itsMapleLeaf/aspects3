import { Icon } from "~/components/ui/Icon.tsx"
import { SquareIconButton } from "~/components/ui/SquareIconButton.tsx"
import { Character } from "./character.ts"

interface CharacterListActionsProps {
	character: Character
	onEdit: (id: string) => void
	onClone: (character: Character) => void
	onDelete: (id: string) => void
}

export function CharacterListActions({
	character,
	onEdit,
	onClone,
	onDelete,
}: CharacterListActionsProps) {
	return (
		<div className="flex gap-1">
			<SquareIconButton
				icon={<Icon icon="mingcute:delete-2-fill" className="size-5" />}
				onClick={() => onDelete(character.id)}
				className="text-red-400 hover:text-red-300"
			>
				Delete
			</SquareIconButton>
			<SquareIconButton
				icon={<Icon icon="mingcute:copy-2-fill" className="size-5" />}
				onClick={() => onClone(character)}
			>
				Clone
			</SquareIconButton>
			<SquareIconButton
				icon={<Icon icon="mingcute:edit-2-fill" className="size-5" />}
				onClick={() => onEdit(character.id)}
			>
				Edit
			</SquareIconButton>
		</div>
	)
}
