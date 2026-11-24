import { exposureScale } from './assessment'
import { assessment, whole } from './report'

const { heatPriorityFactors } = assessment

export const hotDaysCalculation = 'Median annual count of days with highs ≥40°C across 7 climate models.'
export const heatChangeCalculation = '2040 hot days − 2026 hot days.'
export const averageHeatChangeCalculation = '(Total 2040 hot days − total 2026 hot days) ÷ number of plants.'
const heatWeights = heatPriorityFactors.map(({ key, weight }) => `${whole(weight * 100)}% ${key === 'employees' ? 'workforce' : `${key} output`}`).join(', ')
export const heatPriorityCalculation = '2040 hot days × weighted plant inputs, scaled so the highest result scores 100.'
export const portfolioHeatCalculation = `Weighted average of plant hot days using ${heatWeights}.`
export const carbonSensitivityCalculation = 'Direct CO₂ (tonnes) × scenario price (₹/tonne) ÷ rupees per crore.'
export const carbonShareCalculation = 'Annual carbon sensitivity ÷ FY2025–26 revenue × 100.'
export const exposureCalculation = `Round the sum of weighted hot days ÷ ${exposureScale.heatDivisor} and Carbon Cost Share × ${exposureScale.carbonMultiplier}. Each component contributes up to ${exposureScale.componentMax} points.`
export const combinedPriorityCalculation = '(Heat Priority Score + Carbon Cost Share scaled to 100) ÷ 2.'
