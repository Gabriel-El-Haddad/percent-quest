import { Button } from '../components/Button'
import { KnightStage } from '../components/KnightStage'
import { introMessage } from '../game/messages'
import type { StoredSession } from '../storage/sessionStore'
import styles from './StartScreen.module.css'

interface StartScreenProps {
  onStart: () => void
  history: StoredSession[]
}

export function StartScreen({ onStart, history }: StartScreenProps) {
  const last = history[0]
  return (
    <div className={styles.wrap}>
      <div className={styles.badge}>🛡️ Estimation Quest</div>
      <h1 className={styles.title}>Percent Quest</h1>

      <KnightStage line={introMessage()} mood="happy" />

      <Button onClick={onStart} full>
        Begin the Quest
      </Button>

      {last && (
        <p className={styles.last}>
          Last quest: <strong>{last.accuracy}%</strong> accuracy over {last.total}{' '}
          sigils.
        </p>
      )}
    </div>
  )
}
