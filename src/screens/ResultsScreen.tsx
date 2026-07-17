import { Button } from '../components/Button'
import { StatTile } from '../components/StatTile'
import { KnightStage } from '../components/KnightStage'
import { summaryMessage } from '../game/messages'
import { useCountUp } from '../hooks/useCountUp'
import type { SessionSummary } from '../game/types'
import styles from './ResultsScreen.module.css'

interface ResultsScreenProps {
  summary: SessionSummary
  /** Shows the unlock callout on the game that earned the head narrator. */
  justUnlockedHead?: boolean
  onPlayAgain: () => void
}

export function ResultsScreen({
  summary,
  justUnlockedHead = false,
  onPlayAgain,
}: ResultsScreenProps) {
  const { total, withinCount, averageError, accuracy, best, worst } = summary
  const animatedAccuracy = useCountUp(accuracy)
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.scoreRing} style={ringStyle(animatedAccuracy)}>
          <span className={styles.scoreValue}>{Math.round(animatedAccuracy)}%</span>
          <span className={styles.scoreLabel}>accuracy</span>
        </div>
        <KnightStage
          line={summaryMessage(summary)}
          mood={accuracy >= 50 ? 'happy' : 'encouraging'}
        />
      </div>

      {justUnlockedHead && (
        <p className={styles.unlock} role="status">
          <strong>New narrator unlocked.</strong> The floating head takes over from
          here.
        </p>
      )}

      <div className={styles.grid}>
        <StatTile label="Images" value={total} />
        <StatTile
          label="Within ±5%"
          value={`${withinCount} / ${total}`}
          tone="success"
        />
        <StatTile label="Avg error" value={`${averageError}%`} />
        <StatTile
          label="Best guess"
          value={best ? `${best.error}%` : '—'}
          hint={best ? `off on the ${best.correctPct}% image` : undefined}
          tone="success"
        />
        <StatTile
          label="Worst guess"
          value={worst ? `${worst.error}%` : '—'}
          hint={worst ? `off on the ${worst.correctPct}% image` : undefined}
          tone="danger"
        />
        <StatTile
          label="On target"
          value={total > 0 ? `${Math.round((withinCount / total) * 100)}%` : '—'}
        />
      </div>

      <Button onClick={onPlayAgain} full>
        Play Again
      </Button>
    </div>
  )
}

/** Conic-gradient progress ring driven by accuracy. */
function ringStyle(accuracy: number): React.CSSProperties {
  return {
    background: `conic-gradient(var(--color-success) ${accuracy * 3.6}deg, var(--color-surface-2) 0deg)`,
  }
}
