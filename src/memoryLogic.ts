import { iconNames, shuffle, type IconName } from './gameData'

/** Memory Match: face-down cards, flip two at a time. Only the number of cards grows between levels. */
export const MEMORY_LEVEL_COUNT = 5

export const memoryLevels = [
  { level: 1, cols: 3, rows: 2 }, // 6 cards, 3 pairs
  { level: 2, cols: 4, rows: 2 }, // 8 cards, 4 pairs
  { level: 3, cols: 4, rows: 3 }, // 12 cards, 6 pairs
  { level: 4, cols: 4, rows: 4 }, // 16 cards, 8 pairs
  { level: 5, cols: 4, rows: 5 }, // 20 cards, 10 pairs
] as const

export type MemoryCard = { id: number; icon: IconName; gone: boolean }

export function pairsForMemoryLevel(level: number): number {
  const l = memoryLevels[Math.min(Math.max(level, 1), MEMORY_LEVEL_COUNT) - 1]
  return (l.cols * l.rows) / 2
}

export function makeMemoryCards(level: number, random: () => number = Math.random): MemoryCard[] {
  const icons = shuffle(iconNames, random).slice(0, pairsForMemoryLevel(level))
  return shuffle([...icons, ...icons], random).map((icon, id) => ({ id, icon, gone: false }))
}
