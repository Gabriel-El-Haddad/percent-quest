import { describe, it, expect } from 'vitest'
import { createLocalSessionStore } from './sessionStore'
import type { SessionSummary } from '../game/types'

/** Minimal in-memory Storage stand-in. */
function fakeStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
}

const summary: SessionSummary = {
  total: 3,
  withinCount: 2,
  averageError: 5.5,
  accuracy: 66.7,
  best: null,
  worst: null,
}

describe('createLocalSessionStore', () => {
  it('saves and reads back sessions, newest first', () => {
    const store = createLocalSessionStore(fakeStorage())
    store.saveSession({ ...summary, accuracy: 50 })
    store.saveSession({ ...summary, accuracy: 90 })
    const history = store.getHistory()
    expect(history).toHaveLength(2)
    expect(history[0].accuracy).toBe(90)
    expect(history[0].completedAt).toBeTypeOf('number')
  })

  it('clears history', () => {
    const store = createLocalSessionStore(fakeStorage())
    store.saveSession(summary)
    store.clear()
    expect(store.getHistory()).toEqual([])
  })

  it('degrades gracefully when storage is unavailable', () => {
    const store = createLocalSessionStore(null)
    expect(() => store.saveSession(summary)).not.toThrow()
    expect(store.getHistory()).toEqual([])
  })

  it('returns an empty array when stored data is corrupt', () => {
    const storage = fakeStorage()
    storage.setItem('percent-quest:sessions', '{not json')
    const store = createLocalSessionStore(storage)
    expect(store.getHistory()).toEqual([])
  })
})
