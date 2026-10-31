import { shuffle } from './gameData'

/**
 * Missing Letter: a run of letters in alphabet order with the LAST one missing ("A B C ?"). The child says what comes
 * next and picks the missing letter out of three. A gap in the middle made children keep reading on, so it is always at the end.
 * Ten levels: five runs of capitals, then five runs of small letters, each starting somewhere new.
 */
export const SERIES_LEVEL_COUNT = 10

/** [first letter, missing (last) letter]; the capitals use these in capitals */
const RANGES: readonly (readonly [string, string])[] = [
  ['a', 'd'], // A B C ?
  ['e', 'h'], // E F G ?
  ['i', 'm'], // I J K L ?
  ['n', 'r'],
  ['u', 'z'], // U V W X Y ?
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
  const missing = length - 1 // always the end of the run
  const answer = letters[missing]
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode((lv.upper ? 65 : 97) + i))
  const wrong = shuffle(
    alphabet.filter((c) => !letters.includes(c)),
    random,
  ).slice(0, 2)
  return { letters, missing, answer, options: shuffle([answer, ...wrong], random) }
}
