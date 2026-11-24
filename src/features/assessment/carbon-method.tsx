import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Disclosure, Sources } from './evidence-components'
import { MetricHelp } from './metric-help'
import { rupeesPerCrore, type Plant } from './assessment'
import { assessment, money, sources, two, whole } from './report'

const { carbonExchangeRate, carbonGrowthBenchmarks, carbonGrowthRate, carbonRanking, carbonScenario, plants, sensitivityRanking, totals } = assessment

const { baseline, future } = carbonScenario
const scenarioSources = [sources.eyCement, sources.eyGrowth, sources.carbonFx]
const complianceSources = [sources.pibCarbon, sources.ccts, sources.cctsShortfall, sources.cctsPricing]
const cementEmissionsSources = [sources.cementEmissions, sources.cementCalcination]
const peerPrices = [
  { company: 'Shree Cement', disclosed: '₹2,255/tCO₂e', rupees: 2255, unit: 'tCO₂e', source: sources.shreeCarbon },
  { company: 'Ambuja Cements', disclosed: 'US$28/tCO₂', rupees: 28 * carbonExchangeRate, unit: 'tCO₂', source: sources.ambujaCarbon },
  { company: 'UltraTech Cement', disclosed: 'US$30/tCO₂e', rupees: 30 * carbonExchangeRate, unit: 'tCO₂e', source: sources.ultraTechCarbon },
]
const peerSources = peerPrices.map(peer => peer.source)
const peerMedian = [...peerPrices].sort((a, b) => a.rupees - b.rupees)[1].rupees
const captureCostPremium = { low: 75, high: 150 }

function WorkedExample({ plant }: { plant: Plant }) {
  const directTonnes = whole(plant.emissions * 1000)
  const divisor = whole(rupeesPerCrore)
  return <section className="method-example" aria-labelledby="carbon-method-plant">
    <div className="method-example-header">
      <div>
        <h4 id="carbon-method-plant">{plant.name} worked example</h4>
        <p>{future.year} Comparison · FY2025–26 plant data</p>
      </div>
    </div>
    <dl className="method-formulas">
      <div>
        <dt>Annual Carbon Price Sensitivity (₹ crore/year)</dt>
        <dd>
          <code className="method-general-formula">FY2025–26 direct CO₂ (tonnes) × scenario price (₹/tCO₂) ÷ rupees per crore</code>
          <p><code>{future.year} · {directTonnes} t × ₹{whole(future.roundedRupees)}/t ÷ {divisor} =&nbsp;{money(plant.futureSensitivity)} crore/year</code></p>
          <p><code>{baseline.year} · {directTonnes} t × ₹{whole(baseline.roundedRupees)}/t ÷ {divisor} =&nbsp;{money(plant.baselineSensitivity)} crore/year</code></p>
          <p className="method-note">Multiply reported kilotonnes (kt) by 1,000 to get tonnes. Divide the resulting rupee cost by 10 million to get crore.</p>
        </dd>
      </div>
      <div>
        <dt>{future.year} Carbon Cost Share (%)</dt>
        <dd>
          <code className="method-general-formula">{future.year} annual sensitivity (₹ crore) ÷ FY2025–26 plant revenue (₹ crore) × 100</code>
          <code>{money(plant.futureSensitivity)} crore ÷ ₹{whole(plant.revenue)} crore × 100 ≈ {two(plant.costShare)}%</code>
        </dd>
      </div>
    </dl>
    <Sources links={[sources.plant, sources.carbonRule]} />
  </section>
}

function CarbonCostComparison() {
  const rupeeLeader = sensitivityRanking[0]
  const shareLeader = carbonRanking[0]
  const leaders = [...new Set([rupeeLeader, shareLeader])]
  const metrics = [
    {
      label: 'Annual Carbon Price Sensitivity',
      unit: '₹ crore/year',
      value: (plant: Plant) => plant.futureSensitivity,
      rank: (plant: Plant) => sensitivityRanking.indexOf(plant) + 1,
      maximum: Math.max(1, Math.ceil(rupeeLeader.futureSensitivity / 100)) * 100,
      format: money,
      formatTick: whole,
    },
    {
      label: 'Carbon Cost Share',
      unit: '% of FY2025–26 revenue',
      value: (plant: Plant) => plant.costShare,
      rank: (plant: Plant) => plant.carbonRank,
      maximum: Math.max(1, Math.ceil(shareLeader.costShare / 10)) * 10,
      format: (value: number) => `${two(value)}%`,
      formatTick: (value: number) => `${whole(value)}%`,
    },
  ]

  return <section className="method-evidence" aria-labelledby="carbon-cost-comparison">
    <h4 id="carbon-cost-comparison">Where are the most rupees exposed?</h4>
    <p className="method-note">{future.year} scenario · Portfolio leaders by rupees and revenue share</p>
    <div className="carbon-comparison">
      {metrics.map(metric => <figure key={metric.label}>
        <figcaption><strong>{metric.label}</strong><span>{metric.unit}</span></figcaption>
        <ul className="carbon-comparison-bars" role="list">
          {leaders.map(plant => {
            const rank = metric.rank(plant)
            const value = metric.value(plant)
            return <li key={plant.id} data-leader={rank === 1}>
              <div className="carbon-comparison-label">
                <span>{plant.name} <small><span className="sr-only">Rank </span><span aria-hidden="true">#</span>{rank}</small></span>
                <strong>{metric.format(value)}</strong>
              </div>
              <div className="carbon-bar-track" aria-hidden="true"><span style={{ width: `${100 * value / metric.maximum}%` }} /></div>
            </li>
          })}
        </ul>
        <div className="carbon-comparison-axis" aria-hidden="true"><span>{metric.formatTick(0)}</span><span>{metric.formatTick(metric.maximum)}</span></div>
      </figure>)}
    </div>
  </section>
}

