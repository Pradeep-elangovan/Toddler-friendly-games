import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { HoldButton, HomeGlyph } from './ui'
import {
  SCENE_H,
  SCENE_W,
  SPOT_LEVEL_COUNT,
  findHit,
  makeSpotScene,
  spotLevels,
  type Backdrop,
  type Diff,
  type Item,
  type SpotScene,
} from './spotLogic'
import { ART } from './spotArt'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

/** One thing in the picture, drawn in its box and placed and scaled. */
export function ItemEl({ item }: { item: Item }) {
  const art = ART[item.art]
  const sx = item.flip ? -item.s : item.s
  return (
    <g data-id={item.id} transform={`translate(${item.x} ${item.y}) scale(${sx} ${item.s}) translate(-0.5 -0.5)`}>
      {art.draw({ h: item.h, v: item.v })}
    </g>
  )
}

/** The unchanging background of a story scene. */
export function Scenery({ kind }: { kind: Backdrop }) {
  switch (kind) {
    case 'park':
      return (
        <>
          <rect width={SCENE_W} height={SCENE_H} fill="#bfe6ff" />
          <path d="M0 40 Q25 30 50 38 T100 36 V80 H0Z" fill="#7bc46f" />
          <rect y="46" width={SCENE_W} height="34" fill="#8ed081" />
        </>
      )
    case 'farm':
      return (
        <>
          <rect width={SCENE_W} height={SCENE_H} fill="#c9ecff" />
          <path d="M0 40 Q30 28 60 38 T100 34 V80 H0Z" fill="#9bd77a" />
          <rect y="44" width={SCENE_W} height="36" fill="#8ed081" />
          <path d="M0 52 H100 M0 62 H100" stroke="#7bc46f" strokeWidth="0.8" />
        </>
      )
    case 'beach':
      return (
        <>
          <rect width={SCENE_W} height={SCENE_H} fill="#c9ecff" />
          <rect y="28" width={SCENE_W} height="24" fill="#4cb8e8" />
          <path d="M0 34 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth=".8" />
          <path d="M0 46 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
          <path d="M0 52 Q50 46 100 52 V80 H0Z" fill="#f3dca0" />
        </>
      )
    case 'space':
      return (
        <>
          <rect width={SCENE_W} height={SCENE_H} fill="#1d2a5b" />
          <rect width={SCENE_W} height="40" fill="#25346e" opacity=".5" />
          {[[14, 30], [28, 16], [44, 34], [58, 6], [76, 28], [88, 8], [96, 58], [4, 54], [50, 60], [72, 52], [34, 52], [20, 68], [62, 76], [84, 62]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.6 : 0.4} fill="#fff" opacity=".8" />
          ))}
        </>
      )
    case 'town':
      return (
        <>
          <rect width={SCENE_W} height={SCENE_H} fill="#d6e6ff" />
          <rect width={SCENE_W} height="30" fill="#ffe3f0" opacity=".7" />
          <path d="M0 50 Q30 42 60 48 T100 46 V80 H0Z" fill="#a7e08f" />
          <rect y="54" width={SCENE_W} height="26" fill="#9bd77a" />
          <path d="M0 74 Q50 68 100 74 V80 H0Z" fill="#e8d5b5" />
        </>
      )
  }
}

/** A red circle drawn around a difference that was found. */
function Ring({ d }: { d: Diff }) {
  const r = d.r + 1.2
  return (
    <circle
      className="spot-ring"
      cx={d.cx}
      cy={d.cy}
      r={r}
      fill="none"
      stroke="#ef4444"
      strokeWidth="1.2"
      strokeLinecap="round"
      pathLength={100}
    />
  )
}

/**
 * Spot the Difference: tap a change in either picture and it is circled in both.
 * Tapping anywhere else does nothing. Nothing ever fails; there is no clock.
 */
export default function SpotGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [scene, setScene] = useState<SpotScene>(() => makeSpotScene(1))
  const [found, setFound] = useState<number[]>([])
  const [celebrating, setCelebrating] = useState(false)
  const [hintId, setHintId] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    },
    [],
  )

  // If the child gets stuck for a while, show one of the missing differences with a gentle pulse.
  useEffect(() => {
    setHintId(null)
    if (celebrating) return
    const id = window.setTimeout(() => {
      const left = scene.diffs.filter((d) => !found.includes(d.id))
      if (left.length) setHintId(left[Math.floor(Math.random() * left.length)].id)
    }, 25000)
    return () => window.clearTimeout(id)
  }, [scene, found, celebrating])

  const cfg = spotLevels[levelIndex]
  const total = scene.diffs.length

  const beginLevel = (index: number) => {
    setLevelIndex(index)
    setScene(makeSpotScene(index + 1))
    setFound([])
    setCelebrating(false)
  }

  const onTap = (e: React.PointerEvent<SVGSVGElement>) => {
    if (celebrating) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * SCENE_W
    const y = ((e.clientY - r.top) / r.height) * SCENE_H
    const hit = findHit(x, y, scene.diffs, new Set(found))
    if (hit < 0) return // nothing happens on a spot that is not a difference
    const next = [...found, hit]
    setFound(next)
    sound.playCorrect(next.length - 1)
    if (next.length === total) {
      setCelebrating(true)
      later(() => {
        sound.playLevelWin()
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
      }, 500)
      later(() => {
        if (levelIndex < SPOT_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
        else onFinished()
      }, 2600)
    }
  }

  const picture = (items: Item[], which: 'a' | 'b') => (
    <svg
      className="spot-pic"
      data-pic={which}
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      onPointerDown={onTap}
      role="img"
      aria-label={`${scene.name}, ${which === 'a' ? 'first' : 'second'} picture`}
    >
      <Scenery kind={scene.backdrop} />
      {items.map((it) => (
        <ItemEl key={it.id} item={it} />
      ))}
      {scene.diffs
        .filter((d) => found.includes(d.id))
        .map((d) => (
          <Ring key={d.id} d={d} />
        ))}
      {hintId !== null &&
        scene.diffs
          .filter((d) => d.id === hintId && !found.includes(d.id))
          .map((d) => (
            <circle key={d.id} className="spot-hint" cx={d.cx} cy={d.cy} r={d.r + 1.5} fill="none" stroke="#ffb703" strokeWidth="1.2" strokeDasharray="2 2" />
          ))}
    </svg>
  )

  return (
    <main className="game spot-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${SPOT_LEVEL_COUNT}`}>
          {spotLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <div className="spot-status" aria-hidden>
        <span className="spot-label">Find {total}</span>
        <span className="spot-stars">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < found.length ? 'on' : ''}>
              ★
            </span>
          ))}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        Find {total} differences. {found.length} of {total} found at level {cfg.level}
      </p>

      <section className="spot-pair" key={`pair-${levelIndex}`} aria-label="Two pictures, tap the differences">
        {picture(scene.a, 'a')}
        {picture(scene.b, 'b')}
      </section>

      {celebrating && (
        <div className="overlay" role="status">
          <div className="congrats">
            <div className="big-star" aria-hidden>
              <Icon name="star" />
            </div>
            <h2>Great job!</h2>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <small>Grown-ups: hold the home button to exit</small>
      </footer>
    </main>
  )
}
