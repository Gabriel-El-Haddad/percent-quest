import { useId } from 'react'
import { gameConfig } from '../config/gameConfig'
import styles from './PercentInput.module.css'

interface PercentInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

/**
 * Percentage entry: a synced number field + range slider. Keeps the raw string
 * value (so the field can be empty) — parsing/clamping happens at scoring time.
 */
export function PercentInput({ value, onChange, onSubmit, disabled }: PercentInputProps) {
  const id = useId()
  const { minGuess, maxGuess } = gameConfig
  const sliderValue = value === '' ? minGuess : Number(value)

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>
        Your estimate
      </label>
      <form
        className={styles.row}
        onSubmit={(e) => {
          e.preventDefault()
          if (!disabled && value !== '') onSubmit()
        }}
      >
        <div className={styles.field}>
          <input
            id={id}
            className={styles.number}
            type="number"
            inputMode="numeric"
            min={minGuess}
            max={maxGuess}
            step={1}
            placeholder="0"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <span className={styles.percent}>%</span>
        </div>
        <button
          type="submit"
          className={styles.submit}
          disabled={disabled || value === ''}
        >
          Submit
        </button>
      </form>
      <input
        className={styles.slider}
        type="range"
        min={minGuess}
        max={maxGuess}
        step={1}
        value={sliderValue}
        disabled={disabled}
        aria-label="Estimate slider"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
