import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useGame } from './useGame'
import { createLocalSessionStore } from '../storage/sessionStore'

function fakeStore() {
  const map = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
  return createLocalSessionStore(storage)
}

describe('useGame integration', () => {
  it('plays a full session end-to-end and persists the summary', () => {
    const store = fakeStore()
    const { result } = renderHook(() =>
      useGame({ rng: () => 0.42, store }),
    )

    expect(result.current.phase).toBe('idle')

    act(() => result.current.start())
    expect(result.current.phase).toBe('playing')

    const total = result.current.total
    expect(total).toBeGreaterThan(0)

    // Play through every round: guess, view feedback, advance.
    for (let i = 0; i < total; i++) {
      expect(result.current.phase).toBe('playing')
      expect(result.current.position).toBe(i + 1)
      // Guess the current image's true value so accuracy is deterministic (100%).
      const correct = result.current.currentRound!.image.correctPct
      act(() => result.current.submit(correct))
      expect(result.current.phase).toBe('feedback')
      expect(result.current.lastResult?.within).toBe(true)
      act(() => result.current.next())
    }

    expect(result.current.phase).toBe('results')
    expect(result.current.summary.total).toBe(total)
    expect(result.current.summary.accuracy).toBe(100)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].total).toBe(total)
  })

  it('resets back to idle', () => {
    const { result } = renderHook(() => useGame({ store: fakeStore() }))
    act(() => result.current.start())
    act(() => result.current.reset())
    expect(result.current.phase).toBe('idle')
  })
})

/** Plays a whole game, deriving each guess from the round's true value. */
function playGame(
  result: { current: ReturnType<typeof useGame> },
  guess: (correct: number) => number,
) {
  act(() => result.current.start())
  const total = result.current.total
  for (let i = 0; i < total; i++) {
    const correct = result.current.currentRound!.image.correctPct
    act(() => result.current.submit(guess(correct)))
    act(() => result.current.next())
  }
}

describe('head unlock', () => {
  it('stays locked before any game is played', () => {
    const { result } = renderHook(() => useGame({ store: fakeStore() }))
    expect(result.current.headUnlocked).toBe(false)
    expect(result.current.justUnlockedHead).toBe(false)
  })

  it('stays locked after a poor game', () => {
    const { result } = renderHook(() => useGame({ store: fakeStore() }))
    // Miss every image by well over the tolerance.
    playGame(result, (correct) => (correct > 50 ? 0 : 100))
    expect(result.current.summary.accuracy).toBe(0)
    expect(result.current.headUnlocked).toBe(false)
    expect(result.current.justUnlockedHead).toBe(false)
  })

  it('unlocks and announces itself on the game that earns it', () => {
    const { result } = renderHook(() => useGame({ store: fakeStore() }))
    playGame(result, (correct) => correct)
    expect(result.current.summary.accuracy).toBe(100)
    expect(result.current.headUnlocked).toBe(true)
    expect(result.current.justUnlockedHead).toBe(true)
  })

  it('stays unlocked but announces only once', () => {
    const store = fakeStore()
    const { result } = renderHook(() => useGame({ store }))

    playGame(result, (correct) => correct)
    expect(result.current.justUnlockedHead).toBe(true)

    // A second qualifying game keeps the unlock without re-announcing it.
    playGame(result, (correct) => correct)
    expect(result.current.headUnlocked).toBe(true)
    expect(result.current.justUnlockedHead).toBe(false)
  })

  it('keeps the unlock earned in an earlier session, even after a bad game', () => {
    const store = fakeStore()
    const first = renderHook(() => useGame({ store }))
    playGame(first.result, (correct) => correct)
    expect(first.result.current.headUnlocked).toBe(true)

    // A fresh mount reads the same persisted history.
    const second = renderHook(() => useGame({ store }))
    expect(second.result.current.headUnlocked).toBe(true)
    playGame(second.result, (correct) => (correct > 50 ? 0 : 100))
    expect(second.result.current.summary.accuracy).toBe(0)
    expect(second.result.current.headUnlocked).toBe(true)
    expect(second.result.current.justUnlockedHead).toBe(false)
  })
})
