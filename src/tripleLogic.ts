import { critterNames, fruitNames, iconNames, shuffle, type IconName } from './gameData'

/**
 * Triple Tiles (Hard): tiles lie on top of each other. Only a tile with nothing on top of it can be picked. Picked tiles
 * go into a tray of 7; three of a kind in the tray vanish together. A full tray (no match) ends the run.
 *
 * Every tile is 2 x 2 units on a unit grid. A tile on a higher layer covers any tile it overlaps, so the tiles below
 * are still seen, just dimmed, and show a little less than the free ones.
 */
export const TRAY_SIZE = 7
export const TILE_UNITS = 2

export type Tile = { id: number; x: number; y: number; z: number; icon: IconName }
export type TripleLevel = { tiles: Tile[]; w: number; h: number; kinds: number }
type Spot = { x: number; y: number; z: number }

/** Icons that can be on a tile (all the different pictures the app has, minus look-alikes). */
export const tripleIcons: readonly IconName[] = [...new Set<IconName>([...iconNames, ...fruitNames, ...critterNames])]

/**
 * A pyramid: each layer is one tile smaller each way and sits half a tile in. The sideways steps (0, 1, 2, 3 and 0, 1, 1, 2)
 * are chosen so no tile ever lies exactly over another one: the tiles below always show a part of themselves.
 */
function pyramid(cols: number, rows: number, layers: number): Spot[] {
  const out: Spot[] = []
  for (let z = 0; z < layers; z++)
    for (let j = 0; j < rows - z; j++) for (let i = 0; i < cols - z; i++) out.push({ x: 2 * i + z, y: 2 * j + [0, 1, 1, 2][z], z })
  return out
}

/** Tiles scattered over a few layers at random, so a tile may be partly covered by two or three others. */
function scatter(count: number, layers: number, w: number, h: number, random: () => number): Spot[] {
  const out: Spot[] = []
  for (let z = 0; z < layers; z++) {
    const n = Math.round(count / layers)
    let placed = 0
    for (let tries = 0; tries < 500 && placed < n; tries++) {
      const x = Math.floor(random() * (w - 1))
      const y = Math.floor(random() * (h - 1))
      const bad = out.some(
        (o) =>
          (o.z === z && Math.abs(o.x - x) < TILE_UNITS && Math.abs(o.y - y) < TILE_UNITS) || // overlapping on its own layer
          (o.z !== z && o.x === x && o.y === y), // exactly on top of another: it would hide it
      )
      if (!bad) {
        out.push({ x, y, z })
        placed++
      }
    }
  }
  return out
}

/** Does tile `a` lie over tile `b`? */
export const covers = (a: Spot, b: Spot) => a.z > b.z && Math.abs(a.x - b.x) < TILE_UNITS && Math.abs(a.y - b.y) < TILE_UNITS

/** The tiles nothing is on top of. */
export function freeTiles(tiles: readonly Spot[]): number[] {
  const free: number[] = []
  tiles.forEach((t, i) => {
    if (!tiles.some((o) => covers(o, t))) free.push(i)
  })
  return free
}

type Plan = { kinds: number; spots: (random: () => number) => Spot[] }

export const TRIPLE_LEVELS: readonly Plan[] = [
  // 1: a flat little heap, nine tiles, most of them free
  {
    kinds: 3,
    spots: () => [
      ...[0, 2].flatMap((y) => [0, 2, 4].map((x) => ({ x, y, z: 0 }))),
      { x: 1, y: 0, z: 1 },
      { x: 3, y: 0, z: 1 },
      { x: 1, y: 2, z: 1 },
    ],
  },
  { kinds: 4, spots: () => pyramid(3, 3, 2) }, // 2: two layers
  { kinds: 4, spots: () => pyramid(4, 3, 2) }, // 3: wider, two layers
  { kinds: 5, spots: () => pyramid(4, 4, 3) }, // 4: three layers
  { kinds: 5, spots: () => pyramid(5, 4, 3) }, // 5: wider, three layers
  { kinds: 6, spots: () => pyramid(5, 4, 4) }, // 6: four layers
  { kinds: 6, spots: (r) => scatter(45, 5, 10, 10, r) }, // 7: tangled
]
export const TRIPLE_LEVEL_COUNT = TRIPLE_LEVELS.length

export function makeTripleLevel(level: number, random: () => number = Math.random): TripleLevel {
  const plan = TRIPLE_LEVELS[Math.min(Math.max(Math.round(level), 1), TRIPLE_LEVEL_COUNT) - 1]
  let spots = plan.spots(random)
  // a whole number of triples: take the odd ones off the top
  while (spots.length % 3 !== 0) spots.pop()
  const kinds = shuffle(tripleIcons, random).slice(0, plan.kinds)
  // The pictures are dealt so the level can always be cleared: walk through a random order in which the tiles could be
  // picked (always a free tile), and give every three tiles in that order the same picture.
  const order: number[] = []
  const left = new Set(spots.map((_, i) => i))
  while (left.size) {
    const live = [...left]
    const free = freeTiles(live.map((i) => spots[i])).map((k) => live[k])
    const pick = free[Math.floor(random() * free.length)]
    order.push(pick)
    left.delete(pick)
  }
  const triples = spots.length / 3
  let bag: IconName[] = []
  for (let i = 0; i < triples; i++) {
    if (bag.length === 0) bag = shuffle(kinds, random)
    const icon = bag.pop()!
    for (let k = 0; k < 3; k++) spots[order[i * 3 + k]] = { ...spots[order[i * 3 + k]], ...({ icon } as object) }
  }
  const tiles: Tile[] = spots.map((s, id) => ({ id, x: s.x, y: s.y, z: s.z, icon: (s as Tile).icon }))
  return {
    tiles,
    w: Math.max(...tiles.map((t) => t.x)) + TILE_UNITS,
    h: Math.max(...tiles.map((t) => t.y)) + TILE_UNITS,
    kinds: plan.kinds,
  }
}

/** The tray after picking a tile: it goes next to tiles of its own kind (or at the end). */
export function addToTray(tray: readonly Tile[], tile: Tile): Tile[] {
  let at = -1
  tray.forEach((t, i) => {
    if (t.icon === tile.icon) at = i
  })
  const next = tray.slice()
  next.splice(at < 0 ? next.length : at + 1, 0, tile)
  return next
}

/** The picture that now has three tiles in the tray, if any. */
export function tripleInTray(tray: readonly Tile[]): IconName | null {
  const count = new Map<IconName, number>()
  for (const t of tray) count.set(t.icon, (count.get(t.icon) ?? 0) + 1)
  for (const [icon, n] of count) if (n >= 3) return icon
  return null
}
