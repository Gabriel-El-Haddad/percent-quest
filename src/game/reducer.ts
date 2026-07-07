import type { GameAction, GameState } from './types'
import { scoreRound } from './scoring'

export const initialState: GameState = {
  phase: 'idle',
  deck: [],
  index: 0,
  results: [],
  lastResult: null,
}

/**
 * The game as a pure finite state machine:
 *   idle → (START_GAME) → playing ⇄ feedback → … → results → (RESET) → idle
 *
 * The deck is built with randomness OUTSIDE the reducer (see buildGeneratedDeck)
 * and passed in via START_GAME, keeping this function pure and deterministic.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (action.deck.length === 0) return state
      return {
        phase: 'playing',
        deck: action.deck,
        index: 0,
        results: [],
        lastResult: null,
      }
    }

    case 'SUBMIT_GUESS': {
      if (state.phase !== 'playing') return state
      const round = state.deck[state.index]
      if (!round) return state
      const result = scoreRound(round.image, round.rotation, action.guess)
      return {
        ...state,
        phase: 'feedback',
        results: [...state.results, result],
        lastResult: result,
      }
    }

    case 'NEXT': {
      if (state.phase !== 'feedback') return state
      const nextIndex = state.index + 1
      if (nextIndex >= state.deck.length) {
        return { ...state, phase: 'results' }
      }
      return { ...state, phase: 'playing', index: nextIndex }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}
