import type { Rotation, RoundPlan } from './types'
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
 * Build the ordered rounds for one game: procedurally generate `count` unique
 * images at random target percentages and assign each a random rotation. Every
 * game produces a fresh set — nothing is stored or repeated.
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
