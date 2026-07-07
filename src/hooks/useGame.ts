import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { gameReducer, initialState } from '../game/reducer'
import { buildGeneratedDeck, defaultRng, type RNG } from '../game/random'
import { summarize } from '../game/scoring'
import type { RoundPlan } from '../game/types'
import {
  createLocalSessionStore,
  type SessionStore,
  type StoredSession,
} from '../storage/sessionStore'

export interface UseGameOptions {
  /** Injectable for tests; defaults to Math.random. */
  rng?: RNG
  /** Injectable persistence; defaults to localStorage-backed store. */
  store?: SessionStore
}

/**
 * Binds the pure game reducer to React and to the persistence layer. Components
 * consume this hook and never touch the reducer or store directly.
 */
export function useGame(options: UseGameOptions = {}) {
  const rng = options.rng ?? defaultRng
  // Create the store once; it is a stable dependency for the session save effect.
  const store = useMemo(
    () => options.store ?? createLocalSessionStore(),
    [options.store],
  )

  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [history, setHistory] = useState<StoredSession[]>(() => store.getHistory())
  const savedForGame = useRef(false)

  const summary = useMemo(() => summarize(state.results), [state.results])

  const currentRound: RoundPlan | null =
    state.phase === 'playing' ? (state.deck[state.index] ?? null) : null

  const start = useCallback(() => {
    savedForGame.current = false
    dispatch({ type: 'START_GAME', deck: buildGeneratedDeck(rng) })
  }, [rng])

  const submit = useCallback((guess: number) => {
    dispatch({ type: 'SUBMIT_GUESS', guess })
  }, [])

  const next = useCallback(() => dispatch({ type: 'NEXT' }), [])

  const reset = useCallback(() => {
    savedForGame.current = false
    dispatch({ type: 'RESET' })
  }, [])

  // Persist exactly once when a game reaches the results screen.
  useEffect(() => {
    if (state.phase === 'results' && !savedForGame.current) {
      savedForGame.current = true
      store.saveSession(summary)
      setHistory(store.getHistory())
    }
  }, [state.phase, summary, store])

  return {
    phase: state.phase,
    total: state.deck.length,
    /** 1-based position of the current round for display (e.g. 5 / 30). */
    position: state.index + 1,
    currentRound,
    lastResult: state.lastResult,
    summary,
    history,
    start,
    submit,
    next,
    reset,
  }
}

export type UseGame = ReturnType<typeof useGame>
