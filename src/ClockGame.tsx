import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import {
  CLOCK_LEVEL_COUNT,
  clockLevels,
  makeClockRound,
  makeOptions,
  nearestNumber,
  type ClockRound,
  type HandName,
} from './clockLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  /** called after a wrong answer, with the level the child reached */
  onFailed: (level: number) => void
  soundButton: React.ReactNode
}

const NUMBER_COLORS = ['#ff8fa3', '#6cc3f5', '#7bd88f']
const HANDS: HandName[] = ['hour', 'minute']
const HAND_WORD: Record<HandName, string> = { hour: 'short hand', minute: 'long hand' }
const NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1)

/** The short hand is thick, red and short. The long hand is thin, blue and long. Never the other way round. */
function HandChip({ hand }: { hand: HandName }) {
  return (
    <span className={`hand-chip ${hand}`}>
      <i aria-hidden />
      {HAND_WORD[hand]}
    </span>
  )
}

/**
 * Clock Time. Every level asks two things: first about the short (hour) hand, then about the long (minute) hand.
 * Levels 1 to 4: choose the number the hand points at (the closest one, if it sits between two).
 * Levels 5 and 6: swing the hand to the asked number by touching or dragging on the clock.
 * A wrong answer ends the run, like Pattern Match and Counting.
 */
