import type { ReactNode } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useNavigation } from './navigation'

export function Sources({ links }: { links: [string, string][] }) {
  return <ul className="source-links" aria-label="Sources">{links.map(([href, label]) => <li key={href}>
    <a href={href} target="_blank" rel="noopener">{label}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
  </li>)}</ul>
}

export function Disclosure({ id, title, children, initiallyOpen = false, name }: {
  id: string
  title: string
  children: ReactNode
  initiallyOpen?: boolean
  name?: string
}) {
  const { entry } = useNavigation()
  const open = entry.disclosures?.includes(id) ?? initiallyOpen
  return <details className="disclosure" id={id} name={name} open={open}>
    <summary>{title}<ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="disclosure-body">{children}</div>
  </details>
}
