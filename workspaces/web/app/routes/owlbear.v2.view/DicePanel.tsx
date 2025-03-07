import * as Ariakit from "@ariakit/react"
import OBR, { type Metadata as RoomMetadata } from "@owlbear-rodeo/sdk"
import { ArkErrors, type } from "arktype"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Icon } from "~/components/ui/Icon.tsx"
import { owlbearExtensionNamespace } from "./extension.ts"
import { broadcastNotification } from "./notifications.ts"

type DiceRoll = typeof DiceRoll.inferOut
const DiceRoll = type({
	id: "string",
	label: "string",
	diceCount: "number",
	results: "number[]",
	timestamp: "number",
})

const metadataDiceRollsKey = `${owlbearExtensionNamespace}/diceRolls`

type DiceRollsRoomMetadata = typeof DiceRollsRoomMetadata.inferOut
const DiceRollsRoomMetadata = type({
	[metadataDiceRollsKey]: DiceRoll.array().default(() => []),
})

function calculateSuccesses(value: number): number {
	if (value >= 10 && value <= 11) return 1
	if (value === 12) return 2
	return 0
}

function getDieIcon(value: number): React.ReactNode {
	const success = calculateSuccesses(value)

	if (success === 2) {
		return (
			<div className="flex items-center justify-center text-green-700">
				<Icon icon="mingcute:pentagon-fill" className="size-10" />
				<span className="absolute font-semibold text-white">{value}</span>
			</div>
		)
	} else if (success === 1) {
		return (
			<div className="flex items-center justify-center text-green-700">
				<Icon icon="mingcute:pentagon-line" className="size-10" />
				<span className="absolute font-semibold">{value}</span>
			</div>
		)
	} else {
		return (
			<div className="flex items-center justify-center text-gray-400">
				<Icon icon="mingcute:pentagon-line" className="size-10" />
				<span className="absolute font-semibold">{value}</span>
			</div>
		)
	}
}

interface DicePanelProps {
	isOpen: boolean
	onClose: () => void
	diceCount: number
	setDiceCount: (count: number) => void
	label: string
	setLabel: (label: string) => void
}

