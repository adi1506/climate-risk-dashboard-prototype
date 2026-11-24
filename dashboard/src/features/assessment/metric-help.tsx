import { Info } from 'lucide-react'
import { Tooltip } from 'radix-ui'
import { useState } from 'react'

export function MetricHelp({ label, children, className }: { label: string; children: string; className?: string }) {
  const [open, setOpen] = useState(false)
  return <Tooltip.Root open={open} onOpenChange={setOpen}>
    <Tooltip.Trigger type="button" className={`metric-help ${className ?? ''}`} aria-label={`How to calculate ${label}`}
      onClick={event => {
        // Radix handles hover and focus. Activation also opens the help on touch.
        event.preventDefault()
        setOpen(true)
      }}>
      <Info size={15} aria-hidden="true" />
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content className="metric-tooltip" sideOffset={6} collisionPadding={10}>
        {children}
        <Tooltip.Arrow className="metric-tooltip-arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
}
