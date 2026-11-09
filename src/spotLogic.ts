import { ART, type ArtKey } from './spotArt'

/**
 * Spot the Difference. Two cartoon pictures of the same little story (a picnic, a farm, a beach, space, a fairy-tale
 * town), like a magazine puzzle. The second picture has a few changes. Tapping a change in either picture circles it
 * in both. Tapping anywhere else does nothing.
 * Five levels, harder each time: a busier scene, more differences and subtler changes. A thing is never just moved a
 * little: the changes are missing, extra, another colour, another size, turned around, or a different detail.
 * The scene is the same for a level, but which things change is random, and the scene may be mirrored.
 */
export const SPOT_LEVEL_COUNT = 5

export const SCENE_W = 100
export const SCENE_H = 80

export type Backdrop = 'park' | 'farm' | 'beach' | 'space' | 'town'

export type Item = {
  id: number
  art: ArtKey
  /** centre, in scene units */
  x: number
  y: number
  /** size (width and height of its box) */
  s: number
  /** hue for its colour part */
  h: number
  /** small detail (how many apples, which window, ...) */
  v: number
  /** turned around */
  flip: boolean
}

export type DiffType = 'missing' | 'extra' | 'color' | 'size' | 'flip' | 'detail'

export type Diff = {
  id: number
  type: DiffType
  /** centre and radius of the tappable spot (scene units) */
  cx: number
  cy: number
  r: number
}

export type SpotLevel = {
  level: number
  scene: number
  diffs: number
  types: readonly DiffType[]
  /** smallest hue change for a colour difference */
  hue: number
  /** size change: the changed thing is this much smaller or bigger */
  shrink: number
  grow: number
}

export const spotLevels: SpotLevel[] = [
  { level: 1, scene: 0, diffs: 5, types: ['missing', 'color', 'extra', 'detail'], hue: 110, shrink: 0.6, grow: 1.5 },
  { level: 2, scene: 1, diffs: 6, types: ['missing', 'color', 'extra', 'size', 'detail'], hue: 90, shrink: 0.65, grow: 1.45 },
  { level: 3, scene: 2, diffs: 7, types: ['missing', 'color', 'extra', 'size', 'flip', 'detail'], hue: 70, shrink: 0.7, grow: 1.4 },
  { level: 4, scene: 3, diffs: 8, types: ['missing', 'color', 'extra', 'size', 'flip', 'detail'], hue: 50, shrink: 0.76, grow: 1.32 },
  { level: 5, scene: 4, diffs: 10, types: ['missing', 'color', 'extra', 'size', 'flip', 'detail'], hue: 40, shrink: 0.8, grow: 1.28 },
]

type Def = { art: ArtKey; x: number; y: number; s: number; h?: number; v?: number }
const d = (art: ArtKey, x: number, y: number, s: number, h = 0, v = 0): Def => ({ art, x, y, s, h, v })

type SceneDef = { name: string; backdrop: Backdrop; items: Def[]; extras: Def[] }

