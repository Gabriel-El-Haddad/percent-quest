import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { KnightStage } from './KnightStage'

afterEach(cleanup)

describe('KnightStage', () => {
  it('renders the knight and speaks the given line', async () => {
    render(<KnightStage line="Hail there, hero!" mood="happy" />)
    expect(screen.getByRole('img', { name: /knight/i })).toBeInTheDocument()
    expect(await screen.findByText(/hail there, hero!/i)).toBeInTheDocument()
  })
})
