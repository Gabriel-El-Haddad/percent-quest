import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ResultsScreen } from './ResultsScreen'
import type { RoundResult, SessionSummary } from '../game/types'

function roundResult(partial: Partial<RoundResult>): RoundResult {
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

afterEach(cleanup)

describe('ResultsScreen', () => {
  it('renders the knight summary and the best/worst stat tiles', () => {
    const summary: SessionSummary = {
      total: 15,
      withinCount: 9,
      averageError: 6.2,
      accuracy: 60,
      best: roundResult({ error: 1, correctPct: 100 }),
      worst: roundResult({ error: 44, correctPct: 25, within: false }),
    }
    render(<ResultsScreen summary={summary} onPlayAgain={() => {}} />)

    // Summary copy is delivered through the knight dialogue bubble.
    expect(screen.getByRole('img', { name: /knight/i })).toBeInTheDocument()
    // Best-guess tile (the one that used to overflow) renders its hint.
    expect(screen.getByText(/off on the 100% image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument()
  })
})
