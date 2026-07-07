import { useState } from 'react'
import { ImageCard } from '../components/ImageCard'
import { PercentInput } from '../components/PercentInput'
import { ProgressBar } from '../components/ProgressBar'
import { KnightStage } from '../components/KnightStage'
import { promptMessage } from '../game/messages'
import type { RoundPlan } from '../game/types'
import styles from './GameScreen.module.css'

interface GameScreenProps {
  round: RoundPlan
  position: number
  total: number
  onSubmit: (guess: number) => void
}

// The slider always holds a value, so start each round from the midpoint.
const START_VALUE = 50

export function GameScreen({ round, position, total, onSubmit }: GameScreenProps) {
  const [value, setValue] = useState(START_VALUE)

  const handleSubmit = () => {
    onSubmit(value)
    setValue(START_VALUE)
  }

  return (
    <div className={styles.wrap}>
      <KnightStage line={promptMessage(position)} />
      <ProgressBar position={position} total={total} />
      {/* key forces a fresh mount per round so transitions/animations re-trigger */}
      <ImageCard key={round.image.id} src={round.image.src} rotation={round.rotation} />
      <PercentInput value={value} onChange={setValue} onSubmit={handleSubmit} />
    </div>
  )
}
