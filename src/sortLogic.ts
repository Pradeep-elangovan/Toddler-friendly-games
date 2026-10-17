// Fruit Sort (game 3): pure game logic with no React in it, so it is easy to test.
import { fruitNames, shuffle, type FruitName } from './gameData'

export const SORT_LEVEL_COUNT = 5

export type SortLevel = {
  level: number
  /** fruit lying around in a jumble */
  items: number
  /** buckets to sort them into (one bucket per kind of fruit) */
  buckets: number
}

/** The only difficulty is more fruit and more buckets. Every bucket gets the same number of fruit. */
export const sortLevels: SortLevel[] = [
  { level: 1, items: 6, buckets: 2 },
  { level: 2, items: 12, buckets: 3 },
  { level: 3, items: 18, buckets: 3 },
  { level: 4, items: 24, buckets: 4 },
  { level: 5, items: 30, buckets: 5 },
]

export type SortItem = {
  /** unique per piece of fruit; also its position in the jumble */
  id: number
  fruit: FruitName
  /** resting tilt in degrees */
  rot: number
  /** random wobble within the item's cell, each from -1 to 1 */
  jx: number
  jy: number
}

export type SortRound = {
  /** which fruit each bucket takes, left to right */
  buckets: FruitName[]
  /** all the fruit, in jumbled order */
  items: SortItem[]
}

export function makeSortRound(level: number, random: () => number = Math.random): SortRound {
  const cfg = sortLevels[level - 1]
  const buckets = shuffle(fruitNames, random).slice(0, cfg.buckets)
  const perBucket = cfg.items / cfg.buckets
  const fruit = shuffle(
    buckets.flatMap((f) => Array.from({ length: perBucket }, () => f)),
    random,
  )
  const items = fruit.map(
    (f, id): SortItem => ({ id, fruit: f, rot: (random() * 2 - 1) * 16, jx: random() * 2 - 1, jy: random() * 2 - 1 }),
  )
  return { buckets, items }
}

export type Point = { x: number; y: number }
export type Rect = { left: number; top: number; right: number; bottom: number }

export type PileLayout = {
  /** side of every fruit, in px */
  size: number
  cols: number
  rows: number
  cellW: number
  cellH: number
  /** false only if the screen is too small to fit everything at the smallest size */
  fits: boolean
}

const GRID_AIR = 1.08 // a cell is a little bigger than the fruit, so neighbours never touch
const MIN_SIZE = 40
const MAX_SIZE = 88

/** Picks the biggest fruit size at which `count` of them fit on a (width x height) table. */
export function layoutPile(count: number, width: number, height: number): PileLayout {
  for (let size = MAX_SIZE; size >= MIN_SIZE; size -= 2) {
    const cell = size * GRID_AIR
    const cols = Math.max(1, Math.floor(width / cell))
    const rows = Math.ceil(count / cols)
    if (rows * cell <= height) return finish(size, cols, rows, width, height, true)
  }
  const cols = Math.max(1, Math.floor(width / (MIN_SIZE * GRID_AIR)))
  return finish(MIN_SIZE, cols, Math.ceil(count / cols), width, height, false)
}

function finish(size: number, cols: number, rows: number, width: number, height: number, fits: boolean): PileLayout {
  return { size, cols, rows, cellW: width / cols, cellH: height / rows, fits }
}

/** Centre of fruit number `index` on the table (wobbled inside its cell by the item's own jx / jy). */
export function slotPosition(layout: PileLayout, index: number, count: number, width: number, jx: number, jy: number): Point {
  const { cols, rows, cellW, cellH, size } = layout
  const row = Math.floor(index / cols)
  const inRow = row === rows - 1 ? count - cols * (rows - 1) : cols
  const col = index % cols
  const left = (width - inRow * cellW) / 2 // a short last row is centred
  // a tilted fruit is a bit wider than its drawing, so keep a little extra room round it
  const roomX = Math.max(0, (cellW - size * 1.12) / 2) * 0.85
  const roomY = Math.max(0, (cellH - size * 1.12) / 2) * 0.85
  return {
    x: left + (col + 0.5) * cellW + jx * roomX,
    y: (row + 0.5) * cellH + jy * roomY,
  }
}

/**
 * Which bucket (if any) a dropped fruit is over. `rects` are the buckets' on-screen boxes; each is grown
 * by `pad` so a toddler's rough drop still counts. Where grown boxes overlap, the nearest centre wins.
 */
export function pickBucket(p: Point, rects: Rect[], pad = 22): number {
  let best = -1
  let bestDist = Infinity
  rects.forEach((r, i) => {
    if (p.x < r.left - pad || p.x > r.right + pad || p.y < r.top - pad || p.y > r.bottom + pad) return
    const d = (p.x - (r.left + r.right) / 2) ** 2 + (p.y - (r.top + r.bottom) / 2) ** 2
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/**
 * Where a rejected fruit is thrown: a random direction (upwards or sideways, never back down into the
 * buckets) and a good distance away. The throw stops where the table ends, so fruit lands anywhere on the
 * table instead of piling up along its edges, and it prefers a free spot so it doesn't land on other fruit.
 * `others` are the centres of the fruit already lying on the table.
 */
export function throwTarget(
  from: Point,
  table: { w: number; h: number },
  size: number,
  random: () => number = Math.random,
  others: Point[] = [],
): Point {
  const margin = size / 2 + 6
  const minX = margin
  const maxX = Math.max(margin, table.w - margin)
  const minY = margin
  const maxY = Math.max(margin, table.h - margin)
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

  let best: Point = { x: clamp(from.x, minX, maxX), y: clamp(from.y - 140, minY, maxY) }
  let bestScore = -Infinity
  for (let attempt = 0; attempt < 30; attempt++) {
    const angle = -((10 + random() * 160) * Math.PI) / 180 // 10 to 170 degrees above the horizontal
    const dx = Math.cos(angle)
    const dy = Math.sin(angle) // always negative: upwards
    // how far this direction can go before it leaves the table
    let reach = (minY - from.y) / dy
    if (dx > 1e-6) reach = Math.min(reach, (maxX - from.x) / dx)
    else if (dx < -1e-6) reach = Math.min(reach, (minX - from.x) / dx)
    const travel = Math.min(130 + random() * 170, reach)
    if (!(travel > 0)) continue
    const p = { x: clamp(from.x + dx * travel, minX, maxX), y: clamp(from.y + dy * travel, minY, maxY) }
    const clear = others.length ? Math.min(...others.map((o) => Math.hypot(o.x - p.x, o.y - p.y))) : Infinity
    const far = travel >= 110
    if (far && clear >= size * 0.95) return p
    const score = (far ? 1000 : travel) + Math.min(clear, size)
    if (score > bestScore) {
      best = p
      bestScore = score
    }
  }
  return best
}
