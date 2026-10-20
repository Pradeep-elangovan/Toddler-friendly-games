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
  type Diff,
  type Shape,
  type SpotScene,
} from './spotLogic'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

const STAR_PATH = (() => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.52 : 0.22
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r + 0.03).toFixed(3)}`)
  }
  return pts.join(' ')
})()

/** One coloured shape, drawn in a unit box and scaled to its size. */
function ShapeEl({ shape }: { shape: Shape }) {
  const fill = `hsl(${shape.h} 78% 60%)`
  const stroke = `hsl(${shape.h} 70% 36%)`
  const common = { fill, stroke, strokeWidth: 0.07, strokeLinejoin: 'round' as const }
  let body: React.ReactNode
  switch (shape.kind) {
    case 'circle':
      body = <circle r="0.5" {...common} />
      break
    case 'square':
      body = <rect x="-0.44" y="-0.44" width="0.88" height="0.88" rx="0.14" {...common} />
      break
    case 'triangle':
      body = <polygon points="0,-0.52 0.54,0.4 -0.54,0.4" {...common} />
      break
    case 'diamond':
      body = <polygon points="0,-0.56 0.5,0 0,0.56 -0.5,0" {...common} />
      break
    case 'star':
      body = <polygon points={STAR_PATH} {...common} />
      break
    case 'heart':
      body = (
        <path
          d="M0 0.46 C-0.7 -0.05 -0.42 -0.5 -0.2 -0.46 C-0.06 -0.44 0 -0.34 0 -0.28 C0 -0.34 0.06 -0.44 0.2 -0.46 C0.42 -0.5 0.7 -0.05 0 0.46Z"
          {...common}
        />
      )
      break
  }
  return (
    <g data-id={shape.id} transform={`translate(${shape.x} ${shape.y}) rotate(${shape.rot}) scale(${shape.s})`}>
      {body}
    </g>
  )
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

  const picture = (shapes: Shape[], which: 'a' | 'b') => (
    <svg
      className="spot-pic"
      data-pic={which}
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      onPointerDown={onTap}
      role="img"
      aria-label={which === 'a' ? 'First picture' : 'Second picture'}
    >
      <rect width={SCENE_W} height={SCENE_H} fill={scene.bg} />
      {shapes.map((s) => (
        <ShapeEl key={s.id} shape={s} />
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
