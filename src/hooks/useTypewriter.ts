import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Typewriter {
  /** The portion of `text` revealed so far. */
  display: string
  /** True once the full text has been revealed. */
  done: boolean
}

/**
 * Reveals `text` one character at a time. Under prefers-reduced-motion the full
 * string appears instantly (and `done` is immediately true), matching the
 * project's global motion policy.
 */
export function useTypewriter(text: string, charsPerSecond = 42): Typewriter {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(() => (reduce ? text.length : 0))

  useEffect(() => {
    if (reduce) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, 1000 / charsPerSecond)
    return () => clearInterval(id)
  }, [text, reduce, charsPerSecond])

  const clamped = Math.min(count, text.length)
  return { display: text.slice(0, clamped), done: clamped >= text.length }
}
