import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import confetti from 'canvas-confetti'
import { Icon } from './icons'
import { BucketBack, BucketFront, bucketThemes } from './bucketArt'
import {
  SORT_LEVEL_COUNT,
  layoutPile,
  makeSortRound,
  pickBucket,
  slotPosition,
  sortLevels,
  throwTarget,
  type Point,
} from './sortLogic'
import { HoldButton, HomeGlyph, iconLabel } from './ui'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

/** Where the fruit goes in and comes out of a bucket, as a fraction of the bucket's height. */
const MOUTH_Y = 0.4
const BUCKET_GAP = 8

type ItemState = {
  sorted: boolean
  /** true while the fruit is flying (into a bucket, or being spat out), so it can't be grabbed */
  busy: boolean
  /** where it was last thrown to; otherwise it sits at its place in the jumble */
  pos?: Point
  rot: number
}

type Drag = { id: number; pid: number; sx: number; sy: number; dx: number; dy: number }

/**
 * Fruit Sort: drag each fruit into the bucket that takes it. Right bucket: the fruit drops in and joins the pile.
 * Wrong bucket: the bucket can't digest it, shakes, and spits it out in a random direction.
 * There is no losing, the only difficulty is more fruit and more buckets.
 */
export default function SortGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [round, setRound] = useState(() => makeSortRound(1))
  const [states, setStates] = useState<ItemState[]>(() => makeSortRound(1).items.map((i) => ({ sorted: false, busy: false, rot: i.rot })))
  const [board, setBoard] = useState({ w: 0, h: 0 })
  const [drag, setDrag] = useState<Drag | null>(null)
  const [yuck, setYuck] = useState<number | null>(null)
  const [burp, setBurp] = useState<number | null>(null)
  const [happy, setHappy] = useState<number | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)
  const bucketEls = useRef<(HTMLDivElement | null)[]>([])
  const itemEls = useRef(new Map<number, HTMLDivElement>())
  const sortedCount = useRef(0)
  const alive = useRef(true)
  const timers = useRef<number[]>([])
  const reduceMotion = useRef(
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [])

  // Measure the play area (and keep measuring if the phone is rotated or resized).
  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const measure = () =>
      setBoard((b) => (b.w === el.clientWidth && b.h === el.clientHeight ? b : { w: el.clientWidth, h: el.clientHeight }))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cfg = sortLevels[levelIndex]
  const bucketCount = round.buckets.length
  const bucketW = Math.max(56, Math.min(116, Math.floor((board.w - BUCKET_GAP * (bucketCount - 1) - 8) / bucketCount)))
  const bucketH = Math.round(bucketW * 1.18)
  const zoneH = bucketH + 8
  const table = { w: board.w, h: Math.max(0, board.h - zoneH) }
  const layout = useMemo(() => layoutPile(round.items.length, table.w, table.h), [round, table.w, table.h])

  const restOf = (i: number): Point =>
    states[i].pos ?? slotPosition(layout, i, round.items.length, table.w, round.items[i].jx, round.items[i].jy)

  const sortedTotal = states.filter((s) => s.sorted).length
  const total = round.items.length

  // If the child pauses for a while, gently wiggle a fruit and the bucket it belongs in.
  useEffect(() => {
    setHint(false)
    if (celebrating || drag) return
    const id = window.setTimeout(() => setHint(true), 8000)
    return () => window.clearTimeout(id)
  }, [celebrating, drag, states, levelIndex])

  const hintItem = hint ? states.findIndex((s) => !s.sorted && !s.busy) : -1
  const hintBucket = hintItem >= 0 ? round.buckets.indexOf(round.items[hintItem].fruit) : -1

  const beginLevel = (index: number) => {
    const r = makeSortRound(index + 1)
    sortedCount.current = 0
    setLevelIndex(index)
    setRound(r)
    setStates(r.items.map((i) => ({ sorted: false, busy: false, rot: i.rot })))
    setDrag(null)
    setYuck(null)
    setBurp(null)
    setHappy(null)
    setCelebrating(false)
  }

  const patch = (i: number, change: Partial<ItemState>) =>
    setStates((all) => all.map((s, idx) => (idx === i ? { ...s, ...change } : s)))

  const speed = reduceMotion.current ? 0.35 : 1

  const bucketMouth = (rect: DOMRect, boardRect: DOMRect): Point => ({
    x: rect.left + rect.width / 2 - boardRect.left,
    y: rect.top + rect.height * MOUTH_Y - boardRect.top,
  })

  const tf = (x: number, y: number, rot: number, scale: number) =>
    `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`

  const onDown = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (celebrating || drag || states[i].busy || states[i].sorted) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* the drag still works without capture on most browsers */
    }
    sound.playTap()
    setDrag({ id: i, pid: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 })
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    const { clientX, clientY, pointerId } = e
    setDrag((d) => (d && d.id === i && d.pid === pointerId ? { ...d, dx: clientX - d.sx, dy: clientY - d.sy } : d))
  }

  const onUp = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (!drag || drag.id !== i || drag.pid !== e.pointerId) return
    const dx = e.clientX - drag.sx
    const dy = e.clientY - drag.sy
    setDrag(null)
    drop(i, dx, dy, e.type === 'pointercancel')
  }

  /** The fruit slides back to where it was (dropped on nothing, or the touch was cancelled). */
  const slideBack = (i: number, dx: number, dy: number) => {
    const el = itemEls.current.get(i)
    if (!el) return
    const rot = states[i].rot
    el.animate([{ transform: tf(dx, dy, rot, 1.15) }, { transform: tf(0, 0, rot, 1) }], {
      duration: 320 * speed,
      easing: 'cubic-bezier(.34, 1.56, .64, 1)',
    })
  }

  const drop = (i: number, dx: number, dy: number, cancelled: boolean) => {
    const el = itemEls.current.get(i)
    const boardEl = boardRef.current
    if (!el || !boardEl) return
    if (cancelled) return slideBack(i, dx, dy)

    const boardRect = boardEl.getBoundingClientRect()
    const rest = restOf(i)
    const centre = { x: boardRect.left + rest.x + dx, y: boardRect.top + rest.y + dy }
    const rects = round.buckets.map((_, b) => bucketEls.current[b]!.getBoundingClientRect())
    const target = pickBucket(centre, rects, 22)
    if (target < 0) return slideBack(i, dx, dy)

    const mouth = bucketMouth(rects[target], boardRect)
    const toMouth = { x: mouth.x - rest.x, y: mouth.y - rest.y }
    const rot = states[i].rot
    patch(i, { busy: true })

    if (round.buckets[target] === round.items[i].fruit) {
      // Right bucket: it drops in and joins the pile.
      const a = el.animate(
        [
          { transform: tf(dx, dy, rot, 1.15), opacity: 1 },
          { transform: tf(toMouth.x, toMouth.y, 0, 0.55), opacity: 1, offset: 0.75 },
          { transform: tf(toMouth.x, toMouth.y, 0, 0.35), opacity: 0 },
        ],
        { duration: 340 * speed, easing: 'ease-in', fill: 'forwards' },
      )
      a.onfinish = () => {
        if (!alive.current) return
        sortedCount.current += 1
        sound.playCorrect(sortedCount.current - 1)
        flushSync(() => patch(i, { sorted: true, busy: false }))
        setHappy(target)
        later(() => setHappy(null), 450)
        if (sortedCount.current === total) finishLevel()
      }
      return
    }

    // Wrong bucket: it goes in, the bucket can't digest it, shakes, and spits it out at random.
    sound.playYuck()
    setYuck(target)
    later(() => setYuck((y) => (y === target ? null : y)), 1000)
    const a = el.animate(
      [
        { transform: tf(dx, dy, rot, 1.15) },
        { transform: tf(toMouth.x, toMouth.y, rot, 0.55) },
      ],
      { duration: 240 * speed, easing: 'ease-in', fill: 'forwards' },
    )
    a.onfinish = () => {
      if (!alive.current) return
      setBurp(target)
      later(() => setBurp((b) => (b === target ? null : b)), 400)

      const others = round.items.map((_, k) => k).filter((k) => k !== i && !states[k].sorted).map(restOf)
      const tgt = throwTarget(mouth, table, layout.size, Math.random, others)
      const newRot = (Math.random() * 2 - 1) * 16
      const turns = reduceMotion.current ? 0 : (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2)) * 360
      const spin = turns + (newRot - rot)
      const rel = { x: tgt.x - rest.x, y: tgt.y - rest.y }
      const peak = 70 + Math.random() * 60
      const steps = 16
      const frames: Keyframe[] = []
      for (let k = 0; k <= steps; k++) {
        const t = k / steps
        frames.push({
          transform: tf(
            toMouth.x + (rel.x - toMouth.x) * t,
            toMouth.y + (rel.y - toMouth.y) * t - peak * 4 * t * (1 - t),
            rot + spin * t,
            0.55 + 0.45 * Math.min(1, t * 2),
          ),
          offset: t,
        })
      }
      const fly = el.animate(frames, { duration: 760 * speed, easing: 'cubic-bezier(.2, .7, .4, 1)', fill: 'forwards' })
      a.cancel() // the flight starts exactly where the "gulp" ended, so there is no jump
      fly.onfinish = () => {
        if (!alive.current) return
        flushSync(() => patch(i, { busy: false, pos: tgt, rot: newRot }))
        fly.cancel()
      }
    }
  }

  const finishLevel = () => {
    setCelebrating(true)
    later(() => {
      sound.playLevelWin()
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
    }, 250)
    later(() => {
      if (levelIndex < SORT_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
      else onFinished()
    }, 2000)
  }

  const ready = board.w > 0 && board.h > 0

  return (
    <main className="game sort-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${SORT_LEVEL_COUNT}`}>
          {sortLevels.map((l, i) => (
            <span key={l.level} className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`} />
          ))}
        </div>
        {soundButton}
      </header>

      <div className="sort-progress" aria-hidden>
        <div className="sort-progress-fill" style={{ width: `${(sortedTotal / total) * 100}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {sortedTotal} of {total} fruit sorted
      </p>

      <section className="sort-board" ref={boardRef} aria-label="Drag each fruit into its bucket">
        <div className="pile-zone" style={{ bottom: zoneH }} />

        <div
          className="buckets"
          style={{ height: zoneH, gap: BUCKET_GAP, ['--bw' as string]: `${bucketW}px` } as React.CSSProperties}
          key={`buckets-${levelIndex}`}
        >
          {round.buckets.map((fruit, b) => {
            const inside = round.items.reduce((n, it, idx) => n + (it.fruit === fruit && states[idx].sorted ? 1 : 0), 0)
            const cls = [
              'bucket-in',
              yuck === b ? 'yuck' : '',
              burp === b ? 'burp' : '',
              happy === b ? 'happy' : '',
              hintBucket === b ? 'hint' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div
                key={b}
                ref={(el) => {
                  bucketEls.current[b] = el
                }}
                className="bucket"
                data-fruit={fruit}
                role="img"
                aria-label={`${iconLabel(fruit)} bucket, ${inside} inside`}
              >
                {/* the outer box only does the pop-in; the inner one does the shake / burp / bounce, so they never restart each other */}
                <div className={cls}>
                  <BucketBack theme={bucketThemes[b % bucketThemes.length]} />
                  <div className="pile" aria-hidden>
                    {Array.from({ length: inside }, (_, k) => (
                      <span className="mini" key={k}>
                        <Icon name={fruit} />
                      </span>
                    ))}
                  </div>
                  <BucketFront theme={bucketThemes[b % bucketThemes.length]} />
                  <div className="bucket-label" aria-hidden>
                    <Icon name={fruit} />
                  </div>
                  {yuck === b && (
                    <div className="puffs" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {ready &&
          round.items.map((it, i) => {
            const s = states[i]
            if (s.sorted) return null
            const rest = restOf(i)
            const dragging = drag?.id === i
            const cls = ['fruit', dragging ? 'dragging' : '', s.busy ? 'flying' : '', hintItem === i ? 'hint' : '']
              .filter(Boolean)
              .join(' ')
            const transform = dragging ? tf(drag!.dx, drag!.dy, s.rot, 1.15) : `rotate(${s.rot}deg)`
            return (
              <div
                key={`${levelIndex}-${it.id}`}
                ref={(el) => {
                  if (el) itemEls.current.set(i, el)
                  else itemEls.current.delete(i)
                }}
                className={cls}
                style={
                  {
                    width: layout.size,
                    height: layout.size,
                    left: rest.x - layout.size / 2,
                    top: rest.y - layout.size / 2,
                    transform,
                    ['--d' as string]: `${Math.min(i * 25, 500)}ms`,
                  } as React.CSSProperties
                }
                data-fruit={it.fruit}
                data-id={it.id}
                aria-label={`${iconLabel(it.fruit)}, drag it to the ${iconLabel(it.fruit)} bucket`}
                onPointerDown={(e) => onDown(e, i)}
                onPointerMove={(e) => onMove(e, i)}
                onPointerUp={(e) => onUp(e, i)}
                onPointerCancel={(e) => onUp(e, i)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* pop-in and hint wiggle live on their own inner boxes, so neither restarts the other or the dragging */}
                <div className="fruit-pop">
                  <div className="fruit-wiggle">
                    <Icon name={it.fruit} />
                  </div>
                </div>
              </div>
            )
          })}
      </section>

      {celebrating && (
        <div className="overlay" role="status">
          <div className="congrats">
            <div className="big-star" aria-hidden>
              <Icon name="star" />
            </div>
            <h2>All sorted!</h2>
          </div>
        </div>
      )}

      <footer className="game-footer">
        <small>Grown-ups: hold the home button to exit</small>
      </footer>
    </main>
  )
}
