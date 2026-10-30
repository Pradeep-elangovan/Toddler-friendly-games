import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph, iconLabel } from './ui'
import {
  TILE_UNITS,
  TRAY_SIZE,
  TRIPLE_LEVELS,
  TRIPLE_LEVEL_COUNT,
  addToTray,
  covers,
  makeTripleLevel,
  tripleInTray,
  type Tile,
} from './tripleLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  onFinished: () => void
  /** called when the tray is full; the level reached */
  onFailed: (level: number) => void
  soundButton: React.ReactNode
}

/**
 * Triple Tiles: tiles are stacked; the ones with nothing on top are bright and can be tapped, the covered ones are
 * dimmed. A tapped tile flies into the tray (7 places). Three of a kind in the tray vanish. A full tray ends the run.
 */
export default function TripleGame({ onHome, onFinished, onFailed, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [level, setLevel] = useState(() => makeTripleLevel(1))
  const [board, setBoard] = useState<Tile[]>(level.tiles) // tiles still on the board
  const [tray, setTray] = useState<Tile[]>([])
  const [ghosts, setGhosts] = useState<{ key: number; tile: Tile; rect: DOMRect; from: DOMRect | null }[]>([]) // a triple popping out right now (taps keep working meanwhile)
  const slotEls = useRef<(HTMLDivElement | null)[]>([])
  const [failing, setFailing] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [unit, setUnit] = useState(0) // size of one grid unit in pixels, so the whole pile fits the space
  const boardEl = useRef<HTMLElement>(null)
  const busy = useRef(false)
  const timers = useRef<number[]>([])
  const tileEls = useRef<Record<number, HTMLButtonElement | null>>({})
  const trayEls = useRef<Record<number, HTMLDivElement | null>>({})
  const fromRects = useRef<Record<number, DOMRect>>({}) // where tiles were before the last change, to glide them
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

  // the pile is scaled to fit its space (width and height), up to a comfortable tile size
  useLayoutEffect(() => {
    const el = boardEl.current
    if (!el) return
    const fit = () => setUnit(Math.max(8, Math.min(el.clientWidth / level.w, el.clientHeight / level.h, 46)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [level])

  // tiles that nothing lies on
  const freeIds = useMemo(() => {
    const free = new Set<number>()
    for (const t of board) if (!board.some((o) => covers(o, t))) free.add(t.id)
    return free
  }, [board])

  // glide: a tile that has just reached the tray flies there from where it was, and its new neighbours slide over
  useLayoutEffect(() => {
    const from = fromRects.current
    fromRects.current = {}
    for (const idStr of Object.keys(from)) {
      const id = Number(idStr)
      const el = trayEls.current[id]
      if (!el) continue
      const a = from[id]
      const b = el.getBoundingClientRect()
      const dx = a.left + a.width / 2 - (b.left + b.width / 2)
      const dy = a.top + a.height / 2 - (b.top + b.height / 2)
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})`, zIndex: 5 }, { transform: 'none', zIndex: 5 }],
        { duration: 300, easing: 'ease-out' },
      )
    }
  }, [tray])

  const beginLevel = (index: number) => {
    busy.current = false
    const lv = makeTripleLevel(index + 1)
    setLevelIndex(index)
    setLevel(lv)
    setBoard(lv.tiles)
    setTray([])
    setGhosts([])
    setFailing(false)
    setCelebrating(false)
  }

  const pick = (t: Tile) => {
    if (busy.current || failing || !freeIds.has(t.id)) return
    // remember where everything in the tray and the picked tile are now
    const rects: Record<number, DOMRect> = {}
    for (const x of tray) {
      const el = trayEls.current[x.id]
      if (el) rects[x.id] = el.getBoundingClientRect()
    }
    const el = tileEls.current[t.id]
    if (el) rects[t.id] = el.getBoundingClientRect()
    fromRects.current = rects
    sound.playTap()
    const nextBoard = board.filter((x) => x.id !== t.id)
    const nextTray = addToTray(tray, t)
    setBoard(nextBoard)
    const three = tripleInTray(nextTray)
    if (three) {
      // The triple leaves the tray at once (so the next tap is handled straight away); copies of its tiles
      // play the fly-in and pop-out on top of the tray.
      const members = nextTray.filter((x) => x.icon === three).slice(0, 3)
      const after = nextTray.filter((x) => !members.includes(x))
      setTray(after)
      const made = members.map((m) => {
        const isNew = m.id === t.id
        const slot = slotEls.current[nextTray.indexOf(m)]
        const end = slot ? slot.getBoundingClientRect() : rects[m.id]
        return { key: m.id, tile: m, rect: end, from: isNew ? rects[m.id] : null }
      })
      setGhosts((g) => [...g, ...made])
      later(() => sound.playCorrect(Math.min(6, 3 + (levelIndex % 3))), 300)
      if (nextBoard.length === 0 && after.length === 0) {
        busy.current = true
        later(() => {
          setCelebrating(true)
          sound.playLevelWin()
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
        }, 800)
        later(() => {
          if (levelIndex < TRIPLE_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
          else onFinished()
        }, 3000)
      }
    } else {
      setTray(nextTray)
      if (nextTray.length >= TRAY_SIZE) {
        busy.current = true
        later(() => {
          setFailing(true)
          sound.playYuck()
        }, 400)
        later(() => onFailed(levelIndex + 1), 1500)
      }
    }
  }

  const left = board.length
  return (
    <main className="game triple-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots many" role="img" aria-label={`Level ${levelIndex + 1} of ${TRIPLE_LEVEL_COUNT}`}>
          {TRIPLE_LEVELS.map((_, i) => (
            <span key={i} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <p className="triple-ask">Pick 3 that are the same</p>

      <section className="triple-board" ref={boardEl} aria-label={`${left} tiles left`}>
        <div
          className="triple-stage"
          key={`stage-${levelIndex}`}
          style={{ '--W': level.w, '--H': level.h, '--u': `${unit}px`, visibility: unit ? 'visible' : 'hidden' } as React.CSSProperties}
        >
          {board.map((t) => {
            const free = freeIds.has(t.id)
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tileEls.current[t.id] = el
                }}
                className={`ttile ${free ? 'free' : 'covered'}`}
                style={{ '--x': t.x, '--y': t.y, '--z': t.z, '--d': `${(t.id % 9) * 35}ms` } as React.CSSProperties}
                onClick={() => pick(t)}
                aria-label={free ? `${iconLabel(t.icon)}, tap to pick` : `${iconLabel(t.icon)}, covered`}
                aria-disabled={!free}
                tabIndex={free ? 0 : -1}
              >
                <Icon name={t.icon} />
              </button>
            )
          })}
        </div>
      </section>

      <section className={`triple-tray ${failing ? 'full' : ''}`} aria-label={`Tray, ${tray.length} of ${TRAY_SIZE}`}>
        {Array.from({ length: TRAY_SIZE }, (_, i) => {
          const t = tray[i]
          return (
            <div
              className="tray-slot"
              key={i}
              ref={(el) => {
                slotEls.current[i] = el
              }}
            >
              {t && (
                <div
                  key={t.id}
                  ref={(el) => {
                    trayEls.current[t.id] = el
                  }}
                  className="ttile in-tray"
                  role="img"
                  aria-label={iconLabel(t.icon)}
                >
                  <Icon name={t.icon} />
                </div>
              )}
            </div>
          )
        })}
      </section>

      {ghosts.map((g) => (
        <div
          key={g.key}
          ref={(el) => {
            // runs as soon as the copy is on the page (before it is painted): fly in if it was just picked, then pop out
            if (!el || el.dataset.started) return
            el.dataset.started = '1'
            const end = g.rect
            const pre = g.from
              ? `translate(${g.from.left + g.from.width / 2 - (end.left + end.width / 2)}px, ${g.from.top + g.from.height / 2 - (end.top + end.height / 2)}px) scale(${g.from.width / end.width})`
              : 'none'
            const a = el.animate(
              [
                { transform: pre, offset: 0 },
                { transform: 'none', offset: 0.4 },
                { transform: 'none', offset: 0.5 },
                { transform: 'scale(1.25) rotate(-6deg)', offset: 0.7 },
                { transform: 'scale(0) rotate(20deg)', opacity: 0, offset: 1 },
              ],
              { duration: 750, easing: 'ease-in-out', fill: 'forwards' },
            )
            a.onfinish = () => setGhosts((list) => list.filter((x) => x.key !== g.key))
          }}
          className="ttile in-tray ghost"
          aria-hidden
          style={{ left: g.rect.left, top: g.rect.top, width: g.rect.width, height: g.rect.height, padding: g.rect.width * 0.12, boxSizing: 'border-box' }}
        >
          <Icon name={g.tile.icon} />
        </div>
      ))}

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
