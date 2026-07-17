import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { KnightStage } from './KnightStage'
import { NarratorContext } from './narrator'

afterEach(cleanup)

describe('KnightStage', () => {
  it('renders the knight and speaks the given line', async () => {
    render(<KnightStage line="Hail there, hero!" mood="happy" />)
    expect(screen.getByRole('img', { name: /knight/i })).toBeInTheDocument()
    expect(await screen.findByText(/hail there, hero!/i)).toBeInTheDocument()
  })

  it('defaults to the knight when the head is locked', () => {
    render(<KnightStage line="Hail!" />)
    expect(screen.getByRole('img', { name: /knight/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /head/i })).not.toBeInTheDocument()
  })

  it('swaps in the head once unlocked, still speaking the line', async () => {
    render(
      <NarratorContext.Provider value="head">
        <KnightStage line="Nice guess." mood="happy" />
      </NarratorContext.Provider>,
    )
    expect(screen.getByRole('img', { name: /head/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /knight/i })).not.toBeInTheDocument()
    expect(await screen.findByText(/nice guess\./i)).toBeInTheDocument()
  })
})
