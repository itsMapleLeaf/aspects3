import * as Ariakit from "@ariakit/react"
import { randomInt, range, sum, sumBy } from "es-toolkit"
import { Fragment, useRef, useState, type ReactNode } from "react"
import { Button } from "./ui/Button.tsx"
import { Icon } from "./ui/Icon.tsx"
import { Tooltip } from "./ui/Tooltip.tsx"

type Die = {
	name: string
	inactiveIcon: ReactNode
	activeIcon: ReactNode
	resultIcon?: ReactNode
	sides: DieSide[]
}

type DieSide = {
	name: string
	symbol: ReactNode
	value: number
}

const dice: Die[] = [
	{
		name: "skill",
		inactiveIcon: <Icon icon="mingcute:square-line" />,
		activeIcon: <Icon icon="mingcute:square-fill" />,
		sides: range(6).map((i) => ({
			name: `${i + 1}`,
			symbol: i + 1,
			value: i + 1,
		})),
	},
	{
		name: "aspect",
		inactiveIcon: <Icon icon="mingcute:pentagon-line" />,
		activeIcon: <Icon icon="mingcute:pentagon-fill" />,
		sides: range(12).map((i) => ({
			name: `${i + 1}`,
			symbol: i + 1,
			value: i + 1,
		})),
	},
	{
		name: "power",
		inactiveIcon: (
			<Icon icon="mingcute:star-line" className="text-purple-300" />
		),
		activeIcon: <Icon icon="mingcute:star-fill" className="text-purple-300" />,
		resultIcon: (
			<Icon icon="mingcute:square-fill" className="text-purple-300" />
		),
		sides: range(6).map((i) => {
			const sideNumber = i + 1

			let value
			if (sideNumber === 6) {
				value = 2
			} else if (sideNumber >= 4) {
				value = 1
			} else {
				value = 0
			}

			let symbol
			if (value === 2) {
				symbol = (
					<Icon className="size-4 text-purple-900" icon="mingcute:star-fill" />
				)
			} else if (value === 1) {
				symbol = (
					<Icon className="size-4 text-purple-900" icon="mingcute:star-line" />
				)
			}

			return {
				name: `${value === 0 ? "" : "-"}${value} (${sideNumber})`,
				symbol,
				value: -value,
			}
		}),
	},
	{
		name: "risk",
		inactiveIcon: (
			<Icon icon="mingcute:alert-diamond-line" className="text-red-300" />
		),
		activeIcon: (
			<Icon icon="mingcute:alert-diamond-fill" className="text-red-300" />
		),
		resultIcon: <Icon icon="mingcute:square-fill" className="text-red-300" />,
		sides: range(6).map((i) => {
			const sideNumber = i + 1

			let value
			if (sideNumber === 6) {
				value = 2
			} else if (sideNumber >= 4) {
				value = 1
			} else {
				value = 0
			}

			let symbol
			if (value === 2) {
				symbol = (
					<Icon
						className="size-6 text-red-900"
						icon="mingcute:close-circle-fill"
					/>
				)
			} else if (value === 1) {
				symbol = (
					<Icon className="size-4 text-red-900" icon="mingcute:close-fill" />
				)
			}

			return {
				name: `+${value} (${sideNumber})`,
				symbol,
				value,
			}
		}),
	},
]

interface DiceRoll {
	id: string
	rolled: DieRoll[]
}

interface DieRoll {
	id: string
	name: string
	sideIndex: number
}

