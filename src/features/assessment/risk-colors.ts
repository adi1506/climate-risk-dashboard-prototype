const hotDayIncrease = [
  [3, '#bd841b'],
  [5, '#d37525'],
  [7, '#ca5227'],
  [16, '#aa2936'],
  [20, '#861c30'],
] as const

const heatPriority = [
  [0, '#eff2f6'],
  [3, '#fff2dd'],
  [15, '#fce3bd'],
  [55, '#f5b875'],
  [75, '#e7844d'],
  [87, '#bb4e38'],
  [100, '#982539'],
] as const

const carbonCostShare = [
  [0, '#edf5f4'],
  [2, '#e6f3f1'],
  [30, '#8fc8be'],
  [46, '#298278'],
  [55, '#0f6c66'],
  [100, 'var(--oren-color-blue)'],
] as const

function rampColor(value: number, stops: readonly (readonly [number, string])[]) {
  const index = stops.findIndex(([stop]) => value <= stop)
  if (index === -1) return stops[stops.length - 1][1]

  const [upper, upperColor] = stops[index]
  if (index === 0 || value === upper) return upperColor

  const [lower, lowerColor] = stops[index - 1]
  const weight = (value - lower) / (upper - lower) * 100
  return `color-mix(in srgb, ${lowerColor}, ${upperColor} ${weight}%)`
}

export const heatIncreaseColor = (days: number) => rampColor(days, hotDayIncrease)

export function heatPriorityStyle(score: number) {
  return {
    backgroundColor: rampColor(score, heatPriority),
    // The switch keeps both labels above 4.5:1 contrast for every whole score.
    color: score >= 86 ? '#fff' : '#000',
  }
}

export function carbonCostShareStyle(share: number) {
  return {
    backgroundColor: rampColor(share, carbonCostShare),
    // Both text colors exceed 4.5:1 contrast where the scale crosses 46%.
    color: share >= 46 ? '#fff' : '#000',
  }
}
