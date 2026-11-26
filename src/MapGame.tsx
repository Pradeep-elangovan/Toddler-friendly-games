import React, { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import {
  CMDS,
  MAP_LEVEL_COUNT,
  PLACE_NAME,
  TURN_DEG,
  buildMap,
  key,
  simulate,
  simulateAll,
  solve,
  startState,
  DX,
  DY,
  type Cmd,
  type MapLevel,
  type State,
} from './mapLogic'
import { CMD_COLOR, CMD_LABEL, CheetahArt, CmdGlyph, DecorArt, PlaceArt } from './mapArt'
import * as sound from './sound'

type Props = {
  onHome: () => void
  onFinished: () => void
  soundButton: React.ReactNode
}

const PLAN_MAX = 12
const CELL_MS = 230 // time to walk one square
const TURN_MS = 320

type Pose = { x: number; y: number; deg: number; ms: number }
const poseOf = (m: MapLevel): Pose => ({ x: m.start.x, y: m.start.y, deg: m.start.dir * 90, ms: 0 })

/**
 * Cheetah's Trip: guide the cheetah to the place with Straight / Left / Right / Back, which are always the cheetah's
 * own directions. Levels 1-3 move at once when a button is tapped; levels 4-7 line up the commands first and press Go.
 * Going the wrong way is a real bump: the cheetah hits the grass, sees stars, and goes back to the start to try again.
 */
export default function MapGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [map, setMap] = useState<MapLevel>(() => buildMap(1))
  const [pose, setPose] = useState<Pose>(() => poseOf(map))
  const [reached, setReached] = useState(0)
  const [plan, setPlan] = useState<Cmd[]>([])
  const [crashedAt, setCrashedAt] = useState(-1)
  const [playing, setPlaying] = useState(-1) // the plan chip being walked now
  const [bumped, setBumped] = useState<{ x: number; y: number; n: number } | null>(null)
  const [fade, setFade] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState<Cmd | 'clear' | null>(null)
  const [pop, setPop] = useState<{ x: number; y: number; n: number } | null>(null)

  const st = useRef<State>(startState(map))
  const token = useRef(0)
  const pending = useRef<Cmd[]>([])
  const running = useRef(false)
  const timers = useRef<number[]>([])
  const mapRef = useRef(map)
  mapRef.current = map
  const levelRef = useRef(0)
  const [busy, setBusy] = useState(false)

  const sleep = (ms: number) =>
    new Promise<void>((r) => {
      timers.current.push(window.setTimeout(r, ms))
    })
  useEffect(
    () => () => {
      token.current++
      timers.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  const guide = map.mode === 'guide'

  // the house the cheetah starts from (level 7) sits on the grass next to the start
  const homeSpot = useMemo(() => {
    if (!map.start.home) return null
    for (const dx of [-1, 1]) if (!map.roads.has(key(map.start.x + dx, map.start.y))) return { x: map.start.x + dx, y: map.start.y }
    return null
  }, [map])
  const decor = useMemo(() => map.decor.filter((d) => !(homeSpot && d.x === homeSpot.x && d.y === homeSpot.y)), [map, homeSpot])

  const resetCheetah = async (tok: number) => {
    setFade(true)
    await sleep(260)
    if (tok !== token.current) return false
    const m = mapRef.current
    st.current = startState(m)
    setPose(poseOf(m))
    setReached(0)
    setPlaying(-1)
    setFade(false)
    await sleep(60)
    return tok === token.current
  }

  /** One command: turn, walk to the next decision, or crash. Returns false if the run was cancelled. */
  const exec = async (cmd: Cmd, tok: number): Promise<'ok' | 'crash' | 'done' | 'cancel'> => {
    const m = mapRef.current
    const r = simulate(m, st.current, cmd)
    // turn on the spot
    if (cmd !== 'straight') {
      setPose((p) => ({ ...p, deg: p.deg + TURN_DEG[cmd], ms: TURN_MS }))
      await sleep(TURN_MS + 40)
      if (tok !== token.current) return 'cancel'
    }
    if (r.outcome === 'crash') {
      const p0 = st.current
      const f = r.facing
      // run at the grass, bump, bounce back
      setPose((p) => ({ ...p, x: p0.x + DX[f] * 0.42, y: p0.y + DY[f] * 0.42, ms: 220 }))
      await sleep(210)
      if (tok !== token.current) return 'cancel'
      sound.playWrong()
      setBumped({ x: p0.x + DX[f] * 0.5, y: p0.y + DY[f] * 0.5, n: Date.now() })
      setPose((p) => ({ ...p, x: p0.x - DX[f] * 0.12, y: p0.y - DY[f] * 0.12, deg: p.deg + 14, ms: 160 }))
      await sleep(170)
      if (tok !== token.current) return 'cancel'
      setPose((p) => ({ ...p, x: p0.x, y: p0.y, deg: p.deg - 14, ms: 180 }))
      st.current = { ...p0, dir: f }
      await sleep(1300)
      if (tok !== token.current) return 'cancel'
      setBumped(null)
      return 'crash'
    }
    const last = r.steps[r.steps.length - 1]
    setPose((p) => ({ ...p, x: last.x, y: last.y, ms: r.steps.length * CELL_MS }))
    st.current = r.final
    await sleep(r.steps.length * CELL_MS + 60)
    if (tok !== token.current) return 'cancel'
    if (r.outcome === 'target' || r.outcome === 'done') {
      setReached(r.final.t)
      setPop({ x: last.x, y: last.y, n: Date.now() })
      sound.playCorrect(r.final.t - 1)
      await sleep(r.outcome === 'target' ? 450 : 200)
      if (tok !== token.current) return 'cancel'
    }
    return r.outcome === 'done' ? 'done' : 'ok'
  }

  const win = async (tok: number) => {
    await sleep(500)
    if (tok !== token.current) return
    setCelebrating(true)
    sound.playLevelWin()
    confetti({ particleCount: 80, spread: 75, origin: { y: 0.55 }, disableForReducedMotion: true })
    await sleep(2400)
    if (tok !== token.current) return
    if (levelRef.current < MAP_LEVEL_COUNT - 1) beginLevel(levelRef.current + 1)
    else onFinished()
  }

  const beginLevel = (index: number) => {
    token.current++
    pending.current = []
    running.current = false
    const m = buildMap(index + 1)
    mapRef.current = m
    levelRef.current = index
    st.current = startState(m)
    setLevelIndex(index)
    setMap(m)
    setPose(poseOf(m))
    setReached(0)
    setPlan([])
    setCrashedAt(-1)
    setPlaying(-1)
    setBumped(null)
    setCelebrating(false)
    setFade(false)
    setHint(null)
    setBusy(false)
  }

  /** Guide levels: taps are queued while the cheetah is still moving, so no tap is lost. */
  const pump = async () => {
    if (running.current) return
    running.current = true
    setBusy(true)
    const tok = token.current
    while (pending.current.length) {
      const c = pending.current.shift()!
      const res = await exec(c, tok)
      if (res === 'cancel') return
      if (res === 'crash') {
        pending.current = []
        if (!(await resetCheetah(tok))) return
      } else if (res === 'done') {
        pending.current = []
        running.current = false
        setBusy(false)
        await win(tok)
        return
      }
    }
    running.current = false
    setBusy(false)
  }

  /** Plan levels: Go always runs the whole plan from the start. Pressing Go again restarts it. */
  const go = async () => {
    if (!plan.length) return
    token.current++
    const tok = token.current
    pending.current = []
    running.current = true
    setBusy(true)
    setCrashedAt(-1)
    setHint(null)
    const cmds = plan.slice()
    const m = mapRef.current
    const atStart = st.current.x === m.start.x && st.current.y === m.start.y && st.current.dir === m.start.dir && st.current.t === 0
    if (!atStart && !(await resetCheetah(tok))) return
    for (let i = 0; i < cmds.length; i++) {
      setPlaying(i)
      const res = await exec(cmds[i], tok)
      if (res === 'cancel') return
      if (res === 'crash') {
        setCrashedAt(i)
        setPlaying(-1)
        await resetCheetah(tok)
        running.current = false
        setBusy(false)
        return
      }
      if (res === 'done') {
        setPlaying(-1)
        running.current = false
        setBusy(false)
        await win(tok)
        return
      }
    }
    // the plan ended before the place was reached: stay there, add more commands
    setPlaying(-1)
    running.current = false
    setBusy(false)
  }

  const tapCmd = (c: Cmd) => {
    if (celebrating) return
    sound.playTap()
    setHint(null)
    if (guide) {
      pending.current.push(c)
      void pump()
    } else if (plan.length < PLAN_MAX) {
      setPlan((p) => [...p, c])
      setCrashedAt(-1)
    }
  }
  const removeChip = (i: number) => {
    if (celebrating) return
    sound.playTap()
    setPlan((p) => p.filter((_, j) => j !== i))
    setCrashedAt(-1)
  }

  // after a pause, point at the next command
  useEffect(() => {
    setHint(null)
    if (celebrating || busy) return
    const id = window.setTimeout(() => {
      if (guide) {
        const s = solve(map, st.current)
        if (s) setHint(s[0])
      } else {
        const sim = simulateAll(map, plan)
        if (sim.crashAt >= 0) setHint('clear')
        else {
          const s = solve(map, sim.final)
          if (s) setHint(s[0])
        }
      }
    }, 25000)
    return () => window.clearTimeout(id)
  }, [map, plan, busy, celebrating, guide, reached, crashedAt])

  const ask =
    map.targets.length === 1
      ? `Take the arrow to the ${PLACE_NAME[map.targets[0].kind]}`
      : `Go to the ${map.targets.map((t) => PLACE_NAME[t.kind]).join(', then the ')}`

  const W = map.cols * 10
  const H = map.rows * 10
  const roadCells = [...map.roads].map((k) => k.split(',').map(Number) as [number, number])
  const links: [number, number, number, number][] = []
  for (const [x, y] of roadCells) {
    if (map.roads.has(key(x + 1, y))) links.push([x, y, x + 1, y])
    if (map.roads.has(key(x, y + 1))) links.push([x, y, x, y + 1])
  }
  const cx = (x: number) => x * 10 + 5

  return (
    <main className="game trip-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots many" role="img" aria-label={`Level ${levelIndex + 1} of ${MAP_LEVEL_COUNT}`}>
          {Array.from({ length: MAP_LEVEL_COUNT }, (_, i) => (
            <span key={i} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <p className="trip-ask">
        <span>{ask}</span>
        <span className="trip-goals" aria-hidden>
          {map.targets.map((t, i) => (
            <svg key={i} viewBox="-6 -7 12 13" className={i < reached ? 'got' : ''}>
              <PlaceArt kind={t.kind} />
            </svg>
          ))}
        </span>
      </p>

      <section className={`trip-map ${bumped ? 'bump' : ''}`} key={`m${levelIndex}`}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map with a road. The cheetah must follow it.">
          <clipPath id="trip-clip">
            <rect width={W} height={H} rx="3" />
          </clipPath>
          <g clipPath="url(#trip-clip)">
          <rect width={W} height={H} fill="#bfe8a3" />
          <rect width={W} height={H} fill="url(#grass)" opacity="0.5" />
          <defs>
            <pattern id="grass" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="3" r="0.5" fill="#9ed182" />
              <circle cx="7" cy="8" r="0.5" fill="#9ed182" />
            </pattern>
          </defs>
          {decor.map((d, i) => (
            <DecorArt key={i} d={d} />
          ))}
          {/* the road: kerb, tarmac, dashes */}
          <g strokeLinecap="round">
            {links.map(([x1, y1, x2, y2], i) => (
              <line key={`k${i}`} x1={cx(x1)} y1={cx(y1)} x2={cx(x2)} y2={cx(y2)} stroke="#8a8f99" strokeWidth="7.6" />
            ))}
            {roadCells.map(([x, y], i) => (
              <circle key={`kc${i}`} cx={cx(x)} cy={cx(y)} r="3.8" fill="#8a8f99" />
            ))}
            {links.map(([x1, y1, x2, y2], i) => (
              <line key={`t${i}`} x1={cx(x1)} y1={cx(y1)} x2={cx(x2)} y2={cx(y2)} stroke="#d9dce2" strokeWidth="6.6" />
            ))}
            {roadCells.map(([x, y], i) => (
              <circle key={`tc${i}`} cx={cx(x)} cy={cx(y)} r="3.3" fill="#d9dce2" />
            ))}
            {links.map(([x1, y1, x2, y2], i) => (
              <line key={`d${i}`} x1={cx(x1)} y1={cx(y1)} x2={cx(x2)} y2={cx(y2)} stroke="#fff" strokeWidth="0.6" strokeDasharray="1.4 1.6" strokeLinecap="butt" />
            ))}
          </g>
          {/* the start spot */}
          <circle cx={cx(map.start.x)} cy={cx(map.start.y)} r="3.6" fill="none" stroke="#fff" strokeWidth="0.7" strokeDasharray="1 1" />
          {homeSpot && (
            <g transform={`translate(${cx(homeSpot.x)} ${cx(homeSpot.y)})`}>
              <PlaceArt kind="home" />
            </g>
          )}
          {map.targets.map((t, i) => (
            <g key={i} transform={`translate(${cx(t.x)} ${cx(t.y)})`} className={i < reached ? 'trip-place got' : 'trip-place'}>
              <PlaceArt kind={t.kind} />
              {i < reached && (
                <g transform="translate(3.4 -4)">
                  <circle r="2.1" fill="#4cbf6b" stroke="#fff" strokeWidth="0.5" />
                  <path d="M-1 0 L-0.2 0.9 L1.2 -0.9" stroke="#fff" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
            </g>
          ))}
          {pop && (
            <g key={pop.n} transform={`translate(${cx(pop.x)} ${cx(pop.y)})`}>
              <circle className="trip-ring" r="3" fill="none" stroke="#ffd166" strokeWidth="1" />
            </g>
          )}
          </g>
          {/* the cheetah */}
          <g
            className={`trip-cheetah ${fade ? 'fade' : ''}`}
            style={{ transform: `translate(${pose.x * 10 + 5}px, ${pose.y * 10 + 5}px) rotate(${pose.deg}deg)`, transitionDuration: `${pose.ms}ms` }}
            data-x={pose.x}
            data-y={pose.y}
          >
            <g className="trip-shadow">
              <circle cx="0.4" cy="0.8" r="5" fill="rgba(0,0,0,.12)" />
            </g>
            <CheetahArt />
          </g>
          {bumped && (
            <g key={bumped.n} transform={`translate(${bumped.x * 10 + 5} ${bumped.y * 10 + 5})`}>
              <g className="trip-boom">
                <path d="M0 -3.2 L0.9 -0.9 L3.2 0 L0.9 0.9 L0 3.2 L-0.9 0.9 L-3.2 0 L-0.9 -0.9Z" fill="#ffd166" stroke="#ff9f43" strokeWidth="0.4" />
              </g>
              <g className="trip-stars">
                {[0, 120, 240].map((a) => (
                  <text key={a} x="0" y="-5.5" fontSize="3.6" textAnchor="middle" transform={`rotate(${a})`}>
                    ★
                  </text>
                ))}
              </g>
              <g className="trip-ouch" transform="translate(0 -10)">
                <rect x="-6" y="-3.4" width="12" height="5.6" rx="2.4" fill="#fff" stroke="#ef476f" strokeWidth="0.5" />
                <text x="0" y="0.6" fontSize="3.6" fontWeight="900" textAnchor="middle" fill="#ef476f">
                  Ouch!
                </text>
              </g>
            </g>
          )}
        </svg>
      </section>

      {!guide && (
        <section className="trip-plan" aria-label="Plan">
          <div className="trip-chips">
            {plan.length === 0 && <span className="trip-empty">Tap the arrows, then press Go</span>}
            {plan.map((c, i) => (
              <button
                key={i}
                className={`trip-chip ${playing === i ? 'now' : ''} ${crashedAt === i ? 'crashed' : ''} ${hint === 'clear' && crashedAt !== i ? '' : ''}`}
                style={{ '--c': CMD_COLOR[c] } as React.CSSProperties}
                onClick={() => removeChip(i)}
                aria-label={`${CMD_LABEL[c]}, tap to remove`}
              >
                <CmdGlyph cmd={c} size={22} />
              </button>
            ))}
          </div>
          <div className="trip-side">
            <button className={`trip-go ${plan.length ? '' : 'off'}`} onClick={() => { sound.playTap(); void go() }} aria-label="Go">
              GO
            </button>
            <button
              className={`trip-clear ${hint === 'clear' ? 'hint' : ''}`}
              onClick={() => {
                sound.playTap()
                setPlan([])
                setCrashedAt(-1)
              }}
              aria-label="Clear the plan"
            >
              ✕
            </button>
          </div>
        </section>
      )}

      <section className="trip-cmds" aria-label="Directions">
        {CMDS.map((c) => (
          <button
            key={c}
            className={`trip-cmd ${hint === c ? 'hint' : ''}`}
            style={{ '--c': CMD_COLOR[c] } as React.CSSProperties}
            onClick={() => tapCmd(c)}
            aria-label={CMD_LABEL[c]}
          >
            <CmdGlyph cmd={c} />
            <span>{CMD_LABEL[c]}</span>
          </button>
        ))}
      </section>

      {celebrating && (
        <div className="overlay" role="status">
          <div className="congrats">
            <div className="big-star" aria-hidden>
              <Icon name="star" />
            </div>
            <h2>You made it!</h2>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <small>Grown-ups: hold the home button to exit</small>
      </footer>
    </main>
  )
}
