import { BookOpen, Thermometer, Wallet } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CarbonSensitivityLegend, HeatChangePlot, PlantPlot } from './charts'
import { BackToOverview } from './dashboard'
import { carbonSensitivityCalculation, carbonShareCalculation, heatChangeCalculation, heatPriorityCalculation } from './metric-calculations'
import { MetricHelp } from './metric-help'
import { carbonCostShareStyle, heatPriorityStyle } from './risk-colors'
import { plantHref, ReportLink, type Risk } from './navigation'
import { assessment, carbonBasis, heatBasis, money, two } from './report'

const { carbonRanking, heatPriorityRanking, sensitivityRanking, totals } = assessment

export function RiskDetails({ risk }: { risk: Risk }) {
  const heat = risk === 'heat'
  const title = heat ? 'Extreme heat by plant' : 'Carbon cost pressure by plant'
  const ranking = heat ? heatPriorityRanking : carbonRanking
  return <>
    <div className="page-heading detail-heading">
      <div>
        <BackToOverview />
        <h1 id="page-heading" tabIndex={-1}>{title}</h1>
        <p>{heat ? heatBasis : carbonBasis}</p>
      </div>
      <ReportLink id={`${risk}-method`} href={`#${risk}/method`} className={buttonVariants({ variant: 'outline', className: 'method-link' })}>
        <BookOpen aria-hidden="true" />Method &amp; sources
      </ReportLink>
    </div>
    <div className="detail-grid">
      <Card className="panel detail-panel" role="region" aria-labelledby="detail-chart-title">
        <div className="panel-heading">
          <div className="panel-name"><span className={`metric-icon ${risk}`}>{heat ? <Thermometer size={18} aria-hidden="true" /> : <Wallet size={17} aria-hidden="true" />}</span>
            <div>
              <div className="metric-label">
                <h2 id="detail-chart-title">{heat ? 'Change in hot days' : 'Annual carbon price sensitivity'}</h2>
                <MetricHelp label={heat ? 'change in hot days' : 'annual carbon price sensitivity'}>
                  {heat ? heatChangeCalculation : carbonSensitivityCalculation}
                </MetricHelp>
              </div>
              <p>{heat ? '2040 minus 2026 · days/year' : '₹ crore/year · Ordered by 2040 sensitivity'}</p>
            </div>
          </div>
        </div>
        {heat ? <HeatChangePlot /> : <>
          <div className="plot-meta"><span>All {ranking.length} plants</span><CarbonSensitivityLegend /></div>
          <PlantPlot view="carbonSensitivity" ranking={sensitivityRanking} />
        </>}
        <div className="detail-footnote">{heat ? 'These are two individual modelled years. Differences can reflect year-to-year variability.'
          : <>Portfolio sensitivity rises from <strong>{money(totals.baselineSensitivity)} to {money(totals.futureSensitivity)} crore/year</strong>.</>}</div>
      </Card>
      <Card className="panel ranking-panel" role="region" aria-labelledby="ranking-title">
        <div className="panel-heading"><div>
          <div className="metric-label">
            <h2 id="ranking-title">{heat ? '2040 heat priorities' : '2040 carbon cost share'}</h2>
            <MetricHelp label={heat ? 'heat priority' : 'carbon cost share'}>{heat ? heatPriorityCalculation : carbonShareCalculation}</MetricHelp>
          </div>
          <p>{heat ? 'Ranked by Heat Priority Score' : 'Ranked by share of FY2025–26 plant revenue'}</p>
        </div></div>
        <table className="rank-table metric-rank-table">
          <caption className="sr-only">All plants ranked by {heat ? '2040 Heat Priority Score' : '2040 carbon cost share'}</caption>
          <thead><tr><th scope="col">Rank</th><th scope="col">Plant</th>
            {heat ? <><th scope="col">2026 days</th><th scope="col">2040 days</th><th scope="col">Priority / 100</th></> : <th scope="col" className="carbon-share-column">Share</th>}
          </tr></thead>
          <tbody>{ranking.map(plant => <tr key={plant.id}>
            <td>{heat ? plant.heatPriority.rank : plant.carbonRank}</td>
            <th scope="row"><ReportLink id={`${risk}-ranking-${plant.id}`} href={plantHref(risk, plant.id)}>{plant.name}</ReportLink></th>
            {heat && <><td>{plant.heat.baseline}</td><td>{plant.heat.future}</td></>}
            <td><strong className="rank-value" style={heat ? heatPriorityStyle(plant.heatPriority.score) : carbonCostShareStyle(plant.costShare)}>
              {heat ? plant.heatPriority.score : `${two(plant.costShare)}%`}
            </strong></td>
          </tr>)}</tbody>
        </table>
        {heat && <p className="rank-note">The score combines 2040 hot days with reported employees and FY2025–26 cement and clinker output. The top priority in the portfolio scores 100.</p>}
      </Card>
    </div>
  </>
}
