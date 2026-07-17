import { describe, it, expect } from 'vitest'
import { isHeadUnlocked } from './unlock'
import { gameConfig } from '../config/gameConfig'
import type { StoredSession } from '../storage/sessionStore'

function session(accuracy: number): StoredSession {
  return {
    total: 25,
    withinCount: 0,
    averageError: 0,
    accuracy,
    best: null,
    worst: null,
    completedAt: 0,
  }
}

const bar = gameConfig.headUnlockAccuracy

describe('isHeadUnlocked', () => {
  it('stays locked with no history', () => {
    expect(isHeadUnlocked([])).toBe(false)
  })

  it('stays locked below the bar', () => {
    expect(isHeadUnlocked([session(bar - 0.1), session(10)])).toBe(false)
  })

  it('unlocks exactly at the bar', () => {
    expect(isHeadUnlocked([session(bar)])).toBe(true)
  })

  it('unlocks from any past game, not just the newest', () => {
    expect(isHeadUnlocked([session(12), session(bar + 5), session(30)])).toBe(true)
  })
})
