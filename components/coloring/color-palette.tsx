'use client'

import { useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { Check } from 'lucide-react'
import { PALETTE, colorVar, type ColorKey } from '@/lib/palette'
import { cn } from '@/lib/utils'

type ColorPaletteProps = {
  value: ColorKey
  onChange: (color: ColorKey) => void
  className?: string
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown']
const PREV_KEYS = ['ArrowLeft', 'ArrowUp']

export function ColorPalette({ value, onChange, className }: ColorPaletteProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    let next = index
    if (NEXT_KEYS.includes(e.key)) next = (index + 1) % PALETTE.length
    else if (PREV_KEYS.includes(e.key)) next = (index - 1 + PALETTE.length) % PALETTE.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = PALETTE.length - 1
    else return
    e.preventDefault()
    onChange(PALETTE[next].key)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colors"
      className={cn(
        'flex items-center justify-center gap-3 rounded-[2.5rem] bg-secondary p-3 sm:gap-4 sm:p-4',
        className,
      )}
    >
      {PALETTE.map((color, index) => {
        const selected = color.key === value
        return (
          <button
            key={color.key}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(color.key)}
            onKeyDown={handleKeyDown(index)}
            style={
              {
                backgroundColor: colorVar(color.key),
                '--tactile-edge': `color-mix(in oklch, ${colorVar(color.key)} 62%, var(--ink))`,
              } as CSSProperties
            }
            className={cn(
              'tactile flex size-13 shrink-0 items-center justify-center rounded-full outline-none sm:size-16 md:size-18',
              'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-secondary',
              selected && 'scale-110 ring-4 ring-ink ring-offset-4 ring-offset-secondary',
            )}
          >
            {selected && (
              <span className="flex size-8 items-center justify-center rounded-full bg-background sm:size-9">
                <Check className="size-5 text-ink sm:size-6" strokeWidth={3.5} aria-hidden="true" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
