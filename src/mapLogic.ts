/**
 * Cheetah's Trip (Hard): teach left, right, straight and back, the way a child uses a map.
 *
 * The cheetah walks on a road grid and always faces where it is going. The commands are relative to the cheetah
 * (its own left and right), not compass directions:
 *   Straight: keep facing the same way. Left / Right: turn a quarter turn. Back: turn all the way round.
 * After turning, the cheetah walks forward along the road until it comes to a decision (a bend, a junction or a
 * dead end) or reaches the place it must get to. If the road does not go that way it bumps into the grass: a crash,
 * and the trip starts again from the beginning.
 */
export const MAP_COLS = 7
export const MAP_ROWS = 9

/** 0 north (up), 1 east, 2 south, 3 west */
export type Dir = 0 | 1 | 2 | 3
export const DX = [0, 1, 0, -1]
export const DY = [-1, 0, 1, 0]

export type Cmd = 'straight' | 'left' | 'right' | 'back'
export const CMDS: readonly Cmd[] = ['straight', 'left', 'right', 'back']
/** quarter turns clockwise */
export const TURN: Record<Cmd, number> = { straight: 0, right: 1, back: 2, left: 3 }
/** the angle the picture turns by (degrees, clockwise) */
export const TURN_DEG: Record<Cmd, number> = { straight: 0, right: 90, back: 180, left: -90 }

export type PlaceKind = 'school' | 'shop' | 'park' | 'home'
export type Target = { x: number; y: number; kind: PlaceKind }
export type Decor = { kind: 'tree' | 'flower' | 'rock' | 'pond'; x: number; y: number; s: number; h: number }

export type MapLevel = {
  level: number
  /** guide: tap a command and the cheetah goes at once. plan: line up the commands first, then press Go. */
  mode: 'guide' | 'plan'
  cols: number
  rows: number
  roads: Set<string>
  start: { x: number; y: number; dir: Dir; home: boolean }
  targets: Target[]
  decor: Decor[]
}

export const key = (x: number, y: number) => `${x},${y}`

type Spec = {
  mode: 'guide' | 'plan'
  /** each line is a list of corner points; the road runs straight between them */
  roads: [number, number][][]
  start: [number, number, Dir]
  home?: boolean
  targets: [number, number, PlaceKind][]
  /** a pond or two (grass cells) */
  ponds: [number, number][]
}

const N = 0
export const SPECS: readonly Spec[] = [
  // 1: a straight road: Straight
  { mode: 'guide', roads: [[[3, 8], [3, 0]]], start: [3, 8, N], targets: [[3, 0, 'school']], ponds: [[5, 4]] },
  // 2: one turn: Straight, Right
  { mode: 'guide', roads: [[[1, 8], [1, 2], [5, 2]]], start: [1, 8, N], targets: [[5, 2, 'park']], ponds: [[4, 6]] },
  // 3: a few turns, two side roads that lead nowhere
  {
    mode: 'guide',
    roads: [[[1, 8], [1, 4], [4, 4], [4, 1], [6, 1]], [[1, 6], [3, 6]], [[4, 2], [2, 2]]],
    start: [1, 8, N],
    targets: [[6, 1, 'shop']],
    ponds: [[5, 7]],
  },
  // 4: starts facing a dead end, so the first command is Back
  {
    mode: 'plan',
    roads: [[[3, 1], [3, 5], [6, 5]], [[3, 3], [1, 3]]],
    start: [3, 1, N],
    targets: [[6, 5, 'home']],
    ponds: [[5, 7], [0, 7]],
  },
  // 5: a longer winding road with two side roads
  {
    mode: 'plan',
    roads: [[[5, 8], [5, 6], [2, 6], [2, 3], [5, 3], [5, 0]], [[2, 5], [0, 5]], [[5, 1], [3, 1]]],
    start: [5, 8, N],
    targets: [[5, 0, 'school']],
    ponds: [[0, 2], [4, 7]],
  },
  // 6: a big map: many bends and side roads
  {
    mode: 'plan',
    roads: [[[6, 8], [6, 6], [2, 6], [2, 4], [5, 4], [5, 2], [1, 2], [1, 0]], [[4, 6], [4, 8]], [[3, 2], [3, 0]]],
    start: [6, 8, N],
    targets: [[1, 0, 'shop']],
    ponds: [[0, 4], [6, 1], [0, 7]],
  },
  // 7: errands: from home to the shop, then the park, then the school
  {
    mode: 'plan',
    roads: [[[3, 8], [3, 5]], [[3, 5], [1, 5], [1, 3]], [[3, 5], [5, 5], [5, 0]], [[3, 7], [5, 7]]],
    start: [3, 8, N],
    home: true,
    targets: [[1, 3, 'shop'], [5, 3, 'park'], [5, 0, 'school']],
    ponds: [[0, 1], [6, 8]],
  },
]
export const MAP_LEVEL_COUNT = SPECS.length

const mirrorDir = (d: Dir): Dir => (d === 1 ? 3 : d === 3 ? 1 : d)

