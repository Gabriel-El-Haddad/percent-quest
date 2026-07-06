import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from './reducer'
import type { GameState, RoundPlan } from './types'

const deck: RoundPlan[] = [
  { image: { id: 'a', src: 'images/a.svg', correctPct: 40 }, rotation: 0 },
  { image: { id: 'b', src: 'images/b.svg', correctPct: 70 }, rotation: 90 },
]

function started(): GameState {
  return gameReducer(initialState, { type: 'START_GAME', deck })
}

describe('gameReducer', () => {
  it('starts a game into the playing phase at index 0', () => {
    const s = started()
    expect(s.phase).toBe('playing')
    expect(s.index).toBe(0)
    expect(s.results).toEqual([])
  })

  it('ignores START_GAME with an empty deck', () => {
    const s = gameReducer(initialState, { type: 'START_GAME', deck: [] })
    expect(s).toBe(initialState)
  })

  it('scores a guess and moves to feedback', () => {
    const s = gameReducer(started(), { type: 'SUBMIT_GUESS', guess: 42 })
    expect(s.phase).toBe('feedback')
    expect(s.results).toHaveLength(1)
    expect(s.lastResult?.error).toBe(2)
    expect(s.lastResult?.within).toBe(true)
  })

  it('ignores SUBMIT_GUESS outside the playing phase', () => {
    const feedback = gameReducer(started(), { type: 'SUBMIT_GUESS', guess: 42 })
    const again = gameReducer(feedback, { type: 'SUBMIT_GUESS', guess: 10 })
    expect(again).toBe(feedback)
  })

  it('advances to the next round on NEXT', () => {
    let s = started()
    s = gameReducer(s, { type: 'SUBMIT_GUESS', guess: 42 })
    s = gameReducer(s, { type: 'NEXT' })
    expect(s.phase).toBe('playing')
    expect(s.index).toBe(1)
  })

  it('ends the game after the last round', () => {
    let s = started()
    s = gameReducer(s, { type: 'SUBMIT_GUESS', guess: 42 })
    s = gameReducer(s, { type: 'NEXT' })
    s = gameReducer(s, { type: 'SUBMIT_GUESS', guess: 65 })
    s = gameReducer(s, { type: 'NEXT' })
    expect(s.phase).toBe('results')
    expect(s.results).toHaveLength(2)
  })

  it('resets back to the initial state', () => {
    const s = gameReducer(started(), { type: 'RESET' })
    expect(s).toEqual(initialState)
  })
})
