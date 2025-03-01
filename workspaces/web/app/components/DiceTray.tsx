import * as Ariakit from "@ariakit/react"
import { createEmitter } from "@workspace/shared/utils"
import { randomInt, range, sum, sumBy } from "es-toolkit"
import {
	createContext,
	Fragment,
	use,
	useEffect,
	useState,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"
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
			} else if (sideNumber >= 3) {
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
			} else if (sideNumber >= 3) {
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
	target?: number
}

interface DieRoll {
	id: string
	name: string
	sideIndex: number
}

type PrefillArgs = {
	dice: Array<{ name: string; count: number }>
	target: number
}

const DiceTrayContext = createContext({
	prefill: (args: PrefillArgs) => {},
})

export function DiceTray({ children }: { children: ReactNode }) {
	const [counts, setCounts] = useState<Map<Die["name"], number>>(new Map())
	const hasCounts = sum([...counts.values()]) > 0
	const [target, setTarget] = useState<number>()
	const [results, setResults] = useState<DiceRoll[]>([])
	const [open, setOpen] = useState(false)

	const [prefillEmitter] = useState(() => createEmitter<PrefillArgs>())

	useEffect(() => {
		return prefillEmitter.listen((args: PrefillArgs) => {
			const counts = new Map<Die["name"], number>()
			for (const die of args.dice) {
				counts.set(die.name, (counts.get(die.name) ?? 0) + die.count)
			}
			setCounts(counts)
			setTarget(args.target)
			setOpen(true)
		})
	}, [])

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
					target,
				},
			].slice(-5),
		)
		setCounts(new Map())
		setTarget(undefined)
	}

	const handleDisclosureClick = (event: React.MouseEvent) => {
		if (!open || !hasCounts) return
		roll()
		event.preventDefault()
	}

	return (
		<DiceTrayContext value={{ prefill: prefillEmitter.emit }}>
			{children}
			<Ariakit.PopoverProvider
				placement="bottom-end"
				open={open}
				setOpen={setOpen}
			>
				<div className="fixed right-4 bottom-4 print:hidden">
					<div className="flex items-start gap-2">
						<Tooltip content="Show dice tray">
							<Ariakit.PopoverDisclosure
								render={
									open ? (
										<div className="h-0" />
									) : (
										<Button shape="circle">
											<Icon icon="mingcute:box-3-fill" className="size-8" />
										</Button>
									)
								}
							/>
						</Tooltip>
					</div>
				</div>

				<Ariakit.Popover
					portal
					unmountOnHide
					fixed
					className="flex flex-col items-end gap-2 pr-1"
					backdrop={
						<div className="fixed inset-0 bg-black/25 opacity-0 backdrop-blur-xs transition-opacity data-enter:opacity-100" />
					}
				>
					{results.map((result) => (
						<DiceRollElement key={result.id} result={result} />
					))}

					<div className="flex flex-wrap items-center gap-2">
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

					<div className="flex justify-end gap-1.5">
						{target != null && (
							<Tooltip content="Target (Click to remove)">
								<Button
									size="sm"
									icon={<Icon icon="mingcute:target-fill" />}
									onClick={() => setTarget(undefined)}
								>
									{target}
								</Button>
							</Tooltip>
						)}
						{hasCounts && (
							<Tooltip content="Clear">
								<Button shape="circle" size="sm" onClick={clear}>
									<Icon icon="mingcute:close-fill" />
								</Button>
							</Tooltip>
						)}
						<Tooltip content={hasCounts ? "Roll" : "Hide dice tray"}>
							{hasCounts ? (
								<Button shape="circle" onClick={roll} autoFocus>
									<Icon icon="mingcute:check-fill" className="size-8" />
								</Button>
							) : (
								<Ariakit.PopoverDismiss
									render={<Button shape="circle" />}
									autoFocus
								>
									<Icon icon="mingcute:box-3-fill" className="size-8" />
								</Ariakit.PopoverDismiss>
							)}
						</Tooltip>
					</div>
				</Ariakit.Popover>
			</Ariakit.PopoverProvider>
		</DiceTrayContext>
	)
}

export function useDiceTray() {
	return use(DiceTrayContext)
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
					<div className="size-8 *:size-8">
						{count > 0 ? die.activeIcon : die.inactiveIcon}
					</div>
				</Button>
			</Tooltip>
			{count > 0 && (
				<div className="bg-primary-950 border-primary-500 absolute top-0 left-1/2 w-6 -translate-x-1/2 -translate-y-1/2 rounded-md border text-center text-sm">
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

	const total = sumBy(rolls, ({ roll }) => {
		const die = dice.find((it) => it.name === roll.name)
		const side = die?.sides[roll.sideIndex]
		return side?.value ?? 0
	})

	const isSuccess = props.result.target != null && total <= props.result.target
	const isFailure = props.result.target != null && total > props.result.target

	return (
		<div className="bg-primary-950/75 border-primary-500 flex flex-col rounded-md border px-2 py-2 backdrop-blur-md">
			{props.result.target && <small>Target: {props.result.target}</small>}
			<div className="flex items-center">
				<div className="flex max-w-[240px] flex-wrap">
					{rolls.map(({ roll, die, side }) => (
						<Fragment key={roll.id}>
							<Tooltip content={`${die.name}: ${side.name}`}>
								<div className="relative cursor-default">
									<div className="size-10 *:size-10">
										{die.resultIcon || die.activeIcon}
									</div>
									<div className="text-primary-900 absolute inset-0 flex items-center justify-center text-lg font-bold">
										{side?.symbol}
									</div>
								</div>
							</Tooltip>
						</Fragment>
					))}
				</div>
				<Icon icon="mingcute:pause-line" className="mx-1 rotate-90" />
				<span
					className={twMerge(
						"ml-1 flex items-center gap-1 text-2xl font-semibold tabular-nums",
						isSuccess && "text-green-300",
						isFailure && "text-red-300",
					)}
				>
					{isSuccess && (
						<Icon icon="mingcute:check-circle-fill" className="size-4" />
					)}
					{isFailure && (
						<Icon icon="mingcute:close-circle-fill" className="size-5" />
					)}
					{total}
				</span>
			</div>
		</div>
	)
}
