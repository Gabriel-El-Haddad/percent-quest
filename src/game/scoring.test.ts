import { describe, it, expect } from 'vitest'
import { clampGuess, scoreRound, summarize } from './scoring'
import type { ImageItem, RoundResult } from './types'

const image: ImageItem = { id: 'a', src: 'images/a.svg', correctPct: 40 }

describe('clampGuess', () => {
  it('clamps below min and above max', () => {
    expect(clampGuess(-10)).toBe(0)
    expect(clampGuess(150)).toBe(100)
    expect(clampGuess(42)).toBe(42)
  })

  it('falls back to min for NaN', () => {
    expect(clampGuess(NaN)).toBe(0)
  })
})

describe('scoreRound', () => {
  it('computes error and within-tolerance for an exact hit', () => {
    const r = scoreRound(image, 0, 40)
    expect(r.error).toBe(0)
    expect(r.within).toBe(true)
  })

  it('treats the tolerance boundary (±5) as within', () => {
    expect(scoreRound(image, 90, 45).within).toBe(true)
    expect(scoreRound(image, 90, 35).within).toBe(true)
  })

  it('marks guesses beyond tolerance as outside', () => {
    const r = scoreRound(image, 180, 52)
    expect(r.error).toBe(12)
    expect(r.within).toBe(false)
  })

  it('clamps out-of-range guesses before scoring', () => {
    expect(scoreRound(image, 0, 200).guess).toBe(100)
  })
})

function result(error: number, within: boolean, id = 'x'): RoundResult {
  return {
    imageId: id,
    src: `images/${id}.svg`,
    rotation: 0,
    correctPct: 50,
    guess: 50 - error,
    error,
    within,
  }
}

describe('summarize', () => {
  it('returns a zeroed summary for no results', () => {
    const s = summarize([])
    expect(s).toMatchObject({ total: 0, withinCount: 0, accuracy: 0, averageError: 0 })
    expect(s.best).toBeNull()
    expect(s.worst).toBeNull()
  })

  it('aggregates count, accuracy, average error, best and worst', () => {
    const results = [
      result(2, true, 'a'),
      result(4, true, 'b'),
      result(20, false, 'c'),
    ]
    const s = summarize(results)
    expect(s.total).toBe(3)
    expect(s.withinCount).toBe(2)
    expect(s.accuracy).toBe(66.7)
    expect(s.averageError).toBeCloseTo(8.7, 1)
    expect(s.best?.imageId).toBe('a')
    expect(s.worst?.imageId).toBe('c')
  })
})
