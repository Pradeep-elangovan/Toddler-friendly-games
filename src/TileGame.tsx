import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { TILE_LEVEL_COUNT, makeTiles, pairsForLevel, tileLevels, type Tile } from './gameData'
import { Icon } from './icons'
import { HoldButton, HomeGlyph, iconLabel } from './ui'
import * as sound from './sound'

type Props = {
  onHome: () => void
  /** called after the last level is cleared */
  onFinished: () => void
  soundButton: React.ReactNode
}

/**
 * Tile Match: a board of icon tiles. Tap one tile, then another that shows the same icon,
 * and both disappear. Clear the board to move on. Three levels, each harder to tell apart.
 */
export default function TileGame({ onHome, onFinished, soundButton }: Props) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [tiles, setTiles] = useState<Tile[]>(() => makeTiles(1))
  const [selected, setSelected] = useState<number | null>(null)
  const [matching, setMatching] = useState<number[]>([])
  const [wobble, setWobble] = useState<number[]>([])
  const [celebrating, setCelebrating] = useState(false)
  const [hint, setHint] = useState(false)

  const busy = useRef(false) // ignore taps while a match/mismatch animation plays
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

  // If the child pauses for a while, gently pulse a pair that matches.
  useEffect(() => {
    setHint(false)
    if (celebrating) return
    const id = window.setTimeout(() => setHint(true), 7000)
    return () => window.clearTimeout(id)
  }, [tiles, selected, celebrating])

  const cfg = tileLevels[levelIndex]
  const totalPairs = pairsForLevel(levelIndex + 1)
  const liveCount = tiles.filter((t) => !t.gone).length
  const pairsDone = totalPairs - liveCount / 2

  const hintIds: number[] = (() => {
    if (!hint) return []
    const live = tiles.filter((t) => !t.gone)
    if (selected !== null) {
      const first = live.find((t) => t.id === selected)
      const partner = first && live.find((t) => t.id !== selected && t.icon === first.icon)
      return partner ? [partner.id] : []
    }
    for (const t of live) {
      const partner = live.find((u) => u.id !== t.id && u.icon === t.icon)
      if (partner) return [t.id, partner.id]
    }
    return []
  })()

  const beginLevel = (index: number) => {
    busy.current = false
    setLevelIndex(index)
    setTiles(makeTiles(index + 1))
    setSelected(null)
    setMatching([])
    setWobble([])
    setCelebrating(false)
  }

  const finishLevel = () => {
    setCelebrating(true)
    later(() => {
      sound.playLevelWin()
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })
    }, 250)
    later(() => {
      if (levelIndex < TILE_LEVEL_COUNT - 1) beginLevel(levelIndex + 1)
      else onFinished()
    }, 2000)
  }

  const onTileTap = (t: Tile) => {
    if (celebrating || busy.current || t.gone) return

    if (selected === null) {
      setSelected(t.id)
      sound.playTap()
      return
    }
    if (selected === t.id) {
      setSelected(null) // tapping the same tile again just un-selects it
      return
    }
    const first = tiles.find((x) => x.id === selected)
    if (!first) {
      setSelected(t.id)
      return
    }

    busy.current = true
    if (first.icon === t.icon) {
      const stillLive = tiles.filter((x) => !x.gone).length - 2
      sound.playCorrect(totalPairs - (stillLive + 2) / 2)
      setMatching([first.id, t.id])
      setSelected(null)
      later(() => {
        setTiles((ts) => ts.map((x) => (x.id === first.id || x.id === t.id ? { ...x, gone: true } : x)))
        setMatching([])
        busy.current = false
        if (stillLive === 0) finishLevel()
      }, 380)
    } else {
      // gentle: soft boop and a little wobble, then both tiles are free to pick again
      sound.playWrong()
      setWobble([first.id, t.id])
      later(() => {
        setWobble([])
        setSelected(null)
        busy.current = false
      }, 450)
    }
  }

  return (
    <main className="game tile-game">
      <header className="gamebar">
        <HoldButton onHold={onHome} label="Hold to go home">
          <HomeGlyph />
        </HoldButton>
        <div className="dots" role="img" aria-label={`Level ${levelIndex + 1} of ${TILE_LEVEL_COUNT}`}>
          {tileLevels.map((l, i) => (
            <span
              key={l.level}
              className={`dot ${i < levelIndex ? 'done' : ''} ${i === levelIndex ? 'current' : ''}`}
            />
          ))}
        </div>
        {soundButton}
      </header>

      <div className={`ref-stars pairs ${totalPairs > 12 ? 'many' : ''}`} aria-hidden>
        {Array.from({ length: totalPairs }, (_, i) => (
          <span key={i} className={i < pairsDone ? 'on' : ''}>
            ★
          </span>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {pairsDone} of {totalPairs} pairs cleared
      </p>

      <section
        className={`board size-${cfg.size}`}
        style={{ '--n': cfg.size } as React.CSSProperties}
        aria-label="Tap two tiles that match"
        key={`board-${levelIndex}`}
      >
        {tiles.map((t, i) => {
          const cls = [
            'tile',
            t.gone ? 'gone' : '',
            selected === t.id ? 'selected' : '',
            matching.includes(t.id) ? 'matching' : '',
            wobble.includes(t.id) ? 'shake' : '',
            hintIds.includes(t.id) ? 'hint' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={t.id}
              className={cls}
              style={{ '--d': `${Math.min(i * 30, 600)}ms` } as React.CSSProperties}
              onClick={() => onTileTap(t)}
              aria-pressed={selected === t.id}
              aria-label={`${iconLabel(t.icon)} tile${selected === t.id ? ', selected' : ''}`}
              tabIndex={t.gone ? -1 : 0}
            >
              <Icon name={t.icon} />
            </button>
          )
        })}
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
