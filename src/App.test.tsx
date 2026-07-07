import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: /begin the quest/i })).toBeInTheDocument()
  })

  it('starts a game and shows an image with the slider input', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /begin the quest/i }))

    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /shaded area/i })).toBeInTheDocument()
    // Slider-only input: a range control, no number/text field.
    expect(
      screen.getByRole('slider', { name: /percentage estimate/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.getByRole('button', { name: /lock it in/i })).toBeInTheDocument()
  })

  it('submitting a guess reveals feedback with the correct answer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /begin the quest/i }))

    const slider = await screen.findByRole('slider', { name: /percentage estimate/i })
    fireEvent.change(slider, { target: { value: '50' } })
    await user.click(screen.getByRole('button', { name: /lock it in/i }))

    // Feedback screen shows the "Correct" answer stat and a way to continue.
    expect(await screen.findByText(/^correct$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /next image|see results/i }),
    ).toBeInTheDocument()
  })
})