function CostCalculation() {
  const plant = plants.get('P06')!
  return <>
    <h3 className="method-heading">From direct emissions to cost share</h3>
    <WorkedExample plant={plant} />
    <CarbonCostComparison />
    <Disclosure id="carbon-method-portfolio-share" title="How the portfolio share is calculated">
      <p>Both scenarios use FY2025–26 direct emissions and revenue for the same {carbonRanking.length} plants.</p>
      <p>Divide the portfolio’s total {future.year} sensitivity of {money(totals.futureSensitivity)} crore/year by its combined FY2025–26 revenue of ₹{whole(totals.revenue)} crore, then multiply by 100 to get {two(totals.share)}%.</p>
      <Sources links={[sources.plant, sources.carbonRule]} />
    </Disclosure>
    <Sources links={[sources.fixedPortfolio]} />
  </>
}

function CarbonRationale() {
  return <>
    <h3 className="method-heading">How carbon costs affect cement plants</h3>
    <ol className="carbon-rationale">
      <li className="method-evidence">
        <h4>Cement is hard to decarbonise</h4>
        <dl className="evidence-stats carbon-rationale-stats">
          <div className="evidence-stat"><dt>Cement’s share of India’s greenhouse gas emissions</dt><dd>≈6%</dd></div>
          <div className="evidence-stat"><dt>Limestone calcination’s share of cement emissions</dt><dd>≈55%</dd></div>
        </dl>
        <p>Making clinker releases CO₂ from limestone even with renewable electricity.</p>
        <Sources links={cementEmissionsSources} />
      </li>
      <li className="method-evidence">
        <h4>India’s carbon rules create financial exposure</h4>
        <p>October 2025 · India notified Carbon Credit Trading Scheme (CCTS) targets for cement and three other industries.</p>
        <ol className="carbon-compliance-flow" role="list" aria-label="Steps that can lead to a certificate purchase">
          <li>Emissions intensity target applies</li>
          <li>Plant misses target</li>
          <li>Plant may buy carbon credit certificates</li>
        </ol>
        <Sources links={[sources.pibCarbon]} />
      </li>
      <li className="method-evidence">
        <h4>Deep decarbonisation could be expensive</h4>
        <figure className="carbon-premium">
          <figcaption>Production cost premium over conventional plants<span className="sr-only">, {captureCostPremium.low}% to {captureCostPremium.high}% higher</span></figcaption>
          <div className="carbon-bar-track" aria-hidden="true"><span style={{ marginInlineStart: `${100 * captureCostPremium.low / captureCostPremium.high}%` }} /></div>
          <div className="carbon-premium-axis" aria-hidden="true"><span>0%</span><strong>+{captureCostPremium.low}%</strong><strong>+{captureCostPremium.high}%</strong></div>
        </figure>
        <p>International estimate for early commercial near-zero-emissions cement plants using carbon capture and storage.</p>
        <Sources links={[sources.ieaCement]} />
      </li>
    </ol>
    <section className="method-evidence carbon-rationale-conclusion">
      <h4>Decarbonisation</h4>
      <p>Lower-clinker cement and carbon capture can reduce process emissions.</p>
      <Sources links={[sources.cementDecarbonisation]} />
    </section>
  </>
}

