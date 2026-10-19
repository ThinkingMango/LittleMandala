'use client'

import type { CSSProperties } from 'react'
import { Check, Eraser } from 'lucide-react'
import { usePaletteRadios } from '@/components/coloring/use-palette-radios'
import { ERASER, PALETTE, colorVar, type Tool } from '@/lib/palette'
import { cn } from '@/lib/utils'

type ColorPaletteProps = {
  value: Tool
  onChange: (tool: Tool) => void
  className?: string
}

const TOOLS: readonly Tool[] = [...PALETTE.map((c) => c.key), ERASER]

/**
 * On phones the swatches share out the screen's length: seven across in portrait, seven down in
 * landscape. Besides the swatches, that length holds 8px of padding, the gaps (3px across, 6px down,
 * so each pressed edge shows), 12px around the divider and the 2px divider, less the 12px the
 * palette reaches into the screen's edge. Change those and these numbers change too. Tablets keep 64px.
 */
const SWATCH_SIZE = cn(
  '[--swatch:clamp(2.25rem,calc((100cqw_-_25px)_/_7),3.75rem)]',
  'landscape:[--swatch:clamp(2.25rem,calc((100cqh_-_40px)_/_7),3.75rem)]',
  'roomy:[--swatch:4rem]',
)

function swatchClass(selected: boolean, className?: string) {
  return cn(
    'tactile flex size-(--swatch) shrink-0 items-center justify-center rounded-full outline-none',
    'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary roomy:focus-visible:ring-offset-4',
    selected && 'z-10 scale-110 ring-3 ring-ink ring-offset-1 ring-offset-secondary roomy:ring-4 roomy:ring-offset-4',
    className,
  )
}

export function ColorPalette({ value, onChange, className }: ColorPaletteProps) {
  const radio = usePaletteRadios(TOOLS, value, onChange)
  const eraser = radio(ERASER, 'Eraser')

  return (
    <div
      role="radiogroup"
      aria-label="Colors and eraser"
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-[2.5rem] bg-secondary p-1 roomy:gap-3 roomy:p-4',
        SWATCH_SIZE,
        className,
      )}
    >
      <div className="grid grid-flow-col grid-rows-2 gap-x-[3px] gap-y-1.5 landscape:gap-x-1.5 roomy:gap-3 landscape:grid-flow-row landscape:grid-cols-2 landscape:grid-rows-none">
        {PALETTE.map((color) => {
          const { selected, props } = radio(color.key, color.label)
          return (
            <button
              key={color.key}
              {...props}
              style={
                {
                  backgroundColor: colorVar(color.key),
                  '--tactile-edge': `color-mix(in oklch, ${colorVar(color.key)} 62%, var(--ink))`,
                } as CSSProperties
              }
              className={swatchClass(selected)}
            >
              {selected && (
                <span className="flex size-[62%] items-center justify-center rounded-full bg-background">
                  <Check className="size-[62%] text-ink" strokeWidth={3.5} aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <span aria-hidden="true" className="h-10 w-0.5 shrink-0 rounded-full bg-border landscape:h-0.5 landscape:w-10" />

      <button
        {...eraser.props}
        className={swatchClass(
          eraser.selected,
          'border-2 border-dashed border-muted-foreground bg-background text-ink [--tactile-edge:var(--border)]',
        )}
      >
        <Eraser className="size-[55%]" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
