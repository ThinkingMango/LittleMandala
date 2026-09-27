/**
 * The twelve crayons, in pairs of a bold color and its softer partner. The first six keys shipped
 * on their own and stay unchanged, because saved artwork stores these keys.
 */
export const PALETTE = [
  { key: 'red', label: 'Red' },
  { key: 'pink', label: 'Pink' },
  { key: 'orange', label: 'Orange' },
  { key: 'peach', label: 'Peach' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'lime', label: 'Lime' },
  { key: 'green', label: 'Green' },
  { key: 'sky', label: 'Sky blue' },
  { key: 'blue', label: 'Blue' },
  { key: 'purple', label: 'Purple' },
  { key: 'brown', label: 'Brown' },
  { key: 'gray', label: 'Gray' },
] as const

export type ColorKey = (typeof PALETTE)[number]['key']

export const DEFAULT_COLOR: ColorKey = 'red'

/** Turns one part back to white. Chosen from the palette like a color. */
export const ERASER = 'eraser'

export type Tool = ColorKey | typeof ERASER

export function colorVar(key: ColorKey) {
  return `var(--swatch-${key})`
}

export function colorLabel(key: ColorKey) {
  return PALETTE.find((c) => c.key === key)?.label ?? key
}
