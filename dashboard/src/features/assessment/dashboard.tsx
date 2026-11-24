import { ArrowRight, ArrowUpRight, CalendarDays, ClipboardList, Factory, Thermometer, TrendingUp, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeatLegend, PlantPlot, RevenueRing } from './charts'
import {
  averageHeatChangeCalculation, carbonSensitivityCalculation, carbonShareCalculation, combinedPriorityCalculation,
  exposureCalculation, heatChangeCalculation, hotDaysCalculation,
} from './metric-calculations'
import { MetricHelp } from './metric-help'
import { plantHref, ReportLink, sections, useNavigation, type Section } from './navigation'
import { heatChange } from './assessment'
import { assessment, money, one, signed, two, whole } from './report'

const { averageHeatChange, carbonRanking, carbonScenario, combinedPriority, heatDaysRanking, heatIncrease, portfolioExposure, priorityPlants, totals } = assessment

export function Header() {
  const { route } = useNavigation()
  return <header className="site-header">
    <div className="frame header-inner">
      <ReportLink id="home-link" href="#overview" className="brand">
        <span className="brand-mark"><Factory size={19} strokeWidth={1.75} aria-hidden="true" /></span>
        <span><strong>Nimbus Cement</strong><small>Climate risk report</small></span>
      </ReportLink>
      <nav className="header-nav" aria-label="Report sections">
        {(Object.entries(sections) as [Section, string][]).map(([section, title]) =>
          <ReportLink key={section} id={`nav-${section}`} href={`#${section}`} aria-current={route.section === section ? 'page' : undefined}>{title}</ReportLink>)}
      </nav>
      <span className="portfolio-period"><CalendarDays size={15} aria-hidden="true" /> FY2025–26 portfolio</span>
    </div>
  </header>
}

function Stat({ label, value, note, tone, href, visual, calculation }: {
  label: string; value: ReactNode; note: string; tone: string; href: string; visual?: ReactNode; calculation: string
}) {
  return <Card className="panel stat-card">
    <ReportLink href={href} id={`stat-${label.toLowerCase().replaceAll(' ', '-')}`} className="stat-content">
      <div className="stat-top">{label}</div>
      <div className="stat-value">{value}</div>
      <p>{note}</p>
      {visual}
    </ReportLink>
    <MetricHelp label={label.toLowerCase()} className={`metric-icon ${tone}`}>{calculation}</MetricHelp>
  </Card>
}

function ChartHeading({ title, subtitle, kind, href }: { title: string; subtitle: string; kind: 'heat' | 'carbon'; href: string }) {
  return <div className="panel-heading">
    <div className="panel-name">
      <span className={`metric-icon ${kind}`}>
        {kind === 'heat' ? <Thermometer size={18} aria-hidden="true" /> : <Wallet size={17} aria-hidden="true" />}
      </span>
      <div>
        <div className="metric-label"><h2>{title}</h2>
          <MetricHelp label={kind === 'heat' ? 'hot days' : 'carbon cost share'}>{kind === 'heat' ? hotDaysCalculation : carbonShareCalculation}</MetricHelp>
        </div>
        <p>{subtitle}</p>
      </div>
    </div>
    <ReportLink href={href} id={`chart-${kind}`} className="icon-link" aria-label={`View ${title.toLowerCase()} comparison`}>
      <ArrowUpRight size={18} aria-hidden="true" />
    </ReportLink>
  </div>
}

function PanelLink({ href, id, children }: { href: string; id: string; children: ReactNode }) {
  return <ReportLink className="panel-link" id={id} href={href}>{children}<ArrowRight size={15} aria-hidden="true" /></ReportLink>
}

function OverviewExposure() {
  const { baseline, future } = portfolioExposure
  return <section className="panel overview-exposure" aria-labelledby="overview-exposure-title">
    <div className="metric-label">
      <h2 id="overview-exposure-title">Overall business exposure score</h2>
      <MetricHelp label="overall business exposure">{exposureCalculation}</MetricHelp>
    </div>
    <dl className="overview-exposure-values">
      {[baseline, future].map(({ year, score }) => <div key={year}>
        <dt>{year}</dt><dd><strong>{one(score)}</strong> <small>/ 100</small></dd>
      </div>)}
    </dl>
    <PanelLink href="#conclusions" id="overview-conclusions">View conclusions</PanelLink>
  </section>
}

