import { shuffle } from './gameData'

/**
 * Missing Letter: a run of letters in alphabet order with the LAST one missing ("G H I ?"). The child says what comes
 * next and picks the missing letter out of three. A gap in the middle made children keep reading on, so it is always at the end.
 * Where the run starts is random every time (so the answer is different each round); the levels differ in how many
 * letters are shown. Ten levels: five of capitals, then the same five in small letters.
 */
export const SERIES_LEVEL_COUNT = 10

/** how many letters are shown before the missing one, in levels 1 to 5 (and again in 6 to 10) */
const SHOWN = [2, 3, 4, 5, 6]

export type SeriesLevel = { level: number; shown: number; upper: boolean }

export const seriesLevels: SeriesLevel[] = Array.from({ length: SERIES_LEVEL_COUNT }, (_, i) => ({
  level: i + 1,
  shown: SHOWN[i % SHOWN.length],
  upper: i < SHOWN.length,
}))

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
  const length = lv.shown + 1
  const first = Math.floor(random() * (26 - length + 1)) // any start that still leaves room for the run
  const baseCode = (lv.upper ? 65 : 97) + first
  const letters = Array.from({ length }, (_, i) => String.fromCharCode(baseCode + i))
  const missing = length - 1 // always the end of the run
  const answer = letters[missing]
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode((lv.upper ? 65 : 97) + i))
  const wrong = shuffle(
    alphabet.filter((c) => !letters.includes(c)),
    random,
  ).slice(0, 2)
  return { letters, missing, answer, options: shuffle([answer, ...wrong], random) }
}
