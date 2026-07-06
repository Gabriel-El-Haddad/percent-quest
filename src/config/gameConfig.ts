import type { Rotation } from '../game/types'

// Central tunables — no magic numbers scattered through the code. Adjust the
// difficulty, session shape, or input bounds here.
export interface GameConfig {
  /** A guess within this many percentage points counts as "on target". */
  tolerance: number
  /** Rotations an image may be displayed at (defeats memorization). */
  rotations: readonly Rotation[]
  /**
   * How many images per game. `null` = use the entire shuffled dataset (V1).
   * Set a number once the dataset grows and you want shorter sessions.
   */
  sessionLength: number | null
  /** Allowed range for the percentage input. */
  minGuess: number
  maxGuess: number
}

export const gameConfig: GameConfig = {
  tolerance: 5,
  rotations: [0, 90, 180, 270],
  sessionLength: null,
  minGuess: 0,
  maxGuess: 100,
}