export function Dashboard() {
  const baseline = heatIncrease.heat.baseline
  const future = heatIncrease.heat.future
  const change = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, signDisplay: 'exceptZero' }).format(averageHeatChange)
  return <>
    <div className="page-heading overview-heading">
      <div>
        <h1 id="page-heading" tabIndex={-1}>Climate risk overview</h1>
        <p>Physical and transition exposure across the assessment portfolio.</p>
      </div>
    </div>

    <section className="stats-grid" aria-label="Portfolio highlights">
      <OverviewExposure />
      <Stat label="Average increase in hot days" value={<>{change} <small>days/year</small></>}
        note="2026 → 2040 · Highs ≥40°C" tone="heat" href="#heat"
        calculation={averageHeatChangeCalculation} />
      <Stat label="2040 annual carbon sensitivity" value={<>{money(totals.futureSensitivity)} <small>cr</small></>}
        note={`Scenario at ₹${whole(carbonScenario.future.roundedRupees)}/tCO₂`} tone="carbon" href="#carbon"
        calculation={carbonSensitivityCalculation} />
      <Stat label="2040 portfolio carbon cost share" value={`${two(totals.share)}%`}
        note="Of FY2025–26 plant revenue" tone="carbon" href="#carbon" calculation={carbonShareCalculation}
        visual={<RevenueRing share={totals.share} />} />
    </section>

    <div className="dashboard-grid">
      <Card className="panel risk-panel" role="region" aria-label="Extreme heat preview">
        <ChartHeading kind="heat" title="Extreme heat" subtitle="Physical risk · Days/year at ≥40°C" href="#heat" />
        <div className="plot-meta"><span>Top 5 by 2040 hot days</span><HeatLegend /></div>
        <PlantPlot view="heat" ranking={heatDaysRanking.slice(0, 5)} />
        <div className="panel-footer"><PanelLink href="#heat" id="all-heat">Explore extreme heat</PanelLink></div>
      </Card>
      <Card className="panel risk-panel" role="region" aria-label="Carbon cost preview">
        <ChartHeading kind="carbon" title="Carbon cost pressure" subtitle="2040 scenario · Share of plant revenue" href="#carbon" />
        <div className="plot-meta"><span>Top 5 plants</span><span className="plot-legend"><span><i className="swatch carbon" />Carbon cost share</span></span></div>
        <PlantPlot view="carbonShare" ranking={carbonRanking.slice(0, 5)} />
        <div className="panel-footer"><PanelLink href="#carbon" id="all-carbon">Explore carbon cost</PanelLink></div>
      </Card>

      <Card className="panel checks-panel" role="region" aria-labelledby="checks-preview-title">
        <div className="panel-heading">
          <div className="panel-name">
            <span className="metric-icon navy"><ClipboardList size={17} aria-hidden="true" /></span>
            <div className="metric-label"><h2 id="checks-preview-title">Top {priorityPlants.length} priority plants</h2><MetricHelp label="combined plant priority">{combinedPriorityCalculation}</MetricHelp></div>
          </div>
        </div>
        <ol className="checks-preview" aria-label="Combined heat and carbon priorities">
          {priorityPlants.map((plant, index) => <li key={plant.id}><ReportLink href={plantHref('overview', plant.id, 'heat')} id={`check-preview-${plant.id}`}>
            <span className="check-rank" aria-hidden="true">{index + 1}</span><span className="check-name">{plant.name}</span>
            <span className="check-focus">Heat #{plant.heatPriority.rank} · Carbon #{plant.carbonRank}</span>
            <span className="check-score"><span className="sr-only">Combined priority </span>{combinedPriority(plant)}/100</span>
            <ArrowUpRight size={15} aria-hidden="true" className="check-arrow" />
          </ReportLink></li>)}
        </ol>
      </Card>

      <Card className="panel change-panel" role="region" aria-labelledby="change-title">
        <div className="panel-heading">
          <div className="panel-name">
            <span className="metric-icon heat"><TrendingUp size={17} aria-hidden="true" /></span>
            <div className="metric-label"><h2 id="change-title">Largest projected heat rise</h2><MetricHelp label="the largest projected heat rise">{heatChangeCalculation}</MetricHelp></div>
          </div>
          <ReportLink href={plantHref('overview', heatIncrease.id, 'heat')} id="heat-rise" aria-label={`View ${heatIncrease.name} heat evidence`} className="icon-link"><ArrowUpRight size={18} aria-hidden="true" /></ReportLink>
        </div>
        <div className="change-content">
          <div><strong className="change-value">{signed(heatChange(heatIncrease))} <small>days/year</small></strong><p>{heatIncrease.name}</p></div>
          <dl className="period-values">
            <div><dt>2026</dt><dd>{baseline}</dd></div><ArrowRight size={16} aria-hidden="true" /><div><dt>2040</dt><dd>{future}</dd></div>
          </dl>
        </div>
      </Card>
    </div>
  </>
}

export function BackToOverview() {
  return <ReportLink href="#overview" id="back-to-overview" className={buttonVariants({ variant: 'outline', className: 'back-link' })}>
    <ArrowRight className="back-arrow" aria-hidden="true" />Overview
  </ReportLink>
}
