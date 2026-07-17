import { describe, it, expect } from 'vitest'
import { shuffle, pickRotation, buildDeck, buildGeneratedDeck, type RNG } from './random'
import { generateImage } from './generateImage'
import type { ImageItem } from './types'

/** Deterministic RNG that cycles through preset values. */
function seq(values: number[]): RNG {
  let i = 0
  return () => values[i++ % values.length]
}

/** Small seeded PRNG for realistic, varied floats in [0, 1). */
function mulberry32(seed: number): RNG {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('shuffle', () => {
  it('does not mutate the input and preserves all elements', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const result = shuffle(input, seq([0.1, 0.5, 0.9, 0.3]))
    expect(input).toEqual(copy)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('is deterministic for a fixed RNG', () => {
    const rng1 = seq([0.1, 0.5, 0.9, 0.3, 0.7])
    const rng2 = seq([0.1, 0.5, 0.9, 0.3, 0.7])
    expect(shuffle([1, 2, 3, 4, 5], rng1)).toEqual(shuffle([1, 2, 3, 4, 5], rng2))
  })
})

describe('pickRotation', () => {
  it('maps the RNG across the full circle', () => {
    expect(pickRotation(() => 0)).toBe(0)
    expect(pickRotation(() => 0.5)).toBe(180)
    expect(pickRotation(() => 0.999)).toBe(359)
  })

  it('spaces angles evenly for a coarser step count', () => {
    expect(pickRotation(() => 0.99, 4)).toBe(270)
    expect(pickRotation(() => 0.5, 4)).toBe(180)
  })

  it('never reaches a full turn', () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const angle = pickRotation(() => r)
      expect(angle).toBeGreaterThanOrEqual(0)
      expect(angle).toBeLessThan(360)
    }
  })
})

describe('buildDeck', () => {
  const images: ImageItem[] = [
    { id: 'a', src: 'images/a.png', correctPct: 10 },
    { id: 'b', src: 'images/b.png', correctPct: 20 },
    { id: 'c', src: 'images/c.png', correctPct: 30 },
  ]

  it('creates one round per image with a rotation on the circle', () => {
    const deck = buildDeck(images, seq([0, 0, 0, 0, 0, 0]), 10)
    expect(deck).toHaveLength(3)
    for (const round of deck) {
      expect(round.rotation).toBeGreaterThanOrEqual(0)
      expect(round.rotation).toBeLessThan(360)
      expect(images.map((i) => i.id)).toContain(round.image.id)
    }
  })

  it('caps the deck at `count` when the dataset is larger', () => {
    expect(buildDeck(images, seq([0.2, 0.4, 0.6, 0.8]), 2)).toHaveLength(2)
  })

  it('uses the whole set when `count` exceeds its size', () => {
    expect(buildDeck(images, seq([0.1, 0.2, 0.3]), 15)).toHaveLength(3)
  })

  it('is deterministic for a fixed RNG', () => {
    const a = buildDeck(images, mulberry32(5), 3)
    const b = buildDeck(images, mulberry32(5), 3)
    expect(a).toEqual(b)
  })
})

describe('buildGeneratedDeck', () => {
  it('creates `count` rounds, each a generated image with a rotation', () => {
    const deck = buildGeneratedDeck(mulberry32(1), 3)
    expect(deck).toHaveLength(3)
    deck.forEach((round, i) => {
      expect(round.rotation).toBeGreaterThanOrEqual(0)
      expect(round.rotation).toBeLessThan(360)
      expect(round.image.id).toBe(`gen-${i + 1}`)
      expect(round.image.src.startsWith('data:image/svg+xml,')).toBe(true)
      // Coverage stays inside the configured 5–100 range (allow rounding slack).
      expect(round.image.correctPct).toBeGreaterThanOrEqual(4)
      expect(round.image.correctPct).toBeLessThanOrEqual(100)
    })
  })

  it('is deterministic for a fixed RNG seed', () => {
    const a = buildGeneratedDeck(mulberry32(7), 3)
    const b = buildGeneratedDeck(mulberry32(7), 3)
    expect(a.map((r) => r.image.src)).toEqual(b.map((r) => r.image.src))
    expect(a.map((r) => r.image.correctPct)).toEqual(
      b.map((r) => r.image.correctPct),
    )
  })

  it('produces distinct images across rounds', () => {
    const deck = buildGeneratedDeck(mulberry32(3), 5)
    const uniqueSrcs = new Set(deck.map((r) => r.image.src))
    expect(uniqueSrcs.size).toBe(deck.length)
  })
})

describe('generateImage', () => {
  it('produces coverage close to the requested target', () => {
    for (const target of [8, 25, 50, 74, 96]) {
      const { correctPct } = generateImage(target, mulberry32(target * 13 + 1))
      // Solver drives measured coverage to the target within sampling precision.
      expect(Math.abs(correctPct - target)).toBeLessThan(1)
    }
  })

  it('returns an inline SVG data URL', () => {
    const { src } = generateImage(30, mulberry32(99))
    expect(src.startsWith('data:image/svg+xml,')).toBe(true)
    const svg = decodeURIComponent(src.slice('data:image/svg+xml,'.length))
    expect(svg).toContain('<svg')
    expect(svg).toContain('#84DB6D') // green fill
    expect(svg).toContain('clip-path="url(#disk)"')
  })
})
