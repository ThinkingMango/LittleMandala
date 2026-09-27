'use client'

import { useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { Check, Eraser } from 'lucide-react'
import { ERASER, PALETTE, colorVar, type Tool } from '@/lib/palette'
import { cn } from '@/lib/utils'

type ColorPaletteProps = {
  value: Tool
  onChange: (tool: Tool) => void
  className?: string
}

const TOOLS: readonly Tool[] = [...PALETTE.map((c) => c.key), ERASER]
const ERASER_INDEX = TOOLS.length - 1

const NEXT_KEYS = ['ArrowRight', 'ArrowDown']
const PREV_KEYS = ['ArrowLeft', 'ArrowUp']

function swatchClass(selected: boolean, className?: string) {
  return cn(
    'tactile flex size-11 shrink-0 items-center justify-center rounded-full outline-none sm:size-16 md:size-18',
    'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-secondary',
    selected && 'scale-110 ring-4 ring-ink ring-offset-4 ring-offset-secondary',
    className,
  )
}

export function ColorPalette({ value, onChange, className }: ColorPaletteProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    let next = index
    if (NEXT_KEYS.includes(e.key)) next = (index + 1) % TOOLS.length
    else if (PREV_KEYS.includes(e.key)) next = (index - 1 + TOOLS.length) % TOOLS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TOOLS.length - 1
    else return
    e.preventDefault()
    onChange(TOOLS[next])
    refs.current[next]?.focus()
  }

  const radioProps = (index: number, label: string) => {
    const tool = TOOLS[index]
    const selected = tool === value
    return {
      selected,
      props: {
        ref: (el: HTMLButtonElement | null) => {
          refs.current[index] = el
        },
        type: 'button' as const,
        role: 'radio',
        'aria-checked': selected,
        'aria-label': label,
        title: label,
        tabIndex: selected ? 0 : -1,
        onClick: () => onChange(tool),
        onKeyDown: handleKeyDown(index),
      },
    }
  }

  const eraser = radioProps(ERASER_INDEX, 'Eraser')

  return (
    <div
      role="radiogroup"
      aria-label="Colors and eraser"
      className={cn(
        'flex items-center justify-center gap-2 rounded-[2.5rem] bg-secondary p-2 sm:gap-4 sm:p-4',
        className,
      )}
    >
      {PALETTE.map((color, index) => {
        const { selected, props } = radioProps(index, color.label)
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
              <span className="flex size-8 items-center justify-center rounded-full bg-background sm:size-9">
                <Check className="size-5 text-ink sm:size-6" strokeWidth={3.5} aria-hidden="true" />
              </span>
            )}
          </button>
        )
      })}

      <span aria-hidden="true" className="h-10 w-0.5 shrink-0 rounded-full bg-border landscape:h-0.5 landscape:w-10" />

      <button
        {...eraser.props}
        className={swatchClass(
          eraser.selected,
          'border-2 border-dashed border-muted-foreground bg-background text-ink [--tactile-edge:var(--border)]',
        )}
      >
        <Eraser className="size-6 sm:size-8" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
