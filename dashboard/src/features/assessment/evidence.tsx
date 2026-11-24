import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { CarbonMethod } from './carbon-method'
import { PlantPeriodComparison } from './charts'
import { Disclosure, Sources } from './evidence-components'
import { HeatMethod } from './heat-method'
import { carbonShareCalculation, heatChangeCalculation, heatPriorityCalculation } from './metric-calculations'
import { MetricHelp } from './metric-help'
import { plantHref, ReportLink, topics, useNavigation, type Risk } from './navigation'
import { heatChange, rupeesPerCrore, type Plant } from './assessment'
import { assessment, carbonBasis, carbonCaveat, heatBasis, heatMethod, material, money, shipments, signed, sources, two, whole } from './report'

const { carbonScenario, heatPriorityBenchmark, plants } = assessment

function Facts({ items }: { items: [string, ReactNode, string?][] }) {
  return <dl className="evidence-facts">{items.map(([label, value, calculation]) => <div key={label}>
    <dt className={calculation ? 'metric-label' : undefined}>{label}{calculation && <MetricHelp label={label.toLowerCase()}>{calculation}</MetricHelp>}</dt>
    <dd>{value}</dd>
  </div>)}</dl>
}

function HeatEvidence({ plant }: { plant: Plant }) {
  const { future, latitude, longitude } = plant.heat
  const { factors, scale, raw, score, rank } = plant.heatPriority
  return <>
    <PlantPeriodComparison plant={plant} risk="heat" />
    <p className="evidence-note">{heatBasis}. Workplace exposure also depends on humidity, process heat and workload.</p>
    <Facts items={[
      ['Change in hot days', `${signed(heatChange(plant))} days/year`, heatChangeCalculation],
      ['2040 Heat Priority Score', `${score}/100 · Rank ${rank}`, heatPriorityCalculation],
    ]} />
    <Disclosure id="heat-calculation" title="Heat Priority Score calculation" initiallyOpen>
      <p>Each input is divided by its portfolio maximum and multiplied by its weight.</p>
      <Facts items={factors.map(({ key, label, input, maximum, weight, contribution }) => {
        const format = key === 'employees' ? whole : material
        return [label, <code key={key}>{maximum > 0
          ? <>{whole(100 * weight)}% × {format(input)} ÷ {format(maximum)} ≈ {contribution.toFixed(4)}</>
          : 'No recorded value across the portfolio. Contribution is 0.'}</code>]
      })} />
      <Facts items={[
        ['Sum of weighted inputs', <code key="sum">{factors.map(factor => factor.contribution.toFixed(4)).join(' + ')} ≈ {scale.toFixed(4)}</code>],
        ['Raw priority', <code key="raw">{future} hot days × {scale.toFixed(4)} ≈ {raw.toFixed(4)}</code>],
        ['Scale to 100', <code key="score">{heatPriorityBenchmark > 0
          ? <>100 × {raw.toFixed(4)} ÷ {heatPriorityBenchmark.toFixed(4)} → {score}/100</>
          : 'The highest raw priority is 0. All plants score 0.'}</code>],
      ]} />
      <p>The denominator is the highest raw priority in the portfolio. Ranking uses unrounded values.</p>
      <Sources links={[sources.plant, sources.heatReport]} />
    </Disclosure>
    <Disclosure id="heat-source" title="Hot-day counts and sources">
      <p>{heatMethod}</p>
      <Facts items={[[ 'NASA 0.25° grid centre', `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E` ]]} />
      <Sources links={[sources.nasa, sources.heatModels]} />
    </Disclosure>
    {plant.notes && <Disclosure id="plant-context" title="Plant context"><p>{plant.notes}</p></Disclosure>}
  </>
}

function CarbonEvidence({ plant }: { plant: Plant }) {
  const { baseline, future } = carbonScenario
  return <>
    <PlantPeriodComparison plant={plant} risk="carbon" />
    <Facts items={[
      ['2040 carbon cost share', `${two(plant.costShare)}% · Rank ${plant.carbonRank}`, carbonShareCalculation],
      ['FY2025–26 direct CO₂', `${whole(plant.emissions)} kt`],
      ['FY2025–26 revenue', `₹${whole(plant.revenue)} crore`],
    ]} />
    <p className="evidence-note">{carbonCaveat}</p>
    <Disclosure id="carbon-calculation" title="Calculation and sources">
      <h3>{baseline.year} annual sensitivity</h3><p><code>{whole(plant.emissions * 1000)} t × ₹{whole(baseline.roundedRupees)}/t ÷ {whole(rupeesPerCrore)} = {money(plant.baselineSensitivity)} crore/year</code></p>
      <h3>{future.year} annual sensitivity</h3><p><code>{whole(plant.emissions * 1000)} t × ₹{whole(future.roundedRupees)}/t ÷ {whole(rupeesPerCrore)} = {money(plant.futureSensitivity)} crore/year</code></p>
      <h3>{future.year} Carbon Cost Share</h3><p><code>{money(plant.futureSensitivity)} ÷ ₹{whole(plant.revenue)} × 100 ≈ {two(plant.costShare)}%</code></p>
      <Sources links={[sources.plant, sources.eyCement, sources.carbonRule, sources.ccts]} />
    </Disclosure>
  </>
}

