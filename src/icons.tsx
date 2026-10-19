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

    /* ---- look-alikes (Tile Match level 3): same yellow body, different small details ---- */
    case 'smile':
      return (
        <svg {...common}>
          <FaceDisc />
          <circle cx="23" cy="28" r="3.4" fill="#7c4a1e" />
          <circle cx="41" cy="28" r="3.4" fill="#7c4a1e" />
          <path d="M20 38 Q32 52 44 38" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="37" r="4" fill="#fda4af" opacity="0.8" />
          <circle cx="48" cy="37" r="4" fill="#fda4af" opacity="0.8" />
        </svg>
      )
    case 'sleepy':
      return (
        <svg {...common}>
          <FaceDisc />
          <path d="M17 29 Q23 35 29 29" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M35 29 Q41 35 47 29" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="43" r="3.2" fill="#7c4a1e" />
          <path d="M44 9 H54 L44 19 H54" stroke="#3b82f6" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'wow':
      return (
        <svg {...common}>
          <FaceDisc />
          <path d="M16 20 Q23 13 30 20" stroke="#7c4a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M34 20 Q41 13 48 20" stroke="#7c4a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="23" cy="29" r="5.5" fill="#ffffff" stroke="#7c4a1e" strokeWidth="2" />
          <circle cx="41" cy="29" r="5.5" fill="#ffffff" stroke="#7c4a1e" strokeWidth="2" />
          <circle cx="23" cy="29" r="2.4" fill="#7c4a1e" />
          <circle cx="41" cy="29" r="2.4" fill="#7c4a1e" />
          <ellipse cx="32" cy="44" rx="6" ry="8" fill="#7c4a1e" />
        </svg>
      )
    case 'wink':
      return (
        <svg {...common}>
          <FaceDisc />
          <circle cx="23" cy="29" r="3.4" fill="#7c4a1e" />
          <path d="M35 30 Q41 24 47 30" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M19 38 Q32 53 45 38" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M30 47 Q36 55 41 45" fill="#fb7185" stroke="#e11d48" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'star6':
      return (
        <svg {...common}>
          <polygon
            points="32.0,5.0 40.0,19.1 56.2,19.0 48.0,33.0 56.2,47.0 40.0,46.9 32.0,61.0 24.0,46.9 7.8,47.0 16.0,33.0 7.8,19.0 24.0,19.1"
            fill="#ffc93c"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="31" r="2.6" fill="#7c4a1e" />
          <circle cx="38" cy="31" r="2.6" fill="#7c4a1e" />
          <path d="M27 38 Q32 43 37 38" stroke="#7c4a1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      )

    /* ---- more look-alikes (Tile Match level 5) ---- */
    case 'cool':
      return (
        <svg {...common}>
          <FaceDisc />
          <rect x="13" y="23" width="17" height="12" rx="5" fill="#1f2937" />
          <rect x="34" y="23" width="17" height="12" rx="5" fill="#1f2937" />
          <path d="M30 27 H34" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 27 H20 M37 27 H41" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 43 Q32 51 42 43" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'laugh':
      return (
        <svg {...common}>
          <FaceDisc />
          <path d="M15 31 Q22 22 29 31" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M35 31 Q42 22 49 31" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M17 38 H47 Q47 55 32 55 Q17 55 17 38Z" fill="#7c4a1e" strokeLinejoin="round" />
          <path d="M25 52 Q32 45 39 52Z" fill="#fb7185" />
        </svg>
      )
    case 'cry':
      return (
        <svg {...common}>
          <FaceDisc />
          <path d="M16 28 L27 23 M48 28 L37 23" stroke="#7c4a1e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="23" cy="32" r="3.2" fill="#7c4a1e" />
          <circle cx="41" cy="32" r="3.2" fill="#7c4a1e" />
          <path d="M22 37 Q17 45 22 49 Q27 45 22 37Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M42 37 Q37 45 42 49 Q47 45 42 37Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M24 53 Q32 45 40 53" stroke="#7c4a1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </svg>
      )

    /* ---- fruit for Fruit Sort (the apple above is shared); each has its own colour AND silhouette ---- */
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#fff" stroke="#ef476f" strokeWidth="5" />
          <g stroke="#2d3a4f" strokeWidth="2.6" strokeLinecap="round">
            <path d="M32 11v4M32 49v4M11 32h4M49 32h4" />
          </g>
          <path d="M32 32V20" stroke="#ef476f" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 32l11 6" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="3.4" fill="#2d3a4f" />
        </svg>
      )
    case 'banana':
      return (
        <svg {...common}>
          <path
            d="M10 18 C8 40 24 58 52 52 C57 51 58 45 53 44 C34 44 26 32 28 14 C28 9 11 9 10 18Z"
            fill="#fde047"
            stroke="#ca8a04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M14 20 C15 36 26 49 47 49" stroke="#fef9c3" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="12" y="4" width="14" height="9" rx="3" fill="#a16207" stroke="#78350f" strokeWidth="2" />
          <circle cx="53.5" cy="48" r="3.6" fill="#78350f" />
        </svg>
      )
    case 'orange':
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="23" fill="#fb923c" stroke="#c2410c" strokeWidth="3" />
          <path d="M32 13 C32 9 34 7 38 6" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="43" cy="11" rx="9" ry="4.5" transform="rotate(-20 43 11)" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
          <path d="M17 31 Q19 23 26 21" stroke="#fed7aa" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <g fill="#c2410c" opacity="0.55">
            <circle cx="26" cy="44" r="1.4" />
            <circle cx="37" cy="40" r="1.4" />
            <circle cx="44" cy="48" r="1.4" />
            <circle cx="33" cy="51" r="1.4" />
            <circle cx="44" cy="34" r="1.4" />
          </g>
        </svg>
      )
    case 'grapes':
      return (
        <svg {...common}>
          <path d="M32 19 C32 13 34 10 38 8" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M35 11 C41 4 51 6 53 12 C47 15 39 15 35 11Z" fill="#4ade80" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
          <g fill="#a855f7" stroke="#6b21a8" strokeWidth="2.5">
            <circle cx="19" cy="27" r="9" />
            <circle cx="32" cy="27" r="9" />
            <circle cx="45" cy="27" r="9" />
            <circle cx="25.5" cy="39" r="9" />
            <circle cx="38.5" cy="39" r="9" />
            <circle cx="32" cy="51" r="9" />
          </g>
          <g fill="#ffffff" opacity="0.7">
            <circle cx="16" cy="24" r="2.2" />
            <circle cx="29" cy="24" r="2.2" />
            <circle cx="42" cy="24" r="2.2" />
            <circle cx="22.5" cy="36" r="2.2" />
            <circle cx="35.5" cy="36" r="2.2" />
            <circle cx="29" cy="48" r="2.2" />
          </g>
        </svg>
      )
    case 'strawberry':
      return (
        <svg {...common}>
          <path
            d="M32 58 C14 46 8 30 12 24 C16 18 26 20 32 22 C38 20 48 18 52 24 C56 30 50 46 32 58Z"
            fill="#f43f5e"
            stroke="#be123c"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M17 22 L23 12 L28 19 L32 8 L36 19 L41 12 L47 22 C41 27 23 27 17 22Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g fill="#fde68a">
            <ellipse cx="21" cy="33" rx="1.7" ry="2.5" />
            <ellipse cx="32" cy="34" rx="1.7" ry="2.5" />
            <ellipse cx="43" cy="33" rx="1.7" ry="2.5" />
            <ellipse cx="26" cy="42" rx="1.7" ry="2.5" />
            <ellipse cx="38" cy="42" rx="1.7" ry="2.5" />
            <ellipse cx="32" cy="50" rx="1.7" ry="2.5" />
          </g>
        </svg>
      )
    case 'watermelon':
      return (
        <svg {...common}>
          <path d="M3 16 A29 29 0 0 0 61 16Z" fill="#16a34a" stroke="#166534" strokeWidth="3" strokeLinejoin="round" />
          <path d="M8 16 A24 24 0 0 0 56 16Z" fill="#dcfce7" />
          <path d="M11 16 A21 21 0 0 0 53 16Z" fill="#ef4444" />
          <g fill="#1f2937">
            <ellipse cx="22" cy="24" rx="1.8" ry="3" transform="rotate(-20 22 24)" />
            <ellipse cx="32" cy="27" rx="1.8" ry="3" />
            <ellipse cx="42" cy="24" rx="1.8" ry="3" transform="rotate(20 42 24)" />
            <ellipse cx="27" cy="34" rx="1.8" ry="3" transform="rotate(-12 27 34)" />
            <ellipse cx="37" cy="34" rx="1.8" ry="3" transform="rotate(12 37 34)" />
          </g>
        </svg>
      )
  }
}

function FaceDisc() {
  return <circle cx="32" cy="32" r="27" fill="#fde047" stroke="#f59e0b" strokeWidth="3" />
}
