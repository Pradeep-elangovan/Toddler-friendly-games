import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import { SERIES_LEVEL_COUNT, makeSeriesRound, seriesLevels, type SeriesRound } from './seriesLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

const OPTION_COLORS = ['#ff8fa3', '#6cc3f5', '#7bd88f']
const TILE_COLORS = ['#ffb4a2', '#ffd166', '#a0e7e5', '#cdb4f6', '#b8e0a0', '#bde0fe']

/**
 * Missing Letter: letters in alphabet order with one hidden. Drag the missing letter, out of three, into the gap.
 * The right letter is hugged by its new neighbours. A wrong letter is squeezed out of the gap and flung away
 * (the neighbours squeeze together and push it out, it is flung away and drifts back to the options greyed out).
 * Nothing ever fails: the child just tries a different letter in the same round.
 * Dropping a letter anywhere else just slides it back.
 */
export default function SeriesGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<SeriesRound>(() => makeSeriesRound(1))
  const [solved, setSolved] = useState(false) // the right letter is in the gap
  const [rejected, setRejected] = useState<string | null>(null) // the wrong letter being squeezed out right now
  const [tried, setTried] = useState<string[]>([]) // wrong letters already squeezed out (greyed out for this round)
  const [rowAnim, setRowAnim] = useState<'' | 'hug' | 'squeeze'>('')
  const [drag, setDrag] = useState<{ letter: string; pid: number; sx: number; sy: number; dx: number; dy: number } | null>(null)
  const [celebrating, setCelebrating] = useState(false) // the "Great job" card, shown after the hug
  const [hint, setHint] = useState(false)
  const blankRef = useRef<HTMLSpanElement>(null)
  const optRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const busy = useRef(false) // a drop animation is playing
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

  // After a pause, gently wiggle the right letter.
  useEffect(() => {
    setHint(false)
    if (solved || rejected !== null || drag) return
    const id = window.setTimeout(() => setHint(true), 10000)
    return () => window.clearTimeout(id)
  }, [round, solved, rejected, drag])

  const beginLevel = (index: number) => {
    busy.current = false
    setLevelIndex(index)
    setRound(makeSeriesRound(index + 1))
    setSolved(false)
    setCelebrating(false)
    setRejected(null)
    setTried([])
    setRowAnim('')
    setDrag(null)
  }

  const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

  /** Called when a letter is let go (or placed with the keyboard): into the gap, or back to where it came from. */
  const drop = (letter: string, viaKeyboard = false) => {
    const el = optRefs.current[letter]
    const gap = blankRef.current
    if (!el || !gap || busy.current) return
    const cur = getComputedStyle(el).transform // where the letter is right now (the drag transform)
    const here = centre(el.getBoundingClientRect())
    const g = gap.getBoundingClientRect()
    const gc = centre(g)
    // forgiving: the letter counts as "in the gap" when its middle is in or near the gap
    const pad = Math.max(34, g.width * 0.7)
    const inGap =
      viaKeyboard || (Math.abs(here.x - gc.x) <= g.width / 2 + pad && Math.abs(here.y - gc.y) <= g.height / 2 + pad)
    if (!inGap) {
      el.animate([{ transform: cur === 'none' ? 'none' : cur }, { transform: 'none' }], { duration: 260, easing: 'ease-out' })
      setDrag(null)
      return
    }
    busy.current = true
    // the transform that puts the letter exactly over the gap
    const home = (() => {
      const m = new DOMMatrix(cur === 'none' ? undefined : cur)
      return { x: here.x - m.e, y: here.y - m.f }
    })()
    const tx = gc.x - home.x
    const ty = gc.y - home.y
    const at = `translate(${tx}px, ${ty}px)`
    const glide = el.animate([{ transform: cur === 'none' ? 'none' : cur }, { transform: at }], {
      duration: 220,
      easing: 'ease-out',
      fill: 'forwards',
    })
    glide.onfinish = () => {
      if (letter === round.answer) {
        // the letter fits: it becomes part of the row and its neighbours hug it
        flushSync(() => {
          setSolved(true)
          setRowAnim('hug')
          setDrag(null)
        })
        glide.cancel()
        sound.playCorrect(levelIndex)
        later(() => {
          setCelebrating(true)
          sound.playLevelWin()
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
        }, 1100)
        later(() => {
          if (levelIndex < SERIES_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
          else onFinished()
        }, 3100)
      } else {
        // the letter does not fit: the neighbours squeeze together and push it out of the gap, in a random direction
        setDrag(null)
        setRowAnim('squeeze')
        setRejected(letter)
        sound.playYuck()
        const angle = (-(15 + Math.random() * 150) * Math.PI) / 180 // upwards or sideways, never back into the options
        const dist = 190 + Math.random() * 90
        const spin = (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random() * 200)
        const out = el.animate(
          [
            { transform: at, opacity: 1, offset: 0 },
            { transform: `${at} scale(0.62, 1.22)`, opacity: 1, offset: 0.24 },
            { transform: `${at} scale(0.62, 1.22)`, opacity: 1, offset: 0.33 },
            {
              transform: `translate(${tx + Math.cos(angle) * dist}px, ${ty + Math.sin(angle) * dist}px) rotate(${spin}deg) scale(0.8)`,
              opacity: 0.9,
              offset: 0.62,
            },
            { transform: 'none', opacity: 1, offset: 1 }, // and it drifts back to the options
          ],
          { duration: 1500, easing: 'ease-in-out' },
        )
        glide.cancel()
        later(() => setRowAnim(''), 1000)
        out.onfinish = () => {
          // back in the options, greyed out: the child tries a different letter in the same round
          setTried((t) => [...t, letter])
          setRejected(null)
          busy.current = false
        }
      }
    }
  }

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, letter: string) => {
    if (busy.current || solved || rejected !== null || tried.includes(letter)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    sound.playTap()
    setDrag({ letter, pid: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 })
  }
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pid) return
    setDrag({ ...drag, dx: e.clientX - drag.sx, dy: e.clientY - drag.sy })
  }
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pid) return
    drop(drag.letter)
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

      <p className="count-ask">Drag the missing letter into the gap</p>

      <section
        className={`series-row ${rowAnim}`}
        key={`row-${levelIndex}`}
        role="img"
        aria-label={`${lv.from} to ${lv.to}, one letter is missing`}
        style={{ '--n': round.letters.length } as React.CSSProperties}
      >
        {round.letters.map((ch, i) => {
          const isMissing = i === round.missing
          const nb = i === round.missing - 1 ? 'nb-left' : i === round.missing + 1 ? 'nb-right' : ''
          const slotStyle = { '--d': `${i * 80}ms` } as React.CSSProperties
          if (isMissing && !solved) {
            return (
              <span key={i} className="series-slot" style={slotStyle} ref={blankRef}>
                <span className={`series-tile blank ${rejected !== null ? 'wrong' : ''} ${drag ? 'ready' : ''}`}>?</span>
              </span>
            )
          }
          return (
            <span key={i} className="series-slot" style={slotStyle}>
              <span
                className={`series-tile ${isMissing ? 'filled' : ''} ${nb}`}
                style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
              >
                {ch}
              </span>
              {isMissing && (
                <span className="series-heart" aria-hidden>
                  ♥
                </span>
              )}
            </span>
          )
        })}
      </section>

      <section className="count-options series-options" aria-label="Letters to drag" key={`opts-${levelIndex}`}>
        {round.options.map((ch, i) => {
          const dragging = drag?.letter === ch
          const cls = [
            'count-option',
            dragging ? 'dragging' : '',
            solved && ch === round.answer ? 'placed' : '',
            solved && ch !== round.answer ? 'faded' : '',
            rejected === ch ? 'rejected' : '',
            tried.includes(ch) ? 'tried' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={ch}
              ref={(el) => {
                optRefs.current[ch] = el
              }}
              className={cls}
              style={{
                '--c': OPTION_COLORS[i % OPTION_COLORS.length],
                '--d': `${i * 60}ms`,
                ...(dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.12) rotate(-4deg)` } : {}),
              } as React.CSSProperties}
              onPointerDown={(e) => onDown(e, ch)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={(e) => {
                if (e.detail === 0 && !busy.current && !solved && rejected === null && !tried.includes(ch)) drop(ch, true) // keyboard
              }}
              aria-label={`${ch}, drag into the gap`}
              disabled={tried.includes(ch)}
            >
              <span className={`count-num ${hint && !solved && rejected === null && ch === round.answer ? 'hint' : ''}`}>{ch}</span>
            </button>
          )
        })}
      </section>
      <p className="sr-only" aria-live="polite">
        {solved ? `Yes, ${round.answer}!` : ''}
      </p>

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
