import { critterNames, fruitNames, shuffle, type IconName } from './gameData'

/**
 * Number Match: things on the left, their matches on the right. Drag each right-hand tile onto the left-hand pile
 * with the same amount.
 *
 * Levels 1 to 3: piles of animals, fruit and vegetables, matched with numbers (2, 5 and 7 pairs).
 * Level 4: dice faces (1 to 6), matched with numbers.
 * Level 5: hands showing fingers, matched with numbers. Two parts: one hand (1 to 5), then two hands (6 to 10).
 * Level 6: piles matched with piles of a different kind of thing.
 * Level 7: piles matched with piles of the same kind of thing.
 */
export type Visual =
  | { kind: 'number'; n: number }
  | { kind: 'items'; n: number; icon: IconName }
  | { kind: 'die'; n: number }
  | { kind: 'hand'; n: number }

type Stage = { pairs: number; lo: number; hi: number; left: 'items' | 'die' | 'hand'; right: 'number' | 'items'; same?: boolean }

export const MATCH_LEVELS: readonly { level: number; stages: readonly Stage[] }[] = [
  { level: 1, stages: [{ pairs: 2, lo: 1, hi: 5, left: 'items', right: 'number' }] },
  { level: 2, stages: [{ pairs: 5, lo: 1, hi: 7, left: 'items', right: 'number' }] },
  { level: 3, stages: [{ pairs: 7, lo: 1, hi: 9, left: 'items', right: 'number' }] },
  { level: 4, stages: [{ pairs: 6, lo: 1, hi: 6, left: 'die', right: 'number' }] },
  {
    level: 5,
    stages: [
      { pairs: 5, lo: 1, hi: 5, left: 'hand', right: 'number' },
      { pairs: 5, lo: 6, hi: 10, left: 'hand', right: 'number' },
    ],
  },
  { level: 6, stages: [{ pairs: 5, lo: 1, hi: 8, left: 'items', right: 'items' }] },
  { level: 7, stages: [{ pairs: 5, lo: 1, hi: 8, left: 'items', right: 'items', same: true }] },
]
export const MATCH_LEVEL_COUNT = MATCH_LEVELS.length
export const matchStageCount = (level: number) => MATCH_LEVELS[Math.min(Math.max(Math.round(level), 1), MATCH_LEVEL_COUNT) - 1].stages.length

export const matchIcons: readonly IconName[] = [...new Set<IconName>([...fruitNames, ...critterNames])]

export type MatchRound = {
  /** the piles on the left, top to bottom: every one has a different amount */
  left: Visual[]
  /** the matches on the right, top to bottom: the same amounts, in an order where none sits level with its own partner */
  right: Visual[]
}

export function makeMatchRound(level: number, stage = 0, random: () => number = Math.random): MatchRound {
  const lv = MATCH_LEVELS[Math.min(Math.max(Math.round(level), 1), MATCH_LEVEL_COUNT) - 1]
  const st = lv.stages[Math.min(Math.max(stage, 0), lv.stages.length - 1)]
  const values = shuffle(Array.from({ length: st.hi - st.lo + 1 }, (_, i) => st.lo + i), random).slice(0, st.pairs)
  // different kinds on the left; on the right too, but never the partner's kind unless the level asks for the same one
  const icons = shuffle(matchIcons, random)
  const leftIcons = icons.slice(0, st.pairs)
  const rightIcons = st.same ? leftIcons : icons.slice(st.pairs, st.pairs * 2)
  const left: Visual[] = values.map((n, i) => (st.left === 'items' ? { kind: 'items', n, icon: leftIcons[i] } : { kind: st.left, n }))
  const right: Visual[] = values.map((n, i) => (st.right === 'items' ? { kind: 'items', n, icon: rightIcons[i] } : { kind: 'number', n }))
  let order = shuffle(right, random)
  // nothing may sit level with its own partner (otherwise the answer is just "straight across")
  for (let tries = 0; tries < 300 && order.some((v, i) => v.n === left[i].n); tries++) order = shuffle(right, random)
  return { left, right: order }
}
