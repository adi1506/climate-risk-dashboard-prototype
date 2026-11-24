import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Disclosure, Sources } from './evidence-components'
import { hotDaysCalculation } from './metric-calculations'
import { MetricHelp } from './metric-help'
import { heatChange, type Plant } from './assessment'
import { assessment, heatMethod, signed, sources, two, whole } from './report'

const { heatPriorityBenchmark, heatPriorityFactors, heatPriorityRanking, plants } = assessment

const weightLabels = { employees: 'Employees', cement: 'Cement', clinker: 'Clinker' }
const scaleInputNames = { employees: 'employees', cement: 'cement output', clinker: 'clinker output' }
const hotDayThreshold = 40
const holcimExposure = 44

const impactEvidence = [
  { id: 'workforce', label: 'Workforce productivity', impact: 'Heat can reduce working capacity and disrupt shifts.', links: [sources.ultraTechHeat, sources.ambujaHeat] },
  { id: 'health', label: 'Occupational health', impact: 'Heat can cause dehydration and heatstroke and make working conditions unsafe.', links: [sources.holcimImpacts, sources.shreeHeat] },
  { id: 'equipment', label: 'Equipment performance', impact: 'Higher temperatures can strain equipment and reduce its efficiency.', links: [sources.ambujaHeat, sources.shreeHeat] },
  { id: 'cost', label: 'Operating expenditure', impact: 'Higher cooling and energy demand can raise operating costs.', links: [sources.shreeHeat] },
  { id: 'continuity', label: 'Operational continuity', impact: 'Heat can slow production and delay transport.', links: [sources.holcimImpacts] },
  { id: 'assets', label: 'Asset integrity', impact: 'Prolonged heat can weaken infrastructure and reduce asset performance.', links: [sources.holcimImpacts] },
]

