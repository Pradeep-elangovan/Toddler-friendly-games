import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  cards,
  columnsFor,
  levels,
  LEVEL_COUNT,
  makeRound,
  type IconName,
  type Option,
  type Round,
} from './gameData'
import { Icon } from './icons'
import * as sound from './sound'

type Screen = 'home' | 'game' | 'winner'

const iconLabel = (name: IconName) => name.replace(/([A-Z])/g, ' $1').toLowerCase()

function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden focusable="false">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor" />
    </svg>
  )
}

function SpeakerGlyph({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
      {off ? (
        <path d="M16 9l5 6m0-6-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <path
          d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}

function ReplayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden focusable="false">
      <path
        d="M12 5a7 7 0 1 1-6.6 4.7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 1.5 7.5 5 12 8.5z" fill="currentColor" />
    </svg>
  )
}

/** A button that must be held for a moment, so little fingers can't leave the game by accident. */
function HoldButton({
  onHold,
  label,
  children,
}: {
  onHold: () => void
  label: string
  children: React.ReactNode
}) {
  const timer = useRef<number | undefined>(undefined)
  const [holding, setHolding] = useState(false)

  const cancel = () => {
    window.clearTimeout(timer.current)
    setHolding(false)
  }
  const start = () => {
    window.clearTimeout(timer.current)
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      onHold()
    }, 700)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <button
      className={`round-btn hold ${holding ? 'holding' : ''}`}
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onBlur={cancel}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start()
      }}
      onKeyUp={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<Round | null>(null)
  const [found, setFound] = useState<number[]>([])
  const [wrongIds, setWrongIds] = useState<number[]>([])
  const [wobbleId, setWobbleId] = useState<number | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState(false)
  const [muted, setMuted] = useState(false)
  const [wiggleCard, setWiggleCard] = useState<string | null>(null)

  const timers = useRef<number[]>([])
  const lastReference = useRef<IconName | undefined>(undefined)

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Gently nudge the remaining matches if the child pauses for a while.
  useEffect(() => {
    if (screen !== 'game' || celebrating) return
    setHint(false)
    const id = window.setTimeout(() => setHint(true), 7000)
    return () => window.clearTimeout(id)
  }, [screen, celebrating, found, wrongIds, round])

  // Finale: fanfare and confetti.
  useEffect(() => {
    if (screen !== 'winner') return
    sound.playGameWin()
    const fire = () =>
      confetti({
        particleCount: 90,
        spread: 90,
        startVelocity: 38,
        origin: { x: Math.random() * 0.6 + 0.2, y: 0.55 },
        disableForReducedMotion: true,
      })
    fire()
    const a = window.setTimeout(fire, 600)
    const b = window.setTimeout(fire, 1300)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [screen])

  const beginLevel = (index: number) => {
    clearTimers()
    const r = makeRound(index + 1, lastReference.current)
    lastReference.current = r.reference
    setLevelIndex(index)
    setRound(r)
    setFound([])
    setWrongIds([])
    setWobbleId(null)
    setCelebrating(false)
    setHint(false)
    setScreen('game')
  }

  const goHome = () => {
    clearTimers()
    setCelebrating(false)
    setScreen('home')
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    sound.setMuted(next)
    if (!next) sound.playTap()
  }

  const onCardTap = (id: string, playable: boolean) => {
    sound.playTap()
    if (playable) {
      beginLevel(0)
    } else {
      setWiggleCard(id)
      later(() => setWiggleCard(null), 600)
    }
  }

  const onOptionTap = (o: Option) => {
    if (!round || celebrating) return
    if (found.includes(o.id) || wrongIds.includes(o.id)) return

    if (o.isMatch) {
      const nextFound = [...found, o.id]
      setFound(nextFound)
      sound.playCorrect(nextFound.length - 1)
      if (nextFound.length === levels[levelIndex].matchCount) {
        setCelebrating(true)
        later(() => {
          sound.playLevelWin()
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            disableForReducedMotion: true,
          })
        }, 250)
        later(() => {
          if (levelIndex < LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
          else setScreen('winner')
        }, 2000)
      }
    } else {
      // gentle: soft boop, a little wobble, and the wrong one fades away so the next try is easier
      sound.playWrong()
      setWobbleId(o.id)
      setWrongIds((w) => [...w, o.id])
      later(() => setWobbleId(null), 450)
    }
  }

  const topRight = (
    <button
      className="round-btn sound-btn"
      onClick={toggleMute}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
    >
      <SpeakerGlyph off={muted} />
    </button>
  )

  return (
    <div className="app-root">
      {screen === 'home' && (
        <>
          <header className="topbar">
            <div className="topbar-side" />
            <div className="titles">
              <h1 className="title">Playful Patterns</h1>
              <p className="subtitle">Tap the shapes that match</p>
            </div>
            <div className="topbar-side right">{topRight}</div>
          </header>

          <main className="home">
            <div className="cards">
              {cards.map((c) => (
                <button
                  key={c.id}
                  className={`card ${c.playable ? 'playable' : 'coming'} ${wiggleCard === c.id ? 'wiggle' : ''}`}
                  style={{ '--card-bg': c.color } as React.CSSProperties}
                  onClick={() => onCardTap(c.id, c.playable)}
                  aria-label={c.playable ? `Play ${c.label}` : `${c.label}, coming soon`}
                  aria-disabled={!c.playable}
                >
                  <div className="card-icons" aria-hidden>
                    {c.icons.map((ic) => (
                      <div className="card-icon" key={ic}>
                        <Icon name={ic} />
                      </div>
                    ))}
                  </div>
                  <div className="card-label">{c.label}</div>
                  {c.playable ? (
                    <div className="play-badge" aria-hidden>
                      ▶
                    </div>
                  ) : (
                    <div className="coming-text">Coming soon</div>
                  )}
                </button>
              ))}
            </div>
          </main>
        </>
      )}

      {screen === 'game' && round && (
        <main className="game">
          <header className="gamebar">
            <HoldButton onHold={goHome} label="Hold to go home">
              <HomeGlyph />
            </HoldButton>
            <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${LEVEL_COUNT}`}>
              {levels.map((l, i) => (
                <span
                  key={l.level}
                  className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`}
                />
              ))}
            </div>
            {topRight}
          </header>

          <section className="reference" aria-label="Find this one">
            <div className="ref-card" key={`${levelIndex}-${round.reference}`}>
              <Icon name={round.reference} />
            </div>
            <div className="ref-stars" aria-hidden>
              {Array.from({ length: levels[levelIndex].matchCount }, (_, i) => (
                <span key={i} className={i < found.length ? 'on' : ''}>
                  ★
                </span>
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              Found {found.length} of {levels[levelIndex].matchCount} {iconLabel(round.reference)}
            </p>
          </section>

          <section
            className="options"
            style={{ '--cols': columnsFor(round.options.length) } as React.CSSProperties}
            aria-label="Tap every one that matches"
            key={`options-${levelIndex}-${round.reference}`}
          >
            {round.options.map((o, i) => {
              const isFound = found.includes(o.id)
              const isWrong = wrongIds.includes(o.id)
              const cls = [
                'option',
                isFound ? 'found' : '',
                isWrong ? 'oops' : '',
                wobbleId === o.id ? 'shake' : '',
                hint && o.isMatch && !isFound ? 'hint' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={o.id}
                  className={cls}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => onOptionTap(o)}
                  aria-pressed={isFound}
                  aria-label={`${iconLabel(o.icon)}${isFound ? ', found' : ''}`}
                >
                  <Icon name={o.icon} />
                  {isFound && (
                    <span className="check" aria-hidden>
                      ✓
                    </span>
                  )}
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
      )}

      {screen === 'winner' && (
        <main className="winner">
          <div className="winner-top">{topRight}</div>
          <div className="trophy" aria-hidden>
            <Icon name="star" />
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
            <div className="sparkle s3">✦</div>
          </div>
          <h2>You did it!</h2>
          <p className="muted">All {LEVEL_COUNT} levels finished. You're a star!</p>
          <div className="winner-buttons">
            <div className="big-action">
              <button className="big-round home" onClick={goHome} aria-label="Home">
                <HomeGlyph />
              </button>
              <span>Home</span>
            </div>
            <div className="big-action">
              <button className="big-round again" onClick={() => beginLevel(0)} aria-label="Play again">
                <ReplayGlyph />
              </button>
              <span>Again</span>
            </div>
          </div>
        </main>
      )}

      {screen !== 'game' && (
        <footer className="footer">
          <small>All local · No accounts · No tracking</small>
        </footer>
      )}
    </div>
  )
}
