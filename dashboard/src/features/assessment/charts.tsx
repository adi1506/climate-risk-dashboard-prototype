import { useId, type CSSProperties } from 'react'
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { heatIncreaseColor } from './risk-colors'
import { plantHref, ReportLink, useNavigation, type Risk } from './navigation'
import { heatChange, type Plant } from './assessment'
import { assessment, money, signed, two, whole } from './report'

const { carbonScenario, heatChangeRanking, portfolio } = assessment

const heatConfig = {
  baseline: { label: '2026 modelled', color: 'var(--plot-baseline)' },
  future: { label: '2040 projected', color: 'var(--plot-heat)' },
} satisfies ChartConfig
const carbonShareConfig = {
  share: { label: 'Carbon cost share', color: 'var(--plot-carbon)' },
} satisfies ChartConfig
const carbonSensitivityConfig = {
  baseline: { label: `${carbonScenario.baseline.year} scenario`, color: 'var(--plot-carbon-baseline)' },
  future: { label: `${carbonScenario.future.year} scenario`, color: 'var(--plot-carbon)' },
} satisfies ChartConfig
const plotConfigs = { heat: heatConfig, carbonShare: carbonShareConfig, carbonSensitivity: carbonSensitivityConfig }
const ringConfig = {
  value: { label: 'Carbon cost share' },
} satisfies ChartConfig
// Recharts waits for positive dimensions, so the bars appear only after measuring the grid.
const unmeasured = { width: 1, height: 0 }

export function RevenueRing({ share }: { share: number }) {
  const data = [
    { value: share, fill: 'var(--plot-carbon)' },
    { value: 100 - share, fill: 'var(--plot-track)' },
  ]
  return <ChartContainer config={ringConfig} className="revenue-ring" initialDimension={unmeasured} aria-hidden="true">
    <PieChart accessibilityLayer={false}>
      <Pie data={data} dataKey="value" innerRadius="72%" outerRadius="98%" startAngle={90} endAngle={-270}
        cornerRadius={3} paddingAngle={4} stroke="none" isAnimationActive={false} />
    </PieChart>
  </ChartContainer>
}

export function HeatLegend() {
  return <div className="plot-legend"><span><i className="swatch baseline" />2026 modelled</span><span><i className="swatch heat" />2040 projected</span></div>
}

// Keep each metric on the same zero-based scale across all plant drawers.
const plantPeriodLimits = {
  heat: 10 * Math.max(1, Math.ceil(Math.max(...portfolio.flatMap(({ heat }) => [heat.baseline, heat.future])) / 10)),
  carbon: 100 * Math.max(1, Math.ceil(Math.max(...portfolio.flatMap(plant => [plant.baselineSensitivity, plant.futureSensitivity])) / 100)),
}

export function PlantPeriodComparison({ plant, risk }: { plant: Plant; risk: Risk }) {
  const heat = risk === 'heat'
  const limit = plantPeriodLimits[risk]
  const periods = [
    { period: 'baseline', year: carbonScenario.baseline.year, amount: heat ? plant.heat.baseline : plant.baselineSensitivity },
    { period: 'future', year: carbonScenario.future.year, amount: heat ? plant.heat.future : plant.futureSensitivity },
  ]
  return <figure className={`plant-period-figure ${risk}`}>
    <figcaption>
      <h3>{heat ? 'Annual hot days' : 'Annual carbon price sensitivity'}</h3>
      <span>{heat ? 'Days/year with highs ≥40°C' : '₹ crore/year'}</span>
    </figcaption>
    <dl>
      {periods.map(({ period, year, amount }) => <div key={year} className="plant-period-row" data-period={period}>
        <dt>{year}</dt>
        <dd>
          <span className="plant-period-track" aria-hidden="true"><span style={{ width: `${100 * amount / limit}%` }} /></span>
          <strong>{heat ? whole(amount) : money(amount)}</strong>
        </dd>
      </div>)}
    </dl>
    <div className="plant-period-row" aria-hidden="true">
      <div className="plant-period-axis"><span>{heat ? '0' : '₹0'}</span><span>{heat ? whole(limit) : `₹${whole(limit)}`}</span></div>
    </div>
  </figure>
}

export function HeatChangePlot() {
  const rows = heatChangeRanking.map(plant => ({ plant, change: heatChange(plant) }))
  const maximum = Math.max(...rows.map(row => Math.abs(row.change)))
  const limit = Math.max(10, Math.ceil(maximum / 10) * 10)
  const ticks = [-limit, -limit / 2, 0, limit / 2, limit]
  const position = (days: number) => `${50 + 50 * days / limit}%`

  return <div className="heat-change-plot">
    <div className="heat-change-directions" aria-hidden="true">
      <div>
        <span><i className="heat-change-key decrease" />Fewer hot days</span>
        <span><span className="heat-change-key">{[3, 7, 16].map(days =>
          <i key={days} style={{ backgroundColor: heatIncreaseColor(days) }} />
        )}</span>More hot days</span>
      </div>
    </div>
    {rows.map(({ plant, change }) => <ReportLink key={plant.id} id={`heat-plot-${plant.id}`} href={plantHref('heat', plant.id)}
      className="heat-change-row" aria-label={`${plant.name}, change of ${signed(change)} hot days per year. Open evidence`}>
      <span className="plot-name">{plant.name}</span>
      <span className="heat-change-track" aria-hidden="true" style={{
        '--bar-start': position(Math.min(change, 0)),
        '--bar-end': position(Math.max(change, 0)),
        '--heat-change-fill': change > 0 ? heatIncreaseColor(change) : undefined,
      } as CSSProperties}>
        <i className="heat-change-mark" data-direction={Math.sign(change)} />
      </span>
      <strong className="heat-change-value" aria-hidden="true">{signed(change)}</strong>
    </ReportLink>)}
    <div className="heat-change-axis" aria-hidden="true">
      <div className="plot-ticks">{ticks.map(tick => <span key={tick}>{signed(tick)}</span>)}</div>
    </div>
  </div>
}