function ModelCounts({ plant }: { plant: Plant }) {
  const { baseline, future, latitude, longitude, modelCounts } = plant.heat
  return <Disclosure id="heat-method-model-counts" title="See the seven model counts">
    <p>{heatMethod} The median gives a central count when the models differ.</p>
    <p className="heat-method-grid-centre">NASA 0.25° grid centre · {latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E</p>
    <table className="method-data-table">
      <caption className="sr-only">{plant.name} days at or above {hotDayThreshold}°C by model and year</caption>
      <thead><tr><th scope="col">Climate model</th><th scope="col">2026 days</th><th scope="col">2040 days</th></tr></thead>
      <tbody>{modelCounts.map(count => <tr key={count.model}>
        <th scope="row">{count.model}</th><td>{whole(count.baseline)}</td><td>{whole(count.future)}</td>
      </tr>)}</tbody>
      <tfoot><tr><th scope="row">Median</th><td>{whole(baseline)}</td><td>{whole(future)}</td></tr></tfoot>
    </table>
    <dl className="method-formulas">
      <div><dt>Annual count per model</dt><dd><code>count(Tmax ≥ {hotDayThreshold}°C)</code></dd></div>
      <div><dt>Change in hot days</dt><dd><code>{future} − {baseline} = {signed(heatChange(plant))} days/year</code></dd></div>
    </dl>
    <Sources links={[sources.nasaSubset, sources.heatModels, sources.heatWorkbook]} />
  </Disclosure>
}

function WorkedExample({ plant }: { plant: Plant }) {
  const { baseline, future, modelCounts } = plant.heat
  const { factors, scale, raw, score, rank } = plant.heatPriority
  return <section className="method-example" aria-labelledby="heat-method-plant">
    <div className="method-example-header">
      <div>
        <h4 id="heat-method-plant">{plant.name} worked example</h4>
        <p>Median hot days · {future} in 2040 · {baseline} in 2026</p>
      </div>
      <div className="method-score"><strong>{score}/100</strong><span>Rank {rank} of {heatPriorityRanking.length}</span></div>
    </div>
    <dl className="method-formulas">
      <div>
        <dt>Weighted plant scale</dt>
        <dd>
          <code className="method-general-formula">{factors.map(({ key, weight }) => {
            const inputName = scaleInputNames[key]
            return `${weight.toFixed(2)} × (plant ${inputName} / max ${inputName})`
          }).join(' + ')}</code>
          <code className="method-equation">{factors.map(({ key, weight, input, maximum }, index) => {
            const format = key === 'employees' ? whole : two
            return <span key={key}>{index > 0 && ' + '}{maximum > 0 ? `${weight.toFixed(2)} × (${format(input)}/${format(maximum)})` : '0'}</span>
          })}<span> ≈ {scale.toFixed(4)}</span></code>
          <p className="method-note">Each max is the highest value across the {heatPriorityRanking.length} plants. Cement and clinker output are in million tonnes (Mt).</p>
        </dd>
      </div>
      <div>
        <dt>Raw priority</dt>
        <dd>
          <code className="method-general-formula">Median hot days in 2040 × weighted plant scale</code>
          <code>{future} × {scale.toFixed(7)} ≈ {raw.toFixed(4)}</code>
          <p className="method-note">2040 is the projection year. The median is the middle count across {modelCounts.length} climate models.</p>
        </dd>
      </div>
      <div>
        <dt>Heat Priority Score</dt>
        <dd>
          <code className="method-general-formula">round(100 × plant raw priority / highest portfolio raw priority)</code>
          <code>{heatPriorityBenchmark > 0
            ? `round(100 × ${raw.toFixed(4)} / ${heatPriorityBenchmark.toFixed(4)}) = ${score}`
            : '0 (all raw priorities are 0)'}</code>
        </dd>
      </div>
    </dl>
    <p className="method-note">{heatPriorityRanking[0].name} has the highest raw priority at {heatPriorityBenchmark.toFixed(4)}. Calculations and ranks use unrounded values.</p>
  </section>
}

function ScoreMethod() {
  const plant = plants.get('P03') ?? heatPriorityRanking[0]
  return <>
    <div className="metric-label">
      <h3 className="method-heading">From hot days to priority</h3>
      <MetricHelp label="hot days">{hotDaysCalculation}</MetricHelp>
    </div>
    <ol className="method-steps">
      <li><span aria-hidden="true">1</span>Count hot days</li>
      <li><span aria-hidden="true">2</span>Weight plant inputs</li>
      <li><span aria-hidden="true">3</span>Scale to 100</li>
    </ol>
    <dl className="heat-method-weights" aria-label="Plant input weights"
      style={{ gridTemplateColumns: heatPriorityFactors.map(({ weight }) => `minmax(0, ${weight}fr)`).join(' ') }}>
      {heatPriorityFactors.map(({ key, weight }) => <div key={key}>
        <dt>{weightLabels[key]}</dt><dd>{whole(100 * weight)}%</dd>
      </div>)}
    </dl>
    <WorkedExample plant={plant} />
    <ModelCounts plant={plant} />
    <Disclosure id="heat-method-weights" title="Why these inputs and weights?">
      <p>The score gives half the weight to workforce size and splits the production half between cement and clinker.</p>
      <p>Employees represent the workforce that could be affected. Cement output represents finishing and handling. Clinker output represents onsite kiln and cooling operations. Grinding units report zero onsite clinker output.</p>
      <p>Each input is divided by its portfolio maximum. Cement and clinker use FY2025–26 output in million tonnes (Mt).</p>
      <Sources links={[sources.heatReport, sources.plant]} />
    </Disclosure>
    <p className="method-note">The score ranks plants for follow-up. The two modelled years use SSP2–4.5, and their difference can reflect year-to-year variability.</p>
  </>
}

function HeatRationale() {
  return <>
    <h3 className="method-heading">Why screen for extreme heat?</h3>
    <section className="method-evidence">
      <h4>UltraTech Cement</h4>
      <p>UltraTech screened over 60 Indian sites and found extreme heat and floods were the most significant of ten perils.</p>
      <Sources links={[sources.ultraTechHeat]} />
    </section>
    <section className="method-evidence">
      <h4>Holcim</h4>
      <p className="heat-method-exposure"><strong>{holcimExposure}%</strong><span>of 377 assessed sites had current exposure to extreme temperatures.</span></p>
      <div className="heat-method-exposure-chart" aria-hidden="true">
        <div className="heat-method-exposure-track"><div style={{ width: `${holcimExposure}%` }} /></div>
        <div className="heat-method-exposure-scale"><span>0%</span><span>100%</span></div>
      </div>
      <Sources links={[sources.holcimExposure]} />
    </section>
    <h3 className="method-heading heat-method-impacts-heading">How heat affects cement plants</h3>
    <div className="heat-method-impacts">
      {impactEvidence.map(({ id, label, impact, links }) => <Disclosure key={id} id={`heat-impact-${id}`} title={label} name="cement-heat-impacts">
        <p>{impact}</p><Sources links={links} />
      </Disclosure>)}
    </div>
  </>
}

function ThresholdRationale() {
  return <>
    <h3 className="method-heading">What counts as a hot day?</h3>
    <p className="heat-method-threshold">Annual days with daily maximum ≥{hotDayThreshold}°C</p>
    <p className="method-note">Three illustrative daily maximums</p>
    <dl className="heat-method-threshold-examples">
      {[39.9, 40, 40.1].map(temperature => <div key={temperature} data-counted={temperature >= hotDayThreshold}>
        <dt>{temperature.toFixed(1)}°C</dt><dd>{temperature >= hotDayThreshold ? '1 day' : '0 days'}</dd>
      </div>)}
    </dl>
    <section className="method-evidence">
      <h4>Industry precedent</h4>
      <p>JK Lakshmi Cement reports days above 40°C in its physical risk assessment of the Sirohi plant.</p>
      <Sources links={[sources.jkLakshmiHeat]} />
    </section>
    <section className="method-evidence">
      <h4>Scientific basis</h4>
      <p>40°C is IMD’s minimum temperature for considering heatwave conditions in India’s plains. IMD applies additional criteria when declaring a heatwave.</p>
      <Sources links={[sources.imdHeat]} />
    </section>
    <section className="method-evidence">
      <h4>Comparable across plants</h4>
      <p>A common threshold tracks repeated heat relevant to workers, equipment and cooling demand. It can be applied to historical observations and future SSP projections.</p>
    </section>
  </>
}

function HeatSources() {
  return <>
    <h3 className="method-heading">Trace the method to its sources</h3>
    <section className="method-evidence">
      <h4>Climate data</h4>
      <p>Daily maximum temperature · Seven models · SSP2–4.5</p>
      <Sources links={[sources.nasa, sources.nasaSubset, sources.heatModels, sources.heatWorkbook]} />
    </section>
    <section className="method-evidence">
      <h4>Plant inputs and method</h4>
      <p>Coordinates, reported employees and FY2025–26 cement and clinker output.</p>
      <Sources links={[sources.plant, sources.heatReport]} />
    </section>
    <section className="method-evidence">
      <h4>Why we screen for heat</h4>
      <Sources links={[sources.ultraTechHeat, sources.holcimExposure, sources.heatBenchmark]} />
    </section>
    <section className="method-evidence">
      <h4>Why we use 40°C</h4>
      <Sources links={[sources.jkLakshmiHeat, sources.imdHeat]} />
    </section>
  </>
}

export function HeatMethod({ onTabChange }: { onTabChange: () => void }) {
  return <Tabs defaultValue="score" className="risk-method" onValueChange={onTabChange}>
    <TabsList variant="line" className="method-tabs" aria-label="Extreme heat method topics">
      <TabsTrigger value="score">Score</TabsTrigger>
      <TabsTrigger value="rationale">Why heat</TabsTrigger>
      <TabsTrigger value="threshold">Why 40°C?</TabsTrigger>
      <TabsTrigger value="sources">Sources</TabsTrigger>
    </TabsList>
    <TabsContent value="score" className="method-panel" forceMount><ScoreMethod /></TabsContent>
    <TabsContent value="rationale" className="method-panel" forceMount><HeatRationale /></TabsContent>
    <TabsContent value="threshold" className="method-panel" forceMount><ThresholdRationale /></TabsContent>
    <TabsContent value="sources" className="method-panel method-source-panel" forceMount><HeatSources /></TabsContent>
  </Tabs>
}
