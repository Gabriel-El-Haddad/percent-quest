// Generates placeholder estimation images as SVGs plus a matching images.json.
//
// Each image fills a KNOWN target percentage of its area by thresholding a
// smoothed random noise field at the exact cell count. This yields organic,
// asymmetric blobs so that:
//   - the percentage is genuine but not obvious (no clean bar to read off),
//   - rotating the image changes its appearance (defeats memorization).
//
// Regenerating is deterministic (seeded), so the committed assets are stable.
// Swap these for a real dataset by replacing public/images/* and src/data/images.json.

import { mkdir, writeFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const IMAGES_DIR = resolve(ROOT, 'public/images')
const DATA_FILE = resolve(ROOT, 'src/data/images.json')

const GRID = 28 // cells per side; 784 cells => ~0.13% resolution
const SIZE = 400 // svg viewport (px)
const BG = '#eef2f7'
const FILL = '#2f6f6a'

// Target percentages spread across the range (avoid trivial 0/100 & round tens).
const TARGETS = [7, 13, 19, 24, 31, 38, 44, 52, 58, 63, 71, 78, 84, 89, 94]

// Deterministic PRNG (mulberry32) so output is reproducible per seed.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Build a smoothed noise field: random init, then a few neighbor-averaging
// passes to create coherent blobs instead of salt-and-pepper noise.
function noiseField(rng) {
  let field = Array.from({ length: GRID * GRID }, () => rng())
  const at = (f, x, y) => f[((y + GRID) % GRID) * GRID + ((x + GRID) % GRID)]
  for (let pass = 0; pass < 3; pass++) {
    const next = new Array(GRID * GRID)
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        let sum = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) sum += at(field, x + dx, y + dy)
        next[y * GRID + x] = sum / 9
      }
    }
    field = next
  }
  return field
}

// Pick the threshold that fills exactly `count` highest-valued cells.
function fillMask(field, count) {
  const order = field
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, count)
    .map(([, i]) => i)
  const mask = new Array(field.length).fill(false)
  for (const i of order) mask[i] = true
  return mask
}

// Merge filled cells in each row into horizontal run <rect>s (smaller files).
function svgFor(mask) {
  const cell = SIZE / GRID
  const rects = []
  for (let y = 0; y < GRID; y++) {
    let runStart = -1
    for (let x = 0; x <= GRID; x++) {
      const filled = x < GRID && mask[y * GRID + x]
      if (filled && runStart === -1) runStart = x
      if (!filled && runStart !== -1) {
        const rx = (runStart * cell).toFixed(2)
        const ry = (y * cell).toFixed(2)
        const rw = ((x - runStart) * cell).toFixed(2)
        const rh = cell.toFixed(2)
        rects.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"/>`)
        runStart = -1
      }
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="estimation image">`,
    `<rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>`,
    `<g fill="${FILL}">${rects.join('')}</g>`,
    `</svg>`,
  ].join('')
}

async function main() {
  await rm(IMAGES_DIR, { recursive: true, force: true })
  await mkdir(IMAGES_DIR, { recursive: true })
  await mkdir(dirname(DATA_FILE), { recursive: true })

  const total = GRID * GRID
  const manifest = []

  for (let n = 0; n < TARGETS.length; n++) {
    const target = TARGETS[n]
    const rng = mulberry32(1000 + n * 97)
    const field = noiseField(rng)
    const count = Math.round((total * target) / 100)
    const mask = fillMask(field, count)
    const actualPct = Math.round((count / total) * 1000) / 10 // 1 decimal

    const id = `img-${String(n + 1).padStart(2, '0')}`
    const file = `${id}.svg`
    await writeFile(resolve(IMAGES_DIR, file), svgFor(mask), 'utf8')

    // src is relative to the app base; the UI prefixes import.meta.env.BASE_URL.
    manifest.push({ id, src: `images/${file}`, correctPct: actualPct })
  }

  await writeFile(DATA_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(
    `Generated ${manifest.length} images -> public/images/, manifest -> src/data/images.json`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
