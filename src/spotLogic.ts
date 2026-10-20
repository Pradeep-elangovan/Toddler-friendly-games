/**
 * Spot the Difference. Two pictures made of the same coloured shapes; the second one has a few changes.
 * Tapping a change in either picture circles it in both. Tapping anywhere else does nothing.
 * Five levels, harder each time: more (and smaller) shapes, more differences and subtler changes.
 */
export const SPOT_LEVEL_COUNT = 5

export const SCENE_W = 100
export const SCENE_H = 80

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'heart'
export const shapeKinds: readonly ShapeKind[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'heart']

export type Shape = {
  id: number
  kind: ShapeKind
  x: number
  y: number
  /** size (diameter) in scene units */
  s: number
  /** hue 0 to 359 */
  h: number
  /** rotation in degrees */
  rot: number
}

export type DiffType = 'missing' | 'extra' | 'color' | 'size' | 'shift' | 'rotate' | 'kind'

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
  shapes: number
  diffs: number
  size: [number, number]
  types: readonly DiffType[]
  /** smallest hue change for a colour difference */
  hue: number
  /** size change: the changed shape is this much smaller or bigger */
  shrink: number
  grow: number
  /** how far a shifted shape moves, in scene units */
  shift: number
  /** how far a rotated shape turns, in degrees */
  turn: number
}

export const spotLevels: SpotLevel[] = [
  { level: 1, shapes: 8, diffs: 5, size: [12, 16], types: ['missing', 'color', 'extra'], hue: 120, shrink: 0.6, grow: 1.5, shift: 9, turn: 45 },
  { level: 2, shapes: 12, diffs: 6, size: [10, 14], types: ['missing', 'color', 'extra', 'size', 'shift'], hue: 90, shrink: 0.62, grow: 1.45, shift: 7.5, turn: 45 },
  { level: 3, shapes: 16, diffs: 7, size: [8.5, 12], types: ['missing', 'color', 'extra', 'size', 'shift', 'rotate', 'kind'], hue: 55, shrink: 0.7, grow: 1.35, shift: 5.5, turn: 40 },
  { level: 4, shapes: 22, diffs: 8, size: [7, 10], types: ['missing', 'color', 'extra', 'size', 'shift', 'rotate', 'kind'], hue: 36, shrink: 0.78, grow: 1.28, shift: 4.2, turn: 32 },
  { level: 5, shapes: 30, diffs: 10, size: [5.8, 8.6], types: ['missing', 'color', 'extra', 'size', 'shift', 'rotate', 'kind'], hue: 26, shrink: 0.82, grow: 1.24, shift: 3.4, turn: 26 },
]

export type SpotScene = {
  /** the first picture */
  a: Shape[]
  /** the second picture: the same, with the changes */
  b: Shape[]
  diffs: Diff[]
  /** background colours of the two pictures (the same) */
  bg: string
}

const MARGIN = 6
const GAP = 1.6

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)
const rand = (random: () => number, lo: number, hi: number) => lo + random() * (hi - lo)
const pick = <T,>(arr: readonly T[], random: () => number): T => arr[Math.floor(random() * arr.length)]

function shuffled<T>(arr: readonly T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A free spot for a shape of size `s`, away from the edges and from `others` (and `avoid` centres). */
function freeSpot(s: number, others: Shape[], random: () => number, extra: { x: number; y: number; r: number }[] = []) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const x = rand(random, MARGIN + s / 2, SCENE_W - MARGIN - s / 2)
    const y = rand(random, MARGIN + s / 2, SCENE_H - MARGIN - s / 2)
    const clear =
      others.every((o) => dist(x, y, o.x, o.y) >= (s + o.s) / 2 + GAP) &&
      extra.every((e) => dist(x, y, e.x, e.y) >= s / 2 + e.r + GAP)
    if (clear) return { x, y }
  }
  return null
}

const BACKGROUNDS = ['#fff8e6', '#eefaf3', '#eef4ff', '#fff0f4']

export function makeSpotScene(level: number, random: () => number = Math.random): SpotScene {
  const cfg = spotLevels[Math.min(Math.max(Math.round(level), 1), SPOT_LEVEL_COUNT) - 1]
  for (let tries = 0; tries < 50; tries++) {
    const scene = tryScene(cfg, random)
    if (scene) return scene
  }
  throw new Error('could not build a scene')
}

