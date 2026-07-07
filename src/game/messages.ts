import type { RoundResult, SessionSummary } from './types'
import { gameConfig } from '../config/gameConfig'

// All player-facing copy is spoken by the knight (Sir Pixel). These functions
// stay pure and unit-tested so the dialogue layer can render them verbatim.

/** Opening instructions, delivered on the start screen. */
export function introMessage(): string {
  return `Hail! I'm Sir Pixel. Name each shaded share — within ±${gameConfig.tolerance}% wins glory!`
}

// A small rotation of in-character prompts so each image feels freshly narrated
// without any randomness (position drives the choice, so it stays testable).
const prompts = [
  'What share lies shaded here? Slide and decide!',
  'Study it well… what portion is cloaked?',
  'Trust your eye, hero — how much is filled?',
  'A fresh sigil! Give me your best read.',
  'Steady now. What percentage shows?',
] as const

/** Per-round quip, chosen deterministically from the 1-based round position. */
export function promptMessage(position: number): string {
  const len = prompts.length
  const i = (((position - 1) % len) + len) % len
  return prompts[i]
}

/** The knight's reaction to a single guess, keyed to how close it landed. */
export function feedbackMessage(result: RoundResult): string {
  const { error, within } = result
  const close = gameConfig.tolerance * 2
  if (error === 0) return 'A flawless strike! The bards will sing of this. 🎯'
  if (within) return 'Right on the mark — well struck! ⚔️'
  if (error <= close) return 'So close I felt the wind of it! 🛡️'
  return 'A miss — but every quest sharpens the blade. 💪'
}

/** The knight's closing remark on the results screen, keyed to accuracy. */
export function summaryMessage(summary: SessionSummary): string {
  if (summary.total === 0) return 'Take up a guess, brave one, and our quest begins.'
  const acc = summary.accuracy
  if (acc >= 80) return 'A true Eye Knight! The whole realm is dazzled. 🌟'
  if (acc >= 50) return 'Bravely done — your aim grows keen. 🏰'
  if (acc >= 25) return 'A worthy effort, squire. Onward we ride! 🚀'
  return 'Every hero starts green. To the saddle again! 🐎'
}
