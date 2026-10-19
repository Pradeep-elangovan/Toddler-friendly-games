import { shuffle } from './gameData'

/**
 * Missing Letter: a run of letters in alphabet order with one missing in between (never the first or last).
 * The child picks the missing letter out of three. Ten levels: five runs of capitals, then the same five in small letters.
 */
export const SERIES_LEVEL_COUNT = 10

const RANGES: readonly (readonly [string, string])[] = [
  ['a', 'e'],
  ['f', 'k'],
  ['l', 'p'],
  ['q', 'u'],
  ['v', 'z'],
]

export type SeriesLevel = { level: number; from: string; to: string; upper: boolean }

export const seriesLevels: SeriesLevel[] = Array.from({ length: SERIES_LEVEL_COUNT }, (_, i) => {
  const [from, to] = RANGES[i % RANGES.length]
  const upper = i < RANGES.length
  return {
    level: i + 1,
    from: upper ? from.toUpperCase() : from,
    to: upper ? to.toUpperCase() : to,
    upper,
  }
})

export type SeriesRound = {
  /** the whole run, in order */
  letters: string[]
  /** index in `letters` of the letter that is hidden */
  missing: number
  answer: string
  /** exactly three different letters (same case), one of them `answer` */
  options: string[]
}

export function makeSeriesRound(level: number, random: () => number = Math.random): SeriesRound {
  const lv = seriesLevels[Math.min(Math.max(Math.round(level), 1), SERIES_LEVEL_COUNT) - 1]
  const base = lv.from.charCodeAt(0)
  const length = lv.to.charCodeAt(0) - base + 1
  const letters = Array.from({ length }, (_, i) => String.fromCharCode(base + i))
  const missing = 1 + Math.floor(random() * (length - 2))
  const answer = letters[missing]
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode((lv.upper ? 65 : 97) + i))
  const wrong = shuffle(
    alphabet.filter((c) => !letters.includes(c)),
    random,
  ).slice(0, 2)
  return { letters, missing, answer, options: shuffle([answer, ...wrong], random) }
}
