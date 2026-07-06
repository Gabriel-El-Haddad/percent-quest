import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { feedbackMessage } from '../game/messages'
import type { RoundResult } from '../game/types'
import styles from './FeedbackScreen.module.css'

interface FeedbackScreenProps {
  result: RoundResult
  isLast: boolean
  onNext: () => void
}

export function FeedbackScreen({ result, isLast, onNext }: FeedbackScreenProps) {
  const { guess, correctPct, error, within } = result
  return (
    <div className={styles.wrap}>
      <motion.div
        className={`${styles.banner} ${within ? styles.pass : styles.miss}`}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      >
        <span className={styles.icon}>{within ? '✅' : '🔍'}</span>
        <span className={styles.verdict}>
          {within ? 'Within ±5%!' : 'Outside ±5%'}
        </span>
      </motion.div>

      <div className={styles.numbers}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Your guess</span>
          <span className={styles.statValue}>{guess}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Correct</span>
          <span className={styles.statValue}>{correctPct}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Off by</span>
          <span className={`${styles.statValue} ${within ? styles.good : styles.bad}`}>
            {Math.round(error * 10) / 10}
          </span>
        </div>
      </div>

      <p className={styles.message}>{feedbackMessage(result)}</p>

      <Button onClick={onNext} full>
        {isLast ? 'See Results' : 'Next Image'}
      </Button>
    </div>
  )
}
