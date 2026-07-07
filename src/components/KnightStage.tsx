import { Knight, type KnightMood } from './Knight'
import { DialogueBox } from './DialogueBox'
import { useTypewriter } from '../hooks/useTypewriter'
import styles from './KnightStage.module.css'

interface KnightStageProps {
  /** The line the knight speaks. */
  line: string
  /** Resting mood once the line finishes typing. Defaults to idle. */
  mood?: Exclude<KnightMood, 'talking'>
}

/**
 * Pairs the knight with his speech bubble and owns the typewriter reveal: the
 * knight is in `talking` state while the line types, then settles to `mood`.
 * This is the single entry point for routing player-facing copy through the
 * character.
 */
export function KnightStage({ line, mood = 'idle' }: KnightStageProps) {
  const { display, done } = useTypewriter(line)
  return (
    <div className={styles.stage}>
      <div className={styles.knight}>
        <Knight mood={done ? mood : 'talking'} />
      </div>
      <DialogueBox text={display} typing={!done} />
    </div>
  )
}
