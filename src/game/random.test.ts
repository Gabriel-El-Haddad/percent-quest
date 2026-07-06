import { describe, it, expect } from 'vitest'
import { shuffle, pickRotation, buildDeck, type RNG } from './random'
import type { ImageItem } from './types'

/** Deterministic RNG that cycles through preset values. */
function seq(values: number[]): RNG {
  let i = 0
  return () => values[i++ % values.length]
}

const images: ImageItem[] = [
  { id: 'a', src: 'images/a.svg', correctPct: 10 },
  { id: 'b', src: 'images/b.svg', correctPct: 20 },
  { id: 'c', src: 'images/c.svg', correctPct: 30 },
]

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
  it('selects from the rotation set by index', () => {
    expect(pickRotation(() => 0)).toBe(0)
    expect(pickRotation(() => 0.99, [0, 90, 180, 270])).toBe(270)
    expect(pickRotation(() => 0.5, [0, 90, 180, 270])).toBe(180)
  })
})

describe('buildDeck', () => {
  it('creates one round per image with a rotation each', () => {
    const deck = buildDeck(images, seq([0, 0, 0, 0, 0, 0]), null)
    expect(deck).toHaveLength(3)
    for (const round of deck) {
      expect([0, 90, 180, 270]).toContain(round.rotation)
      expect(images.map((i) => i.id)).toContain(round.image.id)
    }
  })

  it('respects sessionLength cap', () => {
    const deck = buildDeck(images, seq([0.2, 0.4, 0.6, 0.8]), 2)
    expect(deck).toHaveLength(2)
  })

  it('uses the full dataset when sessionLength is null', () => {
    expect(buildDeck(images, seq([0.1, 0.2, 0.3]), null)).toHaveLength(3)
  })
})
