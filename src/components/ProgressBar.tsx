import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  /** 1-based current position. */
  position: number
  total: number
}

/**
 * Quest trail: the knight's journey across the session. A pennant marker
 * advances along the path as images are completed, riding toward the castle at
 * the end. Keeps the `progressbar` role for assistive tech.
 */
export function ProgressBar({ position, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (position / total) * 100) : 0
  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <span>Quest</span>
        <span className={styles.count}>
          {position} / {total}
        </span>
      </div>
      <div className={styles.trail}>
        <div className={styles.path}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Quest progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={position}
          >
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.marker} style={{ left: `${pct}%` }} aria-hidden="true">
            <svg viewBox="0 0 24 26" className={styles.pennant}>
              <rect x="4" y="1" width="2" height="24" rx="1" fill="var(--color-text)" />
              <path d="M6 2 L21 6 L6 12 Z" fill="var(--color-primary)" />
            </svg>
          </div>
        </div>
        <span className={styles.castle} aria-hidden="true">
          🏰
        </span>
      </div>
    </div>
  )
}