export const SCENES: readonly SceneDef[] = [
  {
    name: 'Picnic in the Park',
    backdrop: 'park',
    items: [
      d('sun', 86, 13, 16),
      d('cloud', 16, 10, 22),
      d('cloud', 52, 9, 20),
      d('tree', 20, 32, 34, 0, 3),
      d('butterfly', 62, 28, 8, 280),
      d('bird', 40, 19, 9, 30),
      d('kite', 88, 32, 12, 200, 2),
      d('kid', 78, 52, 15, 260),
      d('blanket', 58, 68, 30, 340, 0),
      d('basket', 54, 60, 10),
      d('dog', 32, 66, 17, 0, 1),
      d('flower', 8, 64, 8, 340),
      d('flower', 16, 74, 8, 50),
      d('flower', 90, 70, 8, 330),
      d('flower', 76, 74, 7, 20),
      d('apple', 44, 73, 6, 0),
    ],
    extras: [d('flower', 93, 59, 7, 340), d('bird', 70, 16, 8, 200), d('cloud', 76, 24, 14), d('apple', 26, 74, 6, 90)],
  },
  {
    name: 'Farm Morning',
    backdrop: 'farm',
    items: [
      d('sun', 88, 11, 14),
      d('cloud', 30, 9, 18),
      d('cloud', 64, 14, 15),
      d('barn', 20, 34, 28, 5, 0),
      d('haystack', 46, 47, 14),
      d('fence', 66, 43, 26),
      d('tractor', 80, 58, 20, 140, 1),
      d('tree', 89, 28, 20, 0, 2),
      d('cow', 30, 62, 20, 0, 2),
      d('pig', 54, 68, 14),
      d('sheep', 70, 72, 12),
      d('chicken', 10, 70, 10, 0, 0),
      d('chicken', 88, 76, 8, 0, 1),
      d('bird', 52, 21, 8, 210),
      d('butterfly', 42, 32, 7, 300),
      d('flower', 60, 56, 7, 340),
      d('flower', 20, 76, 7, 50),
    ],
    extras: [d('chicken', 44, 60, 8, 0, 0), d('cloud', 82, 24, 12), d('flower', 66, 76, 6, 280), d('bird', 16, 20, 7, 30)],
  },
  {
    name: 'Day at the Beach',
    backdrop: 'beach',
    items: [
      d('sun', 14, 12, 15),
      d('cloud', 48, 10, 18),
      d('cloud', 80, 15, 14),
      d('bird', 62, 23, 7, 30),
      d('sailboat', 30, 36, 18, 10),
      d('sailboat', 72, 36, 14, 200),
      d('fish', 52, 44, 8, 30, 1),
      d('fish', 12, 45, 8, 200, 0),
      d('palm', 90, 36, 28, 0, 2),
      d('palm', 5, 40, 22, 0, 1),
      d('umbrella', 30, 59, 22, 340, 1),
      d('kid', 47, 63, 13, 60),
      d('beachball', 62, 67, 9, 200, 1),
      d('sandcastle', 74, 65, 16, 0, 1),
      d('crab', 20, 73, 10, 0, 0),
      d('starfish', 45, 75, 7, 30),
      d('shell', 88, 74, 6),
      d('starfish', 8, 62, 6, 330),
    ],
    extras: [d('starfish', 60, 76, 6, 280), d('bird', 30, 18, 7, 200), d('fish', 38, 46, 7, 340), d('crab', 92, 56, 8, 0, 1)],
  },
  {
    name: 'Space Trip',
    backdrop: 'space',
    items: [
      d('planet', 20, 22, 22, 30, 1),
      d('planet', 80, 18, 14, 200, 0),
      d('moon', 52, 12, 12),
      d('rocket', 46, 46, 20, 0, 1),
      d('ufo', 80, 46, 18, 140, 0),
      d('alien', 22, 58, 13, 110, 0),
      d('astronaut', 64, 66, 14),
      d('satellite', 88, 70, 13, 200, 1),
      d('planet', 8, 72, 12, 300, 0),
      d('star', 8, 10, 5, 50),
      d('star', 36, 8, 4, 50),
      d('star', 66, 34, 5, 50),
      d('star', 94, 32, 4, 50),
      d('star', 10, 40, 5, 50),
      d('star', 38, 70, 5, 50),
      d('star', 56, 26, 4, 50),
      d('star', 70, 10, 4, 200),
      d('star', 32, 40, 4, 50),
    ],
    extras: [d('star', 60, 54, 5, 50), d('alien', 50, 72, 10, 280, 1), d('ufo', 30, 32, 10, 300, 1), d('star', 92, 54, 4, 200)],
  },
  {
    name: 'Fairy-tale Town',
    backdrop: 'town',
    items: [
      d('cloud', 14, 10, 20),
      d('cloud', 84, 8, 16),
      d('castle', 50, 34, 32, 280, 2),
      d('house', 14, 46, 18, 10, 1),
      d('house', 86, 46, 18, 200, 2),
      d('tree', 30, 40, 20, 0, 2),
      d('tree', 70, 42, 18, 0, 3),
      d('dragon', 78, 20, 16, 120, 0),
      d('balloon', 8, 22, 9, 340, 1),
      d('balloon', 92, 30, 9, 45, 0),
      d('bird', 34, 14, 6, 200),
      d('butterfly', 60, 16, 6, 300),
      d('lantern', 38, 24, 6, 45),
      d('lantern', 62, 26, 6, 340),
      d('lantern', 24, 20, 6, 200),
      d('lamp', 40, 63, 12, 0, 1),
      d('lamp', 62, 63, 12, 0, 0),
      d('mushroom', 24, 68, 12, 0, 0),
      d('mushroom', 78, 69, 11, 330, 1),
      d('kid', 50, 68, 11, 200),
      d('flower', 8, 70, 7, 50),
      d('flower', 92, 72, 7, 340),
      d('flower', 14, 77, 6, 280),
      d('flower', 62, 76, 6, 20),
      d('car', 30, 76, 10, 140, 1),
      d('car', 72, 56, 9, 20, 0),
    ],
    extras: [d('balloon', 22, 32, 8, 120, 1), d('mushroom', 46, 76, 8, 280, 1), d('butterfly', 70, 54, 6, 50), d('bird', 90, 14, 6, 30), d('flower', 94, 60, 6, 120)],
  },
]

export type SpotScene = {
  name: string
  backdrop: Backdrop
  /** the first picture */
  a: Item[]
  /** the second picture: the same, with the changes */
  b: Item[]
  diffs: Diff[]
}

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

