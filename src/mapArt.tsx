import React from 'react'
import type { Cmd, Decor, PlaceKind } from './mapLogic'

/** Drawings for Cheetah's Trip. Everything is drawn around (0,0) inside a 10×10 map cell. */

export function CheetahArt() {
  // seen from above, facing up
  return (
    <g>
      {/* tail */}
      <path d="M0 3.6 Q2.6 5.6 1.2 7.6" stroke="#f4b942" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M1.5 6.6 Q1.6 7.2 1.2 7.6" stroke="#4a3320" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* legs */}
      <g fill="#f4b942" stroke="#b9801f" strokeWidth="0.35">
        <ellipse cx="-2.5" cy="-1.1" rx="0.95" ry="1.5" />
        <ellipse cx="2.5" cy="-1.1" rx="0.95" ry="1.5" />
        <ellipse cx="-2.4" cy="2.7" rx="0.95" ry="1.6" />
        <ellipse cx="2.4" cy="2.7" rx="0.95" ry="1.6" />
      </g>
      {/* body */}
      <ellipse cx="0" cy="0.9" rx="2.7" ry="4.3" fill="#f7c35a" stroke="#b9801f" strokeWidth="0.4" />
      <g fill="#4a3320">
        <circle cx="-1.2" cy="-0.4" r="0.38" />
        <circle cx="1.1" cy="0.3" r="0.4" />
        <circle cx="-0.5" cy="1.5" r="0.4" />
        <circle cx="1.3" cy="2.4" r="0.36" />
        <circle cx="-1.4" cy="2.7" r="0.36" />
        <circle cx="0.1" cy="3.6" r="0.34" />
        <circle cx="0" cy="-1.5" r="0.34" />
      </g>
      {/* head */}
      <circle cx="-1.55" cy="-4.9" r="0.95" fill="#f7c35a" stroke="#b9801f" strokeWidth="0.35" />
      <circle cx="1.55" cy="-4.9" r="0.95" fill="#f7c35a" stroke="#b9801f" strokeWidth="0.35" />
      <circle cx="-1.55" cy="-4.9" r="0.45" fill="#e58aa0" />
      <circle cx="1.55" cy="-4.9" r="0.45" fill="#e58aa0" />
      <ellipse cx="0" cy="-3.6" rx="2.3" ry="2.1" fill="#f7c35a" stroke="#b9801f" strokeWidth="0.4" />
      <path d="M-1.1 -4.2 Q-1.35 -3 -0.9 -2.4 M1.1 -4.2 Q1.35 -3 0.9 -2.4" stroke="#4a3320" strokeWidth="0.35" fill="none" strokeLinecap="round" />
      <circle cx="-0.95" cy="-4.15" r="0.42" fill="#fff" />
      <circle cx="0.95" cy="-4.15" r="0.42" fill="#fff" />
      <circle cx="-0.95" cy="-4.3" r="0.22" fill="#2d2a26" />
      <circle cx="0.95" cy="-4.3" r="0.22" fill="#2d2a26" />
      <ellipse cx="0" cy="-2.55" rx="0.55" ry="0.4" fill="#4a3320" />
    </g>
  )
}

export function PlaceArt({ kind }: { kind: PlaceKind }) {
  switch (kind) {
    case 'school':
      return (
        <g>
          <rect x="-4.3" y="-2.2" width="8.6" height="6" rx="0.6" fill="#ffb4a2" stroke="#c4584a" strokeWidth="0.4" />
          <path d="M-5 -2.2 L0 -5 L5 -2.2Z" fill="#ef476f" stroke="#a82848" strokeWidth="0.4" strokeLinejoin="round" />
          <rect x="-0.9" y="1.1" width="1.8" height="2.7" rx="0.3" fill="#7c4a1e" />
          <rect x="-3.5" y="-0.6" width="1.7" height="1.6" fill="#bde0fe" />
          <rect x="1.8" y="-0.6" width="1.7" height="1.6" fill="#bde0fe" />
          <path d="M0 -5 V-6.6" stroke="#5b4636" strokeWidth="0.35" />
          <path d="M0 -6.6 L2.2 -6 L0 -5.4Z" fill="#ffd166" />
        </g>
      )
    case 'shop':
      return (
        <g>
          <rect x="-4.2" y="-2" width="8.4" height="6" rx="0.5" fill="#fff3c4" stroke="#c9a227" strokeWidth="0.4" />
          <path d="M-4.8 -2 H4.8 L4.2 -4.2 H-4.2Z" fill="#fff" stroke="#c9a227" strokeWidth="0.3" />
          {[-4.2, -2.1, 0, 2.1].map((x, i) => (
            <path key={x} d={`M${x} -4.2 H${x + 2.1} L${x + 2.4} -2 H${x + 0.3}Z`} fill={i % 2 ? '#fff' : '#ef476f'} />
          ))}
          <rect x="-1.1" y="0.4" width="2.2" height="3.6" rx="0.3" fill="#7c4a1e" />
          <rect x="-3.7" y="0.2" width="1.8" height="1.8" fill="#bde0fe" />
          <rect x="1.9" y="0.2" width="1.8" height="1.8" fill="#bde0fe" />
        </g>
      )
    case 'park':
      return (
        <g>
          <circle cx="0" cy="0" r="4.7" fill="#8fd694" stroke="#4aa35b" strokeWidth="0.4" />
          <circle cx="-1.6" cy="-1.4" r="2.3" fill="#4cae5f" />
          <circle cx="-1.9" cy="-1.8" r="1.1" fill="#6cc87c" />
          <rect x="0.6" y="1.6" width="3.2" height="1" rx="0.3" fill="#a0642c" />
          <circle cx="2.4" cy="-1.8" r="0.6" fill="#ff8fa3" />
          <circle cx="3.3" cy="-0.6" r="0.5" fill="#ffd166" />
        </g>
      )
    default:
      return (
        <g>
          <rect x="-3.8" y="-1.4" width="7.6" height="5.2" rx="0.5" fill="#ffe29a" stroke="#c9a227" strokeWidth="0.4" />
          <path d="M-4.8 -1.4 L0 -5 L4.8 -1.4Z" fill="#ff8a5c" stroke="#b9532c" strokeWidth="0.4" strokeLinejoin="round" />
          <rect x="-0.9" y="1" width="1.8" height="2.8" rx="0.3" fill="#7c4a1e" />
          <rect x="-3.1" y="-0.4" width="1.6" height="1.6" fill="#bde0fe" />
          <rect x="1.5" y="-0.4" width="1.6" height="1.6" fill="#bde0fe" />
          <rect x="1.6" y="-4.6" width="1.2" height="2" fill="#b9532c" />
        </g>
      )
  }
}

