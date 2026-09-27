import type { Fills } from '@/lib/artwork/library'
import type { TemplateVersion } from '@/lib/mandalas'
import type { ColorKey } from '@/lib/palette'

/** sRGB versions of the palette tokens in globals.css, so the file looks right outside the app. */
const FILE_COLORS: Record<ColorKey, string> = {
  red: '#f54748',
  orange: '#fd9836',
  yellow: '#fcd936',
  green: '#3fc168',
  blue: '#3797e9',
  purple: '#9860d0',
}
const CANVAS = '#ffffff'
const INK = '#242b3b'

/** A standalone image of one garden picture, drawn exactly like the garden tile. */
export function renderArtworkSvg(version: TemplateVersion, fills: Fills) {
  const paths = version.regions
    .map((region) => {
      const color = fills[region.id]
      const fill = color ? FILE_COLORS[color] : CANVAS
      return `<path d="${region.d}" fill="${fill}"/>`
    })
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 1048 1048" width="1048" height="1048">` +
    `<rect x="-24" y="-24" width="1048" height="1048" fill="${CANVAS}"/>` +
    `<g stroke="${INK}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">${paths}</g>` +
    `</svg>`
  )
}
