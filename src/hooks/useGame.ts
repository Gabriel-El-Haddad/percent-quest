import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import imagesData from '../data/images.json'
import { gameReducer, initialState } from '../game/reducer'
import { buildDeck, defaultRng, type RNG } from '../game/random'
import { summarize } from '../game/scoring'
import { isHeadUnlocked } from '../game/unlock'
import type { ImageItem, RoundPlan } from '../game/types'
import {
  createLocalSessionStore,
  type SessionStore,
  type StoredSession,
} from '../storage/sessionStore'

const images = imagesData as ImageItem[]

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
  const [justUnlockedHead, setJustUnlockedHead] = useState(false)
  const savedForGame = useRef(false)

  const summary = useMemo(() => summarize(state.results), [state.results])

  const currentRound: RoundPlan | null =
    state.phase === 'playing' ? (state.deck[state.index] ?? null) : null

  const start = useCallback(() => {
    savedForGame.current = false
    setJustUnlockedHead(false)
    dispatch({ type: 'START_GAME', deck: buildDeck(images, rng) })
  }, [rng])

  const submit = useCallback((guess: number) => {
    dispatch({ type: 'SUBMIT_GUESS', guess })
  }, [])

  const next = useCallback(() => dispatch({ type: 'NEXT' }), [])

  const reset = useCallback(() => {
    savedForGame.current = false
    setJustUnlockedHead(false)
    dispatch({ type: 'RESET' })
  }, [])

  // Persist exactly once when a game reaches the results screen. The unlock is
  // sampled either side of the save so the results screen can call out the
  // moment it is earned, rather than on every later game that clears the bar.
  useEffect(() => {
    if (state.phase === 'results' && !savedForGame.current) {
      savedForGame.current = true
      const unlockedBefore = isHeadUnlocked(store.getHistory())
      store.saveSession(summary)
      const next = store.getHistory()
      setHistory(next)
      setJustUnlockedHead(!unlockedBefore && isHeadUnlocked(next))
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
    /** True once any saved game cleared the accuracy bar. */
    headUnlocked: isHeadUnlocked(history),
    /** True only on the results screen of the game that earned the unlock. */
    justUnlockedHead,
    start,
    submit,
    next,
    reset,
  }
}

export type UseGame = ReturnType<typeof useGame>
