import { useMemo, useState, useEffect } from 'react'
import Confetti from 'react-confetti'

export default function PricingGame() {
	const colorPalette = [
		{ key: 'x', label: 'RED', bg: 'bg-red-500' },
		{ key: 'y', label: 'BLUE', bg: 'bg-blue-500' },
		{ key: 'z', label: 'GREEN', bg: 'bg-green-500' },
		{ key: 'w', label: 'YELLOW', bg: 'bg-yellow-400' },
		{ key: 'u', label: 'PURPLE', bg: 'bg-purple-500' },
		{ key: 'v', label: 'PINK', bg: 'bg-pink-400' },
	]

	// hidden mapping
	const hiddenMapping = { x: 3, y: 2, z: 7, w: 4, u: 8, v: 2 }

	// Predefined "cake slices"
	const samples = [
		{ id: 'eq1', layers: ['x', 'x', 'x'], total: 9 },
		{ id: 'eq2', layers: ['y', 'z', 'w'], total: 13 },
		{ id: 'eq3', layers: ['u', 'v', 'x'], total: 13 },
		{ id: 'eq4', layers: ['z', 'w', 'v'], total: 13 },
		{ id: 'eq5', layers: ['y', 'u', 'x'], total: 13 },
		{ id: 'eq6', layers: ['w', 'u', 'z'], total: 19 },
		{ id: 'eq7', layers: ['x', 'y', 'v'], total: 7 },
	]

	// Player guesses
	const [guesses, setGuesses] = useState({})
	const [checked, setChecked] = useState(false)
	const [showConfetti, setShowConfetti] = useState(false)

	const allCorrect = useMemo(() => {
		return colorPalette.every((c) => {
			const g = Number(guesses[c.key])
			return Number.isFinite(g) && g === hiddenMapping[c.key]
		})
	}, [guesses])

	//  Trigger confetti when allCorrect becomes true
	useEffect(() => {
		if (allCorrect && checked) {
			setShowConfetti(true)
			const timer = setTimeout(() => setShowConfetti(false), 4000) // confetti lasts 4s
			return () => clearTimeout(timer)
		}
	}, [allCorrect, checked])

	const handleInput = (colorKey, value) => {
		const num = value === '' ? '' : Number(value)
		if (value === '' || (Number.isFinite(num) && num >= 0 && num <= 99)) {
			setGuesses((prev) => ({ ...prev, [colorKey]: value === '' ? '' : num }))
		}
	}

	return (
		<div className="w-full max-w-5xl mx-auto px-4 py-6 relative">
			{showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

			<div className="flex items-center justify-between gap-4 mb-6">
				{checked && (
					<span className={allCorrect ? 'text-green-600' : 'text-red-600'}>
						{allCorrect ? 'All correct!' : 'Check again'}
					</span>
				)}
			</div>

			<section className="mb-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{samples.map((slice) => (
						<div key={slice.id} className="rounded-lg border border-slate-200 p-3">
							<CakeVisual layers={slice.layers} activeColors={colorPalette} />
							<div className="mt-3 text-sm text-slate-700">
								Cost:&nbsp;
								<span className="font-semibold">{slice.total}</span>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="mb-8">
				<h2 className="text-lg font-medium mb-3">Your Guesses</h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{colorPalette.map((c) => (
					<label key={c.key} className="flex flex-col items-center gap-2 rounded-md border border-slate-200 p-3">
					<span className={`inline-block h-5 w-5 rounded ${c.bg}`} />
					<span className="text-sm font-medium">{c.label}</span>
					<input
						type="number"
						value={guesses[c.key] ?? ''}
						placeholder="?"
						className="w-full min-w-[70px] rounded border border-slate-300 px-3 py-2 text-base text-center"
						onChange={(e) => handleInput(c.key, e.target.value)}
					/>
					</label>
				))}
				</div>

				<div className="mt-3 flex items-center gap-2">
					<button
						className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
						onClick={() => setChecked(true)}
					>
						Check
					</button>
					<button
						className="px-3 py-2 rounded-md bg-slate-100 text-slate-900 hover:bg-slate-200"
						onClick={() => {
							setGuesses({})
							setChecked(false)
							setShowConfetti(false)
						}}
					>
						Clear
					</button>
				</div>
			</section>
		</div>
	)
}

function CakeVisual({ layers, activeColors }) {
	return (
		<div className="w-36">
			<div className="flex flex-col-reverse">
				{layers.map((colorKey, idx) => {
					const meta = activeColors.find((c) => c.key === colorKey)
					const bg = meta ? meta.bg : 'bg-slate-300'
					return (
						<div key={`${colorKey}-${idx}`} className={`h-6 ${bg} rounded-sm border border-black/10`} />
					)
				})}
			</div>
		</div>
	)
}
