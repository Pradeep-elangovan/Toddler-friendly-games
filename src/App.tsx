import React, { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { levels, cards, iconNames } from './gameData'

type Screen = 'home' | 'game' | 'winner'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  const size = 56
  const props = { width: size, height: size, viewBox: '0 0 24 24', className }
  switch (name) {
    case 'pencil':
      return (
        <svg {...props} aria-hidden>
          <path d="M3 21v-3.75L17.81 2.44a2 2 0 012.83 0l0 0a2 2 0 010 2.83L6 20.08H3z" fill="currentColor" />
        </svg>
      )
    case 'iceCream':
      return (
        <svg {...props} aria-hidden>
          <path d="M12 2a4 4 0 00-4 4c0 1.1.45 2.1 1.17 2.83L12 12l2.83-3.17A3.99 3.99 0 0016 6a4 4 0 00-4-4z" fill="currentColor" />
        </svg>
      )
    case 'star':
      return (
        <svg {...props} aria-hidden>
          <path d="M12 2l2.9 6.26L21 9.27l-5 3.73L17.8 21 12 17.77 6.2 21 7 13l-5-3.73 6.1-.99L12 2z" fill="currentColor" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...props} aria-hidden>
          <path d="M12 21s-7-4.35-9-6.32C1.5 12.7 2 9.5 4.5 7.64 6.7 6 9.5 7 12 9c2.5-2 5.3-3 7.5-1.36C22 9.5 22.5 12.7 21 14.68 19 16.65 12 21 12 21z" fill="currentColor" />
        </svg>
      )
    case 'apple':
      return (
        <svg {...props} aria-hidden>
          <path d="M16 11c-.1-2 1-4 2-5-1-.7-2.6-1.2-4-1-1 0-2 1-3 1s-2-1-3-1A6 6 0 005 12c0 3 3 6 7 6s7-3 7-6c0-.3 0-.6-.2-1z" fill="currentColor" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...props} aria-hidden>
          <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" fill="currentColor" />
        </svg>
      )
    case 'flower':
      return (
        <svg {...props} aria-hidden>
          <path d="M12 2a2 2 0 012 2 6 6 0 016 6 2 2 0 01-2 2 6 6 0 01-6 6 2 2 0 01-2-2 6 6 0 01-6-6 2 2 0 012-2 6 6 0 016-6z" fill="currentColor" />
        </svg>
      )
    case 'rocket':
      return (
        <svg {...props} aria-hidden>
          <path d="M5 20l4-1 1-4L4 5 2 9l3 11zM19 5l-4 4 2 2 4-4-2-2z" fill="currentColor" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...props} aria-hidden>
          <path d="M20 17H7a4 4 0 010-8 6 6 0 1111 2 4 4 0 01-2 6z" fill="currentColor" />
        </svg>
      )
    case 'book':
      return (
        <svg {...props} aria-hidden>
          <path d="M4 3v16a1 1 0 001 1h13V3H5a1 1 0 00-1 0z" fill="currentColor" />
        </svg>
      )
    case 'rainbow':
      return (
        <svg {...props} aria-hidden>
          <path d="M2 12a10 10 0 0120 0h-2a8 8 0 10-16 0H2z" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg {...props} aria-hidden>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </svg>
      )
  }
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [levelIndex, setLevelIndex] = useState(0) // 0..9
  const level = levels[levelIndex]
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [options, setOptions] = useState<string[]>([])
  const [showCongrats, setShowCongrats] = useState(false)
  const [wrongShake, setWrongShake] = useState<string | null>(null)

  useEffect(() => {
    // register service worker on window load
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch(() => {
            /* ignore registration errors */
          })
      })
    }
  }, [])

  useEffect(() => {
    // reset selections when level changes or screen changes
    setSelected({})
    setShowCongrats(false)
    setWrongShake(null)
    if (screen === 'game') {
      const base = [...iconNames]
      // choose correct icons (first N)
      const correct = base.slice(0, level.correctCount)
      // fill options: correct + some others
      const others = base.filter((n) => !correct.includes(n))
      const pick = others.slice(0, level.optionsCount - correct.length)
      const all = shuffle([...correct, ...pick])
      setOptions(all)
    }
  }, [levelIndex, screen])

  const checkAnswer = (id: string) => {
    if (showCongrats) return
    const isCorrect = iconNames.slice(0, level.correctCount).includes(id)
    if (isCorrect) {
      setSelected((s) => ({ ...s, [id]: true }))
      const correctSelected = options.filter((o) =>
        iconNames.slice(0, level.correctCount).includes(o) && (selected[o] || o === id)
      ).length
      if (correctSelected >= level.correctCount) {
        // level complete
        setShowCongrats(true)
        // confetti
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } })
        // auto advance after short delay
        setTimeout(() => {
          if (levelIndex < levels.length - 1) {
            setLevelIndex((i) => i + 1)
          } else {
            setScreen('winner')
          }
        }, 1500)
      }
    } else {
      // wrong tap: gentle shake
      setWrongShake(id)
      setTimeout(() => setWrongShake(null), 400)
    }
  }

  const startGame = () => {
    setLevelIndex(0)
    setScreen('game')
  }

  const playAgain = () => {
    setLevelIndex(0)
    setScreen('game')
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <h1 className="title">Playful Patterns</h1>
        <p className="subtitle">Tap the shapes that match</p>
      </header>

      {screen === 'home' && (
        <main className="home">
          <div className="cards">
            {cards.map((c) => (
              <button
                key={c.id}
                className={`card ${c.playable ? 'playable' : 'coming'}`}
                onClick={() => (c.playable ? startGame() : undefined)}
                aria-label={c.playable ? `Play ${c.label}` : `${c.label} coming soon`}
              >
                <div className="card-icons">
                  {c.icons.map((ic) => (
                    <div className="card-icon" key={ic} aria-hidden>
                      <Icon name={ic} />
                    </div>
                  ))}
                </div>
                <div className="card-label">{c.label}</div>
                {!c.playable && <div className="coming-text">Coming soon</div>}
              </button>
            ))}
          </div>
        </main>
      )}

      {screen === 'game' && (
        <main className="game">
          <section className="level-info">
            <div className="level-pill">Level {level.level}</div>
            <div className="level-progress">{level.correctCount} to find</div>
          </section>

          <section className="reference" aria-label="Reference shapes">
            <div className="reference-grid">
              {iconNames.slice(0, level.correctCount).map((n) => (
                <div key={n} className="ref-cell">
                  <Icon name={n} />
                </div>
              ))}
            </div>
          </section>

          <section className="options" aria-label="Options to choose">
            <div className="options-grid">
              {options.map((o) => {
                const isSelected = !!selected[o]
                const isCorrect = iconNames.slice(0, level.correctCount).includes(o)
                return (
                  <button
                    key={o}
                    onClick={() => checkAnswer(o)}
                    className={`option ${isSelected ? 'selected' : ''} ${wrongShake === o ? 'shake' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Option ${o}`}
                  >
                    <Icon name={o} />
                  </button>
                )
              })}
            </div>
          </section>

          {showCongrats && (
            <div className="overlay">
              <div className="congrats">
                <h2>Great job!</h2>
                {levelIndex < levels.length - 1 ? (
                  <button
                    className="primary"
                    onClick={() => setLevelIndex((i) => Math.min(i + 1, levels.length - 1))}
                  >
                    Next
                  </button>
                ) : (
                  <div className="primary muted">Final!</div>
                )}
              </div>
            </div>
          )}

          <div className="bottom-controls">
            <button onClick={() => setScreen('home')} className="secondary" aria-label="Back to home">
              Home
            </button>
          </div>
        </main>
      )}

      {screen === 'winner' && (
        <main className="winner">
          <div className="meditate">
            <div className="kid">
              <div className="head" />
              <div className="body" />
            </div>
          </div>
          <h2>You're a star!</h2>
          <p className="muted">Nice calm finish — great work!</p>
          <div className="winner-buttons">
            <button className="primary" onClick={() => setScreen('home')}>Home</button>
            <button className="secondary" onClick={playAgain}>Play again</button>
          </div>
        </main>
      )}

      <footer className="footer">
        <small>All local · No accounts · No tracking</small>
      </footer>
    </div>
  )
}