export default function ClockGame({ onHome, onFinished, onFailed, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState<ClockRound>(() => makeClockRound(1))
  const [step, setStep] = useState(0) // 0: the short hand, 1: the long hand
  const [state, setState] = useState<'idle' | 'right' | 'failed'>('idle')
  const [failedPick, setFailedPick] = useState<number | null>(null)
  const [live, setLive] = useState(0) // where the hand being moved points (set levels)
  const [dragging, setDragging] = useState(false)
  const [setHour, setSetHour] = useState(0) // where the child left the short hand (set levels)
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
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

  const hand: HandName = HANDS[step]
  const level = clockLevels[levelIndex]
  const isSet = round.mode === 'set'
  const target = round.answer[hand]
  const startPos = (n: number) => (n === 12 ? 6 : 12) // a set-level hand starts away from where it has to go

  const options = React.useMemo(
    () => (isSet ? [] : makeOptions(hand === 'hour' ? round.hour : round.minute, target)),
    [round, step, isSet], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // After a pause, gently pulse the right answer.
  useEffect(() => {
    setHint(false)
    if (state !== 'idle' || celebrating) return
    const id = window.setTimeout(() => setHint(true), 10000)
    return () => window.clearTimeout(id)
  }, [round, step, state, celebrating])

  const startStep = (nextStep: number, r: ClockRound) => {
    setStep(nextStep)
    setState('idle')
    setFailedPick(null)
    if (r.mode === 'set') setLive(startPos(r.answer[HANDS[nextStep]]))
  }

  const beginLevel = (index: number) => {
    const r = makeClockRound(index + 1)
    setLevelIndex(index)
    setRound(r)
    setSetHour(0)
    setCelebrating(false)
    startStep(0, r)
  }

  const right = (placed?: number) => {
    setState('right')
    sound.playCorrect(levelIndex + step * 2)
    if (step === 0) {
      if (isSet) setSetHour(placed ?? live)
      later(() => startStep(1, round), 1000)
    } else {
      later(() => {
        setCelebrating(true)
        sound.playLevelWin()
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
      }, 700)
      later(() => {
        if (levelIndex < CLOCK_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
        else onFinished()
      }, 2700)
    }
  }

  // A wrong answer ends the run; playing again from Home starts at level 1.
  const wrong = (pick: number) => {
    sound.playFail()
    setState('failed')
    setFailedPick(pick)
    later(() => onFailed(levelIndex + 1), 1200)
  }

  const onPick = (n: number) => {
    if (state !== 'idle') return
    if (n === target) right()
    else wrong(n)
  }

  // ----- moving a hand (levels 5 and 6): touch or drag anywhere on the clock face -----
  const posFromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI // 0 at the top, clockwise
    return ((deg + 360) % 360) / 30
  }
  const onDown = (e: React.PointerEvent) => {
    if (!isSet || state !== 'idle') return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setLive(posFromEvent(e))
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setLive(posFromEvent(e))
  }
  const onUp = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    const n = nearestNumber(posFromEvent(e))
    setLive(n) // the hand snaps onto the number
    sound.playTap()
    if (n === target) right(n)
    else wrong(n)
  }

  // ----- what the clock shows -----
  let hourPos: number, minutePos: number
  if (isSet) {
    hourPos = step === 0 ? live : setHour
    minutePos = step === 0 ? 0 : live
  } else {
    hourPos = round.hour
    minutePos = round.minute
  }
  const shown: Record<HandName, number> = { hour: hourPos, minute: minutePos }
  const order: HandName[] = hand === 'hour' ? ['minute', 'hour'] : ['hour', 'minute'] // the asked hand is drawn on top
  const showHint = hint && state === 'idle'

  return (
    <main className="game clock-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${CLOCK_LEVEL_COUNT}`}>
          {clockLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <div className="clock-steps" aria-hidden>
        {HANDS.map((h, i) => (
          <span key={h} className={`${i < step || (i === step && state === 'right') ? 'done' : ''} ${i === step ? 'current' : ''}`} />
        ))}
      </div>

      <p className="clock-ask" key={`${levelIndex}-${step}`}>
        {isSet ? (
          <>
            Move the <HandChip hand={hand} /> to <b className={`target-num ${hand}`}>{target}</b>
          </>
        ) : (
          <>
            Where is the <HandChip hand={hand} /> pointing?
          </>
        )}
      </p>

      <div className="clock-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className={`clock-svg ${isSet ? 'movable' : ''} ${state}`}
          role="img"
          aria-label={
            isSet
              ? `A clock. Move the ${HAND_WORD[hand]} to ${target}.`
              : `A clock. The short hand and the long hand point at numbers.`
          }
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <circle cx="100" cy="100" r="96" fill="#fff" stroke="#ffb703" strokeWidth="6" />
          <circle cx="100" cy="100" r="88" fill="#fffdf6" />
          {NUMBERS.map((n) => {
            const a = (n * 30 * Math.PI) / 180
            const hot = isSet && showHint && n === target
            return (
              <g key={n} className={hot ? 'num-hint' : ''}>
                {isSet && state === 'failed' && n === failedPick && (
                  <circle cx={100 + 76 * Math.sin(a)} cy={100 - 76 * Math.cos(a)} r="13" fill="#fecaca" />
                )}
                <text
                  x={100 + 76 * Math.sin(a)}
                  y={100 - 76 * Math.cos(a)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="19"
                  fontWeight="800"
                  fill="#2d3a4f"
                >
                  {n}
                </text>
              </g>
            )
          })}
          {order.map((h) => {
            const asked = h === hand
            const deg = shown[h] * 30
            return (
              <g
                key={h}
                className={`hand ${h} ${asked ? 'asked' : 'other'} ${dragging && asked ? 'dragging' : ''}`}
                style={{ transform: `rotate(${deg}deg)` }}
              >
                {h === 'hour' ? (
                  <>
                    <line x1="100" y1="106" x2="100" y2="62" stroke="#b3203f" strokeWidth="14" strokeLinecap="round" />
                    <line x1="100" y1="106" x2="100" y2="62" stroke="#ef476f" strokeWidth="9" strokeLinecap="round" />
                    <path d="M100 48 L110 66 L90 66Z" fill="#ef476f" stroke="#b3203f" strokeWidth="3" strokeLinejoin="round" />
                  </>
                ) : (
                  <>
                    <line x1="100" y1="110" x2="100" y2="30" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
                    <line x1="100" y1="110" x2="100" y2="30" stroke="#3b82f6" strokeWidth="3.4" strokeLinecap="round" />
                  </>
                )}
              </g>
            )
          })}
          <circle cx="100" cy="100" r="7" fill="#2d3a4f" />
          <circle cx="100" cy="100" r="2.6" fill="#ffd166" />
        </svg>
        {state === 'right' && !celebrating && (
          <span className="clock-check" aria-hidden>
            ✓
          </span>
        )}
      </div>

      {isSet ? (
        <p className="clock-tip">Touch the clock, or drag the hand, to the number</p>
      ) : (
        <section className="count-options clock-options" aria-label="Pick the number" key={`opts-${levelIndex}-${step}`}>
          {options.map((n, i) => {
            const cls = [
              'count-option',
              state === 'right' && n === target ? 'right' : '',
              state === 'right' && n !== target ? 'faded' : '',
              failedPick === n ? 'failed' : '',
              state === 'failed' && failedPick !== n ? 'faded' : '',
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
                disabled={state !== 'idle'}
              >
                <span className={`count-num ${showHint && n === target ? 'hint' : ''}`}>{n}</span>
              </button>
            )
          })}
        </section>
      )}

      <p className="sr-only" aria-live="polite">
        {state === 'right' ? 'Yes!' : ''}
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
