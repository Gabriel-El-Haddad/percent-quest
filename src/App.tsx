import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from './hooks/useGame'
import { StartScreen } from './screens/StartScreen'
import { GameScreen } from './screens/GameScreen'
import { FeedbackScreen } from './screens/FeedbackScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import styles from './App.module.css'

// Screen-swap transition. Respect reduced-motion by keeping offsets tiny there
// (global CSS also zeroes durations).
const screenMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

function App() {
  const game = useGame()

  return (
    <main className={styles.app}>
      <section className={styles.card}>
        <AnimatePresence mode="wait">
          <motion.div key={game.phase} className={styles.screen} {...screenMotion}>
            {game.phase === 'idle' && (
              <StartScreen onStart={game.start} history={game.history} />
            )}

            {game.phase === 'playing' && game.currentRound && (
              <GameScreen
                round={game.currentRound}
                position={game.position}
                total={game.total}
                onSubmit={game.submit}
              />
            )}

            {game.phase === 'feedback' && game.lastResult && (
              <FeedbackScreen
                result={game.lastResult}
                isLast={game.position >= game.total}
                onNext={game.next}
              />
            )}

            {game.phase === 'results' && (
              <ResultsScreen summary={game.summary} onPlayAgain={game.start} />
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  )
}

export default App
