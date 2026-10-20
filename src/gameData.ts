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

/** Extra icons that look very alike (same yellow body, small differences): used only by Tile Match levels 3 to 5. */
export const lookAlikeNames = ['smile', 'sleepy', 'wow', 'wink', 'star6', 'cool', 'laugh', 'cry'] as const

/** The fruit used by Fruit Sort (game 3). 'apple' is shared with the main icon set; the rest are only used there. */
export const fruitNames = ['apple', 'banana', 'orange', 'grapes', 'strawberry', 'watermelon'] as const

export type FruitName = (typeof fruitNames)[number]

/** Icons used only on the home screen cards. */
export const cardOnlyNames = ['clock', 'letterA', 'letterB', 'letterC'] as const

export type IconName = (typeof iconNames)[number] | (typeof lookAlikeNames)[number] | FruitName | (typeof cardOnlyNames)[number]

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

export const TILE_LEVEL_COUNT = 5

export type TileLevel = {
  level: number
  /** the board is size x size tiles; with an odd size the centre cell is left empty so the rest still pair up */
  size: number
  /** icons this level may draw from */
  pool: readonly IconName[]
  /** how many different icons appear on the board */
  distinct: number
}

/**
 * Levels 1 to 3 use the same 4 x 4 board (big tiles for little fingers); the difficulty is in telling the icons apart.
 * Levels 4 and 5 then add more tiles as well:
 *  1. only 4 very different icons, so there are lots of easy matches        (16 tiles)
 *  2. 8 different icons to look through                                     (16 tiles)
 *  3. look-alikes: four faces and two stars that differ only in small details (16 tiles)
 *  4. a bigger board mixing look-alikes with ordinary icons, 12 different icons (24 tiles, centre left empty)
 *  5. the biggest board: 18 different icons picked from all 19, so nearly every icon in the game
 *     appears, look-alike faces and stars included, each exactly twice (36 tiles)
 */
export const tileLevels: TileLevel[] = [
  { level: 1, size: 4, pool: ['star', 'heart', 'cloud', 'rocket', 'book', 'pencil'], distinct: 4 },
  { level: 2, size: 4, pool: iconNames, distinct: 8 },
  { level: 3, size: 4, pool: ['smile', 'sleepy', 'wow', 'wink', 'star', 'star6'], distinct: 6 },
  {
    level: 4,
    size: 5,
    pool: [
      'smile',
      'sleepy',
      'wow',
      'wink',
      'star',
      'star6',
      'heart',
      'apple',
      'moon',
      'cloud',
      'rocket',
      'flower',
      'rainbow',
      'iceCream',
    ],
    distinct: 12,
  },
  { level: 5, size: 6, pool: [...iconNames, ...lookAlikeNames], distinct: 18 },
]

export type Tile = {
  /** unique per tile so identical icons can be tapped independently */
  id: number
  icon: IconName
  gone: boolean
}

/** How many matching pairs a level has (an odd-sized board leaves its centre cell empty). */
export function pairsForLevel(level: number): number {
  const { size } = tileLevels[level - 1]
  return Math.floor((size * size) / 2)
}

/**
 * Builds a shuffled board for a level (1..TILE_LEVEL_COUNT). Every icon appears an even number of times.
 * On an odd-sized board the centre cell is an already-cleared (invisible) tile, so there is a gap in the middle.
 */
export function makeTiles(level: number, random: () => number = Math.random): Tile[] {
  const cfg = tileLevels[level - 1]
  const cells = cfg.size * cfg.size
  const pairCount = pairsForLevel(level)
  const chosen = shuffle(cfg.pool, random).slice(0, cfg.distinct)
  const pairIcons = Array.from({ length: pairCount }, (_, i) => chosen[i % chosen.length])
  const icons = shuffle(
    pairIcons.flatMap((icon) => [icon, icon]),
    random,
  )
  const blankAt = cells % 2 === 1 ? (cells - 1) / 2 : -1
  let next = 0
  return Array.from({ length: cells }, (_, id): Tile =>
    id === blankAt ? { id, icon: chosen[0], gone: true } : { id, icon: icons[next++], gone: false },
  )
}

export type DifficultyId = 'easy' | 'medium' | 'hard' | 'impossible'

export const cards = [
  {
    id: 'pattern',
    difficulty: 'easy' as DifficultyId,
    label: 'Pattern Match',
    icons: ['star', 'heart', 'apple'] as IconName[],
    playable: true,
    color: '#ffd166',
  },
  {
    id: 'tiles',
    difficulty: 'easy' as DifficultyId,
    label: 'Tile Match',
    icons: ['rainbow', 'cloud', 'flower'] as IconName[],
    playable: true,
    color: '#a0e7e5',
  },
  {
    id: 'sort',
    difficulty: 'easy' as DifficultyId,
    label: 'Fruit Sort',
    icons: ['apple', 'banana', 'grapes'] as IconName[],
    playable: true,
    color: '#cdb4f6',
  },
  {
    id: 'count',
    difficulty: 'easy' as DifficultyId,
    label: 'Counting',
    icons: ['star', 'heart', 'moon'] as IconName[],
    playable: true,
    color: '#ffb4a2',
  },
  {
    id: 'memory',
    difficulty: 'medium' as DifficultyId,
    label: 'Memory Match',
    icons: ['rainbow', 'rocket', 'iceCream'] as IconName[],
    playable: true,
    color: '#b8e0a0',
  },
  {
    id: 'clock',
    difficulty: 'medium' as DifficultyId,
    label: 'Clock Time',
    icons: ['clock', 'moon', 'star'] as IconName[],
    playable: true,
    color: '#ffd6a5',
  },
  {
    id: 'series',
    difficulty: 'medium' as DifficultyId,
    label: 'Missing Letter',
    icons: ['letterA', 'letterB', 'letterC'] as IconName[],
    playable: true,
    color: '#bde0fe',
  },
]

/** The difficulty page that comes before the games. Only Easy has games so far. */
export const difficulties = [
  { id: 'easy', label: 'Easy', stars: 1, playable: true, color: '#b8e0a0' },
  { id: 'medium', label: 'Medium', stars: 2, playable: true, color: '#ffe29a' },
  { id: 'hard', label: 'Hard', stars: 3, playable: false, color: '#ffc09a' },
  { id: 'impossible', label: 'Impossible', stars: 4, playable: false, color: '#ffa8b4' },
] as const
