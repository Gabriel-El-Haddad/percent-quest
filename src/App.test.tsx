import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('App', () => {
  it('shows the start screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /percent quest/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('starts a game and shows an image with the estimate input', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /start game/i }))

    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /shaded area/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('submitting a guess reveals feedback with the correct answer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /start game/i }))

    const input = await screen.findByLabelText(/your estimate/i)
    await user.type(input, '50')
    await user.click(screen.getByRole('button', { name: /^submit$/i }))

    expect(await screen.findByText(/correct/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /next image|see results/i }),
    ).toBeInTheDocument()
  })
})
