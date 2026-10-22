import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './icons'
import {
  COOLDOWN_MS,
  MAX_WRONG,
  NO_TIMER,
  TIMER_OPTIONS,
  formatTime,
  loadTimer,
  makeAdultProblem,
  saveTimer,
  startTimer,
  statusOf,
  tick,
  type AdultProblem,
  type TimerMinutes,
  type TimerState,
  type TimerStatus,
} from './screenTimeLogic'
import * as sound from './sound'

/**
 * The screen time timer: counts down only while the app is open and visible, is remembered on the device,
 * and reports when time is up so the app can lock.
 */
export function useScreenTime() {
  const [timer, setTimer] = useState<TimerState>(() => loadTimer())
  const ref = useRef(timer)
  ref.current = timer

  const update = useCallback((next: TimerState) => {
    ref.current = next
    setTimer(next)
    saveTimer(next)
  }, [])

  useEffect(() => {
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const elapsed = now - last
      last = now
      if (document.visibilityState !== 'visible') return
      const cur = ref.current
      if (cur.remainingMs === null || cur.remainingMs <= 0) return
      update(tick(cur, elapsed))
    }, 1000)
    const onVisible = () => {
      last = Date.now() // time spent hidden does not count
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [update])

  return {
    timer,
    status: statusOf(timer) as TimerStatus,
    start: (min: TimerMinutes) => update(startTimer(min)),
    stop: () => update(NO_TIMER),
  }
}

/** The three timer buttons. */
function TimerButtons({ onPick }: { onPick: (min: TimerMinutes) => void }) {
  return (
    <div className="st-options">
      {TIMER_OPTIONS.map((m) => (
        <button
          key={m}
          className="st-option"
          onClick={() => {
            sound.playTap()
            onPick(m)
          }}
          aria-label={`${m} minutes`}
        >
          <b>{m}</b>
          <span>min</span>
        </button>
      ))}
    </div>
  )
}

/**
 * The grown-up check: a small sum answered on a big keypad. A wrong answer gives a new sum;
 * after a few wrong answers the keypad rests for 30 seconds so a child cannot just keep guessing.
 */
