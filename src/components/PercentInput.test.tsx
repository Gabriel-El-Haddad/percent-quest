import { describe, it, expect, vi, afterEach } from 'vitest'
import { useState } from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PercentInput } from './PercentInput'

// Harness mirrors GameScreen: the parent owns the numeric value.
function Harness({ onSubmit = () => {} }: { onSubmit?: (n: number) => void }) {
  const [value, setValue] = useState(50)
  return (
    <PercentInput value={value} onChange={setValue} onSubmit={() => onSubmit(value)} />
  )
}

afterEach(cleanup)

describe('PercentInput', () => {
  it('shows the value as a read-only number and exposes no text field', () => {
    render(<Harness />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(
      screen.getByRole('slider', { name: /percentage estimate/i }),
    ).toBeInTheDocument()
  })

  it('updates the read-only number as the slider moves', () => {
    render(<Harness />)
    const slider = screen.getByRole('slider', { name: /percentage estimate/i })
    fireEvent.change(slider, { target: { value: '73' } })
    expect(screen.getByText('73')).toBeInTheDocument()
  })

  it('submits the current value via the button', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSubmit={onSubmit} />)
    fireEvent.change(
      screen.getByRole('slider', { name: /percentage estimate/i }),
      { target: { value: '20' } },
    )
    await user.click(screen.getByRole('button', { name: /lock it in/i }))
    expect(onSubmit).toHaveBeenCalledWith(20)
  })
})
