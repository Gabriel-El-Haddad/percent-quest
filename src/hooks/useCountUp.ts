import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms using rAF.
 * Honors prefers-reduced-motion by snapping straight to the target.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const frame = useRef<number | undefined>(undefined)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || duration <= 0) {
      setValue(target)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic for a snappy settle.
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else setValue(target)
    }
    frame.current = requestAnimationFrame(tick)

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    }
  }, [target, duration])

  return value
}
