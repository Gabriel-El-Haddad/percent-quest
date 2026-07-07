import styles from './DialogueBox.module.css'

interface DialogueBoxProps {
  /** The (possibly partially typed) line to show. */
  text: string
  /** True while the typewriter is still revealing characters. */
  typing?: boolean
}

/**
 * A speech bubble that renders the knight's current line. Purely presentational:
 * the typewriter reveal lives in the parent (KnightStage), which passes the
 * growing `text`. `aria-live` announces the settled line to screen readers.
 */
export function DialogueBox({ text, typing }: DialogueBoxProps) {
  return (
    <div className={styles.bubble} aria-live="polite">
      <p className={styles.line}>
        <span>{text}</span>
        {typing && <span className={styles.caret} aria-hidden="true" />}
      </p>
    </div>
  )
}
