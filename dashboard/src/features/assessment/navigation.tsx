import { createContext, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react'
import { assessment } from './report'

const { plants } = assessment

export const sections = {
  overview: 'Overview',
  heat: 'Extreme heat',
  carbon: 'Carbon cost',
  conclusions: 'Conclusions',
} as const
export const topics = { heat: 'Extreme heat', carbon: 'Carbon cost' } as const
export type Section = keyof typeof sections
export type Risk = keyof typeof topics
type Evidence = { kind: 'plant'; plant: string; topic: Risk } | { kind: 'method'; risk: Risk }
export type Route = { section: Section; evidence?: Evidence }

function readRoute(hash: string): Route {
  const [requested, selection, requestedTopic] = hash.slice(1).split('/')
  const destination = requested === 'water' ? 'heat' : requested === 'follow-up' ? 'conclusions' : requested
  const section = Object.hasOwn(sections, destination) ? destination as Section : 'overview'
  if (selection === 'method' && (section === 'heat' || section === 'carbon')) {
    return { section, evidence: { kind: 'method', risk: section } }
  }
  if (plants.has(selection)) {
    const candidate = requestedTopic === 'water' ? 'heat' : requestedTopic
    const defaultTopic = section === 'carbon' ? 'carbon' : 'heat'
    const topic = Object.hasOwn(topics, candidate) ? candidate as Risk : defaultTopic
    return { section, evidence: { kind: 'plant', plant: selection, topic } }
  }
  return { section }
}

type Entry = {
  from?: string
  focusId?: string
  scroll?: number
  evidenceScroll?: number
  disclosures?: string[]
}

const navigationEvent = 'nimbus:report-navigation'
const initialLocation = { hash: '', entry: {} as Entry }
let snapshot = initialLocation
let lastEntry: Entry | undefined

const historyEntry = (): Entry | undefined => history.state?.nimbusReport
const serverLocation = () => initialLocation

function browserLocation() {
  const hash = window.location.hash
  const entry = historyEntry()
  if (hash !== snapshot.hash || entry !== lastEntry) {
    lastEntry = entry
    snapshot = { hash, entry: entry ?? {} }
  }
  return snapshot
}

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener)
  window.addEventListener('hashchange', listener)
  window.addEventListener(navigationEvent, listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener('hashchange', listener)
    window.removeEventListener(navigationEvent, listener)
  }
}

const savePosition = (focusId?: string) => {
  const evidenceBody = document.querySelector('.evidence-body')
  history.replaceState({
    ...history.state,
    nimbusReport: {
      ...historyEntry(),
      focusId,
      scroll: window.scrollY,
      evidenceScroll: evidenceBody?.scrollTop,
      disclosures: Array.from(evidenceBody?.querySelectorAll('details[open]') ?? [], element => element.id),
    } satisfies Entry,
  }, '')
}

type Navigation = {
  route: Route
  entry: Entry
  go: (href: string, focusId?: string, replace?: boolean) => void
  close: () => void
}
const NavigationContext = createContext<Navigation | null>(null)
export const useNavigation = () => useContext(NavigationContext)!

export function ReportNavigation({ children }: { children: ReactNode }) {
  const locationState = useSyncExternalStore(subscribe, browserLocation, serverLocation)
  const route = useMemo(() => readRoute(locationState.hash), [locationState.hash])
  const sync = () => window.dispatchEvent(new Event(navigationEvent))

  useLayoutEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => { history.scrollRestoration = previous }
  }, [])

  useLayoutEffect(() => {
    if (locationState === initialLocation || route.evidence) return

    return restorePage(locationState.entry)
  }, [locationState, route])

  function go(href: string, focusId?: string, replace = false) {
    if (href === location.hash) return
    if (replace) {
      history.replaceState({ nimbusReport: { from: historyEntry()?.from, focusId } satisfies Entry }, '', href)
    } else {
      const target = readRoute(href)
      savePosition(focusId)
      history.pushState({
        nimbusReport: {
          from: target.evidence ? location.hash || '#overview' : undefined,
          scroll: target.evidence && target.section === route.section ? window.scrollY : 0,
        } satisfies Entry,
      }, '', href)
    }
    sync()
  }

  function close() {
    if (historyEntry()?.from) {
      history.back()
    } else {
      history.replaceState(null, '', `#${route.section}`)
      sync()
    }
  }

  return <NavigationContext.Provider value={{ route, entry: locationState.entry, go, close }}>{children}</NavigationContext.Provider>
}

function restorePage(entry: Entry) {
  const frame = requestAnimationFrame(() => {
    window.scrollTo(0, entry.scroll ?? 0)
    const origin = entry.focusId && document.getElementById(entry.focusId)
    const heading = document.getElementById('page-heading')
    const target = origin || heading
    target?.focus({ preventScroll: true })
  })
  return () => cancelAnimationFrame(frame)
}

export function ReportLink({ href, replace = false, onClick, ...props }: ComponentProps<'a'> & { href: string; replace?: boolean }) {
  const { go } = useNavigation()
  return <a {...props} href={href} onClick={event => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    go(href, event.currentTarget.id, replace)
  }} />
}

export function plantHref(section: Section, plantId: string, topic?: Risk) {
  return `#${section}/${plantId}${topic ? `/${topic}` : ''}`
}
