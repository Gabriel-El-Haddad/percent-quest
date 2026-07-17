// Core domain types. This module is pure data — no React, no DOM — so the game
// logic can be unit-tested and reused (future modes, a server, etc.).

/** Degrees clockwise. Any angle is valid: the artwork's only opaque pixels are
 * the circle itself, centred with a transparent margin, so an off-axis angle
 * neither clips the circle nor reveals a corner. */
export type Rotation = number

/** A single item from the static dataset (src is relative to the app base). */
export interface ImageItem {
  id: string
  src: string
  correctPct: number
}

/** One planned round: which image, shown at which rotation. */
export interface RoundPlan {
  image: ImageItem
  rotation: Rotation
}

/** The recorded outcome of a played round. */
export interface RoundResult {
  imageId: string
  src: string
  rotation: Rotation
  correctPct: number
  guess: number
  /** Absolute difference between guess and correctPct. */
  error: number
  /** True when error is within the configured tolerance (±5% by default). */
  within: boolean
}

/** Aggregate stats shown on the results screen and persisted per session. */
export interface SessionSummary {
  total: number
  withinCount: number
  averageError: number
  /** Accuracy = withinCount / total, as a 0–100 percentage. */
  accuracy: number
  best: RoundResult | null
  worst: RoundResult | null
}

export type GamePhase = 'idle' | 'playing' | 'feedback' | 'results'

export interface GameState {
  phase: GamePhase
  deck: RoundPlan[]
  /** Index of the current round within `deck`. */
  index: number
  results: RoundResult[]
  /** The most recent result, surfaced on the feedback screen. */
  lastResult: RoundResult | null
}

export type GameAction =
  | { type: 'START_GAME'; deck: RoundPlan[] }
  | { type: 'SUBMIT_GUESS'; guess: number }
  | { type: 'NEXT' }
  | { type: 'RESET' }