function PriceBasis() {
  return <>
    <div className="metric-label">
      <h3 className="method-heading">Scenario prices used in the dashboard</h3>
      <MetricHelp label="scenario prices">US$ carbon price × rupees per US dollar, rounded to the nearest ₹100/tCO₂.</MetricHelp>
    </div>
    <div className="evidence-stats">
      {[baseline, future].map(scenario => <div key={scenario.year} className="evidence-stat">
        <h4>{scenario.year} scenario</h4><div>₹{whole(scenario.roundedRupees)} <small>/tCO₂</small></div>
      </div>)}
    </div>
    <p>The dashboard uses the EY-Parthenon central cement scenario and converts both dollar prices at the same FBIL October 2026 average rate.</p>
    <Disclosure id="carbon-method-scenario-price" title="EY-Parthenon scenario and rupee conversion">
      <p>EY-Parthenon starts at US${whole(baseline.dollars)}/tCO₂ in {baseline.year}. Its India price projection uses the mean of six EU growth benchmarks ({carbonGrowthBenchmarks.map(rate => `${two(rate)}%`).join(', ')}), about {two(carbonGrowthRate * 100)}% a year.</p>
      <p><code>US${whole(baseline.dollars)} × (1 + {carbonGrowthRate.toFixed(6)})<sup>{future.year - baseline.year}</sup> ≈ US${two(future.dollars)}/tCO₂</code> in {future.year}.</p>
      <p>Multiply both dollar prices by ₹{carbonExchangeRate} per US$1 and round to the nearest ₹100 per tonne.</p>
      <ul className="carbon-price-conversions">
        {[baseline, future].map(scenario => <li key={scenario.year}><strong>{scenario.year}</strong> · {money(scenario.rupees)}/tCO₂ → ₹{whole(scenario.roundedRupees)}/tCO₂</li>)}
      </ul>
      <Sources links={scenarioSources} />
    </Disclosure>
    <section className="method-evidence">
      <h4>What cement peers disclose</h4>
      <p>Three FY2025–26 internal carbon prices have a median of about ₹{whole(Math.round(peerMedian))} per tonne. It also rounds to <strong>₹{whole(Math.round(peerMedian / 100) * 100)}</strong>, corroborating the size of the {future.year} scenario price. These are internal planning prices.</p>
    </section>
    <Disclosure id="carbon-method-peer-prices" title="Shree Cement, Ambuja and UltraTech disclosures">
      <table className="method-data-table">
        <caption className="sr-only">FY2025–26 internal prices disclosed by cement peers</caption>
        <thead><tr><th scope="col">Company</th><th scope="col">Disclosed price</th><th scope="col">Rupee equivalent</th></tr></thead>
        <tbody>{peerPrices.map(peer => <tr key={peer.company}>
          <th scope="row">{peer.company}</th><td>{peer.disclosed}</td><td>₹{whole(Math.round(peer.rupees))}/{peer.unit}</td>
        </tr>)}</tbody>
      </table>
      <p>Dollar amounts use FBIL’s October 2026 rate. The table keeps each issuer’s disclosed emissions unit.</p>
      <Sources links={[...peerSources, sources.carbonFx]} />
    </Disclosure>
  </>
}

function CarbonSources() {
  return <>
    <h3 className="method-heading">Trace the method to its sources</h3>
    <Disclosure id="carbon-sources-plant" title="Nimbus plant inputs and method">
      <p>FY2025–26 direct emissions, revenue and the fixed-portfolio decision.</p>
      <Sources links={[sources.plant, sources.fixedPortfolio, sources.carbonRule]} />
    </Disclosure>
    <Disclosure id="carbon-sources-scenario" title="Scenario prices and currency">
      <p>EY-Parthenon’s cement scenario and growth assumptions, and FBIL’s exchange rate.</p>
      <Sources links={scenarioSources} />
    </Disclosure>
    <Disclosure id="carbon-sources-peers" title="Cement company disclosures">
      <p>FY2025–26 internal carbon prices disclosed by cement peers.</p>
      <Sources links={[...peerSources, sources.benchmark]} />
    </Disclosure>
    <Disclosure id="carbon-sources-ccts" title="CCTS targets and certificate pricing">
      <Sources links={complianceSources} />
    </Disclosure>
    <Disclosure id="carbon-sources-cement" title="Cement emissions and decarbonisation">
      <Sources links={[...cementEmissionsSources, sources.cementDecarbonisation, sources.ieaCement]} />
    </Disclosure>
  </>
}

export function CarbonMethod({ onTabChange }: { onTabChange: () => void }) {
  return <Tabs defaultValue="calculation" className="risk-method carbon-method" onValueChange={onTabChange}>
    <TabsList variant="line" className="method-tabs" aria-label="Carbon cost method topics">
      <TabsTrigger value="calculation">Calculation</TabsTrigger>
      <TabsTrigger value="rationale">Why carbon costs</TabsTrigger>
      <TabsTrigger value="price">Price basis</TabsTrigger>
      <TabsTrigger value="sources">Sources</TabsTrigger>
    </TabsList>
    <TabsContent value="calculation" className="method-panel" forceMount><CostCalculation /></TabsContent>
    <TabsContent value="rationale" className="method-panel" forceMount><CarbonRationale /></TabsContent>
    <TabsContent value="price" className="method-panel" forceMount><PriceBasis /></TabsContent>
    <TabsContent value="sources" className="method-panel method-source-panel" forceMount><CarbonSources /></TabsContent>
  </Tabs>
}
