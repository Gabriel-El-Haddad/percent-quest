import type { Rotation } from '../game/types'

// Central tunables — no magic numbers scattered through the code. Adjust the
// difficulty, session shape, or input bounds here.
export interface GameConfig {
  /** A guess within this many percentage points counts as "on target". */
  tolerance: number
  /** Rotations an image may be displayed at (defeats memorization). */
  rotations: readonly Rotation[]
  /** How many procedurally-generated images to show per game. */
  roundsPerGame: number
  /** Inclusive range for the generated images' green coverage (percent). */
  targetRange: { min: number; max: number }
  /** Allowed range for the percentage input. */
  minGuess: number
  maxGuess: number
}

export const gameConfig: GameConfig = {
  tolerance: 5,
  rotations: [0, 90, 180, 270],
  roundsPerGame: 15,
  targetRange: { min: 5, max: 100 },
  minGuess: 0,
  maxGuess: 100,
}
