import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  /** 1-based current position. */
  position: number
  total: number
}

export function ProgressBar({ position, total }: ProgressBarProps) {
  const pct = total > 0 ? (position / total) * 100 : 0
  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <span>Image</span>
        <span className={styles.count}>
          {position} / {total}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={position}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
