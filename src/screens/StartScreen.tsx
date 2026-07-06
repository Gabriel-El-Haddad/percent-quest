import { Button } from '../components/Button'
import { gameConfig } from '../config/gameConfig'
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
      <div className={styles.badge}>🎯 Estimation Practice</div>
      <h1 className={styles.title}>Percent Quest</h1>
      <p className={styles.subtitle}>
        How much of each image is shaded? Train your eye by estimating the
        percentage — images are shuffled and randomly rotated every game.
      </p>

      <ol className={styles.steps}>
        <li>Study the shaded image.</li>
        <li>Type your best percentage guess.</li>
        <li>
          Land within <strong>±{gameConfig.tolerance}%</strong> to nail it.
        </li>
      </ol>

      <Button onClick={onStart} full>
        Start Game
      </Button>

      {last && (
        <p className={styles.last}>
          Last session: <strong>{last.accuracy}%</strong> accuracy over{' '}
          {last.total} images.
        </p>
      )}
    </div>
  )
}
