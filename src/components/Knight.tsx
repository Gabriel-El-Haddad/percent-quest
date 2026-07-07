import { motion, useReducedMotion } from 'framer-motion'
import { useId } from 'react'
import styles from './Knight.module.css'

export type KnightMood = 'idle' | 'talking' | 'happy' | 'encouraging'

interface KnightProps {
  mood?: KnightMood
  className?: string
}

/**
 * Sir Pixel — a code-drawn SVG knight companion (no external assets, works
 * offline). `mood` drives his animation and expression; the mouth animates open
 * and closed while `talking`. Motion is disabled under prefers-reduced-motion.
 */
export function Knight({ mood = 'idle', className }: KnightProps) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/[:]/g, '')
  const plume = `plume-${uid}`
  const armor = `armor-${uid}`
  const shield = `shield-${uid}`

  // Whole-body motion: a gentle bob at rest, a bouncy cheer when happy, a small
  // sway of support when encouraging.
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

  const happyEyes = mood === 'happy'

  return (
    <motion.svg
      className={`${styles.knight} ${className ?? ''}`}
      viewBox="0 0 100 132"
      role="img"
      aria-label="Sir Pixel, your knight companion"
      animate={bodyAnimate}
      transition={bodyTransition}
    >
      <defs>
        <linearGradient id={plume} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9fb6" />
          <stop offset="1" stopColor="#ff5d7e" />
        </linearGradient>
        <linearGradient id={armor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdd5ff" />
          <stop offset="1" stopColor="#7d93ff" />
        </linearGradient>
        <linearGradient id={shield} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8aa0ff" />
          <stop offset="1" stopColor="#4d6bff" />
        </linearGradient>
      </defs>

      {/* Plume */}
      <path d="M50 6 C 62 0, 78 6, 68 22 C 62 15, 55 16, 51 24 Z" fill={`url(#${plume})`} />
      <circle cx="50" cy="24" r="4" fill="#c3ccff" />

      {/* Helmet + face guard */}
      <path
        d="M26 42 C 26 18, 74 18, 74 42 L 74 60 C 74 70, 26 70, 26 60 Z"
        fill={`url(#${armor})`}
        stroke="#4d6bff"
        strokeWidth="2.5"
      />
      {/* Dark visor window */}
      <rect x="33" y="40" width="34" height="22" rx="7" fill="#20244a" />

      {/* Eyes */}
      {happyEyes ? (
        <>
          <path d="M38 51 Q42 46 46 51" stroke="#eef1ff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M54 51 Q58 46 62 51" stroke="#eef1ff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="42" cy="50" r="2.8" fill="#eef1ff" />
          <circle cx="58" cy="50" r="2.8" fill="#eef1ff" />
        </>
      )}

      {/* Mouth — animates open/closed while talking, otherwise a mood-shaped line */}
      {mood === 'talking' ? (
        <motion.ellipse
          cx="50"
          cy="58"
          rx="4"
          ry="3"
          fill="#ff7a93"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          animate={{ scaleY: [0.25, 1, 0.25] }}
          transition={{ duration: 0.34, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : mood === 'happy' ? (
        <path d="M43 56 Q50 63 57 56" stroke="#ff7a93" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : mood === 'encouraging' ? (
        <path d="M44 58 Q50 62 56 58" stroke="#ff9fb6" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="50" cy="58" rx="3" ry="1.4" fill="#ff9fb6" />
      )}

      {/* Shoulders + torso */}
      <path
        d="M28 68 Q28 64 33 63 L67 63 Q72 64 72 68 L76 108 Q76 118 66 118 L34 118 Q24 118 24 108 Z"
        fill={`url(#${armor})`}
        stroke="#4d6bff"
        strokeWidth="2.5"
      />

      {/* Chest shield bearing a % */}
      <path
        d="M39 78 L61 78 L61 96 Q61 106 50 110 Q39 106 39 96 Z"
        fill={`url(#${shield})`}
        stroke="#eef1ff"
        strokeWidth="2"
      />
      <text
        x="50"
        y="97"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#eef1ff"
        fontFamily="var(--font-mono)"
      >
        %
      </text>
    </motion.svg>
  )
}
