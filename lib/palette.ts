export const PALETTE = [
  { key: 'red', label: 'Red' },
  { key: 'orange', label: 'Orange' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'green', label: 'Green' },
  { key: 'blue', label: 'Blue' },
  { key: 'purple', label: 'Purple' },
] as const

export type ColorKey = (typeof PALETTE)[number]['key']

export const DEFAULT_COLOR: ColorKey = 'red'

export function colorVar(key: ColorKey) {
  return `var(--swatch-${key})`
}

export function colorLabel(key: ColorKey) {
  return PALETTE.find((c) => c.key === key)?.label ?? key
}
