import { ArrowRight, ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { carbonSensitivityCalculation, carbonShareCalculation, combinedPriorityCalculation, exposureCalculation, heatExposureCalculation, portfolioHeatCalculation } from './metric-calculations'
import { MetricHelp } from './metric-help'
import { plantHref, ReportLink, type Risk } from './navigation'
import { assessment, money, one, two, whole } from './report'
import { heatPriorityStyle } from './risk-colors'

const { carbonScenario, heatPriorityFactors, portfolio, portfolioExposure, priorityPlants, totals } = assessment

const { baseline, future } = portfolioExposure
const percentChange = new Intl.NumberFormat('en-IN', {
  style: 'percent', signDisplay: 'exceptZero', minimumFractionDigits: 1, maximumFractionDigits: 1,
}).format
const signedDays = new Intl.NumberFormat('en-IN', {
  signDisplay: 'exceptZero', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format

function ExposureScore() {
  const factors = heatPriorityFactors.map(({ key, weight }) => {
    const label = key === 'employees' ? 'workforce' : `${key} output`
    return `${whole(weight * 100)}% ${label}`
  })
  return <Card className="panel first-check-panel exposure-panel" role="region" aria-labelledby="exposure-title">
    <div className="exposure-headline">
      <div className="metric-label">
        <h2 id="exposure-title">Overall Business Exposure to Climate Risk Score</h2>
        <MetricHelp label="overall business exposure">{exposureCalculation}</MetricHelp>
      </div>
      <p className="first-check-note">Screening index · {portfolio.length} plants · Heat and carbon</p>
      <div className="exposure-primary">
        <strong>{one(future.score)} <small>/ 100</small></strong>
        <span>{future.year} scenario</span>
      </div>
      <p className="exposure-baseline">
        <span><strong>{one(baseline.score)} / 100</strong> in {baseline.year}</span>
        {baseline.score > 0 && <span className="metric-label">
          <strong className="exposure-change">{percentChange(future.score / baseline.score - 1)} vs {baseline.year}</strong>
          <MetricHelp label="change in overall exposure">(2040 score ÷ 2026 score − 1) × 100. Uses unrounded scores.</MetricHelp>
        </span>}
      </p>
    </div>
    <div className="exposure-components">
      <h3>Two components, weighted equally</h3>
      <dl className="exposure-components-grid">
        <div className="exposure-component heat">
          <dt className="metric-label">Physical · Extreme heat
            <MetricHelp label="physical exposure">{heatExposureCalculation}</MetricHelp>
          </dt>
          <dd className="exposure-component-value"><strong>{two(future.heatScore)} <small>/ 100</small></strong><span>50% weight</span></dd>
          <dd className="exposure-component-note">Portfolio-weighted share of hot days</dd>
        </div>
        <div className="exposure-component carbon">
          <dt className="metric-label">Transition · Carbon cost
            <MetricHelp label="transition exposure">{carbonShareCalculation}</MetricHelp>
          </dt>
          <dd className="exposure-component-value"><strong>{two(future.carbonScore)} <small>/ 100</small></strong><span>50% weight</span></dd>
          <dd className="exposure-component-note">Sensitivity as a share of revenue</dd>
        </div>
      </dl>
      <details className="disclosure exposure-method">
        <summary>How the score is calculated<ChevronDown size={16} aria-hidden="true" /></summary>
        <div className="disclosure-body">
          <p><strong>Physical risk.</strong> Average modelled hot days at or above 40°C using {factors.join(', ')} across the fixed FY2025–26 portfolio. Divide by calendar days and multiply by 100. The {future.year} component is {two(future.hotDays)} ÷ {future.daysInYear} × 100 ≈ {two(future.heatScore)}.</p>
          <p><strong>Transition risk.</strong> Divide scenario annual carbon price sensitivity by fixed FY2025–26 portfolio revenue and multiply by 100. The {future.year} component is {money(future.annualSensitivity)} crore ÷ ₹{whole(totals.revenue)} crore × 100 ≈ {two(future.carbonScore)}.</p>
          <p><strong>Overall score.</strong> Average the two components for each year. The headline change divides the increase in the overall score by the {baseline.year} score. The calculations use unrounded values.</p>
        </div>
      </details>
    </div>
  </Card>
}

function PlantRanks() {
  const lastRank = Math.max(...priorityPlants.flatMap(plant => [plant.heatPriority.rank, plant.carbonRank]))
  const ranks = Array.from({ length: lastRank }, (_, index) => index + 1)
  const rowPosition = (rank: number) => (rank - 0.5) * 100 / lastRank
  const lines = priorityPlants.map(plant => {
    const heatRank = plant.heatPriority.rank
    const carbonRank = plant.carbonRank
    const ink = heatRank === carbonRank ? heatPriorityStyle(plant.heatPriority.score).backgroundColor
      : heatRank < carbonRank ? 'var(--heat-ink)' : 'var(--carbon-ink)'
    return { plant, ink, start: rowPosition(heatRank), end: rowPosition(carbonRank) }
  })
  const rankTicks = ranks.map(rank => <span key={rank} style={{ top: `${rowPosition(rank)}%` }}>#{rank}</span>)

  return <Card className="panel first-check-panel first-check-plants" role="region" aria-labelledby="focus-title">
    <div>
      <div className="metric-label">
        <h2 id="focus-title">Top {priorityPlants.length} plants to focus on</h2>
        <MetricHelp label="combined plant priority">{combinedPriorityCalculation}</MetricHelp>
      </div>
      <ol className="first-check-plant-list" role="list">
        {priorityPlants.map((plant, index) => <li key={plant.id}>
          <span className="check-rank" aria-hidden="true">{index + 1}</span>
          <ReportLink id={`priority-plant-${plant.id}`} href={plantHref('conclusions', plant.id)}>{plant.name}</ReportLink>
          <span className="sr-only">Heat priority rank {plant.heatPriority.rank}, score {plant.heatPriority.score} out of 100. Carbon cost share rank {plant.carbonRank}, {two(plant.costShare)} percent.</span>
        </li>)}
      </ol>
    </div>
    <div className="first-check-ranks">
      <p className="first-check-note">The shortlist gives equal weight to Heat Priority Score and scaled Carbon Cost Share.</p>
      <div className="first-check-rank-plot" aria-hidden="true">
        <div className="focus-plot-head"><strong>Heat priority rank</strong><strong>Carbon cost share rank</strong></div>
        <div className="focus-plot-grid">
          <div className="focus-plot-ticks">{rankTicks}</div>
          <div className="focus-plot-lines">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              {ranks.map(rank => <line key={rank} x1="0" x2="100" y1={rowPosition(rank)} y2={rowPosition(rank)} className="focus-plot-guide" vectorEffect="non-scaling-stroke" />)}
              {lines.map(({ plant, ink, start, end }) => <line key={plant.id} x1="0" x2="100" y1={start} y2={end} stroke={ink} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
            </svg>
            {lines.map(({ plant, ink, start, end }) => <div key={plant.id} style={{ color: ink }}>
              <i className="focus-plot-dot" style={{ top: `${start}%` }} />
              <i className="focus-plot-dot carbon-end" style={{ top: `${end}%` }} />
              <span className="focus-plot-label" style={{ top: `${(start + end) / 2}%` }}>
                <strong>{plant.name}</strong> <span>{plant.heatPriority.score}/100 · {two(plant.costShare)}%</span>
              </span>
            </div>)}
          </div>
          <div className="focus-plot-ticks">{rankTicks}</div>
        </div>
      </div>
    </div>
  </Card>
}

function PortfolioTrend({ risk }: { risk: Risk }) {
  const heat = risk === 'heat'
  const title = heat ? 'Extreme heat findings' : 'Carbon cost findings'
  const metric = heat ? 'Portfolio-weighted hot days · days/year' : 'Portfolio annual price sensitivity · ₹ crore/year'
  const values = heat ? [baseline.hotDays, future.hotDays] : [baseline.annualSensitivity, future.annualSensitivity]
  const upper = Math.max(1, ...values)
  const points = [baseline.year, future.year].map((year, index) => ({
    year,
    x: index === 0 ? 23 : 77,
    y: 100 * (1 - values[index] / upper),
    label: heat ? two(values[index]) : money(values[index]),
  }))
  const [first, last] = points
  return <Card className={`panel first-check-panel portfolio-trend ${risk}`} role="region" aria-labelledby={`${risk}-findings`}>
    <div className="metric-label">
      <h2 id={`${risk}-findings`}>{title}</h2>
      <MetricHelp label={heat ? 'portfolio-weighted hot days' : 'annual carbon sensitivity'}>
        {heat ? portfolioHeatCalculation : carbonSensitivityCalculation}
      </MetricHelp>
    </div>
    <p className="first-check-note">{metric}</p>
    <div className="portfolio-trend-chart">
      <div className="portfolio-trend-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <dl>
          {points.map(({ year, x, y, label }) => <div key={year} className="portfolio-trend-point" style={{ left: `${x}%`, top: `${y}%` }}>
            <dt className="sr-only">{year}</dt><dd>{label}</dd>
          </div>)}
        </dl>
      </div>
      <div className="portfolio-trend-years" aria-hidden="true">
        {points.map(({ year, x }) => <span key={year} style={{ left: `${x}%` }}>{year}</span>)}
      </div>
    </div>
    <p className="first-check-note portfolio-trend-note">{heat
      ? <><strong>{signedDays(future.hotDays - baseline.hotDays)} days/year</strong> · Two modelled years · Days ≥40°C</>
      : <>Carbon price scenario · ₹{whole(carbonScenario.baseline.roundedRupees)} to ₹{whole(carbonScenario.future.roundedRupees)}/tCO₂</>}</p>
    <ReportLink className="panel-link" id={`conclusions-${risk}-report`} href={`#${risk}`}>
      {heat ? 'Extreme heat report' : 'Carbon cost report'} <ArrowRight size={15} aria-hidden="true" />
    </ReportLink>
  </Card>
}

export function Conclusions() {
  return <>
    <div className="page-heading">
      <h1 id="page-heading" tabIndex={-1}>Conclusions</h1>
    </div>
    <div className="first-checks">
      <ExposureScore />
      <PlantRanks />
      <div className="first-check-trends">
        <PortfolioTrend risk="heat" />
        <PortfolioTrend risk="carbon" />
      </div>
    </div>
  </>
}
