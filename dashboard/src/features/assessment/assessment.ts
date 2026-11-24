export const rupeesPerCrore = 10_000_000

const carbonGrowthBenchmarks = [3.69, 5.60, 9.92, 8.65, 8.00, 10.00] as const
const carbonGrowthRate = carbonGrowthBenchmarks.reduce((sum, rate) => sum + rate, 0) / carbonGrowthBenchmarks.length / 100
const carbonExchangeRate = 95.5063
const baselineYear = 2026
const futureYear = 2040
const startingPrice = 10
const heatPriorityInputs = [
  { key: 'employees', label: 'Reported employees', weight: 0.5 },
  { key: 'cement', label: 'FY2025–26 cement output', weight: 0.25 },
  { key: 'clinker', label: 'FY2025–26 clinker produced', weight: 0.25 },
] as const

function scenarioPrice(year: number, dollars: number) {
  const rupees = dollars * carbonExchangeRate
  return { year, dollars, rupees, roundedRupees: Math.round(rupees / 100) * 100 }
}

export type PlantRecord = Readonly<{
  id: string
  name: string
  state: string
  type: string
  employees: number
  cement: number
  clinker: number
  emissions: number
  revenue: number
  notes: string
  heat: Readonly<{
    baseline: number
    future: number
    latitude: number
    longitude: number
    modelCounts: readonly Readonly<{ model: string; baseline: number; future: number }>[]
  }>
}>

export const heatChange = ({ heat }: PlantRecord) => heat.future - heat.baseline

/** Compare a non-empty fixed portfolio with unique IDs and positive annual plant revenue. */
export function buildAssessment(records: readonly PlantRecord[]) {
  if (!records.length || records.some(record => !Number.isFinite(record.revenue) || record.revenue <= 0)) {
    throw new RangeError('The assessment requires plants with positive annual revenue.')
  }
  if (new Set(records.map(record => record.id)).size !== records.length) {
    throw new RangeError('The assessment requires unique plant IDs.')
  }

  const carbonScenario = {
    baseline: scenarioPrice(baselineYear, startingPrice),
    future: scenarioPrice(futureYear, startingPrice * (1 + carbonGrowthRate) ** (futureYear - baselineYear)),
  }
  const heatPriorityFactors = heatPriorityInputs.map(factor => ({
    ...factor,
    maximum: Math.max(...records.map(record => record[factor.key])),
  }))
  const portfolio = records.map(record => {
    const tonnes = record.emissions * 1000
    const baselineSensitivity = tonnes * carbonScenario.baseline.roundedRupees / rupeesPerCrore
    const futureSensitivity = tonnes * carbonScenario.future.roundedRupees / rupeesPerCrore
    const factors = heatPriorityFactors.map(factor => {
      const input = record[factor.key]
      const contribution = factor.maximum > 0 ? factor.weight * (input / factor.maximum) : 0
      return { ...factor, input, contribution }
    })
    const scale = factors.reduce((sum, factor) => sum + factor.contribution, 0)
    return {
      ...record,
      heatPriority: { factors, scale, raw: record.heat.future * scale, score: 0, rank: 0 },
      baselineSensitivity,
      futureSensitivity,
      costShare: futureSensitivity / record.revenue * 100,
      carbonRank: 0,
      carbonScore: 0,
    }
  })
  const heatDaysRanking = [...portfolio].sort((a, b) => b.heat.future - a.heat.future)
  const heatChangeRanking = [...heatDaysRanking].sort((a, b) => heatChange(b) - heatChange(a))
  const averageHeatChange = portfolio.reduce((sum, plant) => sum + heatChange(plant), 0) / portfolio.length
  const heatPriorityRanking = [...portfolio].sort((a, b) => b.heatPriority.raw - a.heatPriority.raw)
  const heatPriorityBenchmark = heatPriorityRanking[0].heatPriority.raw
  for (const [index, { heatPriority }] of heatPriorityRanking.entries()) {
    const previous = heatPriorityRanking[index - 1]?.heatPriority
    heatPriority.rank = previous?.raw === heatPriority.raw ? previous.rank : index + 1
    heatPriority.score = heatPriorityBenchmark > 0 ? Math.round(100 * heatPriority.raw / heatPriorityBenchmark) : 0
  }

  const carbonRanking = [...portfolio].sort((a, b) => b.costShare - a.costShare)
  const sensitivityRanking = [...portfolio].sort((a, b) => b.futureSensitivity - a.futureSensitivity)
  const highestShare = carbonRanking[0]?.costShare ?? 0
  for (const [index, plant] of carbonRanking.entries()) {
    plant.carbonRank = index + 1
    plant.carbonScore = highestShare > 0 ? Math.round(1 + 99 * plant.costShare / highestShare) : 1
  }

  const baselineSensitivity = portfolio.reduce((total, plant) => total + plant.baselineSensitivity, 0)
  const futureSensitivity = portfolio.reduce((total, plant) => total + plant.futureSensitivity, 0)
  const revenue = portfolio.reduce((total, plant) => total + plant.revenue, 0)
  const totals = { baselineSensitivity, futureSensitivity, revenue, share: futureSensitivity / revenue * 100 }

  const portfolioHeatWeights = heatPriorityInputs.map(({ key, weight }) => ({
    key,
    weight,
    total: portfolio.reduce((sum, plant) => sum + plant[key], 0),
  }))
  function exposureFor(period: keyof typeof carbonScenario, annualSensitivity: number) {
    const { year } = carbonScenario[period]
    const daysInYear = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000
    const hotDays = portfolioHeatWeights.reduce((sum, { key, weight, total }) => {
      const weightedCount = portfolio.reduce((count, plant) => count + plant.heat[period] * plant[key], 0)
      return total > 0 ? sum + weight * weightedCount / total : sum
    }, 0)
    const heatScore = 100 * hotDays / daysInYear
    const carbonScore = 100 * annualSensitivity / revenue
    return { year, daysInYear, hotDays, heatScore, annualSensitivity, carbonScore, score: (heatScore + carbonScore) / 2 }
  }

  const portfolioExposure = {
    baseline: exposureFor('baseline', baselineSensitivity),
    future: exposureFor('future', futureSensitivity),
  }
  const priorityPlants = [...portfolio].sort((a, b) => combinedPriority(b) - combinedPriority(a)).slice(0, 3)
  const plants = new Map(portfolio.map(plant => [plant.id, plant]))

  return {
    carbonScenario, carbonRanking, sensitivityRanking, totals, heatPriorityFactors, heatPriorityRanking,
    heatPriorityBenchmark, heatDaysRanking, heatChangeRanking, heatIncrease: heatChangeRanking[0], averageHeatChange,
    portfolioExposure, priorityPlants, combinedPriority, portfolio, plants,
    carbonGrowthBenchmarks, carbonGrowthRate, carbonExchangeRate,
  }
}

export type Plant = ReturnType<typeof buildAssessment>['portfolio'][number]

function combinedPriority(plant: { heatPriority: { score: number }; carbonScore: number }) {
  return (plant.heatPriority.score + plant.carbonScore) / 2
}
