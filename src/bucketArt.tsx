import React from 'react'

export type BucketTheme = { body: string; dark: string; light: string }

/** One colour per bucket position, so neighbouring buckets are easy to tell apart. */
export const bucketThemes: BucketTheme[] = [
  { body: '#60a5fa', dark: '#1d4ed8', light: '#bfdbfe' }, // blue
  { body: '#f472b6', dark: '#be185d', light: '#fbcfe8' }, // pink
  { body: '#34d399', dark: '#047857', light: '#a7f3d0' }, // green
  { body: '#fbbf24', dark: '#b45309', light: '#fde68a' }, // amber
  { body: '#a78bfa', dark: '#6d28d9', light: '#ddd6fe' }, // violet
]

/**
 * A bucket is drawn in two layers with the pile of sorted fruit sandwiched between them,
 * so the fruit looks like it is inside: the back (the dark opening) and the front (the body).
 * Both use the same 100 x 118 box.
 */
export function BucketBack({ theme }: { theme: BucketTheme }) {
  return (
    <svg viewBox="0 0 100 118" className="bk bk-back" aria-hidden focusable="false">
      <ellipse cx="50" cy="46" rx="44" ry="10" fill={theme.dark} />
      <ellipse cx="50" cy="46" rx="40" ry="7" fill="#000000" opacity="0.28" />
    </svg>
  )
}

export function BucketFront({ theme }: { theme: BucketTheme }) {
  return (
    <svg viewBox="0 0 100 118" className="bk bk-front" aria-hidden focusable="false">
      <path
        d="M6 46 Q50 66 94 46 L84 108 Q83 115 76 115 L24 115 Q17 115 16 108Z"
        fill={theme.body}
        stroke={theme.dark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M6 46 Q50 66 94 46" fill="none" stroke={theme.light} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M29 64 L33 104 M50 68 L50 106 M71 64 L67 104"
        stroke={theme.dark}
        strokeWidth="2.5"
        opacity="0.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
