/**
 * Vectorise the Iron Scope seal.
 *
 * The only brand asset that exists is a 522px raster. Any design that uses the
 * seal large — as a watermark, an emboss, a stamp impression — needs it sharp,
 * so we trace it once to SVG and use that everywhere instead.
 *
 *   node scripts/trace_seal.js
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const potrace = require('potrace')

const REPO = path.resolve(__dirname, '..', '..') // the Iron Scope folder
const ROOT = path.resolve(__dirname, '..') // ironscope-site
const SRC = path.join(REPO, 'site_snapshot', 'ironscope-seal-v2.png')
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'brand')

fs.mkdirSync(OUT_DIR, { recursive: true })

/**
 * The source PNG is dark ink on a TRANSPARENT field. Potrace ignores the alpha
 * channel and reads those transparent pixels as rgb(0,0,0), so tracing the file
 * directly returns one solid black square. Flatten onto white first.
 */
function flattenOntoWhite(src, dest) {
  const py = `
from PIL import Image
im = Image.open(r"${src}").convert("RGBA")
bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
bg.alpha_composite(im)
bg.convert("L").save(r"${dest}")
print(bg.size[0])
`
  execFileSync('python', ['-c', py], { stdio: 'pipe' })
}

const traceFile = (file, opts) =>
  new Promise((resolve, reject) => {
    potrace.trace(file, opts, (err, svg) => (err ? reject(err) : resolve(svg)))
  })

/**
 * Strip potrace's hardcoded fill so the mark inherits `currentColor`. That lets
 * one file serve the navy header lockup, a white footer mark, and a low-opacity
 * watermark without shipping three copies.
 */
function makeCurrentColor(svg) {
  const viewBox = /viewBox="[^"]*"/.exec(svg)?.[0] ?? 'viewBox="0 0 522 522"'
  const body = svg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .replace(/ fill="[^"]*"/g, '')
    .replace(/<path/g, '<path fill="currentColor"')
    .trim()
  return `<svg xmlns="http://www.w3.org/2000/svg" ${viewBox}>${body}</svg>`
}

async function main() {
  const flat = path.join(OUT_DIR, '.seal-flat.png')
  flattenOntoWhite(SRC, flat)

  const svg = await traceFile(flat, {
    threshold: 160,
    turdSize: 2, // drop specks smaller than 2px, keep the fine ring detail
    optCurve: true,
    optTolerance: 0.18,
    alphaMax: 1,
    blackOnWhite: true,
  })

  const cleaned = makeCurrentColor(svg)
  const out = path.join(OUT_DIR, 'seal.svg')
  fs.writeFileSync(out, cleaned)
  fs.unlinkSync(flat)

  const rasterKB = fs.statSync(SRC).size / 1024
  const svgKB = fs.statSync(out).size / 1024
  const paths = (cleaned.match(/<path/g) || []).length
  console.log(`source PNG : ${rasterKB.toFixed(1)} KB (522x522)`)
  console.log(`traced SVG : ${svgKB.toFixed(1)} KB, ${paths} path element(s)`)
  console.log(`viewBox    : ${/viewBox="([^"]*)"/.exec(cleaned)?.[1]}`)
  console.log(`written    : ${path.relative(REPO, out)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
