import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph, iconLabel } from './ui'
import {
  MEMORY_LEVEL_COUNT,
  makeMemoryCards,
  memoryLevels,
  pairsForMemoryLevel,
  type MemoryCard,
} from './memoryLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

/**
 * Memory Match: all cards start face down. Flip one, flip a second. Two the same disappear;
 * two different flip back so the child can try to remember where they were. Never more than two open.
 */
export default function MemoryGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [cards, setCards] = useState<MemoryCard[]>(() => makeMemoryCards(1))
  const [open, setOpen] = useState<number[]>([])
  const [matching, setMatching] = useState<number[]>([])
  const [wobble, setWobble] = useState<number[]>([])
  const [celebrating, setCelebrating] = useState(false)

  const busy = useRef(false)
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

  const cfg = memoryLevels[levelIndex]
  const totalPairs = pairsForMemoryLevel(levelIndex + 1)
  const pairsDone = totalPairs - cards.filter((c) => !c.gone).length / 2

  const beginLevel = (index: number) => {
    busy.current = false
    setLevelIndex(index)
    setCards(makeMemoryCards(index + 1))
    setOpen([])
    setMatching([])
    setWobble([])
    setCelebrating(false)
  }

  const finishLevel = () => {
    setCelebrating(true)
    later(() => {
      sound.playLevelWin()
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
    }, 250)
    later(() => {
      if (levelIndex < MEMORY_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
      else onFinished()
    }, 2000)
  }

  const onCardTap = (c: MemoryCard) => {
    if (celebrating || busy.current || c.gone || open.includes(c.id)) return
    sound.playTap()
    if (open.length === 0) {
      setOpen([c.id])
      return
    }
    const first = cards.find((x) => x.id === open[0])
    if (!first) {
      setOpen([c.id])
      return
    }
    setOpen([first.id, c.id])
    busy.current = true // two cards are open: ignore taps until they match or flip back
    if (first.icon === c.icon) {
      const left = cards.filter((x) => !x.gone).length - 2
      later(() => {
        sound.playCorrect(pairsDone)
        setMatching([first.id, c.id])
      }, 450)
      later(() => {
        setCards((cs) => cs.map((x) => (x.id === first.id || x.id === c.id ? { ...x, gone: true } : x)))
        setMatching([])
        setOpen([])
        busy.current = false
        if (left === 0) finishLevel()
      }, 450 + 400)
    } else {
      later(() => {
        sound.playWrong()
        setWobble([first.id, c.id])
      }, 500)
      later(() => {
        setWobble([])
        setOpen([]) // flip both back face down
      }, 500 + 900)
      later(() => {
        busy.current = false
      }, 500 + 900 + 250)
    }
  }

  return (
    <main className="game memory-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${MEMORY_LEVEL_COUNT}`}>
          {memoryLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <div className={`ref-stars pairs ${totalPairs > 12 ? 'many' : ''}`} aria-hidden>
        {Array.from({ length: totalPairs }, (_, i) => (
          <span key={i} className={i < pairsDone ? 'on' : ''}>
            ★
          </span>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {pairsDone} of {totalPairs} pairs found
      </p>

      <section
        className="memory-board"
        style={{ '--cols': cfg.cols, '--rows': cfg.rows } as React.CSSProperties}
        aria-label="Flip two cards to find a pair"
        key={`board-${levelIndex}`}
      >
        {cards.map((c, i) => {
          const isOpen = open.includes(c.id)
          const cls = [
            'mcard',
            isOpen ? 'open' : '',
            c.gone ? 'gone' : '',
            matching.includes(c.id) ? 'matching' : '',
            wobble.includes(c.id) ? 'shake' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={c.id}
              className={cls}
              style={{ '--d': `${Math.min(i * 40, 600)}ms` } as React.CSSProperties}
              onClick={() => onCardTap(c)}
              aria-label={isOpen ? `${iconLabel(c.icon)} card` : 'face down card'}
              tabIndex={c.gone ? -1 : 0}
              data-icon={c.icon}
            >
              <span className="mcard-pop">
                <span className="mcard-wiggle">
                  <span className="mcard-flip">
                    <span className="mcard-face mcard-back" aria-hidden>
                      <svg viewBox="0 0 40 40" className="mcard-mark">
                        <path d="M20 5l4.6 10.4L36 17l-8.4 7.6L30 36l-10-6-10 6 2.4-11.4L4 17l11.4-1.6z" fill="#fff" opacity="0.85" />
                      </svg>
                    </span>
                    <span className="mcard-face mcard-front">
                      <Icon name={c.icon} />
                    </span>
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </section>

      {celebrating && (
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
