import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph, iconLabel } from './ui'
import { COUNT_LEVEL_COUNT, ROWS, countLevels, makeCountRound, type CountRound } from './countLogic'
import * as sound from './sound'
import type { IconName } from './gameData'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  /** called after a wrong pick, with the level the child reached */
  onFailed: (level: number) => void
  soundButton: React.ReactNode
}

const NUMBER_COLORS = ['#ff8fa3', '#6cc3f5', '#7bd88f']

/**
 * Counting: level N shows N of the same item (1 to 9). Pick the right number out of three.
 * A wrong pick ends the run: the number turns red, a sad sound plays and the "Oops" screen follows.
 * There are no extra tricks in later levels.
 */
export default function CountGame({ onHome, onFinished, onFailed, soundButton }: Props) {
  const lastIcon = useRef<IconName | undefined>(undefined)
  const make = (level: number): CountRound => {
    const r = makeCountRound(level, lastIcon.current)
    lastIcon.current = r.icon
    return r
  }
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<CountRound>(() => make(1))
  const [failed, setFailed] = useState<number | null>(null) // the wrong number the child tapped
  const [solved, setSolved] = useState(false)
  const [hint, setHint] = useState(false)
  const [bounced, setBounced] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    },
    [],
  )

  // If the child pauses for a while, gently pulse the right number.
  useEffect(() => {
    setHint(false)
    if (solved || failed !== null) return
    const id = window.setTimeout(() => setHint(true), 9000)
    return () => window.clearTimeout(id)
  }, [round, failed, solved])

  const beginLevel = (index: number) => {
    setLevelIndex(index)
    setRound(make(index + 1))
    setFailed(null)
    setSolved(false)
  }

  const onPick = (n: number) => {
    if (solved || failed !== null) return
    if (n === round.count) {
      setSolved(true)
      sound.playCorrect(levelIndex)
      later(() => {
        sound.playLevelWin()
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
      }, 250)
      later(() => {
        if (levelIndex < COUNT_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
        else onFinished()
      }, 2000)
    } else {
      // A wrong pick ends the run; playing again from Home starts at level 1.
      sound.playFail()
      setFailed(n)
      later(() => onFailed(levelIndex + 1), 1100)
    }
  }

  const onItemTap = (i: number) => {
    sound.playTap()
    setBounced(i)
    later(() => setBounced((b) => (b === i ? null : b)), 400)
  }

  const rows = ROWS[round.count]
  let index = 0

  return (
    <main className="game count-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${COUNT_LEVEL_COUNT}`}>
          {countLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <p className="count-ask">How many?</p>

      <section
        className="count-items"
        key={`items-${levelIndex}`}
        role="img"
        aria-label={`${round.count} ${iconLabel(round.icon)}`}
      >
        {rows.map((n, r) => (
          <div className="count-row" key={r}>
            {Array.from({ length: n }, () => {
              const i = index++
              return (
                <button
                  key={i}
                  className="count-item"
                  style={{ '--d': `${i * 110}ms` } as React.CSSProperties}
                  onClick={() => onItemTap(i)}
                  aria-hidden
                  tabIndex={-1}
                >
                  <span className={`count-in ${bounced === i ? 'bounce' : ''}`}>
                    <Icon name={round.icon} />
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </section>

      <section className="count-options" aria-label="Pick the number" key={`options-${levelIndex}`}>
        {round.options.map((n, i) => {
          const cls = [
            'count-option',
            solved && n === round.count ? 'right' : '',
            solved && n !== round.count ? 'faded' : '',
            failed === n ? 'failed' : '',
            failed !== null && failed !== n ? 'faded' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={n}
              className={cls}
              style={{ '--c': NUMBER_COLORS[i % NUMBER_COLORS.length], '--d': `${i * 60}ms` } as React.CSSProperties}
              onClick={() => onPick(n)}
              aria-label={`${n}`}
              disabled={failed !== null}
            >
              <span className={`count-num ${hint && !solved && failed === null && n === round.count ? 'hint' : ''}`}>
                {n}
              </span>
            </button>
          )
        })}
      </section>
      <p className="sr-only" aria-live="polite">
        {solved ? `Yes, ${round.count}!` : ''}
      </p>

      {solved && (
        <div className="overlay" role="status">
          <div className="congrats">
            <div className="big-star" aria-hidden>
              <Icon name="star" />
            </div>
            <h2>Great job!</h2>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <small>Grown-ups: hold the home button to exit</small>
      </footer>
    </main>
  )
}
