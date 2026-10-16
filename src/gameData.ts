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

/** Extra icons that look very alike: used only by Tile Match level 3. */
export const lookAlikeNames = ['smile', 'sleepy', 'wow', 'wink', 'star6'] as const

export type IconName = (typeof iconNames)[number] | (typeof lookAlikeNames)[number]

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

/* ---------------- Tile Match (game 2) ---------------- */

export const TILE_LEVEL_COUNT = 3

export type TileLevel = {
  level: number
  /** the board is size x size tiles (size * size must be even) */
  size: number
  /** icons this level may draw from */
  pool: readonly IconName[]
  /** how many different icons appear on the board */
  distinct: number
}

/**
 * Same board size every level (big tiles for little fingers); the difficulty is in telling the icons apart:
 *  1. only 4 very different icons, so there are lots of easy matches
 *  2. 8 different icons to look through
 *  3. look-alikes: four faces and two stars that differ only in small details
 */
export const tileLevels: TileLevel[] = [
  { level: 1, size: 4, pool: ['star', 'heart', 'cloud', 'rocket', 'book', 'pencil'], distinct: 4 },
  { level: 2, size: 4, pool: iconNames, distinct: 8 },
  { level: 3, size: 4, pool: ['smile', 'sleepy', 'wow', 'wink', 'star', 'star6'], distinct: 6 },
]

export type Tile = {
  /** unique per tile so identical icons can be tapped independently */
  id: number
  icon: IconName
  gone: boolean
}

/** Builds a shuffled board for a level (1..TILE_LEVEL_COUNT). Every icon appears an even number of times. */
export function makeTiles(level: number, random: () => number = Math.random): Tile[] {
  const cfg = tileLevels[level - 1]
  const pairCount = (cfg.size * cfg.size) / 2
  const chosen = shuffle(cfg.pool, random).slice(0, cfg.distinct)
  const pairIcons = Array.from({ length: pairCount }, (_, i) => chosen[i % chosen.length])
  const icons = shuffle(
    pairIcons.flatMap((icon) => [icon, icon]),
    random,
  )
  return icons.map((icon, id) => ({ id, icon, gone: false }))
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
    id: 'tiles',
    label: 'Tile Match',
    icons: ['rainbow', 'cloud', 'flower'] as IconName[],
    playable: true,
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
