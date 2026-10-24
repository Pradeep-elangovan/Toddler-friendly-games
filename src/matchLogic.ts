import { critterNames, fruitNames, shuffle, type IconName } from './gameData'

/**
 * Number Match: piles of little animals, fruit and vegetables on the left, numbers on the right.
 * Drag each number to the pile with that many things in it.
 */
export const MATCH_LEVELS = [
  { level: 1, pairs: 2, max: 5 },
  { level: 2, pairs: 5, max: 7 },
  { level: 3, pairs: 7, max: 9 },
] as const
export const MATCH_LEVEL_COUNT = MATCH_LEVELS.length

export const matchIcons: readonly IconName[] = [...new Set<IconName>([...fruitNames, ...critterNames])]

export type MatchRound = {
  /** the piles, top to bottom: every pile has a different kind of thing and a different count */
  groups: { icon: IconName; count: number }[]
  /** the numbers, top to bottom: the same counts, in an order where no number sits next to its own pile */
  numbers: number[]
}

export function makeMatchRound(level: number, random: () => number = Math.random): MatchRound {
  const lv = MATCH_LEVELS[Math.min(Math.max(Math.round(level), 1), MATCH_LEVEL_COUNT) - 1]
  const counts = shuffle(Array.from({ length: lv.max }, (_, i) => i + 1), random).slice(0, lv.pairs)
  const icons = shuffle(matchIcons, random).slice(0, lv.pairs)
  const groups = counts.map((count, i) => ({ icon: icons[i], count }))
  let numbers = shuffle(counts, random)
  // no number may sit level with its own pile (otherwise the answer is just "straight across")
  for (let tries = 0; tries < 200 && numbers.some((n, i) => n === groups[i].count); tries++) numbers = shuffle(counts, random)
  return { groups, numbers }
}