export function DecorArt({ d }: { d: Decor }) {
  const sc = d.s / 10
  if (d.kind === 'pond')
    return (
      <g transform={`translate(${d.x * 10 + 5} ${d.y * 10 + 5})`}>
        <ellipse cx="0" cy="0" rx="4.3" ry="3.5" fill="#7cc8f2" stroke="#4aa3d9" strokeWidth="0.5" />
        <path d="M-2 -0.8 Q-1 -1.6 0.2 -0.8" stroke="#d9f1ff" strokeWidth="0.45" fill="none" strokeLinecap="round" />
        <path d="M0.6 1.1 Q1.6 0.4 2.6 1.1" stroke="#d9f1ff" strokeWidth="0.45" fill="none" strokeLinecap="round" />
      </g>
    )
  if (d.kind === 'tree')
    return (
      <g transform={`translate(${d.x * 10 + 5} ${d.y * 10 + 5}) scale(${sc})`}>
        <circle cx="0.6" cy="0.8" r="4.2" fill="rgba(0,0,0,.1)" />
        <circle cx="0" cy="0" r="4.2" fill="#3fa65a" stroke="#2c7d42" strokeWidth="0.4" />
        <circle cx="-1.2" cy="-1.2" r="1.7" fill="#5cc277" />
      </g>
    )
  if (d.kind === 'flower')
    return (
      <g transform={`translate(${d.x * 10 + 5} ${d.y * 10 + 5}) scale(${sc / 5})`} >
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 1.6} cy={Math.sin((a * Math.PI) / 180) * 1.6} r="1.2" fill={`hsl(${d.h} 85% 72%)`} />
        ))}
        <circle r="1" fill="#ffd166" />
      </g>
    )
  return (
    <g transform={`translate(${d.x * 10 + 5} ${d.y * 10 + 5}) scale(${sc / 5})`}>
      <ellipse cx="0" cy="0" rx="3.2" ry="2.5" fill="#b8bcc4" stroke="#8a8f99" strokeWidth="0.5" />
      <ellipse cx="-0.8" cy="-0.8" rx="1.2" ry="0.8" fill="#d9dce2" />
    </g>
  )
}

/** The arrows on the buttons and chips, drawn in the cheetah's point of view (up = straight on). */
export function CmdGlyph({ cmd, size = 40 }: { cmd: Cmd; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      {cmd === 'straight' && <path {...common} d="M12 20V5 M6 11l6-6 6 6" />}
      {cmd === 'left' && <path {...common} d="M19 20v-6a5 5 0 0 0-5-5H5 M10 4l-5 5 5 5" />}
      {cmd === 'right' && <path {...common} d="M5 20v-6a5 5 0 0 1 5-5h9 M14 4l5 5-5 5" />}
      {cmd === 'back' && <path {...common} d="M17 5v9a5 5 0 0 1-10 0V6 M3 11l4 4 4-4" transform="translate(0 2)" />}
    </svg>
  )
}

export const CMD_LABEL: Record<Cmd, string> = { straight: 'Straight', left: 'Left', right: 'Right', back: 'Back' }
export const CMD_COLOR: Record<Cmd, string> = { straight: '#4cbf6b', left: '#4aa3f0', right: '#ff9f43', back: '#a77bf0' }