export function DicePanel({
	isOpen,
	onClose,
	diceCount,
	setDiceCount,
	label,
	setLabel,
}: DicePanelProps) {
	const [diceRolls, setDiceRolls] = useState<DiceRoll[]>([])

	useEffect(() => {
		async function loadDiceRolls(metadata: RoomMetadata) {
			const parsed = DiceRollsRoomMetadata(metadata)
			if (parsed instanceof ArkErrors) {
				console.error(
					"failed to parse dice rolls from room metadata:",
					parsed.summary,
				)
				return
			}
			setDiceRolls(parsed[metadataDiceRollsKey])
		}

		OBR.room.getMetadata().then(loadDiceRolls)
		return OBR.room.onMetadataChange(loadDiceRolls)
	}, [])

	async function saveDiceRolls(rolls: DiceRoll[]) {
		try {
			const recentRolls = [...rolls]
				.sort((a, b) => b.timestamp - a.timestamp)
				.slice(0, 20)

			const metadata: DiceRollsRoomMetadata = {
				[metadataDiceRollsKey]: recentRolls,
			}
			await OBR.room.setMetadata(metadata)
		} catch (error) {
			console.error(error)
		}
	}

	function rollDice() {
		if (diceCount < 1) return

		const results = Array.from(
			{ length: diceCount },
			() => Math.floor(Math.random() * 12) + 1,
		)

		saveDiceRolls([
			{
				id: crypto.randomUUID(),
				label,
				diceCount,
				results,
				timestamp: Date.now(),
			},
			...diceRolls,
		])

		setDiceCount(1)
		setLabel("")
		onClose()

		const successes = countSuccesses(results)
		const isSuccess = successes > 0
		const successText = isSuccess
			? `${successes} ${successes === 1 ? "success" : "successes"}`
			: "failed"

		broadcastNotification({
			text: `${label || "Dice Roll"} — ${successText}`,
			variant: isSuccess ? "SUCCESS" : "DEFAULT",
		})
	}

	function countSuccesses(results: number[]): number {
		return results.reduce((sum, value) => sum + calculateSuccesses(value), 0)
	}

	return (
		<Ariakit.DialogProvider>
			<Ariakit.Dialog
				open={isOpen}
				onClose={onClose}
				portal
				unmountOnHide
				backdrop={
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
				}
				className="fixed top-1/2 left-1/2 flex h-dvh max-h-[720px] w-dvw max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 shadow-lg"
			>
				<header className="flex items-center justify-between">
					<Ariakit.DialogHeading className="heading-2xl">
						Dice Roller
					</Ariakit.DialogHeading>
					<Ariakit.DialogDismiss className="hover:text-primary-300 rounded p-1 transition">
						<Icon icon="mingcute:close-fill" className="size-6" />
					</Ariakit.DialogDismiss>
				</header>

				<form className="flex flex-col gap-2" action={rollDice}>
					<div className="flex gap-2">
						<div className="flex-1">
							<label className="mb-1 block text-sm font-medium">Label</label>
							<input
								type="text"
								value={label}
								onChange={(e) => setLabel(e.target.value)}
								className="w-full min-w-0 rounded border border-gray-800 bg-gray-900 px-3 py-2 transition focus:border-gray-700 focus:outline-none"
								placeholder="Strength Check, Attack Roll, etc."
							/>
						</div>
						<div className="w-24">
							<label className="mb-1 block text-sm font-medium">
								# of dice
							</label>
							<input
								type="number"
								min="1"
								value={diceCount}
								onChange={(e) =>
									setDiceCount(Math.max(1, parseInt(e.target.value) || 1))
								}
								className="w-full min-w-0 rounded border border-gray-800 bg-gray-900 px-3 py-2 transition focus:border-gray-700 focus:outline-none"
							/>
						</div>
					</div>
					<button
						type="submit"
						className="hover:text-primary-300 flex items-center justify-center gap-2 rounded border border-gray-800 bg-gray-900 px-3 py-2 transition"
					>
						<Icon icon="mingcute:box-3-fill" className="size-5" />
						<span>Roll Dice</span>
					</button>
				</form>

				<section
					aria-labelledby="history-heading"
					className="flex min-h-0 flex-1 flex-col"
				>
					<h3 id="history-heading" className="heading-xl mb-1">
						History
					</h3>
					{diceRolls.length === 0 ? (
						<p className="text-gray-400">No dice rolls yet</p>
					) : (
						<ul className="grid min-h-0 flex-1 gap-2 overflow-y-auto">
							{diceRolls.map((roll) => {
								const successes = countSuccesses(roll.results)
								const isSuccess = successes > 0
								return (
									<li
										key={roll.id}
										className={twMerge(
											"rounded border bg-gray-900 p-3",
											isSuccess ? "border-green-900" : "border-gray-800",
										)}
									>
										<time
											dateTime={new Date(roll.timestamp).toISOString()}
											className="float-right text-sm text-gray-400"
										>
											{new Date(roll.timestamp).toLocaleTimeString()}
										</time>

										<h4 className="mb-1 font-medium">{roll.label}</h4>

										<ul className="mb-1 flex flex-wrap gap-1">
											{roll.results.map((result, i) => (
												<li key={i} className="relative">
													{getDieIcon(result)}
												</li>
											))}
										</ul>

										<p
											className={twMerge(
												"text-sm font-semibold tracking-wide",
												isSuccess ? "text-green-400" : "text-gray-400",
											)}
										>
											{isSuccess
												? `${successes} ${
														successes === 1 ? "success" : "successes"
													}`
												: "no successes"}
										</p>
									</li>
								)
							})}
						</ul>
					)}
				</section>
			</Ariakit.Dialog>
		</Ariakit.DialogProvider>
	)
}
