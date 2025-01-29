import * as Ariakit from "@ariakit/react"
import { Icon } from "@iconify/react/dist/iconify.js"
import { randomInt, range } from "es-toolkit"
import { useRef, useState } from "react"
import { Button } from "./ui/Button.tsx"
import { Tooltip } from "./ui/Tooltip.tsx"

const diceTypes = [
	{
		sides: 4,
		inactiveIcon: <Icon icon="mingcute:triangle-line" />,
		activeIcon: <Icon icon="mingcute:triangle-fill" />,
	},
	{
		sides: 6,
		inactiveIcon: <Icon icon="mingcute:square-line" />,
		activeIcon: <Icon icon="mingcute:square-fill" />,
	},
	{
		sides: 8,
		inactiveIcon: <Icon icon="mingcute:diamond-square-line" />,
		activeIcon: <Icon icon="mingcute:diamond-square-fill" />,
	},
	{
		sides: 10,
		inactiveIcon: <Icon icon="mingcute:diamond-line" className="rotate-90" />,
		activeIcon: <Icon icon="mingcute:diamond-fill" className="rotate-90" />,
	},
	{
		sides: 12,
		inactiveIcon: <Icon icon="mingcute:pentagon-line" />,
		activeIcon: <Icon icon="mingcute:pentagon-fill" />,
	},
	{
		sides: 20,
		inactiveIcon: <Icon icon="mingcute:hexagon-line" />,
		activeIcon: <Icon icon="mingcute:hexagon-fill" />,
	},
	{
		sides: 100,
		inactiveIcon: <Icon icon="mingcute:octagon-line" />,
		activeIcon: <Icon icon="mingcute:octagon-fill" />,
	},
]

interface RollResult {
	id: string
	dice: RollResultDie[]
}

interface RollResultDie {
	id: string
	sides: number
	value: number
}

export function DiceTray() {
	const [counts, setCounts] = useState<Map<number, number>>(new Map())
	const [results, setResults] = useState<RollResult[]>([])
	const [open, setOpen] = useState(false)
	const controlsRef = useRef<HTMLDivElement>(null)

	const clear = () => {
		setCounts(new Map())
	}

	const roll = () => {
		const rolled: RollResultDie[] = []

		for (const [sides, count] of counts) {
			for (const i of range(count)) {
				rolled.push({
					id: crypto.randomUUID(),
					sides: sides,
					value: randomInt(sides) + 1,
				})
			}
		}

		if (rolled.length === 0) {
			return
		}

		setResults((results) =>
			[
				...results,
				{
					id: crypto.randomUUID(),
					dice: rolled,
				},
			].slice(-10),
		)
		setCounts(new Map())
	}

	return (
		<div className="fixed right-4 bottom-4">
			<Ariakit.PopoverProvider
				placement="bottom-end"
				open={open}
				setOpen={setOpen}
			>
				<div className="flex gap-2 items-start">
					{open && (
						<div className="contents" ref={controlsRef}>
							<Tooltip content="Clear">
								<Button shape="circle" size="sm" onClick={clear}>
									<Icon icon="mingcute:close-fill" />
								</Button>
							</Tooltip>
							<Tooltip content="Submit">
								<Button shape="circle" size="sm" onClick={roll}>
									<Icon icon="mingcute:check-fill" />
								</Button>
							</Tooltip>
						</div>
					)}
					<Ariakit.PopoverDisclosure render={<Button shape="circle" />}>
						<Icon icon="fa6-solid:dice-d20" className="size-8" />
					</Ariakit.PopoverDisclosure>
				</div>
				<Ariakit.Popover
					gutter={12}
					portal
					unmountOnHide
					fixed
					getPersistentElements={() =>
						controlsRef.current ? [controlsRef.current] : []
					}
					className="flex flex-col items-end gap-2"
				>
					{results.map((result) => (
						<div
							key={result.id}
							className="bg-primary-950/50 border-primary-500 border rounded-md px-2 py-2 flex"
						>
							{result.dice
								.flatMap((die) => {
									const type = diceTypes.find((it) => it.sides === die.sides)
									return type ? { ...type, ...die } : []
								})
								.map((die) => (
									<div key={die.id} className="relative">
										<div className="*:size-10 size-10">{die.activeIcon}</div>
										<div
											className={`absolute inset-0 flex items-center justify-center text-primary-900 font-bold text-lg ${
												die.sides === 4 ? "translate-y-[2px]" : ""
											}`}
										>
											{die.value}
										</div>
									</div>
								))}
						</div>
					))}

					<div className="flex items-center gap-2 flex-wrap">
						{diceTypes
							.map((dice) => ({
								dice,
								count: counts.get(dice.sides) ?? 0,
							}))
							.map(({ dice, count }) => (
								<DiceButton
									key={dice.sides}
									count={count}
									dice={dice}
									onIncrement={() => {
										setCounts((counts) => {
											const next = new Map(counts)
											next.set(dice.sides, (counts.get(dice.sides) ?? 0) + 1)
											return next
										})
									}}
									onDecrement={() => {
										setCounts((counts) => {
											const next = new Map(counts)
											next.set(
												dice.sides,
												Math.max(0, (counts.get(dice.sides) ?? 0) - 1),
											)
											return next
										})
									}}
								/>
							))}
					</div>
				</Ariakit.Popover>
			</Ariakit.PopoverProvider>
		</div>
	)
}

function DiceButton({
	dice,
	count,
	onIncrement,
	onDecrement,
}: {
	dice: (typeof diceTypes)[number]
	count: number
	onIncrement: () => void
	onDecrement: () => void
}) {
	return (
		<div className="relative">
			<Tooltip content={`d${dice.sides}`} placement="bottom">
				<Button
					shape="circle"
					size="sm"
					onClick={() => {
						onIncrement()
					}}
					onContextMenu={(event) => {
						event.preventDefault()
						onDecrement()
					}}
				>
					<div className="*:size-8 size-8">
						{count > 0 ? dice.activeIcon : dice.inactiveIcon}
					</div>
				</Button>
			</Tooltip>
			{count > 0 && (
				<div className="absolute top-0 left-1/2 bg-primary-950 border-primary-500 border w-6 rounded-md text-center text-sm -translate-y-1/2 -translate-x-1/2">
					{count}
				</div>
			)}
		</div>
	)
}