function tryScene(cfg: SpotLevel, random: () => number): SpotScene | null {
  // 1. the shapes of the first picture, none overlapping
  const a: Shape[] = []
  for (let i = 0; i < cfg.shapes; i++) {
    const s = rand(random, cfg.size[0], cfg.size[1])
    const spot = freeSpot(s, a, random)
    if (!spot) return null
    a.push({ id: i, kind: pick(shapeKinds, random), x: spot.x, y: spot.y, s, h: Math.floor(random() * 360), rot: Math.round(rand(random, -12, 12)) })
  }
  // 2. choose which shapes change and how, keeping the spots well apart
  const b: Shape[] = a.map((s) => ({ ...s }))
  const diffs: Diff[] = []
  const types = shuffled(cfg.types, random)
  const order = shuffled(a, random)
  let nextId = a.length
  const apart = (cx: number, cy: number, r: number) => diffs.every((d) => dist(cx, cy, d.cx, d.cy) >= d.r + r + 2)
  let t = 0
  for (const shape of order) {
    if (diffs.length >= cfg.diffs) break
    const type = types[t % types.length]
    const idx = b.findIndex((x) => x.id === shape.id)
    const base = Math.max(cfg.size[1] * 0.6, shape.s * 0.62)
    let diff: Diff | null = null
    if (type === 'missing') {
      diff = { id: diffs.length, type, cx: shape.x, cy: shape.y, r: base }
      if (apart(diff.cx, diff.cy, diff.r)) b[idx] = { ...b[idx], id: -1 }
      else diff = null
    } else if (type === 'color') {
      const delta = cfg.hue + random() * 40
      const cand = { ...b[idx], h: (b[idx].h + (random() < 0.5 ? delta : -delta) + 360) % 360 }
      diff = { id: diffs.length, type, cx: shape.x, cy: shape.y, r: base }
      if (apart(diff.cx, diff.cy, diff.r)) b[idx] = cand
      else diff = null
    } else if (type === 'size') {
      const f = random() < 0.5 ? cfg.shrink : cfg.grow
      const cand = { ...b[idx], s: shape.s * f }
      const r = Math.max(base, cand.s * 0.62)
      diff = { id: diffs.length, type, cx: shape.x, cy: shape.y, r }
      // a bigger shape must still fit without touching its neighbours
      const fits = b.every((o) => o.id === shape.id || o.id === -1 || dist(cand.x, cand.y, o.x, o.y) >= (cand.s + o.s) / 2 + 0.6)
      if (apart(diff.cx, diff.cy, r) && fits && cand.x - cand.s / 2 > 2 && cand.x + cand.s / 2 < SCENE_W - 2 && cand.y - cand.s / 2 > 2 && cand.y + cand.s / 2 < SCENE_H - 2) b[idx] = cand
      else diff = null
    } else if (type === 'shift') {
      const ang = random() * Math.PI * 2
      const nx = shape.x + Math.cos(ang) * cfg.shift
      const ny = shape.y + Math.sin(ang) * cfg.shift
      const cand = { ...b[idx], x: nx, y: ny }
      const fits =
        nx - shape.s / 2 > 2 && nx + shape.s / 2 < SCENE_W - 2 && ny - shape.s / 2 > 2 && ny + shape.s / 2 < SCENE_H - 2 &&
        b.every((o) => o.id === shape.id || o.id === -1 || dist(nx, ny, o.x, o.y) >= (shape.s + o.s) / 2 + 0.6)
      const mx = (shape.x + nx) / 2
      const my = (shape.y + ny) / 2
      const r = cfg.shift / 2 + shape.s * 0.62
      diff = { id: diffs.length, type, cx: mx, cy: my, r }
      if (fits && apart(mx, my, r)) b[idx] = cand
      else diff = null
    } else if (type === 'rotate') {
      if (shape.kind === 'circle') {
        diff = null
      } else {
        const sign = random() < 0.5 ? -1 : 1
        const cand = { ...b[idx], rot: shape.rot + sign * (cfg.turn + random() * 10) }
        diff = { id: diffs.length, type, cx: shape.x, cy: shape.y, r: base }
        if (apart(diff.cx, diff.cy, diff.r)) b[idx] = cand
        else diff = null
      }
    } else if (type === 'kind') {
      const kind = pick(shapeKinds.filter((k) => k !== shape.kind), random)
      diff = { id: diffs.length, type, cx: shape.x, cy: shape.y, r: base }
      if (apart(diff.cx, diff.cy, diff.r)) b[idx] = { ...b[idx], kind, rot: kind === 'circle' ? 0 : b[idx].rot }
      else diff = null
    } else if (type === 'extra') {
      const s = rand(random, cfg.size[0], cfg.size[1])
      const spot = freeSpot(s, b.filter((o) => o.id !== -1), random, diffs.map((d) => ({ x: d.cx, y: d.cy, r: d.r })))
      if (spot) {
        const r = Math.max(base * 0.9, s * 0.62)
        const cand: Shape = { id: nextId++, kind: pick(shapeKinds, random), x: spot.x, y: spot.y, s, h: Math.floor(random() * 360), rot: Math.round(rand(random, -12, 12)) }
        if (apart(cand.x, cand.y, r)) {
          b.push(cand)
          diff = { id: diffs.length, type, cx: cand.x, cy: cand.y, r }
        }
      }
    }
    if (diff) {
      diffs.push(diff)
      t++
    } else {
      t++ // try a different kind of change on the next shape
    }
  }
  if (diffs.length < cfg.diffs) return null
  return { a, b: b.filter((s) => s.id !== -1), diffs, bg: BACKGROUNDS[Math.floor(random() * BACKGROUNDS.length)] }
}

/** Is the tap (in scene units) on this difference? Forgiving: a little beyond the visible spot. */
export function hitDiff(x: number, y: number, d: Diff): boolean {
  return dist(x, y, d.cx, d.cy) <= d.r + 1.5
}

/** The first difference under a tap that has not been found yet, or -1. */
export function findHit(x: number, y: number, diffs: Diff[], found: ReadonlySet<number>): number {
  let best = -1
  let bestD = Infinity
  for (const d of diffs) {
    if (found.has(d.id) || !hitDiff(x, y, d)) continue
    const dd = dist(x, y, d.cx, d.cy)
    if (dd < bestD) {
      best = d.id
      bestD = dd
    }
  }
  return best
}
