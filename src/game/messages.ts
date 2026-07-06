import type { RoundResult, SessionSummary } from './types'

/** Encouraging feedback keyed to how close a single guess was. */
export function feedbackMessage(result: RoundResult): string {
  const { error, within } = result
  if (error === 0) return 'Bullseye! Perfect estimate. 🎯'
  if (within) return 'Nice — right on target! ✅'
  if (error <= 10) return 'So close! Just a little off. 👍'
  if (error <= 20) return 'Not bad — keep sharpening your eye. 🔎'
  return "Tricky one! Every guess builds your intuition. 💪"
}

/** A closing remark for the results screen based on overall accuracy. */
export function summaryMessage(summary: SessionSummary): string {
  const acc = summary.accuracy
  if (summary.total === 0) return 'Play a round to see your stats.'
  if (acc >= 80) return 'Outstanding eye for estimation! 🌟'
  if (acc >= 50) return 'Solid work — your estimates are getting sharp. 📈'
  if (acc >= 25) return 'Good effort! A bit more practice and you’ll level up. 🚀'
  return 'Estimation is a skill — keep practicing and you’ll improve fast. 💡'
}
