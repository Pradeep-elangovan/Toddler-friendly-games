// Tiny sound effects made with the Web Audio API: no audio files, so it works fully offline.

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (muted) return null
  try {
    if (!ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.18) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t0 = c.currentTime + start
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

// C major pentatonic: always sounds happy, never harsh
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]

/** Happy "pop" that climbs the scale with every correct tap. */
export function playCorrect(step: number) {
  const f = SCALE[Math.min(step, SCALE.length - 1)]
  tone(f, 0, 0.28, 'sine', 0.2)
  tone(f * 2, 0.02, 0.18, 'triangle', 0.06)
}

/** Soft, low, friendly "boop" (not a buzzer). */
export function playWrong() {
  tone(220, 0, 0.18, 'sine', 0.16)
  tone(185, 0.12, 0.22, 'sine', 0.12)
}

/** "Blegh!": a bucket that can't digest the wrong fruit, then a little pop as it spits it out. Funny, not scary. */
export function playYuck() {
  tone(207.65, 0, 0.16, 'triangle', 0.12)
  tone(174.61, 0.13, 0.2, 'triangle', 0.1)
  tone(155.56, 0.26, 0.14, 'triangle', 0.08)
  tone(740, 0.42, 0.09, 'sine', 0.12)
}

/** A soft, slow "aww" for a lost run: three gently falling notes (sad, but never scary). */
export function playFail() {
  ;[392.0, 329.63, 261.63].forEach((f, i) => tone(f, i * 0.2, 0.42, 'sine', 0.16))
}

/** Little cheer when a level is finished. */
export function playLevelWin() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.18))
}

/** Longer fanfare for finishing every level. */
export function playGameWin() {
  ;[523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach((f, i) =>
    tone(f, i * 0.14, 0.34, 'triangle', 0.18),
  )
}

export function playTap() {
  tone(660, 0, 0.1, 'sine', 0.1)
}

export function setMuted(value: boolean) {
  muted = value
}

export function isMuted() {
  return muted
}
