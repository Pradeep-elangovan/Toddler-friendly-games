import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import { SERIES_LEVEL_COUNT, makeSeriesRound, seriesLevels, type SeriesRound } from './seriesLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  /** called after a wrong pick, with the level the child reached */
  onFailed: (level: number) => void
  soundButton: React.ReactNode
}

const OPTION_COLORS = ['#ff8fa3', '#6cc3f5', '#7bd88f']
const TILE_COLORS = ['#ffb4a2', '#ffd166', '#a0e7e5', '#cdb4f6', '#b8e0a0', '#bde0fe']

/**
 * Missing Letter: letters in alphabet order with one hidden. Pick the missing letter out of three.
 * A wrong pick ends the run: the letter turns red, a sad sound plays and the "Oops" screen follows.
 */
export default function SeriesGame({ onHome, onFinished, onFailed, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<SeriesRound>(() => makeSeriesRound(1))
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [hint, setHint] = useState(false)
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

  // After a pause, gently pulse the right letter.
  useEffect(() => {
    setHint(false)
    if (solved || failed !== null) return
    const id = window.setTimeout(() => setHint(true), 10000)
    return () => window.clearTimeout(id)
  }, [round, solved, failed])

  const beginLevel = (index: number) => {
    setLevelIndex(index)
    setRound(makeSeriesRound(index + 1))
    setSolved(false)
    setFailed(null)
  }

  const onPick = (letter: string) => {
    if (solved || failed !== null) return
    if (letter === round.answer) {
      setSolved(true)
      sound.playCorrect(levelIndex)
      later(() => {
        sound.playLevelWin()
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
      }, 400)
      later(() => {
        if (levelIndex < SERIES_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
        else onFinished()
      }, 2400)
    } else {
      // A wrong pick ends the run; playing again from Home starts at level 1.
      sound.playFail()
      setFailed(letter)
      later(() => onFailed(levelIndex + 1), 1100)
    }
  }

  const lv = seriesLevels[levelIndex]

  return (
    <main className="game series-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots many" role="img" aria-label={`Level ${levelIndex + 1} of ${SERIES_LEVEL_COUNT}`}>
          {seriesLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <p className="count-ask">Which letter is missing?</p>

      <section
        className="series-row"
        key={`row-${levelIndex}`}
        role="img"
        aria-label={`${lv.from} to ${lv.to}, one letter is missing`}
        style={{ '--n': round.letters.length } as React.CSSProperties}
      >
        {round.letters.map((ch, i) => {
          const isMissing = i === round.missing
          if (isMissing && !solved) {
            return (
              <span key={i} className={`series-tile blank ${failed !== null ? 'wrong' : ''}`} style={{ '--d': `${i * 80}ms` } as React.CSSProperties}>
                {failed !== null ? failed : '?'}
              </span>
            )
          }
          return (
            <span
              key={i}
              className={`series-tile ${isMissing ? 'filled' : ''}`}
              style={{ '--d': `${i * 80}ms`, background: TILE_COLORS[i % TILE_COLORS.length] } as React.CSSProperties}
            >
              {ch}
            </span>
          )
        })}
      </section>

      <section className="count-options series-options" aria-label="Pick the missing letter" key={`opts-${levelIndex}`}>
        {round.options.map((ch, i) => {
          const cls = [
            'count-option',
            solved && ch === round.answer ? 'right' : '',
            solved && ch !== round.answer ? 'faded' : '',
            failed === ch ? 'failed' : '',
            failed !== null && failed !== ch ? 'faded' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={ch}
              className={cls}
              style={{ '--c': OPTION_COLORS[i % OPTION_COLORS.length], '--d': `${i * 60}ms` } as React.CSSProperties}
              onClick={() => onPick(ch)}
              aria-label={ch}
              disabled={solved || failed !== null}
            >
              <span className={`count-num ${hint && !solved && failed === null && ch === round.answer ? 'hint' : ''}`}>{ch}</span>
            </button>
          )
        })}
      </section>
      <p className="sr-only" aria-live="polite">
        {solved ? `Yes, ${round.answer}!` : ''}
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
