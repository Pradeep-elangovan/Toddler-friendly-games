/** Screen time limit: pure logic (no React), so it can be tested on its own. */

export const TIMER_OPTIONS = [15, 30, 45] as const
export type TimerMinutes = (typeof TIMER_OPTIONS)[number]

const KEY = 'tfg.screentime'

/** What is saved on the device: the time left (it only counts down while the app is open and visible). */
export type TimerState = {
  /** null: no timer is running. 0: time is up and the app is locked. */
  remainingMs: number | null
  /** the length of the timer that was chosen, in minutes (for the progress bar) */
  totalMin: number | null
}

export const NO_TIMER: TimerState = { remainingMs: null, totalMin: null }

export function loadTimer(): TimerState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return NO_TIMER
    const v = JSON.parse(raw)
    if (typeof v.remainingMs === 'number' && v.remainingMs >= 0 && v.remainingMs <= 45 * 60000 + 1000) {
      return { remainingMs: v.remainingMs, totalMin: typeof v.totalMin === 'number' ? v.totalMin : null }
    }
  } catch {
    /* storage blocked or damaged: no timer */
  }
  return NO_TIMER
}

export function saveTimer(t: TimerState) {
  try {
    if (t.remainingMs === null) window.localStorage.removeItem(KEY)
    else window.localStorage.setItem(KEY, JSON.stringify(t))
  } catch {
    /* private mode: the timer still works, it just isn't remembered */
  }
}

export const startTimer = (min: TimerMinutes): TimerState => ({ remainingMs: min * 60000, totalMin: min })

export type TimerStatus = 'none' | 'running' | 'expired'
export const statusOf = (t: TimerState): TimerStatus => (t.remainingMs === null ? 'none' : t.remainingMs <= 0 ? 'expired' : 'running')

/** "12:05" */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Counting down: only time the app was really open counts. A tick longer than a few seconds (the phone slept, the tab
 * was hidden) is ignored, so the child never loses time they did not use, and nobody gains time by changing the clock.
 */
export function tick(t: TimerState, elapsedMs: number): TimerState {
  if (t.remainingMs === null || t.remainingMs <= 0) return t
  const used = Math.min(Math.max(elapsedMs, 0), 5000)
  return { ...t, remainingMs: Math.max(0, t.remainingMs - used) }
}

export type AdultProblem = { text: string; answer: number }

/**
 * A small sum for a grown-up, hard enough that a young child cannot guess it:
 * two-digit addition, two-digit subtraction, or a times table.
 */
export function makeAdultProblem(random: () => number = Math.random): AdultProblem {
  const between = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1))
  const kind = Math.floor(random() * 3)
  if (kind === 0) {
    const a = between(21, 79)
    const b = between(18, 69)
    return { text: `${a} + ${b}`, answer: a + b }
  }
  if (kind === 1) {
    const a = between(62, 99)
    const b = between(17, a - 21)
    return { text: `${a} − ${b}`, answer: a - b }
  }
  const a = between(6, 12)
  const b = between(4, 9)
  return { text: `${a} × ${b}`, answer: a * b }
}

/** Wrong answers allowed before the keypad rests for a while, and how long it rests. */
export const MAX_WRONG = 3
export const COOLDOWN_MS = 30000
