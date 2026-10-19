import { shuffle } from './gameData'

/**
 * Clock Time. Hands point at the numbers 1 to 12 only (no minutes to convert).
 * Positions are in "numbers": 3 means pointing at the 3, 3.4 means a bit past the 3 on the way to the 4.
 * Each level has two questions: first the short (hour) hand, then the long (minute) hand.
 * Levels 1 to 4: read the clock and choose the number a hand points at.
 * Levels 5 and 6: move a hand to a number that is asked for.
 * Level 7: the child looks at a real clock and shows the time it is right now on the clock whose hands they move.
 * Levels 5 to 7 never fail the child: a wrong placement springs back and the child tries again.
 */
export const CLOCK_LEVEL_COUNT = 7

export type ClockLevel = { level: number; mode: 'read' | 'set' | 'copy' }

export const clockLevels: ClockLevel[] = [
  { level: 1, mode: 'read' }, // both hands on different numbers
  { level: 2, mode: 'read' }, // both hands on the same number
  { level: 3, mode: 'read' }, // short hand between two numbers
  { level: 4, mode: 'read' }, // both hands between numbers
  { level: 5, mode: 'set' }, // move the hands to 12, 3, 6, 9
  { level: 6, mode: 'set' }, // move the hands to the other numbers
  { level: 7, mode: 'copy' }, // look at a real clock and show the time it is right now
]

export type HandName = 'hour' | 'minute'

export type ClockRound = {
  mode: 'read' | 'set'
  /** where the hands are shown (read levels) */
  hour: number
  minute: number
  /** the number each hand must end up pointing at (the answer for read levels, the target for set levels) */
  answer: { hour: number; minute: number }
  /** every number that counts as correct for each hand (only level 7 has more than one, when the short hand is half way) */
  accept: { hour: number[]; minute: number[] }
  /** the three options shown for both questions of a read level */
  options?: number[]
  /** where a real clock would show the time (level 7 only; kept for tests) */
  ref?: { hour: number; minute: number }
}

/**
 * The time to show in level 7: the time right now, rounded to the nearest 5 minutes so the long hand sits on a number.
 * The short hand sits where a real clock puts it (hour plus a fraction), and either neighbouring number is accepted
 * when it is exactly half way.
 */
export function copyRound(now: Date = new Date()): ClockRound {
  const total = Math.round((now.getHours() * 60 + now.getMinutes()) / 5) * 5
  const hh = Math.floor(total / 60) % 12
  const mm = total % 60
  const hourPos = hh + mm / 60
  const minutePos = mm / 5
  const minuteNum = minutePos === 0 ? 12 : minutePos
  const hourNums = NUMBERS.filter((n) => dist(hourPos, posOf(n)) <= 0.5 + 1e-9)
  return {
    mode: 'set',
    hour: 0,
    minute: 0,
    answer: { hour: nearestNumber(hourPos), minute: minuteNum },
    accept: { hour: hourNums, minute: [minuteNum] },
    ref: { hour: hourPos, minute: minutePos },
  }
}

const NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1)

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

export function makeClockRound(level: number, random: () => number = Math.random, now?: Date): ClockRound {
  const lv = Math.min(Math.max(Math.round(level), 1), CLOCK_LEVEL_COUNT)
  if (lv === 7) return copyRound(now)
  if (lv >= 5) {
    const pool = SET_POOLS[lv as 5 | 6]
    const hour = pool[Math.floor(random() * pool.length)]
    const minute = pool[Math.floor(random() * pool.length)]
    return { mode: 'set', hour: 0, minute: 0, answer: { hour, minute }, accept: { hour: [hour], minute: [minute] } }
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
    const r: ClockRound = { mode: 'read', hour, minute, answer: { hour: ah, minute: am }, accept: { hour: [ah], minute: [am] } }
    r.options = makeLevelOptions(r, random)
    return r
  }
}

/** The number next to `answer` on the far side of the hand, which the hand is NOT closest to. */
function otherNeighbour(pos: number, answer: number): number | null {
  const rel = ((((pos % 12) + 12) % 12) - posOf(answer) + 12) % 12 // 0 on the number, else just past or just before
  if (rel < 0.01 || rel > 11.99) return null
  const other = rel < 6 ? answer + 1 : answer - 1
  return ((((other - 1) % 12) + 12) % 12) + 1
}

/**
 * The three options for a whole level (read levels). They stay the same for both questions: the child picks the
 * short hand's number first and that option is used up, then picks the long hand's number from what is left.
 * So the options are the two answers plus one more number. When a hand sits between two numbers, the extra number
 * is that hand's other neighbour, so the child really has to see which one is closer.
 * (Level 2 has the same answer for both hands, so it needs two extra numbers and the answer stays available.)
 */
export function makeLevelOptions(round: ClockRound, random: () => number = Math.random): number[] {
  const opts = new Set<number>([round.answer.hour, round.answer.minute])
  const neighbours = shuffle(
    [otherNeighbour(round.hour, round.answer.hour), otherNeighbour(round.minute, round.answer.minute)].filter(
      (n): n is number => n !== null,
    ),
    random,
  )
  for (const n of neighbours) if (opts.size < 3) opts.add(n)
  while (opts.size < 3) opts.add(whole(random))
  return shuffle([...opts], random)
}
