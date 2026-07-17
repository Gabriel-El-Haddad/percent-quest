// Central tunables — no magic numbers scattered through the code. Adjust the
// difficulty, session shape, or input bounds here.
export interface GameConfig {
  /** A guess within this many percentage points counts as "on target". */
  tolerance: number
  /**
   * How many evenly-spaced angles an image may be displayed at (defeats
   * memorization). 360 gives every whole degree; 4 would be right angles only.
   */
  rotationSteps: number
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
  rotationSteps: 360,
  roundsPerGame: 25,
  targetRange: { min: 5, max: 100 },
  minGuess: 0,
  maxGuess: 100,
}
