'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import type { Fills } from '@/lib/artwork/library'
import type { Region, TemplateVersion } from '@/lib/mandalas'
import { colorLabel, colorVar } from '@/lib/palette'
import { cn } from '@/lib/utils'

type MandalaArtProps = {
  /** The immutable template version to draw. Only its approved regions are rendered. */
  version: TemplateVersion
  fills: Fills
  className?: string
  /** Accessible name for the interactive canvas. */
  label?: string
  /** When provided, regions become tappable, focusable buttons. */
  onRegionTap?: (region: Region, element: SVGPathElement) => void
}

export function MandalaArt({ version, fills, className, label, onRegionTap }: MandalaArtProps) {
  const interactive = Boolean(onRegionTap)

  const handleClick = (region: Region) => (e: MouseEvent<SVGPathElement>) => {
    onRegionTap?.(region, e.currentTarget)
  }

  const handleKey = (region: Region) => (e: KeyboardEvent<SVGPathElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRegionTap?.(region, e.currentTarget)
    }
  }

  return (
    <svg
      viewBox="-24 -24 1048 1048"
      className={cn('select-none', interactive && 'touch-manipulation', className)}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={interactive ? undefined : true}
      focusable="false"
    >
      {version.regions.map((region) => {
        const fill = fills[region.id]
        return (
          <path
            key={region.id}
            d={region.d}
            fill={fill ? colorVar(fill) : 'var(--canvas)'}
            stroke="var(--ink)"
            strokeWidth={interactive ? 7 : 14}
            strokeLinejoin="round"
            strokeLinecap="round"
            {...(interactive && {
              className: 'mandala-region',
              role: 'button',
              tabIndex: 0,
              'aria-label': fill ? `${region.label}, ${colorLabel(fill)}` : region.label,
              onClick: handleClick(region),
              onKeyDown: handleKey(region),
            })}
          />
        )
      })}
      {version.details.map((detail, i) => (
        <path
          key={i}
          d={detail.d}
          fill={detail.kind === 'dot' ? 'var(--ink)' : 'none'}
          stroke={detail.kind === 'dot' ? 'none' : 'var(--ink)'}
          strokeWidth={interactive ? 7 : 14}
          strokeLinecap="round"
          pointerEvents="none"
        />
      ))}
    </svg>
  )
}