function ClinkerEvidence({ plant, topic }: { plant: Plant; topic: Risk }) {
  const { route } = useNavigation()
  const related = shipments.filter(shipment => shipment.from === plant.id || shipment.to === plant.id)
  if (!related.length) return null
  const supplied = related[0].from === plant.id
  const total = related.reduce((sum, shipment) => sum + shipment.tonnes, 0)
  return <Disclosure id="clinker-commitments" title="Clinker commitments">
    <p><strong>{material(total)}/year</strong> {supplied ? 'supplied to' : 'received from'}</p>
    <ul>{related.map(shipment => {
      const linked = plants.get(supplied ? shipment.to : shipment.from)!
      return <li key={linked.id}><ReportLink id={`clinker-${linked.id}`} href={plantHref(route.section, linked.id, topic)}>{linked.name}</ReportLink> · {material(shipment.tonnes)}/year</li>
    })}</ul>
    <Sources links={[sources.plant]} />
  </Disclosure>
}

const evidencePanels = { heat: HeatEvidence, carbon: CarbonEvidence }

function PlantEvidence({ plant, topic }: { plant: Plant; topic: Risk }) {
  const { route } = useNavigation()
  const Panel = evidencePanels[topic]
  return <>
    <nav className="evidence-nav" aria-label="Plant evidence topics">
      {(Object.entries(topics) as [Risk, string][]).map(([key, label]) => <ReportLink key={key} id={`evidence-topic-${key}`}
        href={plantHref(route.section, plant.id, key)} replace aria-current={key === topic ? 'page' : undefined}>{label}</ReportLink>)}
    </nav>
    <section aria-label={topics[topic]}><Panel plant={plant} /><ClinkerEvidence plant={plant} topic={topic} /></section>
  </>
}

export function Evidence() {
  const { close, entry, route } = useNavigation()
  const active = route.evidence
  const isOpen = Boolean(active)
  const plant = active?.kind === 'plant' ? plants.get(active.plant) : undefined
  const risk = active?.kind === 'method' ? active.risk : undefined
  const heatMethodOpen = risk === 'heat'
  const title = plant?.name ?? (heatMethodOpen ? 'Extreme heat method' : 'Carbon cost method')
  const description = plant ? `${plant.state} · ${plant.type === 'Integrated' ? 'Integrated works' : plant.type}` : heatMethodOpen ? 'How Nimbus prioritises plant follow-up.' : carbonBasis
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const resetBodyScroll = () => bodyRef.current?.scrollTo(0, 0)

  useLayoutEffect(() => {
    if (!isOpen) return
    const origin = entry.focusId && document.getElementById(entry.focusId)
    if (bodyRef.current) bodyRef.current.scrollTop = entry.evidenceScroll ?? 0
    const target = origin && bodyRef.current?.contains(origin) ? origin : titleRef.current
    target?.focus({ preventScroll: true })
  }, [title, entry, isOpen])

  return <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) close() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="evidence-overlay" />
      <Dialog.Content className={risk ? 'evidence-drawer method-drawer' : 'evidence-drawer'} onOpenAutoFocus={event => { event.preventDefault(); titleRef.current?.focus() }}
        onCloseAutoFocus={event => event.preventDefault()}>
        <div className="evidence-header">
          <div><Dialog.Title ref={titleRef} tabIndex={-1}>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div>
          <Dialog.Close className="icon-link" aria-label="Close evidence"><X size={20} aria-hidden="true" /></Dialog.Close>
        </div>
        <div className={risk ? 'evidence-body method-body' : 'evidence-body'} ref={bodyRef}>
          {plant && active?.kind === 'plant' && <PlantEvidence key={`${plant.id}/${active.topic}`} plant={plant} topic={active.topic} />}
          {heatMethodOpen && <HeatMethod onTabChange={resetBodyScroll} />}
          {risk === 'carbon' && <CarbonMethod onTabChange={resetBodyScroll} />}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