export function buildMap(level: number, random: () => number = Math.random): MapLevel {
  const n = Math.min(Math.max(Math.round(level), 1), MAP_LEVEL_COUNT)
  const spec = SPECS[n - 1]
  const mirror = random() < 0.5
  const mx = (x: number) => (mirror ? MAP_COLS - 1 - x : x)
  const roads = new Set<string>()
  for (const line of spec.roads)
    for (let i = 0; i + 1 < line.length; i++) {
      const [x1, y1] = line[i]
      const [x2, y2] = line[i + 1]
      const dx = Math.sign(x2 - x1)
      const dy = Math.sign(y2 - y1)
      for (let x = x1, y = y1; ; x += dx, y += dy) {
        roads.add(key(mx(x), y))
        if (x === x2 && y === y2) break
      }
    }
  const start = { x: mx(spec.start[0]), y: spec.start[1], dir: (mirror ? mirrorDir(spec.start[2]) : spec.start[2]) as Dir, home: !!spec.home }
  const targets: Target[] = spec.targets.map(([x, y, kind]) => ({ x: mx(x), y, kind }))
  // scenery on the grass: ponds where the level says, then trees, flowers and rocks here and there
  const decor: Decor[] = []
  const taken = new Set<string>([...roads])
  for (const [x, y] of spec.ponds) {
    const px = mx(x)
    if (!taken.has(key(px, y))) {
      decor.push({ kind: 'pond', x: px, y, s: 10, h: 0 })
      taken.add(key(px, y))
    }
  }
  for (let y = 0; y < MAP_ROWS; y++)
    for (let x = 0; x < MAP_COLS; x++) {
      if (taken.has(key(x, y)) || random() > 0.5) continue
      const r = random()
      const kind = r < 0.45 ? 'tree' : r < 0.8 ? 'flower' : 'rock'
      decor.push({ kind, x, y, s: kind === 'tree' ? 8 + random() * 2 : kind === 'flower' ? 4.5 + random() * 1.5 : 4 + random() * 1.5, h: [340, 50, 280, 20, 200][Math.floor(random() * 5)] })
    }
  return { level: n, mode: spec.mode, cols: MAP_COLS, rows: MAP_ROWS, roads, start, targets, decor }
}

export type State = { x: number; y: number; dir: Dir; t: number }
export const startState = (m: MapLevel): State => ({ x: m.start.x, y: m.start.y, dir: m.start.dir, t: 0 })

export type Outcome = 'stopped' | 'target' | 'done' | 'crash'
export type StepResult = {
  /** the dir after turning (also while crashing) */
  facing: Dir
  /** the cells walked, in order */
  steps: { x: number; y: number }[]
  outcome: Outcome
  /** where the cheetah hit the grass (the cell it could not enter) */
  bump?: { x: number; y: number }
  final: State
}

const isRoad = (m: MapLevel, x: number, y: number) => m.roads.has(key(x, y))

/** Do one command: turn, then walk to the next decision (or the place to reach). */
export function simulate(m: MapLevel, st: State, cmd: Cmd): StepResult {
  const facing = ((st.dir + TURN[cmd]) % 4) as Dir
  let x = st.x
  let y = st.y
  let nx = x + DX[facing]
  let ny = y + DY[facing]
  if (!isRoad(m, nx, ny)) return { facing, steps: [], outcome: 'crash', bump: { x: nx, y: ny }, final: { ...st, dir: facing } }
  const steps: { x: number; y: number }[] = []
  let t = st.t
  for (let guard = 0; guard < 100; guard++) {
    x = nx
    y = ny
    steps.push({ x, y })
    const target = m.targets[t]
    if (target && target.x === x && target.y === y) {
      t++
      return { facing, steps, outcome: t === m.targets.length ? 'done' : 'target', final: { x, y, dir: facing, t } }
    }
    // roads ahead (not the one we came along)
    const exits: number[] = []
    for (let d = 0; d < 4; d++) {
      if (d === (facing + 2) % 4) continue
      if (isRoad(m, x + DX[d], y + DY[d])) exits.push(d)
    }
    if (exits.length === 1 && exits[0] === facing) {
      nx = x + DX[facing]
      ny = y + DY[facing]
      continue
    }
    break
  }
  return { facing, steps, outcome: 'stopped', final: { x, y, dir: facing, t } }
}

/** Run a list of commands from the start; stops at a crash. */
export function simulateAll(m: MapLevel, cmds: readonly Cmd[]): { final: State; crashAt: number; done: boolean } {
  let st = startState(m)
  for (let i = 0; i < cmds.length; i++) {
    const r = simulate(m, st, cmds[i])
    if (r.outcome === 'crash') return { final: st, crashAt: i, done: false }
    st = r.final
    if (r.outcome === 'done') return { final: st, crashAt: -1, done: i === cmds.length - 1 ? true : true }
  }
  return { final: st, crashAt: -1, done: st.t === m.targets.length }
}

/** The fewest commands that get from `from` to the last place (breadth-first), or null. */
export function solve(m: MapLevel, from: State = startState(m)): Cmd[] | null {
  const seen = new Set<string>([`${from.x},${from.y},${from.dir},${from.t}`])
  let frontier: { st: State; path: Cmd[] }[] = [{ st: from, path: [] }]
  for (let depth = 0; depth < 40 && frontier.length; depth++) {
    const next: typeof frontier = []
    for (const { st, path } of frontier)
      for (const c of CMDS) {
        const r = simulate(m, st, c)
        if (r.outcome === 'crash') continue
        if (r.outcome === 'done') return [...path, c]
        const k = `${r.final.x},${r.final.y},${r.final.dir},${r.final.t}`
        if (seen.has(k)) continue
        seen.add(k)
        next.push({ st: r.final, path: [...path, c] })
      }
    frontier = next
  }
  return null
}

export const PLACE_NAME: Record<PlaceKind, string> = { school: 'school', shop: 'shop', park: 'park', home: 'home' }