function shuffled<T>(arr: readonly T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** radius of the tappable spot for a thing of size `s` */
const spotR = (s: number) => Math.max(4.5, s * 0.42)
/** things bigger than this are never taken away, shrunk or added as a change (they are the main picture) */
const BIG = 27

function eligible(type: DiffType, it: Item, cfg: SpotLevel): boolean {
  const art = ART[it.art]
  switch (type) {
    case 'missing':
      return it.s <= BIG && it.art !== 'sun'
    case 'size':
      return it.s <= BIG && it.s * cfg.grow <= 26
    case 'color':
      return !!art.tint
    case 'flip':
      return !!art.flip
    case 'detail':
      return (art.variants ?? 0) >= 2
    default:
      return false
  }
}

export function makeSpotScene(level: number, random: () => number = Math.random): SpotScene {
  const cfg = spotLevels[Math.min(Math.max(Math.round(level), 1), SPOT_LEVEL_COUNT) - 1]
  const def = SCENES[cfg.scene]
  const mirror = random() < 0.5
  const place = (x: number, f: boolean) => ({ x: mirror ? SCENE_W - x : x, flip: mirror ? !f : f })
  const toItem = (e: Def, id: number): Item => ({ id, art: e.art, ...place(e.x, false), y: e.y, s: e.s, h: e.h ?? 0, v: e.v ?? 0 })
  const a = def.items.map((e, i) => toItem(e, i))
  for (let tries = 0; tries < 300; tries++) {
    const scene = tryScene(cfg, def, a, random, (e, id) => toItem(e, id))
    if (scene) return scene
  }
  throw new Error('could not build a scene')
}

function tryScene(cfg: SpotLevel, def: SceneDef, a: Item[], random: () => number, toItem: (e: Def, id: number) => Item): SpotScene | null {
  const b: Item[] = a.map((i) => ({ ...i }))
  const diffs: Diff[] = []
  const apart = (cx: number, cy: number, r: number) => diffs.every((x) => dist(cx, cy, x.cx, x.cy) >= x.r + r + 1.2)
  const types = shuffled(cfg.types, random)
  const used = new Set<number>()
  let t = 0
  let guard = 0
  const extras = shuffled(def.extras, random)
  let nextExtra = 0
  while (diffs.length < cfg.diffs && guard++ < 400) {
    const type = types[t++ % types.length]
    if (type === 'extra') {
      const e = extras[nextExtra]
      if (!e) continue
      const it = toItem(e, 100 + nextExtra)
      const r = spotR(it.s)
      if (it.s > BIG || !apart(it.x, it.y, r)) {
        nextExtra++
        continue
      }
      nextExtra++
      b.push(it)
      diffs.push({ id: diffs.length, type, cx: it.x, cy: it.y, r })
      continue
    }
    const pool = shuffled(a.filter((i) => !used.has(i.id) && eligible(type, i, cfg)), random)
    for (const it of pool) {
      const idx = b.findIndex((x) => x.id === it.id)
      let cand: Item | null = null
      let r = spotR(it.s)
      if (type === 'missing') cand = null
      else if (type === 'color') {
        const delta = cfg.hue + random() * 40
        cand = { ...it, h: (it.h + (random() < 0.5 ? delta : -delta) + 720) % 360 }
      } else if (type === 'size') {
        const f = random() < 0.5 ? cfg.shrink : cfg.grow
        cand = { ...it, s: it.s * f }
        r = spotR(Math.max(it.s, cand.s))
        if (cand.x - cand.s / 2 < 1 || cand.x + cand.s / 2 > SCENE_W - 1 || cand.y - cand.s / 2 < 1 || cand.y + cand.s / 2 > SCENE_H - 1) continue
      } else if (type === 'flip') cand = { ...it, flip: !it.flip }
      else if (type === 'detail') {
        const n = ART[it.art].variants ?? 0
        const options = Array.from({ length: n }, (_, k) => k).filter((k) => k !== it.v)
        cand = { ...it, v: options[Math.floor(random() * options.length)] }
      }
      if (!apart(it.x, it.y, r)) continue
      if (cand) b[idx] = cand
      else b[idx] = { ...it, id: -1 }
      used.add(it.id)
      diffs.push({ id: diffs.length, type, cx: it.x, cy: it.y, r })
      break
    }
  }
  if (diffs.length < cfg.diffs) return null
  return { name: def.name, backdrop: def.backdrop, a, b: b.filter((i) => i.id !== -1), diffs }
}

const hitDist = (x: number, y: number, dd: Diff) => dist(x, y, dd.cx, dd.cy)

/** Is the tap (in scene units) on this difference? Forgiving: a little beyond the visible spot. */
export function hitDiff(x: number, y: number, dd: Diff): boolean {
  return hitDist(x, y, dd) <= dd.r + 1.5
}

/** The nearest difference under a tap that has not been found yet, or -1. */
export function findHit(x: number, y: number, diffs: Diff[], found: ReadonlySet<number>): number {
  let best = -1
  let bestD = Infinity
  for (const dd of diffs) {
    if (found.has(dd.id) || !hitDiff(x, y, dd)) continue
    const k = hitDist(x, y, dd)
    if (k < bestD) {
      best = dd.id
      bestD = k
    }
  }
  return best
}
