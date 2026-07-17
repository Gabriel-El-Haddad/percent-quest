import { motion, useReducedMotion } from 'framer-motion'
import type { KnightMood } from './Knight'
import headSrc from '../assets/head.webp'
import mouthSrc from '../assets/mouth.webp'
import styles from './TalkingHead.module.css'

interface TalkingHeadProps {
  mood?: KnightMood
  className?: string
}

/**
 * The unlocked narrator: a photo cut-out head that talks South Park style. The
 * face is one image drawn twice and clipped at the mouth line; while `talking`
 * the lower piece hinges down, revealing a mouth band that sits behind both
 * halves. Shares the `mood` vocabulary with the knight so either can stand in
 * for the other. Motion is disabled under prefers-reduced-motion.
 */
export function TalkingHead({ mood = 'idle', className }: TalkingHeadProps) {
  const reduce = useReducedMotion()

  const bodyAnimate = reduce
    ? undefined
    : mood === 'happy'
      ? { y: [0, -9, 0], rotate: [0, -3, 3, 0] }
      : mood === 'encouraging'
        ? { rotate: [0, -3, 3, 0] }
        : mood === 'talking'
          ? { y: [0, -2, 0] }
          : { y: [0, -3, 0] }

  const bodyTransition = reduce
    ? undefined
    : {
        duration: mood === 'happy' ? 0.7 : mood === 'talking' ? 1.4 : 2.6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }

  // A closed jaw is the resting state, so reduced-motion simply never opens it.
  const talking = mood === 'talking' && !reduce

  return (
    <motion.div
      className={`${styles.head} ${className ?? ''}`}
      role="img"
      aria-label="Your floating head, narrating"
      animate={bodyAnimate}
      transition={bodyTransition}
    >
      <img className={styles.mouth} src={mouthSrc} alt="" draggable={false} />
      <img className={styles.top} src={headSrc} alt="" draggable={false} />
      <motion.img
        className={styles.jaw}
        src={headSrc}
        alt=""
        draggable={false}
        animate={talking ? { y: ['0%', '3.6%', '0%'] } : { y: '0%' }}
        transition={
          talking
            ? { duration: 0.34, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.12 }
        }
      />
    </motion.div>
  )
}
