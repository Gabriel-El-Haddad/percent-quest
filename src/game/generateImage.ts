// Procedural generator for the estimation images. Each image is a fixed
// black-outlined circle on a transparent canvas, its interior white, with a
// green region covering a target fraction of the DISK area. Green and white are
// split by a single smooth, low-frequency wavy line at a random orientation —
// matching the reference image set. Output is a self-contained SVG data URL that
// drops straight into an <img src>, so images are generated fresh at runtime and
// never repeat.
//
// Pure module: no DOM. All randomness flows through the injected RNG, so callers
// (and tests) get deterministic output for a fixed seed.

import { gameConfig } from '../config/gameConfig'
import type { RNG } from './random'

// Canvas + circle geometry, matched to the reference images (900×900, centered
// disk of radius 380 with a ~4px black stroke).
const SIZE = 900
const CX = SIZE / 2
const CY = SIZE / 2
const R = 380
const STROKE = 4
const GREEN = '#84DB6D'
const WHITE = '#ffffff'

/** Grid step (px) for area sampling. Smaller = more precise, quadratically slower. */
const SAMPLE_STEP = 2

export interface GeneratedImage {
  /** `data:image/svg+xml,...` URL, usable directly as an <img> src. */
  src: string
  /** The true green coverage of the disk, in percent (1 decimal). */
  correctPct: number
}

/** Pick an integer target percentage within the configured range. */
export function pickTarget(rng: RNG): number {
  const { min, max } = gameConfig.targetRange
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * Build the boundary perturbation w(v): a sum of two low-frequency sinusoids.
 * The primary term gives the dominant gentle hump; the small secondary term adds
 * subtle organic variation without making the curve look noisy.
 */
function makeWave(rng: RNG): (v: number) => number {
  const a1 = (0.06 + rng() * 0.08) * R // primary amplitude ~0.06–0.14 R
  const f1 = 0.4 + rng() * 0.7 // ~0.4–1.1 humps across the diameter
  const p1 = rng() * Math.PI * 2
  const a2 = rng() * 0.03 * R // secondary amplitude ~0–0.03 R
  const f2 = 1.1 + rng() * 1.2
  const p2 = rng() * Math.PI * 2
  return (v) =>
    a1 * Math.sin((f1 * Math.PI * v) / R + p1) +
    a2 * Math.sin((f2 * Math.PI * v) / R + p2)
}

/**
 * Fraction of the disk with u < t + wave(v), estimated by grid-sampling. u,v are
 * the coordinates in the frame rotated by theta (u = fill axis).
 */
function greenFraction(
  cos: number,
  sin: number,
  wave: (v: number) => number,
  t: number,
): number {
  let inside = 0
  let green = 0
  const r2 = R * R
  for (let y = -R; y <= R; y += SAMPLE_STEP) {
    for (let x = -R; x <= R; x += SAMPLE_STEP) {
      if (x * x + y * y > r2) continue
      inside++
      const u = x * cos + y * sin
      const v = -x * sin + y * cos
      if (u < t + wave(v)) green++
    }
  }
  return inside === 0 ? 0 : green / inside
}

/** Binary-search the offset t so the green fraction matches the target. */
function solveOffset(
  cos: number,
  sin: number,
  wave: (v: number) => number,
  target: number,
): number {
  let lo = -R * 1.5
  let hi = R * 1.5
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (greenFraction(cos, sin, wave, mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Generate one image for the given target percentage (clamped to 5–100).
 * Returns the SVG data URL and the exact measured coverage to score against.
 */
export function generateImage(targetPct: number, rng: RNG): GeneratedImage {
  const target = Math.min(1, Math.max(0.05, targetPct / 100))
  const theta = rng() * Math.PI * 2
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const wave = makeWave(rng)
  const t = solveOffset(cos, sin, wave, target)
  const correctPct = Math.round(greenFraction(cos, sin, wave, t) * 1000) / 10

  // Trace the wavy boundary in image coordinates, then close the polygon far on
  // the green side (u ≪ 0). The polygon is clipped to the circle, so extending
  // beyond the disk is harmless.
  const toXY = (u: number, v: number): [number, number] => [
    CX + u * cos - v * sin,
    CY + u * sin + v * cos,
  ]
  const vMax = R + 30
  const points: string[] = []
  for (let v = -vMax; v <= vMax; v += 6) {
    const [x, y] = toXY(t + wave(v), v)
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const [cx1, cy1] = toXY(-2 * R, vMax)
  const [cx2, cy2] = toXY(-2 * R, -vMax)
  points.push(`${cx1.toFixed(1)},${cy1.toFixed(1)}`)
  points.push(`${cx2.toFixed(1)},${cy2.toFixed(1)}`)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" ` +
    `width="${SIZE}" height="${SIZE}" role="img" aria-label="estimation image">` +
    `<defs><clipPath id="disk"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>` +
    `<g clip-path="url(#disk)">` +
    `<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${WHITE}"/>` +
    `<polygon points="${points.join(' ')}" fill="${GREEN}"/>` +
    `</g>` +
    `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#000000" stroke-width="${STROKE}"/>` +
    `</svg>`

  return {
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    correctPct,
  }
}
