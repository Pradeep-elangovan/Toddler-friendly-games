import React, { useId } from 'react'
import type { IconName } from './gameData'

/**
 * Colourful, chunky icons drawn on a 64x64 grid.
 * Every icon has a distinct silhouette AND colour so toddlers can tell them apart at a glance.
 */
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const maskId = useId()
  const common = {
    viewBox: '0 0 64 64',
    className: `icon ${className}`.trim(),
    'aria-hidden': true,
    focusable: false,
  } as const

  switch (name) {
    case 'star':
      return (
        <svg {...common}>
          <polygon
            points="32,5 40,23 60,25 45,39 49,59 32,49 15,59 19,39 4,25 24,23"
            fill="#ffc93c"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="30" r="2.6" fill="#7c4a1e" />
          <circle cx="38" cy="30" r="2.6" fill="#7c4a1e" />
          <path d="M27 37 Q32 42 37 37" stroke="#7c4a1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path
            d="M32 57 C8 40 5 23 15 14 C23 8 30 12 32 18 C34 12 41 8 49 14 C59 23 56 40 32 57Z"
            fill="#ff5c7a"
            stroke="#e11d48"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M16 22 Q18 17 23 17" stroke="#ffd1da" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'apple':
      return (
        <svg {...common}>
          <path
            d="M32 21 C23 13 9 20 10 37 C11 51 21 60 32 55 C43 60 53 51 54 37 C55 20 41 13 32 21Z"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M32 21 C32 15 34 11 38 8" stroke="#7c4a1e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="43" cy="12" rx="8" ry="4.5" transform="rotate(-25 43 12)" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
          <path d="M18 30 Q19 25 24 24" stroke="#fecaca" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <defs>
            <mask id={maskId}>
              <rect width="64" height="64" fill="white" />
              <circle cx="42" cy="26" r="19" fill="black" />
            </mask>
          </defs>
          <circle cx="29" cy="33" r="24" fill="#fde047" mask={`url(#${maskId})`} />
          <circle cx="16" cy="38" r="3" fill="#facc15" />
          <circle cx="24" cy="50" r="2.2" fill="#facc15" />
          <circle cx="50" cy="52" r="1.8" fill="#fde047" />
          <circle cx="54" cy="12" r="2.4" fill="#fde047" />
        </svg>
      )
    case 'flower':
      return (
        <svg {...common}>
          <rect x="30" y="38" width="4" height="22" rx="2" fill="#22c55e" />
          <g fill="#f472b6" stroke="#db2777" strokeWidth="2">
            <circle cx="32" cy="14" r="9" />
            <circle cx="32" cy="14" r="9" transform="rotate(72 32 28)" />
            <circle cx="32" cy="14" r="9" transform="rotate(144 32 28)" />
            <circle cx="32" cy="14" r="9" transform="rotate(216 32 28)" />
            <circle cx="32" cy="14" r="9" transform="rotate(288 32 28)" />
          </g>
          <circle cx="32" cy="28" r="7" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      )
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M23 42 L9 54 L24 50Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M41 42 L55 54 L40 50Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M26 50 L32 62 L38 50Z" fill="#fb923c" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d="M32 3 C45 13 47 33 43 50 L21 50 C17 33 19 13 32 3Z"
            fill="#f1f5f9"
            stroke="#64748b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M32 3 C38 8 41 13 42 18 L22 18 C23 13 26 8 32 3Z" fill="#ef4444" />
          <circle cx="32" cy="30" r="7" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="3" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...common}>
          <g fill="#bfdbfe" stroke="#60a5fa" strokeWidth="3">
            <circle cx="19" cy="38" r="12" />
            <circle cx="33" cy="27" r="16" />
            <circle cx="47" cy="38" r="12" />
            <rect x="19" y="38" width="28" height="12" />
          </g>
          <g fill="#bfdbfe">
            <circle cx="19" cy="38" r="10.5" />
            <circle cx="33" cy="27" r="14.5" />
            <circle cx="47" cy="38" r="10.5" />
            <rect x="19" y="37" width="28" height="11" />
          </g>
          <circle cx="28" cy="33" r="2.2" fill="#1e3a8a" />
          <circle cx="38" cy="33" r="2.2" fill="#1e3a8a" />
          <path d="M29 39 Q33 43 37 39" stroke="#1e3a8a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'rainbow':
      return (
        <svg {...common}>
          <g fill="none" strokeWidth="6.5">
            <path d="M6 50 A26 26 0 0 1 58 50" stroke="#ef4444" />
            <path d="M12.5 50 A19.5 19.5 0 0 1 51.5 50" stroke="#fbbf24" />
            <path d="M19 50 A13 13 0 0 1 45 50" stroke="#22c55e" />
            <path d="M25.5 50 A6.5 6.5 0 0 1 38.5 50" stroke="#3b82f6" />
          </g>
          <g fill="#ffffff" stroke="#cbd5e1" strokeWidth="2">
            <circle cx="9" cy="52" r="6" />
            <circle cx="55" cy="52" r="6" />
          </g>
        </svg>
      )
    case 'iceCream':
      return (
        <svg {...common}>
          <path d="M19 31 L45 31 L32 61Z" fill="#f2b56b" stroke="#d98e3a" strokeWidth="3" strokeLinejoin="round" />
          <path d="M25 38 L38 46 M39 38 L27 48" stroke="#d98e3a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="22" r="15" fill="#f9a8d4" stroke="#ec4899" strokeWidth="3" />
          <path d="M17 31 Q22 38 27 31 Q32 38 37 31 Q42 38 47 31" fill="#f9a8d4" stroke="#ec4899" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="6" r="4.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <path d="M23 18 Q25 14 29 13" stroke="#fce7f3" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'pencil':
      return (
        <svg {...common}>
          <g transform="rotate(45 32 32)">
            <rect x="23" y="3" width="18" height="8" rx="3" fill="#fb7185" stroke="#e11d48" strokeWidth="2" />
            <rect x="23" y="10" width="18" height="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="23" y="15" width="18" height="30" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <rect x="30" y="15" width="4" height="30" fill="#fde68a" />
            <path d="M23 45 L41 45 L32 61Z" fill="#fde7c2" stroke="#d6a86a" strokeWidth="2" strokeLinejoin="round" />
            <path d="M29 55 L35 55 L32 61Z" fill="#374151" />
          </g>
        </svg>
      )
    case 'book':
      return (
        <svg {...common}>
          <rect x="9" y="7" width="46" height="50" rx="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
          <rect x="15" y="12" width="36" height="40" rx="2" fill="#ffffff" />
          <rect x="9" y="7" width="8" height="50" rx="4" fill="#2563eb" />
          <path d="M23 22 H44 M23 29 H44 M23 36 H37" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M42 7 V22 L46 18 L50 22 V7Z" fill="#f43f5e" />
        </svg>
      )
  }
}
