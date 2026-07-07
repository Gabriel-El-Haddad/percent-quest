import type { ImageItem, Rotation, RoundPlan } from './types'
import { gameConfig } from '../config/gameConfig'
import { generateImage, pickTarget } from './generateImage'

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
 * Build the ordered rounds for one game from the committed dataset: shuffle the
 * images, take up to `count` of them (the whole set when it is smaller), and give
 * each a random rotation so repeats still look fresh.
 */
export function buildDeck(
  images: readonly ImageItem[],
  rng: RNG = defaultRng,
  count: number = gameConfig.roundsPerGame,
): RoundPlan[] {
  const chosen = shuffle(images, rng).slice(0, count)
  return chosen.map((image) => ({ image, rotation: pickRotation(rng) }))
}

/**
 * Shelved runtime path: procedurally generate `count` unique images at random
 * target percentages, each with a random rotation. Kept (and unit-tested) so the
 * generator can be re-enabled later; not currently wired into the game.
 */
export function buildGeneratedDeck(
  rng: RNG = defaultRng,
  count: number = gameConfig.roundsPerGame,
): RoundPlan[] {
  const rounds: RoundPlan[] = []
  for (let i = 0; i < count; i++) {
    const target = pickTarget(rng)
    const { src, correctPct } = generateImage(target, rng)
    rounds.push({
      image: { id: `gen-${i + 1}`, src, correctPct },
      rotation: pickRotation(rng),
    })
  }
  return rounds
}
