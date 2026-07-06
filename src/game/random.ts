import type { ImageItem, Rotation, RoundPlan } from './types'
import { gameConfig } from '../config/gameConfig'

/** A random source returning a float in [0, 1). Injectable for deterministic tests. */
export type RNG = () => number

export const defaultRng: RNG = Math.random

/** Fisher–Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(items: readonly T[], rng: RNG = defaultRng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Pick a rotation uniformly from the configured set. */
export function pickRotation(
  rng: RNG = defaultRng,
  rotations: readonly Rotation[] = gameConfig.rotations,
): Rotation {
  const i = Math.floor(rng() * rotations.length)
  return rotations[i]
}

/**
 * Build the ordered rounds for one game: shuffle the dataset, optionally cap to
 * `sessionLength`, and assign each image a random rotation.
 */
export function buildDeck(
  images: readonly ImageItem[],
  rng: RNG = defaultRng,
  sessionLength: number | null = gameConfig.sessionLength,
): RoundPlan[] {
  const shuffled = shuffle(images, rng)
  const chosen =
    sessionLength != null ? shuffled.slice(0, sessionLength) : shuffled
  return chosen.map((image) => ({ image, rotation: pickRotation(rng) }))
}
