import { useState } from 'react'
import { ImageCard } from '../components/ImageCard'
import { PercentInput } from '../components/PercentInput'
import { ProgressBar } from '../components/ProgressBar'
import type { RoundPlan } from '../game/types'
import styles from './GameScreen.module.css'

interface GameScreenProps {
  round: RoundPlan
  position: number
  total: number
  onSubmit: (guess: number) => void
}

export function GameScreen({ round, position, total, onSubmit }: GameScreenProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value === '') return
    onSubmit(Number(value))
    setValue('')
  }

  return (
    <div className={styles.wrap}>
      <ProgressBar position={position} total={total} />
      {/* key forces a fresh mount per round so transitions/animations re-trigger */}
      <ImageCard key={round.image.id} src={round.image.src} rotation={round.rotation} />
      <PercentInput value={value} onChange={setValue} onSubmit={handleSubmit} />
    </div>
  )
}