export function CarbonSensitivityLegend() {
  return <div className="plot-legend sensitivity-legend">
    <span><i className="swatch carbon-baseline" />{carbonSensitivityConfig.baseline.label} · ₹{whole(carbonScenario.baseline.roundedRupees)}/tCO₂</span>
    <span><i className="swatch carbon-future" />{carbonSensitivityConfig.future.label} · ₹{whole(carbonScenario.future.roundedRupees)}/tCO₂</span>
  </div>
}

export function PlantPlot({ view, ranking }: { view: keyof typeof plotConfigs; ranking: Plant[] }) {
  const { route, go } = useNavigation()
  const heat = view === 'heat'
  const sensitivity = view === 'carbonSensitivity'
  const comparison = view !== 'carbonShare'
  const carbonGradientId = useId()
  const primarySeries = comparison ? 'future' : 'share'
  const primaryFill = sensitivity ? `url(#${carbonGradientId})` : `var(--color-${primarySeries})`
  const risk = heat ? 'heat' : 'carbon'
  const config: ChartConfig = plotConfigs[view]
  const rows = ranking.map(plant => ({
    id: plant.id, name: plant.name,
    baseline: heat ? plant.heat.baseline : plant.baselineSensitivity,
    future: heat ? plant.heat.future : plant.futureSensitivity,
    share: plant.costShare,
    href: plantHref(route.section, plant.id, risk), origin: `${risk}-plot-${plant.id}`,
  }))
  const maximum = Math.max(...rows.map(row => comparison ? Math.max(row.baseline, row.future) : row.share))
  const tickInterval = sensitivity ? 50 : 5
  const step = Math.max(tickInterval, Math.ceil(maximum / (4 * tickInterval)) * tickInterval)
  const ticks = [0, step, step * 2, step * 3, step * 4]
  const comparisonValue = heat ? whole : two
  const unit = heat ? 'days' : 'crore/year'
  const barClick = (_: unknown, index: number) => {
    const row = rows[index]
    go(row.href, row.origin)
  }

  return <div className={`plant-plot ${heat ? 'heat-plot' : sensitivity ? 'sensitivity-plot' : ''}`} style={{ '--rows': rows.length } as CSSProperties}>
    <div className="plot-names">
      {rows.map(row => <ReportLink key={row.id} id={row.origin} href={row.href} className="plot-name"
        aria-label={`${row.name}, ${heat ? `${row.baseline} hot days in 2026, ${row.future} in 2040`
          : comparison ? `${money(row.baseline)} crore per year in the 2026 scenario, ${money(row.future)} crore per year in the 2040 scenario`
            : `${two(row.share)}% carbon cost share in the 2040 scenario`}. Open evidence`}>
        {row.name}
      </ReportLink>)}
    </div>
    <ChartContainer config={config} className="plot-body" aria-hidden="true" initialDimension={unmeasured}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, bottom: 0, left: 0, right: 0 }} barGap={3} accessibilityLayer={false}>
        {sensitivity && <defs>
          <linearGradient id={carbonGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--oren-color-blue)" />
            <stop offset="100%" stopColor="var(--oren-color-accent)" />
          </linearGradient>
        </defs>}
        <CartesianGrid horizontal={false} stroke="var(--oren-chart-grid)" strokeDasharray="3 4" />
        <XAxis type="number" domain={[0, step * 4]} ticks={ticks} hide />
        <YAxis dataKey="name" type="category" hide />
        <ChartTooltip cursor={{ fill: 'var(--plot-hover)' }} labelFormatter={(_, payload) => payload[0]?.payload?.name}
          content={<ChartTooltipContent className="plot-tooltip"
            formatter={(value, name) => <><span>{config[String(name)]?.label ?? name}</span><strong>{comparison ? `${comparisonValue(Number(value))} ${unit}` : `${two(Number(value))}%`}</strong></>} />} />
        {comparison && <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[0, 3, 3, 0]} barSize={7} isAnimationActive={false} onClick={barClick} cursor="pointer" />}
        <Bar dataKey={primarySeries} fill={primaryFill}
          radius={[0, 4, 4, 0]} barSize={comparison ? 8 : 13} isAnimationActive={false} onClick={barClick} cursor="pointer" />
      </BarChart>
    </ChartContainer>
    <div className="plot-values" aria-hidden="true">
      {rows.map(row => <span key={row.id}>{comparison ? <><span>{comparisonValue(row.baseline)}</span><i>→</i><strong>{comparisonValue(row.future)}</strong></> : <strong>{two(row.share)}%</strong>}</span>)}
    </div>
    <div className="plot-ticks" aria-hidden="true">{ticks.map(tick => <span key={tick}>{whole(tick)}{comparison ? '' : '%'}</span>)}</div>
  </div>
}
