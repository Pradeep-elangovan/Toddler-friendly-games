export const iconNames = [
  'star',
  'heart',
  'apple',
  'moon',
  'flower',
  'rocket',
  'cloud',
  'rainbow',
  'iceCream',
  'pencil',
  'book',
] as const

export type IconName = (typeof iconNames)[number]

export const LEVEL_COUNT = 10

/** Level N: one reference icon, N matching options and 1 wrong option (N + 1 options in total). */
export const levels = Array.from({ length: LEVEL_COUNT }).map((_, i) => ({
  level: i + 1,
  matchCount: i + 1,
  optionsCount: i + 2,
}))

export type Option = {
  /** unique per option so identical icons can be tapped independently */
  id: number
  icon: IconName
  isMatch: boolean
}

export type Round = {
  reference: IconName
  wrong: IconName
  options: Option[]
}

export function shuffle<T>(arr: readonly T[], random: () => number = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds one round for a level (1..LEVEL_COUNT).
 * `avoid` keeps the reference from repeating the previous level's icon.
 */
export function makeRound(
  level: number,
  avoid?: IconName,
  random: () => number = Math.random,
): Round {
  const matchCount = level
  const refPool = iconNames.filter((n) => n !== avoid)
  const reference = refPool[Math.floor(random() * refPool.length)]
  const wrongPool = iconNames.filter((n) => n !== reference)
  const wrong = wrongPool[Math.floor(random() * wrongPool.length)]

  const raw: Omit<Option, 'id'>[] = [
    ...Array.from({ length: matchCount }, () => ({ icon: reference, isMatch: true })),
    { icon: wrong, isMatch: false },
  ]
  const options = shuffle(raw, random).map((o, id) => ({ ...o, id }))
  return { reference, wrong, options }
}

/** How many options sit on one row, so every level fills the screen nicely. */
export function columnsFor(optionCount: number): number {
  if (optionCount <= 3) return optionCount
  if (optionCount === 4) return 2
  if (optionCount <= 6) return 3
  if (optionCount === 7 || optionCount === 8) return 4
  if (optionCount === 9) return 3
  return 4
}

export const cards = [
  {
    id: 'pattern',
    label: 'Pattern Match',
    icons: ['star', 'heart', 'apple'] as IconName[],
    playable: true,
    color: '#ffd166',
  },
  {
    id: 'colors',
    label: 'Color Pairs',
    icons: ['rainbow', 'cloud', 'flower'] as IconName[],
    playable: false,
    color: '#a0e7e5',
  },
  {
    id: 'sounds',
    label: 'Sound Match',
    icons: ['moon', 'rocket', 'book'] as IconName[],
    playable: false,
    color: '#cdb4f6',
  },
]
