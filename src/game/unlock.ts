import { gameConfig } from '../config/gameConfig'
import type { StoredSession } from '../storage/sessionStore'

/**
 * The head narrator is a reward, not a setting: it stays locked until some
 * completed game clears the accuracy bar. Derived from saved history rather
 * than stored as its own flag, so the unlock persists (and can be re-earned)
 * without a second source of truth to keep in sync.
 */
export function isHeadUnlocked(history: readonly StoredSession[]): boolean {
  return history.some((session) => session.accuracy >= gameConfig.headUnlockAccuracy)
}
