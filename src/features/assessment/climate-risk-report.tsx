'use client'

import { Tooltip } from 'radix-ui'
import { Conclusions } from './conclusions'
import { Dashboard, Header } from './dashboard'
import { RiskDetails } from './details'
import { Evidence } from './evidence'
import { ReportNavigation, sections, useNavigation } from './navigation'
import { assessment } from './report'

const views = {
  overview: Dashboard,
  heat: () => <RiskDetails risk="heat" />,
  carbon: () => <RiskDetails risk="carbon" />,
  conclusions: Conclusions,
}

function Report() {
  const { route: { section, evidence } } = useNavigation()
  const View = views[section]
  const title = evidence?.kind === 'plant' ? assessment.plants.get(evidence.plant)!.name
    : evidence?.kind === 'method' ? `${sections[evidence.risk]} method`
    : section === 'overview' ? 'Climate risk overview' : sections[section]

  return <>
    <title>{`${title} · Nimbus Cement`}</title>
    <a href="#main-content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('main-content')?.focus()
    }}>Skip to report</a>
    <Header />
    <main className="frame" id="main-content" tabIndex={-1} key={section}><View /></main>
    {section !== 'overview' && <footer className="frame site-footer">
      {section !== 'carbon' && 'NASA NEX-GDDP-CMIP6 · '}{section !== 'heat' && 'EY-Parthenon · '}Nimbus Cement plant data
    </footer>}
    <Evidence />
  </>
}

export function ClimateRiskReport() {
  return <Tooltip.Provider delayDuration={200}><ReportNavigation><Report /></ReportNavigation></Tooltip.Provider>
}