export function DiceTray() {
	const [counts, setCounts] = useState<Map<Die["name"], number>>(new Map())
	const hasCounts = sum([...counts.values()]) > 0
	const [results, setResults] = useState<DiceRoll[]>([])
	const [open, setOpen] = useState(false)
	const controlsRef = useRef<HTMLDivElement>(null)

	const clear = () => {
		setCounts(new Map())
	}

	const roll = () => {
		const rolled: DieRoll[] = []

		for (const [name, count] of counts) {
			const die = dice.find((die) => die.name === name)
			if (!die) continue

			rolled.push(
				...range(count).map(() => ({
					id: crypto.randomUUID(),
					name,
					sideIndex: randomInt(die.sides.length),
				})),
			)
		}

		if (rolled.length === 0) {
			return
		}

		setResults((results) =>
			[
				...results,
				{
					id: crypto.randomUUID(),
					rolled,
				},
			].slice(-10),
		)
		setCounts(new Map())
	}

	const handleDisclosureClick = (event: React.MouseEvent) => {
		if (!hasCounts) return
		roll()
		event.preventDefault()
	}

	return (
		<Ariakit.PopoverProvider
			placement="bottom-end"
			open={open}
			setOpen={setOpen}
		>
			<div className="flex gap-2 items-start">
				{open && (
					<div className="contents" ref={controlsRef}>
						{hasCounts && (
							<Tooltip content="Clear">
								<Button shape="circle" size="sm" onClick={clear}>
									<Icon icon="mingcute:close-fill" />
								</Button>
							</Tooltip>
						)}
					</div>
				)}
				<Tooltip
					content={
						hasCounts ? "Roll" : open ? "Hide dice tray" : "Show dice tray"
					}
				>
					<Ariakit.PopoverDisclosure
						render={<Button shape="circle" />}
						onClick={handleDisclosureClick}
					>
						<Icon
							icon={hasCounts ? "mingcute:check-fill" : "mingcute:box-3-fill"}
							className="size-8"
						/>
					</Ariakit.PopoverDisclosure>
				</Tooltip>
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
					<DiceRollElement key={result.id} result={result} />
				))}

				<div className="flex items-center gap-2 flex-wrap">
					{dice.map((die) => {
						const count = counts.get(die.name) ?? 0
						return (
							<DiceButton
								key={die.name}
								count={count}
								die={die}
								onIncrement={() => {
									setCounts((counts) => {
										const next = new Map(counts)
										next.set(die.name, count + 1)
										return next
									})
								}}
								onDecrement={() => {
									setCounts((counts) => {
										const next = new Map(counts)
										next.set(die.name, Math.max(0, count - 1))
										return next
									})
								}}
							/>
						)
					})}
				</div>
			</Ariakit.Popover>
		</Ariakit.PopoverProvider>
	)
}

function DiceButton({
	die,
	count,
	onIncrement,
	onDecrement,
}: {
	die: Die
	count: number
	onIncrement: () => void
	onDecrement: () => void
}) {
	return (
		<div className="relative">
			<Tooltip
				content={`${die.name} (d${die.sides.length})`}
				placement="bottom"
			>
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
						{count > 0 ? die.activeIcon : die.inactiveIcon}
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

function DiceRollElement(props: { result: DiceRoll }) {
	const rolls = props.result.rolled
		.flatMap((roll) => {
			const dieIndex = dice.findIndex((it) => it.name === roll.name)
			const die = dice[dieIndex]
			const side = die?.sides[roll.sideIndex]
			return side ? { roll, die, side, dieIndex } : []
		})
		.sort((a, b) => Math.abs(b.side.value) - Math.abs(a.side.value))
		.sort((a, b) => a.dieIndex - b.dieIndex)

	return (
		<div className="bg-primary-950/50 border-primary-500 border rounded-md px-2 py-2 flex items-center">
			{rolls.map(({ roll, die, side }) => (
				<Fragment key={roll.id}>
					<Tooltip content={`${die.name}: ${side.name}`}>
						<div className="relative cursor-default">
							<div className="*:size-10 size-10">
								{die.resultIcon || die.activeIcon}
							</div>
							<div className="absolute inset-0 flex items-center justify-center text-primary-900 font-bold text-lg">
								{side?.symbol}
							</div>
						</div>
					</Tooltip>
				</Fragment>
			))}
			<Icon icon="mingcute:pause-line" className="rotate-90" />
			<span className="text-2xl ml-1 tabular-nums font-semibold">
				{sumBy(rolls, ({ roll }) => {
					const die = dice.find((it) => it.name === roll.name)
					const side = die?.sides[roll.sideIndex]
					return side?.value ?? 0
				})}
			</span>
		</div>
	)
}
