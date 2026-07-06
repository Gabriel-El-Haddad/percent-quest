import type { SessionSummary } from '../game/types'

/** A completed game session as persisted to history. */
export interface StoredSession extends SessionSummary {
  /** Epoch milliseconds when the session finished. */
  completedAt: number
}

/**
 * Persistence boundary for session history. UI code depends only on this
 * interface, so localStorage can later be swapped for IndexedDB or a cloud
 * backend without touching components.
 */
export interface SessionStore {
  saveSession(summary: SessionSummary): StoredSession
  getHistory(): StoredSession[]
  clear(): void
}

const STORAGE_KEY = 'percent-quest:sessions'
const MAX_SESSIONS = 50

/** localStorage-backed implementation with safe fallbacks (private mode, quota). */
export function createLocalSessionStore(
  storage: Storage | null = safeLocalStorage(),
): SessionStore {
  function read(): StoredSession[] {
    if (!storage) return []
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as StoredSession[]) : []
    } catch {
      return []
    }
  }

  function write(sessions: StoredSession[]): void {
    if (!storage) return
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch {
      // Ignore quota / serialization errors — history is a nice-to-have.
    }
  }

  return {
    saveSession(summary) {
      const entry: StoredSession = { ...summary, completedAt: Date.now() }
      // Newest first, capped so storage can't grow unbounded.
      const next = [entry, ...read()].slice(0, MAX_SESSIONS)
      write(next)
      return entry
    },
    getHistory() {
      return read()
    },
    clear() {
      if (!storage) return
      try {
        storage.removeItem(STORAGE_KEY)
      } catch {
        // no-op
      }
    },
  }
}

/** Returns localStorage if usable, else null (e.g. Safari private mode). */
function safeLocalStorage(): Storage | null {
  try {
    const ls = globalThis.localStorage
    const probe = '__percent_quest_probe__'
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return ls
  } catch {
    return null
  }
}
