import { Knight, type KnightMood } from './Knight'
import { TalkingHead } from './TalkingHead'
import { DialogueBox } from './DialogueBox'
import { useNarrator } from './narrator'
import { useTypewriter } from '../hooks/useTypewriter'
import styles from './KnightStage.module.css'

interface KnightStageProps {
  /** The line the narrator speaks. */
  line: string
  /** Resting mood once the line finishes typing. Defaults to idle. */
  mood?: Exclude<KnightMood, 'talking'>
}

/**
 * Pairs the narrator with their speech bubble and owns the typewriter reveal:
 * the character is in `talking` state while the line types, then settles to
 * `mood`. This is the single entry point for routing player-facing copy through
 * the character, so which one is on stage is read from context rather than
 * threaded through every screen.
 */
export function KnightStage({ line, mood = 'idle' }: KnightStageProps) {
  const { display, done } = useTypewriter(line)
  const narrator = useNarrator()
  const character = done ? mood : 'talking'
  return (
    <div className={styles.stage}>
      <div className={styles.knight}>
        {narrator === 'head' ? (
          <TalkingHead mood={character} />
        ) : (
          <Knight mood={character} />
        )}
      </div>
      <DialogueBox text={display} typing={!done} />
    </div>
  )
}
