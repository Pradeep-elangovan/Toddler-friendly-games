import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  cards,
  columnsFor,
  levels,
  LEVEL_COUNT,
  makeRound,
  TILE_LEVEL_COUNT,
  type IconName,
  type Option,
  type Round,
} from './gameData'
import { Icon } from './icons'
import TileGame from './TileGame'
import SortGame from './SortGame'
import CountGame from './CountGame'
import { COUNT_LEVEL_COUNT } from './countLogic'
import MemoryGame from './MemoryGame'
import { MEMORY_LEVEL_COUNT } from './memoryLogic'
import { SORT_LEVEL_COUNT } from './sortLogic'
import {
  ColorGlyph,
  HoldButton,
  HomeGlyph,
  ReplayGlyph,
  SadFace,
  SpeakerGlyph,
  iconLabel,
  loadFlag,
  saveFlag,
} from './ui'
import * as sound from './sound'

type Screen = 'home' | 'game' | 'tiles' | 'sort' | 'count' | 'memory' | 'winner' | 'failed'
type GameId = 'pattern' | 'tiles' | 'sort' | 'count' | 'memory'

const BW_KEY = 'tfg.bw'
const MUTE_KEY = 'tfg.muted'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeGame, setActiveGame] = useState<GameId>('pattern')
  const [runId, setRunId] = useState(0) // changes every time Tile Match starts, so it begins fresh
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<Round | null>(null)
  const [found, setFound] = useState<number[]>([])
  const [failedId, setFailedId] = useState<number | null>(null) // the wrong option the child tapped
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState(false)
  const [muted, setMuted] = useState(() => loadFlag(MUTE_KEY))
  const [bw, setBw] = useState(() => loadFlag(BW_KEY))
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

  // Black-and-white mode is a grayscale filter on the whole page (including confetti).
  useEffect(() => {
    document.documentElement.classList.toggle('bw', bw)
  }, [bw])

  useEffect(() => {
    sound.setMuted(muted)
  }, [muted])

  // Pattern Match: gently nudge the remaining matches if the child pauses for a while.
  useEffect(() => {
    if (screen !== 'game' || celebrating || failedId !== null) return
    setHint(false)
    const id = window.setTimeout(() => setHint(true), 7000)
    return () => window.clearTimeout(id)
  }, [screen, celebrating, failedId, found, round])

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
    setActiveGame('pattern')
    setLevelIndex(index)
    setRound(r)
    setFound([])
    setFailedId(null)
    setCelebrating(false)
    setHint(false)
    setScreen('game')
  }

  const startTiles = () => {
    clearTimers()
    setActiveGame('tiles')
    setRunId((n) => n + 1)
    setScreen('tiles')
  }

  const startSort = () => {
    clearTimers()
    setActiveGame('sort')
    setRunId((n) => n + 1)
    setScreen('sort')
  }

  const startCount = () => {
    clearTimers()
    setActiveGame('count')
    setRunId((n) => n + 1)
    setScreen('count')
  }

  const startMemory = () => {
    clearTimers()
    setActiveGame('memory')
    setRunId((n) => n + 1)
    setScreen('memory')
  }

  const startGame = (game: GameId) =>
    game === 'memory' ? startMemory() : game === 'tiles' ? startTiles() : game === 'sort' ? startSort() : game === 'count' ? startCount() : beginLevel(0)

  const goHome = () => {
    clearTimers()
    setCelebrating(false)
    setScreen('home')
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    saveFlag(MUTE_KEY, next)
    sound.setMuted(next)
    if (!next) sound.playTap()
  }

  const toggleColor = () => {
    const next = !bw
    setBw(next)
    saveFlag(BW_KEY, next)
    sound.playTap()
  }

  const onCardTap = (id: string, playable: boolean) => {
    sound.playTap()
    if (!playable) {
      setWiggleCard(id)
      later(() => setWiggleCard(null), 600)
    } else if (id === 'tiles') {
      startTiles()
    } else if (id === 'sort') {
      startSort()
    } else if (id === 'count') {
      startCount()
    } else if (id === 'memory') {
      startMemory()
    } else {
      beginLevel(0)
    }
  }

  const onOptionTap = (o: Option) => {
    if (!round || celebrating || failedId !== null) return
    if (found.includes(o.id)) return

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
      // A wrong tap ends the run: show which tile was wrong, then the "Oops" screen.
      // Playing again from Home starts at level 1.
      sound.playFail()
      setFailedId(o.id)
      later(() => setScreen('failed'), 1100)
    }
  }

  const soundButton = (
    <button
      className="round-btn sound-btn"
      onClick={toggleMute}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
    >
      <SpeakerGlyph off={muted} />
    </button>
  )

  const finishedLevels =
    activeGame === 'tiles'
      ? TILE_LEVEL_COUNT
      : activeGame === 'sort'
        ? SORT_LEVEL_COUNT
        : activeGame === 'count'
          ? COUNT_LEVEL_COUNT
          : activeGame === 'memory'
            ? MEMORY_LEVEL_COUNT
            : LEVEL_COUNT

  return (
    <div className="app-root">
      {screen === 'home' && (
        <>
          <header className="topbar">
            <div className="topbar-side">
              <button
                className="round-btn color-btn"
                onClick={toggleColor}
                aria-label={bw ? 'Switch to colour' : 'Switch to black and white'}
                aria-pressed={bw}
                title={bw ? 'Switch to colour' : 'Switch to black and white'}
              >
                <ColorGlyph bw={bw} />
              </button>
            </div>
            <div className="titles">
              <h1 className="title">Playful Patterns</h1>
              <p className="subtitle">Tap the shapes that match</p>
            </div>
            <div className="topbar-side right">{soundButton}</div>
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
            {soundButton}
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
              const isFailed = failedId === o.id
              const cls = [
                'option',
                isFound ? 'found' : '',
                isFailed ? 'failed' : '',
                hint && o.isMatch && !isFound ? 'hint' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={o.id}
                  className={cls}
                  style={{ '--d': `${i * 40}ms` } as React.CSSProperties}
                  onClick={() => onOptionTap(o)}
                  aria-pressed={isFound}
                  aria-label={`${iconLabel(o.icon)}${isFound ? ', found' : ''}${isFailed ? ', wrong' : ''}`}
                >
                  <Icon name={o.icon} />
                  {isFound && (
                    <span className="check" aria-hidden>
                      ✓
                    </span>
                  )}
                  {isFailed && (
                    <span className="check cross" aria-hidden>
                      ✕
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

      {screen === 'tiles' && (
        <TileGame
          key={runId}
          onHome={goHome}
          onFinished={() => setScreen('winner')}
          soundButton={soundButton}
        />
      )}

      {screen === 'sort' && (
        <SortGame
          key={runId}
          onHome={goHome}
          onFinished={() => setScreen('winner')}
          soundButton={soundButton}
        />
      )}

      {screen === 'count' && (
        <CountGame
          key={runId}
          onHome={goHome}
          onFinished={() => setScreen('winner')}
          soundButton={soundButton}
        />
      )}

      {screen === 'memory' && (
        <MemoryGame
          key={runId}
          onHome={goHome}
          onFinished={() => setScreen('winner')}
          soundButton={soundButton}
        />
      )}

      {screen === 'failed' && (
        <main className="winner failed-screen">
          <div className="winner-top">{soundButton}</div>
          <div className="sad-wrap" aria-hidden>
            <SadFace />
          </div>
          <h2>Oops!</h2>
          <p className="muted">That one was different. You got to level {levelIndex + 1}.</p>
          <p className="muted">Go Home and try again from level 1.</p>
          <div className="winner-buttons">
            <div className="big-action">
              <button className="big-round home" onClick={goHome} aria-label="Home">
                <HomeGlyph />
              </button>
              <span>Home</span>
            </div>
          </div>
        </main>
      )}

      {screen === 'winner' && (
        <main className="winner">
          <div className="winner-top">{soundButton}</div>
          <div className="trophy" aria-hidden>
            <Icon name="star" />
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
            <div className="sparkle s3">✦</div>
          </div>
          <h2>You did it!</h2>
          <p className="muted">All {finishedLevels} levels finished. You're a star!</p>
          <div className="winner-buttons">
            <div className="big-action">
              <button className="big-round home" onClick={goHome} aria-label="Home">
                <HomeGlyph />
              </button>
              <span>Home</span>
            </div>
            <div className="big-action">
              <button className="big-round again" onClick={() => startGame(activeGame)} aria-label="Play again">
                <ReplayGlyph />
              </button>
              <span>Again</span>
            </div>
          </div>
        </main>
      )}

      {screen !== 'game' && screen !== 'tiles' && screen !== 'sort' && screen !== 'count' && screen !== 'memory' && (
        <footer className="footer">
          <small>All local · No accounts · No tracking</small>
        </footer>
      )}
    </div>
  )
}
