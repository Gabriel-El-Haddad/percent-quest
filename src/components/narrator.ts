import { createContext, useContext } from 'react'

/** Who speaks the game's lines. The head is earned; the knight is the default. */
export type NarratorKind = 'knight' | 'head'

export const NarratorContext = createContext<NarratorKind>('knight')

export function useNarrator(): NarratorKind {
  return useContext(NarratorContext)
}
