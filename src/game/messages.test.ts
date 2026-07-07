import { describe, it, expect } from 'vitest'
import {
  introMessage,
  promptMessage,
  feedbackMessage,
  summaryMessage,
} from './messages'
import type { RoundResult, SessionSummary } from './types'

function result(partial: Partial<RoundResult>): RoundResult {
  return {
    imageId: 'a',
    src: 'a.png',
    rotation: 0,
    correctPct: 50,
    guess: 50,
    error: 0,
    within: true,
    ...partial,
  }
}

const baseSummary: SessionSummary = {
  total: 10,
  withinCount: 0,
  averageError: 0,
  accuracy: 0,
  best: null,
  worst: null,
}

describe('messages', () => {
  it('introMessage names the tolerance', () => {
    expect(introMessage()).toMatch(/±5%/)
  })

  it('promptMessage is a non-empty string that cycles deterministically', () => {
    expect(typeof promptMessage(1)).toBe('string')
    expect(promptMessage(1).length).toBeGreaterThan(0)
    // Five prompts in rotation → position 1 and 6 match.
    expect(promptMessage(1)).toBe(promptMessage(6))
  })

  it('feedbackMessage reacts across the tiers', () => {
    expect(feedbackMessage(result({ error: 0, within: true }))).toMatch(/flawless/i)
    expect(feedbackMessage(result({ error: 3, within: true }))).toMatch(/mark/i)
    expect(feedbackMessage(result({ error: 8, within: false }))).toMatch(/close/i)
    expect(feedbackMessage(result({ error: 40, within: false }))).toMatch(/quest/i)
  })

  it('summaryMessage returns a line for each accuracy tier', () => {
    expect(summaryMessage({ ...baseSummary, total: 0 })).toMatch(/quest/i)
    expect(summaryMessage({ ...baseSummary, accuracy: 90 })).toMatch(/knight/i)
    expect(summaryMessage({ ...baseSummary, accuracy: 60 })).toMatch(/keen/i)
    expect(summaryMessage({ ...baseSummary, accuracy: 30 })).toMatch(/squire/i)
    expect(summaryMessage({ ...baseSummary, accuracy: 10 })).toMatch(/saddle/i)
  })
})
