import React, { useEffect, useRef, useState } from 'react'
import type { IconName } from './gameData'

export const iconLabel = (name: IconName) =>
  name === 'star6' ? 'six point star' : name.replace(/([A-Z])/g, ' $1').toLowerCase()

export function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden focusable="false">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor" />
    </svg>
  )
}

export function SpeakerGlyph({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
      {off ? (
        <path d="M16 9l5 6m0-6-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <path
          d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}

export function BackGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden focusable="false">
      <path d="M14.5 5 7.5 12l7 7" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function ReplayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden focusable="false">
      <path d="M12 5a7 7 0 1 1-6.6 4.7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M12 1.5 7.5 5 12 8.5z" fill="currentColor" />
    </svg>
  )
}

/** A sad (but friendly) face with a tear, for the "Oops" screen. */
export function SadFace() {
  return (
    <svg viewBox="0 0 64 64" className="icon" aria-hidden focusable="false">
      <circle cx="32" cy="32" r="27" fill="#fde047" stroke="#f59e0b" strokeWidth="3" />
      <path d="M15 27 L27 21 M49 27 L37 21" stroke="#7c4a1e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="23" cy="33" r="3.4" fill="#7c4a1e" />
      <circle cx="41" cy="33" r="3.4" fill="#7c4a1e" />
      <path d="M21 48 Q32 38 43 48" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M47 38 Q43 44 47 47 Q51 44 47 38Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Colour / black-and-white switch icon.
 * In colour mode: a four-colour disc. In black-and-white mode: a half black, half white disc.
 */
export function ColorGlyph({ bw }: { bw: boolean }) {
  return (
    <svg viewBox="0 0 28 28" width="30" height="30" aria-hidden focusable="false">
      {bw ? (
        <>
          <circle cx="14" cy="14" r="11" fill="#ffffff" stroke="#2d3a4f" strokeWidth="2.4" />
          <path d="M14 3a11 11 0 0 1 0 22z" fill="#2d3a4f" />
        </>
      ) : (
        <>
          <path d="M14 14V3a11 11 0 0 1 11 11z" fill="#ff6b8b" />
          <path d="M14 14h11a11 11 0 0 1-11 11z" fill="#ffd166" />
          <path d="M14 14v11A11 11 0 0 1 3 14z" fill="#4ade80" />
          <path d="M14 14H3A11 11 0 0 1 14 3z" fill="#4dabf7" />
          <circle cx="14" cy="14" r="11" fill="none" stroke="#2d3a4f" strokeWidth="2.4" />
        </>
      )}
    </svg>
  )
}

/** A button that must be held for a moment, so little fingers can't leave the game by accident. */
export function HoldButton({
  onHold,
  label,
  children,
}: {
  onHold: () => void
  label: string
  children: React.ReactNode
}) {
  const timer = useRef<number | undefined>(undefined)
  const [holding, setHolding] = useState(false)

  const cancel = () => {
    window.clearTimeout(timer.current)
    setHolding(false)
  }
  const start = () => {
    window.clearTimeout(timer.current)
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      onHold()
    }, 700)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <button
      className={`round-btn hold ${holding ? 'holding' : ''}`}
      aria-label={label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onBlur={cancel}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start()
      }}
      onKeyUp={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}

/** Remembers a small yes/no setting on this device only (nothing is ever sent anywhere). */
export function loadFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export function saveFlag(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0')
  } catch {
    /* private mode or storage blocked: the setting simply won't be remembered */
  }
}