function AdultGate({ title, note, onPass, onCancel }: { title: string; note: string; onPass: () => void; onCancel?: () => void }) {
  const [problem, setProblem] = useState<AdultProblem>(() => makeAdultProblem())
  const [typed, setTyped] = useState('')
  const [wrong, setWrong] = useState(0)
  const [shake, setShake] = useState(false)
  const [restUntil, setRestUntil] = useState(0)
  const [now, setNow] = useState(Date.now())

  const resting = restUntil > now
  useEffect(() => {
    if (!resting) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [resting])

  const press = (d: string) => {
    if (resting) return
    setTyped((t) => (t.length < 4 ? t + d : t))
  }
  const back = () => setTyped((t) => t.slice(0, -1))
  const check = () => {
    if (resting || typed === '') return
    if (Number(typed) === problem.answer) {
      sound.playCorrect(2)
      onPass()
      return
    }
    sound.playWrong()
    setShake(true)
    window.setTimeout(() => setShake(false), 450)
    setTyped('')
    setProblem(makeAdultProblem())
    const w = wrong + 1
    if (w >= MAX_WRONG) {
      setWrong(0)
      setRestUntil(Date.now() + COOLDOWN_MS)
      setNow(Date.now())
    } else {
      setWrong(w)
    }
  }

  // a computer keyboard works too
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {})
  keyRef.current = (e) => {
    if (/^[0-9]$/.test(e.key)) press(e.key)
    else if (e.key === 'Backspace') back()
    else if (e.key === 'Enter') check()
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const secondsLeft = Math.ceil((restUntil - now) / 1000)

  return (
    <div className="st-gate" role="dialog" aria-modal="true" aria-label={title}>
      <h2>{title}</h2>
      <p className="st-note">{note}</p>
      <div className={`st-sum ${shake ? 'shake' : ''}`}>
        <span className="st-problem" aria-label={`${problem.text} equals`}>
          {problem.text} = ?
        </span>
        <span className="st-typed" aria-live="polite">
          {typed || ' '}
        </span>
      </div>
      {resting ? (
        <p className="st-rest" role="status">
          Too many tries. Please wait {secondsLeft} seconds.
        </p>
      ) : (
        <div className="st-keys">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} onClick={() => press(d)} aria-label={d}>
              {d}
            </button>
          ))}
          <button className="st-back" onClick={back} aria-label="Delete">
            ⌫
          </button>
          <button onClick={() => press('0')} aria-label="0">
            0
          </button>
          <button className="st-ok" onClick={check} aria-label="Check" disabled={typed === ''}>
            ✓
          </button>
        </div>
      )}
      {onCancel && (
        <button className="st-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  )
}

/** The small strip on the first page: set a timer, or see how long is left. */
export function ScreenTimePanel({
  status,
  timer,
  onStart,
  onStop,
}: {
  status: TimerStatus
  timer: TimerState
  onStart: (m: TimerMinutes) => void
  onStop: () => void
}) {
  // changing a running timer needs a grown-up: first the sum, then the choice
  const [step, setStep] = useState<'idle' | 'gate' | 'choose'>('idle')
  const left = timer.remainingMs ?? 0
  const pct = timer.totalMin ? Math.min(100, Math.max(0, (left / (timer.totalMin * 60000)) * 100)) : 0

  return (
    <section className="st-panel" aria-label="Screen time">
      {status === 'running' ? (
        <>
          <div className="st-running">
            <span className="st-clock" aria-hidden>
              <Icon name="clock" />
            </span>
            <span className="st-left" role="timer" aria-label={`${formatTime(left)} left`}>
              {formatTime(left)} <small>left</small>
            </span>
            <button className="st-change" onClick={() => setStep('gate')}>
              Change
            </button>
          </div>
          <div className="st-bar" aria-hidden>
            <span style={{ width: `${pct}%` }} />
          </div>
        </>
      ) : (
        <div className="st-set">
          <span className="st-title">
            <span className="st-clock" aria-hidden>
              <Icon name="clock" />
            </span>
            Screen time
          </span>
          <TimerButtons onPick={onStart} />
        </div>
      )}

      {step !== 'idle' && (
        <div className="st-backdrop">
          {step === 'gate' ? (
            <AdultGate
              title="Grown-ups only"
              note="Solve the sum to change the screen time."
              onPass={() => setStep('choose')}
              onCancel={() => setStep('idle')}
            />
          ) : (
            <div className="st-gate" role="dialog" aria-modal="true" aria-label="Choose screen time">
              <h2>Screen time</h2>
              <p className="st-note">Start a new timer, or turn the limit off.</p>
              <TimerButtons
                onPick={(m) => {
                  onStart(m)
                  setStep('idle')
                }}
              />
              <button
                className="st-cancel"
                onClick={() => {
                  onStop()
                  setStep('idle')
                }}
              >
                No limit
              </button>
              <button className="st-cancel" onClick={() => setStep('idle')}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/** Time is up: the whole app is covered until a grown-up solves the sum and picks a new timer. */
export function LockScreen({ onStart }: { onStart: (m: TimerMinutes) => void }) {
  const [passed, setPassed] = useState(false)
  return (
    <div className="st-lock" role="alertdialog" aria-modal="true" aria-label="Screen time is over">
      <div className="st-lock-card">
        <div className="st-moon" aria-hidden>
          <Icon name="moon" />
        </div>
        <h1>Time is up!</h1>
        <p className="st-note">Great playing! Screen time is over for now.</p>
        {passed ? (
          <div className="st-gate plain">
            <h2>More time?</h2>
            <p className="st-note">Pick how long they can play.</p>
            <TimerButtons onPick={onStart} />
          </div>
        ) : (
          <AdultGate title="Grown-ups only" note="Solve the sum to unlock." onPass={() => setPassed(true)} />
        )}
      </div>
    </div>
  )
}

/** "1 minute left": a small friendly note so the end is not a surprise. */
export function MinuteWarning({ remainingMs }: { remainingMs: number | null }) {
  const [shown, setShown] = useState(false)
  const done = useRef(false)
  useEffect(() => {
    if (remainingMs === null || remainingMs > 61000) {
      done.current = false
      return
    }
    if (remainingMs > 0 && !done.current) {
      done.current = true
      setShown(true)
      const id = window.setTimeout(() => setShown(false), 5000)
      return () => window.clearTimeout(id)
    }
  }, [remainingMs])
  if (!shown) return null
  return (
    <div className="st-toast" role="status">
      <span aria-hidden>⏳</span> 1 minute left
    </div>
  )
}
