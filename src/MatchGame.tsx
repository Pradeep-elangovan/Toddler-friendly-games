import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import { MATCH_LEVELS, MATCH_LEVEL_COUNT, makeMatchRound, type MatchRound } from './matchLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  onFinished: () => void
  /** called when a number is dropped on the wrong pile; the level reached */
  onFailed: (level: number) => void
  soundButton: React.ReactNode
}

const TILE_COLORS = ['#ff8fa3', '#6cc3f5', '#7bd88f', '#ffb86b', '#b79cf2', '#5fd3c4', '#f7a1d4']
const NAMES: Record<string, string> = { iceCream: 'ice cream' }

/**
 * Number Match: piles of animals, fruit and vegetables on the left, numbers on the right. Drag each number onto the
 * pile with that many things. A right match snaps the number onto its pile. A wrong pile ends the run (back to level 1),
 * so guessing does not pay. Dropping a number anywhere else just slides it back.
 */
export default function MatchGame({ onHome, onFinished, onFailed, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<MatchRound>(() => makeMatchRound(1))
  const [matched, setMatched] = useState<Record<number, { dx: number; dy: number }>>({}) // number -> where it snapped
  const [wrongGroup, setWrongGroup] = useState<number | null>(null) // pile that was wrongly chosen
  const [wrongNum, setWrongNum] = useState<number | null>(null)
  const [drag, setDrag] = useState<{ n: number; pid: number; sx: number; sy: number; dx: number; dy: number } | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const groupRefs = useRef<(HTMLDivElement | null)[]>([])
  const slotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({})
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

  const beginLevel = (index: number) => {
    busy.current = false
    setLevelIndex(index)
    setRound(makeMatchRound(index + 1))
    setMatched({})
    setWrongGroup(null)
    setWrongNum(null)
    setCelebrating(false)
    setDrag(null)
  }

  const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

  const drop = (n: number, x: number, y: number) => {
    const tile = tileRefs.current[n]
    if (!tile || busy.current) return
    const cur = drag ? { dx: drag.dx, dy: drag.dy } : { dx: 0, dy: 0 }
    // which pile is the number over? (forgiving: the pile's box, a little bigger)
    let target = -1
    let best = Infinity
    groupRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const pad = 10
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        const c = centre(r)
        const d = Math.hypot(c.x - x, c.y - y)
        if (d < best) {
          best = d
          target = i
        }
      }
    })
    const slide = () => {
      tile.animate(
        [{ transform: `translate(${cur.dx}px, ${cur.dy}px) scale(1.1)` }, { transform: 'none' }],
        { duration: 260, easing: 'ease-out' },
      )
      setDrag(null)
    }
    if (target < 0 || matched[round.groups[target].count] !== undefined) {
      slide()
      return
    }
    if (round.groups[target].count === n) {
      // right: the number snaps onto its pile
      const slot = slotRefs.current[target]!.getBoundingClientRect()
      const home = { x: centre(tile.getBoundingClientRect()).x - cur.dx, y: centre(tile.getBoundingClientRect()).y - cur.dy }
      const sc = centre(slot)
      const next = { ...matched, [n]: { dx: sc.x - home.x, dy: sc.y - home.y } }
      setMatched(next)
      setDrag(null)
      const done = Object.keys(next).length === round.groups.length
      sound.playCorrect(Object.keys(next).length - 1)
      if (done) {
        busy.current = true
        later(() => {
          setCelebrating(true)
          sound.playLevelWin()
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
        }, 700)
        later(() => {
          if (levelIndex < MATCH_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
          else onFinished()
        }, 2700)
      }
    } else {
      // wrong pile: the pile shakes, the run is over
      busy.current = true
      setWrongGroup(target)
      setWrongNum(n)
      setDrag(null)
      sound.playYuck()
      later(() => onFailed(levelIndex + 1), 1100)
    }
  }

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, n: number) => {
    if (busy.current || matched[n] !== undefined) return
    e.currentTarget.setPointerCapture(e.pointerId)
    sound.playTap()
    setDrag({ n, pid: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 })
  }
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pid) return
    setDrag({ ...drag, dx: e.clientX - drag.sx, dy: e.clientY - drag.sy })
  }
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pid) return
    drop(drag.n, e.clientX, e.clientY)
  }

  const n = round.groups.length
  return (
    <main className="game match-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots many" role="img" aria-label={`Level ${levelIndex + 1} of ${MATCH_LEVEL_COUNT}`}>
          {MATCH_LEVELS.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <p className="count-ask">Match each number</p>

      <section className="match-board" key={`board-${levelIndex}`} style={{ '--n': n } as React.CSSProperties}>
        <div className="match-col piles" aria-label="Piles">
          {round.groups.map((g, i) => {
            const done = matched[g.count] !== undefined
            return (
              <div
                key={i}
                ref={(el) => {
                  groupRefs.current[i] = el
                }}
                className={`match-card ${done ? 'matched' : ''} ${wrongGroup === i ? 'wrong' : ''} ${drag ? 'ready' : ''}`}
                style={{ '--d': `${i * 70}ms` } as React.CSSProperties}
                role="img"
                aria-label={`${g.count} ${NAMES[g.icon] ?? g.icon}`}
              >
                <div className="match-items">
                  {Array.from({ length: g.count }, (_, k) => (
                    <span className="match-item" key={k}>
                      <Icon name={g.icon} />
                    </span>
                  ))}
                </div>
                <span
                  className="match-slot"
                  ref={(el) => {
                    slotRefs.current[i] = el
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="match-col nums" aria-label="Numbers">
          {round.numbers.map((num, i) => {
            const m = matched[num]
            const dragging = drag?.n === num
            const style = {
              '--c': TILE_COLORS[i % TILE_COLORS.length],
              '--d': `${i * 70}ms`,
              ...(dragging
                ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.12) rotate(-4deg)` }
                : m
                  ? { transform: `translate(${m.dx}px, ${m.dy}px) scale(0.78)` }
                  : {}),
            } as React.CSSProperties
            return (
              <div className="match-cell" key={num}>
                <button
                  ref={(el) => {
                    tileRefs.current[num] = el
                  }}
                  className={`match-tile ${dragging ? 'dragging' : ''} ${m ? 'placed' : ''} ${wrongNum === num ? 'wrong' : ''}`}
                  style={style}
                  onPointerDown={(e) => onDown(e, num)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  aria-label={`${num}, drag to its pile`}
                  disabled={!!m}
                >
                  {num}
                </button>
              </div>
            )
          })}
        </div>
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
