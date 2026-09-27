import { readFileSync, writeFileSync } from 'node:fs'

const root = '/vercel/share/v0-project'
const [pack] = process.argv.slice(2)
const labels = JSON.parse(readFileSync(`${root}/.labels-tmp/${pack}.json`, 'utf8'))
let bad = 0
for (const [id, names] of Object.entries(labels)) {
  const file = `${root}/lib/templates/${pack}/${id}.json`
  const art = JSON.parse(readFileSync(file, 'utf8'))
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  if (names.length !== art.regions.length || dupes.length) {
    console.log(`BAD ${id}: ${names.length} labels for ${art.regions.length} areas${dupes.length ? `; repeated ${dupes.join(', ')}` : ''}`)
    bad++
    continue
  }
  art.regions.forEach((r, i) => (r.label = names[i]))
  art.review.placeholderLabels = 0
  writeFileSync(file, `${JSON.stringify(art, null, 2)}\n`)
}
console.log(`${pack}: ${Object.keys(labels).length - bad} pages labeled, ${bad} problems`)
