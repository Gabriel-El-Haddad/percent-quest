import type { ImageItem, Rotation, RoundResult, SessionSummary } from './types'
import { gameConfig } from '../config/gameConfig'

/** Clamp a raw numeric guess into the allowed range. */
export function clampGuess(
  guess: number,
  min: number = gameConfig.minGuess,
  max: number = gameConfig.maxGuess,
): number {
  if (Number.isNaN(guess)) return min
  return Math.min(max, Math.max(min, guess))
}

/** Round to one decimal place for display-friendly aggregates. */
function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Score a single guess against an image, producing a recorded result. */
export function scoreRound(
  image: ImageItem,
  rotation: Rotation,
  guess: number,
  tolerance: number = gameConfig.tolerance,
): RoundResult {
  const clamped = clampGuess(guess)
  const rawError = Math.abs(clamped - image.correctPct)
  return {
    imageId: image.id,
    src: image.src,
    rotation,
    correctPct: image.correctPct,
    guess: clamped,
    // Rounded for display; guards against binary float artifacts (e.g. 60 - 72.4).
    error: round1(rawError),
    within: rawError <= tolerance,
  }
}

/** Aggregate a set of round results into session statistics. */
export function summarize(results: readonly RoundResult[]): SessionSummary {
  const total = results.length
  if (total === 0) {
    return {
      total: 0,
      withinCount: 0,
      averageError: 0,
      accuracy: 0,
      best: null,
      worst: null,
    }
  }

  let withinCount = 0
  let errorSum = 0
  let best = results[0]
  let worst = results[0]

  for (const r of results) {
    if (r.within) withinCount++
    errorSum += r.error
    if (r.error < best.error) best = r
    if (r.error > worst.error) worst = r
  }

  return {
    total,
    withinCount,
    averageError: round1(errorSum / total),
    accuracy: round1((withinCount / total) * 100),
    best,
    worst,
  }
}
