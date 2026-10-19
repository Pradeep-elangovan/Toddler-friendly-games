import { shuffle } from './gameData'

/**
 * Clock Time. Hands point at the numbers 1 to 12 only (no minutes to convert).
 * Positions are in "numbers": 3 means pointing at the 3, 3.4 means a bit past the 3 on the way to the 4.
 * Each level has two questions: first the short (hour) hand, then the long (minute) hand.
 * Levels 1 to 4: read the clock and choose the number a hand points at.
 * Levels 5 and 6: move a hand to a number that is asked for.
 */
export const CLOCK_LEVEL_COUNT = 6

export type ClockLevel = { level: number; mode: 'read' | 'set' }

export const clockLevels: ClockLevel[] = [
  { level: 1, mode: 'read' }, // both hands on different numbers
  { level: 2, mode: 'read' }, // both hands on the same number
  { level: 3, mode: 'read' }, // short hand between two numbers
  { level: 4, mode: 'read' }, // both hands between numbers
  { level: 5, mode: 'set' }, // move the hands to 12, 3, 6, 9
  { level: 6, mode: 'set' }, // move the hands to the other numbers
]

export type HandName = 'hour' | 'minute'

export type ClockRound = {
  mode: 'read' | 'set'
  /** where the hands are shown (read levels) */
  hour: number
  minute: number
  /** the number each hand must end up pointing at (the answer for read levels, the target for set levels) */
  answer: { hour: number; minute: number }
}

/** The set levels use different numbers: level 5 the quarter numbers, level 6 all the others. */
export const SET_POOLS: Record<5 | 6, readonly number[]> = {
  5: [12, 3, 6, 9],
  6: [1, 2, 4, 5, 7, 8, 10, 11],
}

/** Which number (1 to 12) a position is closest to. */
export function nearestNumber(pos: number): number {
  const n = Math.round(((pos % 12) + 12) % 12)
  return n === 0 ? 12 : n
}

/** Position on the dial (0 to 12, 12 is the top) of a number. */
export const posOf = (n: number) => n % 12

/** Shortest distance between two positions, in numbers (0 to 6). */
export function dist(a: number, b: number): number {
  const d = Math.abs(((a - b) % 12) + 12) % 12
  return Math.min(d, 12 - d)
}

const whole = (random: () => number) => 1 + Math.floor(random() * 12)

/** A position between two numbers, clearly closer to one of them (never exactly half way). */
function between(random: () => number): { pos: number; answer: number } {
  const k = whole(random)
  const d = (0.22 + random() * 0.16) * (random() < 0.5 ? -1 : 1) // 0.22..0.38 either side
  const pos = (((k + d) % 12) + 12) % 12
  return { pos, answer: k }
}

export function makeClockRound(level: number, random: () => number = Math.random): ClockRound {
  const lv = Math.min(Math.max(Math.round(level), 1), CLOCK_LEVEL_COUNT)
  if (lv >= 5) {
    const pool = SET_POOLS[lv as 5 | 6]
    const hour = pool[Math.floor(random() * pool.length)]
    const minute = pool[Math.floor(random() * pool.length)]
    return { mode: 'set', hour: 0, minute: 0, answer: { hour, minute } }
  }
  for (;;) {
    let hour: number, minute: number, ah: number, am: number
    if (lv === 1 || lv === 2) {
      ah = whole(random)
      am = lv === 2 ? ah : whole(random)
      hour = posOf(ah)
      minute = posOf(am)
    } else if (lv === 3) {
      const h = between(random)
      hour = h.pos
      ah = h.answer
      am = whole(random)
      minute = posOf(am)
    } else {
      const h = between(random)
      const m = between(random)
      hour = h.pos
      ah = h.answer
      minute = m.pos
      am = m.answer
    }
    // the two hands must be easy to tell apart (except in level 2, where they sit on the same number on purpose)
    if (lv !== 2 && dist(hour, minute) < 1) continue
    return { mode: 'read', hour, minute, answer: { hour: ah, minute: am } }
  }
}

/**
 * Three different numbers (1 to 12), one of them correct. When the hand sits between two numbers,
 * the other neighbour is always one of the wrong options, so the child really has to see which is closer.
 */
export function makeOptions(pos: number, answer: number, random: () => number = Math.random): number[] {
  const opts = new Set<number>([answer])
  const rel = ((((pos % 12) + 12) % 12) - posOf(answer) + 12) % 12 // 0 on the number, else just past or just before
  if (rel > 0.01 && rel < 11.99) {
    const other = rel < 6 ? answer + 1 : answer - 1
    opts.add(((((other - 1) % 12) + 12) % 12) + 1)
  }
  while (opts.size < 3) opts.add(whole(random))
  return shuffle([...opts], random)
}
