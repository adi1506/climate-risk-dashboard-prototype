import { ChevronRight, X } from 'lucide-react'
import { useRef } from 'react'
import { Popover } from 'radix-ui'
import { Card } from '@/components/ui/card'
import { carbonSensitivityCalculation, carbonShareCalculation } from './metric-calculations'
import { exposureBands, exposureScale, rupeesPerCrore } from './assessment'
import { assessment, money, two, whole } from './report'

const { carbonScenario, portfolio, portfolioExposure, totals } = assessment
const { baseline, future } = portfolioExposure
const { componentMax, max, reviewScore, heatDivisor, carbonMultiplier } = exposureScale
const examplePlant = portfolio[0]
const heatWeights = future.heatFactors.map(({ key, weight }) => `${whole(weight * 100)}% ${key === 'employees' ? 'workforce' : key}`).join(' + ')
const weightedDays = future.heatFactors.map(({ weight, days }) => `${two(weight)} × ${two(days)}`).join(' + ')

function ExposureWalkthrough() {
  const title = useRef<HTMLHeadingElement>(null)

  return <Popover.Portal>
    <Popover.Content className="exposure-walkthrough" align="end" sideOffset={10} collisionPadding={12} aria-modal="true"
      aria-labelledby="exposure-walkthrough-title" aria-describedby="exposure-walkthrough-year"
      onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus() }}>
      <div className="exposure-walkthrough-header">
        <div>
          <h2 id="exposure-walkthrough-title" ref={title} tabIndex={-1}>Calculation walkthrough</h2>
          <p id="exposure-walkthrough-year">{future.year} worked example</p>
        </div>
        <Popover.Close className="icon-link" aria-label="Close calculation walkthrough"><X size={19} aria-hidden="true" /></Popover.Close>
      </div>
      <div className="exposure-walkthrough-body" tabIndex={0} role="region" aria-label="Worked calculation">
        <div className="exposure-walkthrough-columns">
          <section className="exposure-worked heat" aria-labelledby="worked-heat-title">
            <h3 id="worked-heat-title">Extreme heat</h3>
            <ol className="exposure-steps">
              <li><h4>1. Count hot days</h4><div>
                <p>Middle count across {examplePlant.heat.modelCounts.length} climate models</p>
                <p className="exposure-example">{examplePlant.name} · {whole(examplePlant.heat.future)} days at 40°C or above</p>
              </div></li>
              <li><h4>2. Weight across plants</h4><div>
                <p>{heatWeights}</p>
                <p className="exposure-example">{weightedDays} ≈ {two(future.hotDays)} days</p>
              </div></li>
              <li><h4>3. Convert days to points</h4><div>
                <p>Weighted hot days ÷ {heatDivisor}, up to {componentMax} points</p>
                <p className="exposure-example">{two(future.hotDays)} ÷ {heatDivisor} ≈ {two(future.heatPoints)} points</p>
              </div></li>
            </ol>
          </section>
          <section className="exposure-worked carbon" aria-labelledby="worked-carbon-title">
            <h3 id="worked-carbon-title">Carbon cost</h3>
            <ol className="exposure-steps">
              <li><h4>1. Price direct emissions</h4><div>
                <p>{carbonSensitivityCalculation}</p>
                <p className="exposure-example">{whole(totals.directEmissions)} × ₹{whole(carbonScenario.future.roundedRupees)} ÷ {whole(rupeesPerCrore)} = {money(future.annualSensitivity)} crore</p>
              </div></li>
              <li><h4>2. Find share of revenue</h4><div>
                <p>{carbonShareCalculation}</p>
                <p className="exposure-example">{money(future.annualSensitivity)} crore ÷ ₹{whole(totals.revenue)} crore × 100 ≈ {two(future.carbonShare)}%</p>
              </div></li>
              <li><h4>3. Convert cost share to points</h4><div>
                <p>Carbon Cost Share × {carbonMultiplier}, up to {componentMax} points</p>
                <p className="exposure-example">{two(future.carbonShare)} × {carbonMultiplier} ≈ {two(future.carbonPoints)} points</p>
              </div></li>
            </ol>
          </section>
        </div>
        <div className="exposure-total">
          <div><h3>Overall score</h3><p>Add heat and carbon points, then round once.</p></div>
          <dl>
            <div><dt>{baseline.year} baseline</dt><dd>{two(baseline.heatPoints)} + {two(baseline.carbonPoints)} → {baseline.score} / {max}</dd></div>
            <div><dt>{future.year} scenario</dt><dd>{two(future.heatPoints)} + {two(future.carbonPoints)} → {future.score} / {max}</dd></div>
          </dl>
        </div>
        <p className="exposure-walkthrough-note">Fixed FY2025–26 plant data · Carbon cost is a scenario sensitivity</p>
      </div>
      <Popover.Arrow className="exposure-walkthrough-arrow" width={16} height={8} />
    </Popover.Content>
  </Popover.Portal>
}

export function ExposureTimeline() {
  return <dl className="exposure-timeline">
    {([[baseline, 'baseline'], [future, 'scenario']] as const).map(([{ year, score, band }, label]) => (
      <div key={year} data-exposure-band={band?.id}>
        <dt>{year} {label}</dt>
        <dd><strong>{score} <small>/ {max}</small></strong><span>{band?.label}</span></dd>
      </div>
    ))}
  </dl>
}

export function ExposureScore() {
  return <Popover.Root modal>
    <Card className="panel first-check-panel exposure-panel" role="region" aria-labelledby="exposure-title">
      <div className="exposure-comparison">
        <h2 id="exposure-title">Overall Business Exposure to Climate Risk Score</h2>
        <p className="first-check-note">Screening index · {portfolio.length} plants · Heat and carbon</p>
        <ExposureTimeline />
      </div>
      <div className="exposure-scale">
        <h3>How to read the score</h3>
        <ul className="exposure-bands">
          {exposureBands.map(({ id, from, to, label }) => <li key={id} data-exposure-band={id}>
            <strong>{from}–{to}</strong><span>{label}</span>
          </li>)}
        </ul>
        <p className="first-check-note">Review line · {reviewScore} / {max}</p>
      </div>
      <div className="exposure-footer">
        <div className="exposure-components">
          <p id="exposure-components-label">{future.year} components</p>
          <dl aria-labelledby="exposure-components-label">
            <div className="heat"><dt>Extreme heat</dt><dd>{two(future.heatPoints)} / {componentMax}</dd></div>
            <div className="carbon"><dt>Carbon cost</dt><dd>{two(future.carbonPoints)} / {componentMax}</dd></div>
          </dl>
        </div>
        <Popover.Trigger type="button" className="exposure-method-trigger">How the score is calculated <ChevronRight size={17} aria-hidden="true" /></Popover.Trigger>
      </div>
    </Card>
    <ExposureWalkthrough />
  </Popover.Root>
}
