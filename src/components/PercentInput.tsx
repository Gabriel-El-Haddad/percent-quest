import { gameConfig } from '../config/gameConfig'
import styles from './PercentInput.module.css'

interface PercentInputProps {
  value: number
  onChange: (value: number) => void
  onSubmit: () => void
  disabled?: boolean
}

/**
 * Slider-only percentage entry. Deliberately has no text field: on mobile a
 * numeric keyboard shifts the page, so the range slider is the sole control and
 * the chosen value is shown as a large read-only number.
 */
export function PercentInput({ value, onChange, onSubmit, disabled }: PercentInputProps) {
  const { minGuess, maxGuess } = gameConfig
  return (
    <div className={styles.wrap}>
      <div className={styles.readout} aria-live="polite">
        <span className={styles.number}>{value}</span>
        <span className={styles.percent}>%</span>
      </div>

      <input
        className={styles.slider}
        type="range"
        min={minGuess}
        max={maxGuess}
        step={1}
        value={value}
        disabled={disabled}
        aria-label="Your percentage estimate"
        onChange={(e) => onChange(Number(e.target.value))}
      />

      <button
        type="button"
        className={styles.submit}
        onClick={onSubmit}
        disabled={disabled}
      >
        Lock it in
      </button>
    </div>
  )
}
