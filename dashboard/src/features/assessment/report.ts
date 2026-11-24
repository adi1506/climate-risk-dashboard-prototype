import { buildAssessment } from './assessment'
import { plantRecords } from './plant-records'

export const assessment = buildAssessment(plantRecords)

export const whole = new Intl.NumberFormat('en-IN').format
export const one = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format
export const two = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format
export const money = (value: number) => `₹${two(value)}`
export const material = (value: number) => `${two(value)} Mt`
export const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${whole(Math.abs(value))}`

export const shipments = [
  { from: 'P01', to: 'P07', tonnes: 1.12 },
  { from: 'P06', to: 'P08', tonnes: 0.68 },
  { from: 'P06', to: 'P09', tonnes: 0.60 },
]

const docs = '/docs/'
const eyReport = 'https://www.ey.com/content/dam/ey-unified-site/ey-com/en-in/insights/climate-change-sustainability-services/documents/2026/ey-ccts-accelerating-the-path-to-decarbonization.pdf'
const cctsRules = 'https://beeindia.gov.in/WriteReadData/L45218/1663540214634949.pdf'
const cementRoadmap = 'https://www.niti.gov.in/sites/default/files/2026-01/Roadmap_for_Cement_Sector_Decarbonaisation.pdf'
export const sources = {
  plant: [`${docs}nimbus_cement_plants.csv`, 'Nimbus plant inventory'],
  heatReport: [`${docs}research/nimbus-hot-days-2026-2040.md`, 'Nimbus heat comparison report'],
  heatModels: [`${docs}research/nimbus-hot-days-model-counts.csv`, 'Counts by plant and model'],
  heatWorkbook: ['/outputs/nimbus-heat-2026-2040/nimbus-hot-days-2026-2040.xlsx', 'Daily temperatures and calculations workbook'],
  heatBenchmark: [`${docs}research/nimbus-extreme-heat-industry-benchmark.md#why-extreme-heat-is-particularly-relevant-to-cement-manufacturing`, 'Cement producer disclosures'],
  nasa: ['https://www.nccs.nasa.gov/data-collections/nex-gddp-cmip6/', 'NASA NEX-GDDP-CMIP6 v2.0'],
  nasaSubset: ['https://www.nccs.nasa.gov/data-collections/nex-gddp-cmip6/#making-a-spatial-subset', 'NASA download and subsetting guide'],
  ultraTechHeat: ['https://www.ultratechcement.com/content/dam/ultratechcementwebsite/pdf/financials/annual-reports/integrated-and-sustainability-report-2024-25-single-page-view.pdf', 'UltraTech FY2024–25 report · p. 71'],
  holcimExposure: ['https://www.holcim.com/sites/holcim/files/docs/27022026-holcim-sustainability-statement-2025.pdf#page=89', 'Holcim 2025 Sustainability Statement · p. 89'],
  holcimImpacts: ['https://www.holcim.com/sites/holcim/files/docs/28022025-holcim-climate-report-2024.pdf#page=75', 'Holcim 2024 Climate Report · p. 73'],
  ambujaHeat: ['https://www.ambujacement.com/annual-report-2025/natural-capital.html#:~:text=Higher%20temperatures%20can%20reduce%20productivity', 'Ambuja FY2025–26 report · Temperature extremes'],
  shreeHeat: ['https://www.shreecement.com/uploads/cleanupload/TCFD-Report.pdf#page=5', 'Shree Cement climate risk report · p. 8'],
  jkLakshmiHeat: ['https://nsearchives.nseindia.com/annual_reports/AR_29594_JKLAKSHMI_2025_2026_A_13735652_06072026192607.pdf', 'JK Lakshmi Cement FY2025–26 · Sirohi assessment'],
  imdHeat: ['https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1701781&lang=2&reg=48', 'IMD heatwave criteria · PIB, Annexure 3'],
  workplaceHeat: ['https://www.who.int/publications/i/item/9789240099814', 'WHO/WMO workplace heat guidance'],
  cementHeat: ['https://www.gov.uk/government/publications/adapting-to-climate-change-industry-sector-examples-for-your-risk-assessment/cement-lime-and-minerals-examples-for-your-adapting-to-climate-change-risk-assessment#summer-daily-maximum-temperature', 'Environment Agency cement heat guidance'],
  cementProcess: ['https://www.iea.org/articles/driving-energy-efficiency-in-heavy-industries#cement', 'IEA cement manufacturing stages'],
  carbonRule: [`${docs}climate-risk-v1-transition-risk-data.md#price-formulas-and-labels`, 'Sensitivity and rank rules'],
  fixedPortfolio: [`${docs}adr/0001-hold-assessment-portfolio-fixed.md`, 'Fixed-portfolio decision'],
  eyGrowth: [`${eyReport}#page=19`, 'EY-Parthenon growth benchmarks · p. 19'],
  eyCement: [`${eyReport}#page=25`, 'EY-Parthenon cement scenario · p. 25'],
  carbonFx: ['https://www.fbil.org.in/uploads/Newsletter_for_the_month_of_November_2026_1_53864e1ec6.pdf#page=13', 'FBIL October 2026 exchange rate · p. 13'],
  benchmark: [`${docs}research/nimbus-carbon-pricing-benchmarks.md`, 'Peer price benchmark'],
  shreeCarbon: ['https://www.shreecement.com/uploads/cleanupload/ESGDataBookFY202526.pdf#page=23', 'Shree Cement ESG Data Book · p. 23'],
  ambujaCarbon: ['https://www.ambujacement.com/annual-report-2025/natural-capital.html#:~:text=Internal%20Carbon%20Pricing', 'Ambuja annual report · Internal carbon pricing'],
  ultraTechCarbon: ['https://www.ultratechcement.com/corporate/sustainability/environment/decarbonisation#:~:text=Going%20forward%2C%20a%20shadow%20price', 'UltraTech · FY26 shadow price'],
  pibCarbon: ['https://www.pib.gov.in/PressReleasePage.aspx?PRID=2217239&lang=2&reg=48', 'Press Information Bureau'],
  ccts: [`${cctsRules}#page=30`, 'MoEFCC intensity rules · Rule 4'],
  cctsShortfall: [`${cctsRules}#page=31`, 'MoEFCC certificate shortfall · Rule 5'],
  cctsPricing: ['https://cercind.gov.in/regulations/GZ-205.pdf#page=9', 'CERC certificate pricing · Regulation 11'],
  cementEmissions: [`${cementRoadmap}#page=37`, 'NITI Aayog · Cement emissions · p. 18'],
  cementCalcination: [`${cementRoadmap}#page=12`, 'NITI Aayog · Calcination share · p. xii'],
  cementDecarbonisation: [`${cementRoadmap}#page=46`, 'NITI Aayog · Decarbonisation options · p. 27'],
  ieaCement: ['https://www.iea.org/reports/breakthrough-agenda-report-2025/cement-and-concrete', 'IEA · Breakthrough Agenda Report 2025'],
} satisfies Record<string, [string, string]>

export const heatBasis = 'Daily highs at or above 40°C · SSP2–4.5'
export const carbonBasis = 'EY-Parthenon normative price scenario · FY2025–26 direct emissions for both years'
export const carbonCaveat = 'Estimating Carbon Credit Trading Scheme (CCTS) costs requires facility coverage, the notified target, verified intensity, equivalent output, eligible credits and the price of any remaining credits.'
export const heatMethod = 'Count days with a maximum air temperature of at least 40°C in each of seven NASA climate models and take the median for each plant and year.'
