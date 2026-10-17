import { fruitNames, iconNames, shuffle, type IconName } from './gameData'

/** Level N shows N of the same item (1 to 9) and asks "how many?". Nothing else changes between levels. */
export const COUNT_LEVEL_COUNT = 9

export const countLevels = Array.from({ length: COUNT_LEVEL_COUNT }, (_, i) => ({ level: i + 1, count: i + 1 }))

/** Items that can be counted: every main icon plus the fruit. */
export const countIcons: readonly IconName[] = [...new Set<IconName>([...iconNames, ...fruitNames])]

/** How many items sit on each row, so every number is laid out neatly and easy to count. */
export const ROWS: readonly (readonly number[])[] = [
  [], // unused (levels are 1-based)
  [1],
  [2],
  [3],
  [2, 2],
  [3, 2],
  [3, 3],
  [4, 3],
  [4, 4],
  [3, 3, 3],
]

export type CountRound = {
  icon: IconName
  count: number
  /** exactly three different numbers from 1 to 9, one of which is `count` */
  options: number[]
}

export function makeCountRound(level: number, avoid?: IconName, random: () => number = Math.random): CountRound {
  const count = Math.min(Math.max(Math.round(level), 1), COUNT_LEVEL_COUNT)
  const pool = countIcons.filter((n) => n !== avoid)
  const icon = pool[Math.floor(random() * pool.length)]
  const others = shuffle(
    Array.from({ length: COUNT_LEVEL_COUNT }, (_, i) => i + 1).filter((n) => n !== count),
    random,
  ).slice(0, 2)
  return { icon, count, options: shuffle([count, ...others], random) }
}
