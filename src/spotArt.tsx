import React from 'react'

/**
 * The little pictures that story scenes are built from, for Spot the Difference.
 * Each one is drawn in a 1 x 1 box (top left 0,0) and is scaled and placed by the scene.
 * `h` is a hue for the parts that can change colour; `v` picks a small detail (how many apples, which window, ...).
 */
export type ArtKey =
  | 'sun' | 'cloud' | 'tree' | 'flower' | 'butterfly' | 'bird' | 'kite' | 'balloon' | 'house' | 'blanket' | 'basket'
  | 'apple' | 'dog' | 'cow' | 'pig' | 'sheep' | 'chicken' | 'barn' | 'fence' | 'haystack' | 'tractor'
  | 'crab' | 'starfish' | 'shell' | 'umbrella' | 'beachball' | 'sandcastle' | 'sailboat' | 'fish' | 'palm' | 'kid'
  | 'planet' | 'rocket' | 'alien' | 'star' | 'moon' | 'ufo' | 'astronaut' | 'satellite'
  | 'castle' | 'mushroom' | 'lantern' | 'dragon' | 'lamp' | 'car'

type Draw = (p: { h: number; v: number }) => React.ReactNode
export type Art = {
  draw: Draw
  /** a colour part exists, so "a different colour" is a fair change */
  tint?: boolean
  /** looks different when turned around */
  flip?: boolean
  /** number of `v` details (0 or 1: none) */
  variants?: number
}

const OL = '#3b3b58'
const sw = 0.03
const fill = (h: number) => `hsl(${h} 80% 62%)`
const dark = (h: number) => `hsl(${h} 65% 40%)`
const o = { stroke: OL, strokeWidth: sw, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const ray = (i: number, r1: number, r2: number) => {
  const a = (i * 45 * Math.PI) / 180
  return <line key={i} x1={0.5 + Math.cos(a) * r1} y1={0.5 + Math.sin(a) * r1} x2={0.5 + Math.cos(a) * r2} y2={0.5 + Math.sin(a) * r2} stroke="#ffd43b" strokeWidth="0.07" strokeLinecap="round" />
}
const starPts = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180)
    const k = i % 2 === 0 ? R : r
    return `${cx + Math.cos(a) * k},${cy + Math.sin(a) * k}`
  }).join(' ')

export const ART: Record<ArtKey, Art> = {
  sun: {
    draw: () => (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ray(i, 0.34, 0.48))}
        <circle cx=".5" cy=".5" r=".28" fill="#ffd43b" {...o} />
        <circle cx=".42" cy=".46" r=".03" fill={OL} /><circle cx=".58" cy=".46" r=".03" fill={OL} />
        <path d="M.4 .57 Q.5 .66 .6 .57" fill="none" {...o} />
      </>
    ),
  },
  cloud: {
    draw: () => (
      <>
        <g fill="#fff" stroke="#9fb7d1" strokeWidth={sw}>
          <ellipse cx=".3" cy=".62" rx=".26" ry=".2" /><ellipse cx=".55" cy=".48" rx=".28" ry=".26" /><ellipse cx=".74" cy=".66" rx=".22" ry=".17" />
          <rect x=".28" y=".6" width=".46" height=".23" rx=".1" stroke="none" />
        </g>
      </>
    ),
  },
  tree: {
    variants: 4, // number of apples
    draw: ({ v }) => (
      <>
        <rect x=".42" y=".55" width=".16" height=".44" rx=".04" fill="#a8683a" {...o} />
        <g fill="#4fb36a" {...o}>
          <circle cx=".3" cy=".48" r=".25" /><circle cx=".7" cy=".48" r=".25" /><circle cx=".5" cy=".3" r=".3" />
        </g>
        <g fill="#4fb36a"><circle cx=".5" cy=".48" r=".25" /></g>
        {[[0.35, 0.34], [0.62, 0.28], [0.5, 0.52], [0.72, 0.5]].slice(0, v).map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r=".055" fill="#ef4444" {...o} /></g>
        ))}
      </>
    ),
  },
  flower: {
    tint: true,
    draw: ({ h }) => (
      <>
        <path d="M.5 .5 V1" stroke="#3f9b52" strokeWidth=".06" strokeLinecap="round" />
        <path d="M.5 .8 q-.2 -.1 -.25 -.25 q.2 0 .25 .25Z" fill="#4fb36a" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={0.5 + Math.cos((a * Math.PI) / 180) * 0.19} cy={0.3 + Math.sin((a * Math.PI) / 180) * 0.19} r=".14" fill={fill(h)} stroke={dark(h)} strokeWidth=".02" />
        ))}
        <circle cx=".5" cy=".3" r=".1" fill="#ffd43b" />
      </>
    ),
  },
  butterfly: {
    tint: true,
    draw: ({ h }) => (
      <>
        <ellipse cx=".28" cy=".4" rx=".26" ry=".22" fill={fill(h)} {...o} /><ellipse cx=".72" cy=".4" rx=".26" ry=".22" fill={fill(h)} {...o} />
        <ellipse cx=".32" cy=".68" rx=".17" ry=".15" fill={fill(h + 30)} {...o} /><ellipse cx=".68" cy=".68" rx=".17" ry=".15" fill={fill(h + 30)} {...o} />
        <rect x=".46" y=".25" width=".08" height=".6" rx=".04" fill={OL} />
        <path d="M.48 .27 q-.08 -.16 -.14 -.18 M.52 .27 q.08 -.16 .14 -.18" stroke={OL} strokeWidth=".025" fill="none" />
      </>
    ),
  },
  bird: {
    tint: true, flip: true,
    draw: ({ h }) => (
      <>
        <path d="M.15 .55 q.02 -.3 .35 -.3 q.3 0 .32 .3 q-.05 .28 -.34 .28 q-.28 0 -.33 -.28Z" fill={fill(h)} {...o} />
        <path d="M.82 .45 L.98 .5 L.82 .58Z" fill="#fb923c" {...o} />
        <path d="M.1 .5 L-.02 .4 L.04 .62Z" fill={dark(h)} {...o} />
        <path d="M.35 .55 q.12 -.18 .26 0 q-.12 .1 -.26 0Z" fill={fill(h + 25)} {...o} />
        <circle cx=".68" cy=".44" r=".04" fill={OL} />
      </>
    ),
  },
  kite: {
    tint: true,
    variants: 3, // bows on the tail
    draw: ({ h, v }) => (
      <>
        <path d="M.5 .02 L.82 .3 L.5 .62 L.18 .3Z" fill={fill(h)} {...o} />
        <path d="M.5 .02 V.62 M.18 .3 H.82" stroke={dark(h)} strokeWidth=".02" />
        <path d="M.5 .62 q.08 .1 0 .18 q-.1 .1 0 .2" fill="none" stroke={OL} strokeWidth=".025" />
        {Array.from({ length: v + 1 }, (_, i) => (
          <g key={i}><path d={`M${0.42 - 0.0} ${0.74 + i * 0.1} l.16 .03 l-.16 .03Z`} fill={fill(h + 120)} /></g>
        ))}
      </>
    ),
  },
  balloon: {
    tint: true,
    variants: 2, // a highlight stripe or not
    draw: ({ h, v }) => (
      <>
        <path d="M.5 .72 q-.02 .14 .04 .28" fill="none" stroke={OL} strokeWidth=".025" />
        <ellipse cx=".5" cy=".38" rx=".3" ry=".36" fill={fill(h)} {...o} />
        <path d="M.46 .72 L.54 .72 L.5 .8Z" fill={dark(h)} />
        {v === 1 && <path d="M.5 .04 q-.2 .34 0 .68 M.5 .04 q.2 .34 0 .68" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth=".04" />}
        <ellipse cx=".38" cy=".26" rx=".05" ry=".09" fill="#fff" fillOpacity=".55" />
      </>
    ),
  },
  house: {
    tint: true,
    variants: 3, // round window, square window, two windows
    draw: ({ h, v }) => (
      <>
        <rect x=".12" y=".42" width=".76" height=".56" fill="#fff3d6" {...o} />
        <path d="M.04 .45 L.5 .06 L.96 .45Z" fill={fill(h)} {...o} />
        <rect x=".42" y=".68" width=".16" height=".3" rx=".04" fill="#a8683a" {...o} />
        {v === 0 && <circle cx=".26" cy=".6" r=".08" fill="#bfe6ff" {...o} />}
        {v === 1 && <rect x=".18" y=".52" width=".16" height=".16" fill="#bfe6ff" {...o} />}
        {v === 2 && (
          <>
            <rect x=".17" y=".52" width=".15" height=".15" fill="#bfe6ff" {...o} />
            <rect x=".68" y=".52" width=".15" height=".15" fill="#bfe6ff" {...o} />
          </>
        )}
        <rect x=".7" y=".14" width=".1" height=".18" fill={dark(h)} {...o} />
      </>
    ),
  },
  blanket: {
    tint: true,
    variants: 2, // stripes or dots
    draw: ({ h, v }) => (
      <>
        <path d="M.18 .1 L.82 .1 L1 .9 L0 .9Z" fill={fill(h)} {...o} />
        {v === 0 ? (
          <path d="M.34 .1 L.24 .9 M.5 .1 L.5 .9 M.66 .1 L.76 .9" stroke="#fff" strokeOpacity=".75" strokeWidth=".06" />
        ) : (
          [[.3, .3], [.5, .3], [.7, .3], [.22, .65], [.42, .65], [.62, .65], [.8, .65]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".05" fill="#fff" fillOpacity=".8" />)
        )}
      </>
    ),
  },
  basket: {
    draw: () => (
      <>
        <path d="M.12 .45 q.38 -.5 .76 0" fill="none" stroke="#8a5a2b" strokeWidth=".06" strokeLinecap="round" />
        <path d="M.04 .45 H.96 L.86 .95 H.14Z" fill="#c98a4b" {...o} />
        <path d="M.1 .62 H.9 M.13 .78 H.87" stroke="#8a5a2b" strokeWidth=".03" />
        <circle cx=".35" cy=".4" r=".07" fill="#ef4444" /><circle cx=".55" cy=".38" r=".07" fill="#facc15" />
      </>
    ),
  },
  apple: {
    tint: true,
    draw: ({ h }) => (
      <>
        <circle cx=".5" cy=".58" r=".38" fill={fill(h)} {...o} />
        <path d="M.5 .2 q.02 -.12 .1 -.16" stroke="#6b4423" strokeWidth=".05" fill="none" strokeLinecap="round" />
        <path d="M.52 .2 q.18 -.16 .3 -.04 q-.14 .12 -.3 .04Z" fill="#4fb36a" />
        <ellipse cx=".36" cy=".48" rx=".06" ry=".1" fill="#fff" fillOpacity=".5" />
      </>
    ),
  },
  dog: {
    flip: true, variants: 2, // a patch on the back or not
    draw: ({ v }) => (
      <>
        <path d="M.78 .5 q.18 -.12 .14 -.3" stroke="#d9a066" strokeWidth=".08" fill="none" strokeLinecap="round" />
        <ellipse cx=".55" cy=".6" rx=".32" ry=".2" fill="#d9a066" {...o} />
        {v === 1 && <ellipse cx=".6" cy=".55" rx=".11" ry=".08" fill="#8a5a2b" />}
        <rect x=".3" y=".72" width=".08" height=".22" rx=".04" fill="#d9a066" {...o} /><rect x=".66" y=".72" width=".08" height=".22" rx=".04" fill="#d9a066" {...o} />
        <circle cx=".24" cy=".42" r=".17" fill="#d9a066" {...o} />
        <ellipse cx=".12" cy=".34" rx=".06" ry=".12" fill="#a8683a" transform="rotate(-20 .12 .34)" {...o} />
        <circle cx=".2" cy=".4" r=".022" fill={OL} /><ellipse cx=".1" cy=".47" rx=".035" ry=".03" fill={OL} />
      </>
    ),
  },
  cow: {
    flip: true, variants: 3, // spots
    draw: ({ v }) => (
      <>
        <ellipse cx=".55" cy=".52" rx=".34" ry=".24" fill="#fff" {...o} />
        <rect x=".3" y=".66" width=".08" height=".28" rx=".03" fill="#fff" {...o} /><rect x=".7" y=".66" width=".08" height=".28" rx=".03" fill="#fff" {...o} />
        <ellipse cx=".2" cy=".42" rx=".16" ry=".15" fill="#fff" {...o} /><ellipse cx=".12" cy=".5" rx=".1" ry=".07" fill="#f9a8b8" {...o} />
        <path d="M.14 .27 L.12 .17 M.26 .27 L.3 .17" stroke={OL} strokeWidth=".03" />
        <circle cx=".2" cy=".38" r=".02" fill={OL} />
        <path d="M.88 .46 q.1 .1 .04 .28" stroke={OL} strokeWidth=".03" fill="none" />
        {[[.5, .45, .08], [.66, .56, .07], [.42, .6, .05]].slice(0, v + 1).map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#3b3b58" />)}
      </>
    ),
  },
  pig: {
    flip: true,
    draw: () => (
      <>
        <ellipse cx=".55" cy=".55" rx=".34" ry=".26" fill="#ffb3c6" {...o} />
        <rect x=".35" y=".72" width=".08" height=".2" rx=".03" fill="#ffb3c6" {...o} /><rect x=".68" y=".72" width=".08" height=".2" rx=".03" fill="#ffb3c6" {...o} />
        <circle cx=".22" cy=".5" r=".18" fill="#ffb3c6" {...o} /><ellipse cx=".1" cy=".54" rx=".07" ry=".06" fill="#ff8fa3" {...o} />
        <path d="M.18 .36 L.14 .26 L.26 .32Z" fill="#ff8fa3" {...o} /><circle cx=".2" cy=".47" r=".022" fill={OL} />
        <path d="M.88 .5 q.08 -.08 .02 -.14 q-.06 .06 .04 .1" fill="none" stroke={OL} strokeWidth=".03" />
      </>
    ),
  },
  sheep: {
    flip: true,
    draw: () => (
      <>
        <rect x=".3" y=".66" width=".07" height=".28" rx=".03" fill="#3b3b58" /><rect x=".62" y=".66" width=".07" height=".28" rx=".03" fill="#3b3b58" />
        <g fill="#fff" {...o}><circle cx=".35" cy=".5" r=".2" /><circle cx=".58" cy=".44" r=".22" /><circle cx=".72" cy=".56" r=".18" /><circle cx=".5" cy=".6" r=".2" /></g>
        <g fill="#fff"><circle cx=".5" cy=".52" r=".22" /></g>
        <ellipse cx=".16" cy=".48" rx=".11" ry=".13" fill="#3b3b58" /><circle cx=".13" cy=".44" r=".018" fill="#fff" />
      </>
    ),
  },
  chicken: {
    flip: true, variants: 2, // comb colour
    draw: ({ v }) => (
      <>
        <path d="M.2 .5 q0 -.3 .3 -.3 q.34 0 .38 .36 q-.04 .3 -.34 .3 q-.34 0 -.34 -.36Z" fill="#fff" {...o} />
        <path d="M.34 .22 q-.02 -.14 .06 -.14 q.04 .08 .08 0 q.08 0 .06 .14Z" fill={v ? '#facc15' : '#ef4444'} {...o} />
        <path d="M.1 .36 L.2 .32 L.2 .42Z" fill="#fb923c" {...o} /><circle cx=".28" cy=".32" r=".025" fill={OL} />
        <path d="M.88 .5 q.1 -.2 .06 -.3 q-.1 .1 -.1 .3" fill="#e5e7eb" {...o} />
        <path d="M.4 .84 V.96 M.58 .84 V.96" stroke="#fb923c" strokeWidth=".04" />
      </>
    ),
  },
  barn: {
    tint: true, variants: 2, // cross on the door, or plain
    draw: ({ h, v }) => (
      <>
        <path d="M.06 .4 L.5 .08 L.94 .4 V.96 H.06Z" fill={fill(h)} {...o} />
        <path d="M.02 .42 L.5 .04 L.98 .42" fill="none" stroke="#fff" strokeWidth=".06" />
        <rect x=".32" y=".55" width=".36" height=".41" fill="#fff" {...o} />
        {v === 0 && <path d="M.32 .55 L.68 .96 M.68 .55 L.32 .96" stroke={dark(h)} strokeWidth=".04" />}
        {v === 1 && <path d="M.5 .55 V.96" stroke={dark(h)} strokeWidth=".04" />}
        <circle cx=".5" cy=".3" r=".07" fill="#fff" {...o} />
      </>
    ),
  },
  fence: {
    draw: () => (
      <>
        <path d="M0 .42 H1 M0 .66 H1" stroke="#c98a4b" strokeWidth=".1" />
        {[0.1, 0.36, 0.62, 0.88].map((x) => <rect key={x} x={x - 0.06} y=".2" width=".12" height=".74" rx=".03" fill="#e0a566" {...o} />)}
      </>
    ),
  },
  haystack: {
    draw: () => (
      <>
        <path d="M.04 .96 q-.02 -.6 .46 -.76 q.5 .16 .46 .76Z" fill="#f2c94c" {...o} />
        <path d="M.3 .8 L.4 .4 M.55 .85 L.6 .35 M.76 .8 L.7 .5" stroke="#c99a1c" strokeWidth=".03" />
      </>
    ),
  },
  tractor: {
    tint: true, flip: true, variants: 2, // chimney
    draw: ({ h, v }) => (
      <>
        {v === 1 && <rect x=".58" y=".08" width=".07" height=".24" fill="#555" {...o} />}
        <rect x=".4" y=".28" width=".34" height=".3" rx=".05" fill="#bfe6ff" {...o} />
        <rect x=".06" y=".4" width=".56" height=".28" rx=".06" fill={fill(h)} {...o} />
        <circle cx=".26" cy=".78" r=".2" fill="#3b3b58" /><circle cx=".26" cy=".78" r=".08" fill="#facc15" />
        <circle cx=".78" cy=".84" r=".13" fill="#3b3b58" /><circle cx=".78" cy=".84" r=".05" fill="#facc15" />
      </>
    ),
  },
  crab: {
    tint: true, variants: 2, // claws up or down
    draw: ({ h, v }) => (
      <>
        <path d={v ? 'M.2 .5 q-.16 -.1 -.1 -.3 M.8 .5 q.16 -.1 .1 -.3' : 'M.2 .55 q-.2 .1 -.14 .3 M.8 .55 q.2 .1 .14 .3'} fill="none" stroke={fill(h)} strokeWidth=".08" strokeLinecap="round" />
        <circle cx={v ? 0.1 : 0.06} cy={v ? 0.2 : 0.86} r=".08" fill={fill(h)} {...o} /><circle cx={v ? 0.9 : 0.94} cy={v ? 0.2 : 0.86} r=".08" fill={fill(h)} {...o} />
        <ellipse cx=".5" cy=".6" rx=".34" ry=".24" fill={fill(h)} {...o} />
        <path d="M.22 .74 l-.1 .14 M.34 .8 l-.06 .14 M.66 .8 l.06 .14 M.78 .74 l.1 .14" stroke={OL} strokeWidth=".03" />
        <circle cx=".4" cy=".34" r=".05" fill="#fff" {...o} /><circle cx=".6" cy=".34" r=".05" fill="#fff" {...o} />
        <circle cx=".4" cy=".34" r=".02" fill={OL} /><circle cx=".6" cy=".34" r=".02" fill={OL} />
      </>
    ),
  },
  starfish: {
    tint: true,
    draw: ({ h }) => (
      <>
        <polygon points={starPts(0.5, 0.52, 0.5, 0.2)} fill={fill(h)} {...o} />
        <circle cx=".5" cy=".52" r=".03" fill={dark(h)} /><circle cx=".42" cy=".4" r=".02" fill={dark(h)} /><circle cx=".6" cy=".4" r=".02" fill={dark(h)} />
      </>
    ),
  },
  shell: {
    draw: () => (
      <>
        <path d="M.5 .92 L.08 .4 q.42 -.5 .84 0Z" fill="#ffd7c2" {...o} />
        <path d="M.5 .92 L.3 .2 M.5 .92 V.14 M.5 .92 L.7 .2" stroke="#e8a98c" strokeWidth=".03" />
      </>
    ),
  },
  umbrella: {
    tint: true, variants: 2, // plain or striped
    draw: ({ h, v }) => (
      <>
        <path d="M.5 .3 V.97" stroke="#8a5a2b" strokeWidth=".05" strokeLinecap="round" />
        <path d="M.02 .46 q.04 -.44 .48 -.44 q.44 0 .48 .44 q-.12 -.1 -.24 0 q-.12 -.1 -.24 0 q-.12 -.1 -.24 0 q-.12 -.1 -.24 0Z" fill={fill(h)} {...o} />
        {v === 1 && <path d="M.5 .04 Q.3 .2 .26 .44 M.5 .04 Q.7 .2 .74 .44" stroke="#fff" strokeWidth=".06" fill="none" />}
      </>
    ),
  },
  beachball: {
    tint: true, variants: 2, // star or no star
    draw: ({ h, v }) => (
      <>
        <circle cx=".5" cy=".5" r=".46" fill="#fff" {...o} />
        <path d="M.5 .04 Q.3 .5 .5 .96 L.7 .9 Q.5 .5 .7 .1Z" fill={fill(h)} />
        <path d="M.04 .5 Q.5 .4 .96 .5 L.9 .66 Q.5 .56 .1 .66Z" fill={fill(h + 150)} opacity=".8" />
        <circle cx=".5" cy=".5" r=".46" fill="none" {...o} />
        {v === 1 && <polygon points={starPts(0.5, 0.5, 0.1, 0.045)} fill="#ffd43b" />}
      </>
    ),
  },
  sandcastle: {
    variants: 2, // one flag or two
    draw: ({ v }) => (
      <>
        <rect x=".08" y=".56" width=".84" height=".4" fill="#e8c27c" {...o} />
        <rect x=".12" y=".34" width=".22" height=".24" fill="#e8c27c" {...o} /><rect x=".66" y=".34" width=".22" height=".24" fill="#e8c27c" {...o} />
        <rect x=".38" y=".4" width=".24" height=".18" fill="#e8c27c" {...o} />
        <path d="M.23 .34 V.08 l.16 .05 l-.16 .05" fill="#ef4444" stroke={OL} strokeWidth=".025" />
        {v === 1 && <path d="M.77 .34 V.08 l.16 .05 l-.16 .05" fill="#6cc3f5" stroke={OL} strokeWidth=".025" />}
        <path d="M.44 .96 V.78 q.06 -.1 .12 0 V.96Z" fill="#b98b44" />
      </>
    ),
  },
  sailboat: {
    tint: true, flip: true,
    draw: ({ h }) => (
      <>
        <path d="M.5 .06 V.74" stroke={OL} strokeWidth=".04" />
        <path d="M.54 .1 Q.9 .4 .86 .68 H.54Z" fill={fill(h)} {...o} />
        <path d="M.46 .22 Q.2 .46 .16 .68 H.46Z" fill="#fff" {...o} />
        <path d="M.08 .74 H.92 L.78 .94 H.22Z" fill="#a8683a" {...o} />
        <path d="M.5 .06 l.12 .04 l-.12 .06Z" fill="#ef4444" />
      </>
    ),
  },
  fish: {
    tint: true, flip: true, variants: 2, // stripes
    draw: ({ h, v }) => (
      <>
        <path d="M.78 .5 L.98 .3 V.7Z" fill={dark(h)} {...o} />
        <ellipse cx=".46" cy=".5" rx=".4" ry=".26" fill={fill(h)} {...o} />
        {v === 1 && <path d="M.42 .26 Q.5 .5 .42 .74 M.58 .28 Q.66 .5 .58 .72" stroke="#fff" strokeWidth=".05" fill="none" />}
        <circle cx=".24" cy=".44" r=".05" fill="#fff" {...o} /><circle cx=".23" cy=".44" r=".02" fill={OL} />
        <path d="M.1 .56 q.04 .04 .08 0" stroke={OL} strokeWidth=".025" fill="none" />
      </>
    ),
  },
  palm: {
    variants: 3, // coconuts
    draw: ({ v }) => (
      <>
        <path d="M.5 .98 Q.58 .6 .46 .3" stroke="#a8683a" strokeWidth=".1" fill="none" strokeLinecap="round" />
        <g fill="#3fa35c" {...o}>
          <path d="M.46 .3 Q.1 .1 .02 .34 Q.3 .22 .46 .3Z" /><path d="M.46 .3 Q.2 -.02 .0 .1 Q.3 .08 .46 .3Z" />
          <path d="M.46 .3 Q.8 .1 .98 .34 Q.7 .22 .46 .3Z" /><path d="M.46 .3 Q.76 -.02 .96 .1 Q.66 .08 .46 .3Z" />
          <path d="M.46 .3 Q.46 .0 .56 -.0 Q.5 .15 .46 .3Z" />
        </g>
        {[[.4, .36], [.52, .36], [.46, .44]].slice(0, v).map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".05" fill="#7a4a22" />)}
      </>
    ),
  },
  kid: {
    tint: true,
    draw: ({ h }) => (
      <>
        <rect x=".26" y=".5" width=".48" height=".42" rx=".16" fill="#ff7b7b" {...o} />
        <circle cx=".5" cy=".34" r=".22" fill="#ffd9b0" {...o} />
        <path d="M.22 .3 Q.5 -.12 .78 .3 Q.5 .2 .22 .3Z" fill={fill(h)} {...o} />
        <circle cx=".42" cy=".36" r=".022" fill={OL} /><circle cx=".6" cy=".36" r=".022" fill={OL} />
        <path d="M.43 .44 q.08 .06 .16 0" fill="none" stroke={OL} strokeWidth=".025" />
      </>
    ),
  },
  planet: {
    tint: true, variants: 2, // with a ring or not
    draw: ({ h, v }) => (
      <>
        <circle cx=".5" cy=".5" r=".34" fill={fill(h)} {...o} />
        <circle cx=".4" cy=".4" r=".06" fill={dark(h)} opacity=".5" /><circle cx=".6" cy=".6" r=".08" fill={dark(h)} opacity=".5" />
        {v === 1 && <ellipse cx=".5" cy=".5" rx=".5" ry=".13" fill="none" stroke="#ffe29a" strokeWidth=".05" transform="rotate(-20 .5 .5)" />}
      </>
    ),
  },
  rocket: {
    tint: true, variants: 3, // windows
    draw: ({ h, v }) => (
      <>
        <path d="M.5 .02 Q.76 .22 .72 .66 H.28 Q.24 .22 .5 .02Z" fill="#fff" {...o} />
        <path d="M.5 .02 Q.62 .1 .66 .2 H.34 Q.38 .1 .5 .02Z" fill={fill(h)} {...o} />
        <path d="M.28 .5 L.12 .8 L.28 .72Z M.72 .5 L.88 .8 L.72 .72Z" fill={fill(h)} {...o} />
        {Array.from({ length: v + 1 }, (_, i) => <circle key={i} cx=".5" cy={0.34 + i * 0.12} r=".05" fill="#bfe6ff" {...o} />)}
        <path d="M.38 .66 Q.5 1 .62 .66Z" fill="#ffb703" {...o} />
      </>
    ),
  },
  alien: {
    tint: true, variants: 2, // two eyes or three
    draw: ({ h, v }) => (
      <>
        <path d="M.34 .2 L.28 .02 M.66 .2 L.72 .02" stroke={OL} strokeWidth=".03" /><circle cx=".28" cy=".02" r=".04" fill={fill(h + 90)} /><circle cx=".72" cy=".02" r=".04" fill={fill(h + 90)} />
        <ellipse cx=".5" cy=".42" rx=".34" ry=".3" fill={fill(h)} {...o} />
        <rect x=".32" y=".68" width=".36" height=".24" rx=".1" fill={fill(h)} {...o} />
        {(v === 0 ? [0.38, 0.62] : [0.32, 0.5, 0.68]).map((x, i) => <g key={i}><circle cx={x} cy=".4" r=".06" fill="#fff" {...o} /><circle cx={x} cy=".4" r=".025" fill={OL} /></g>)}
        <path d="M.42 .56 q.08 .06 .16 0" fill="none" stroke={OL} strokeWidth=".025" />
      </>
    ),
  },
  star: {
    tint: true,
    draw: ({ h }) => <polygon points={starPts(0.5, 0.53, 0.5, 0.22)} fill={fill(h)} {...o} />,
  },
  moon: {
    draw: () => (
      <>
        <path d="M.7 .08 A.42 .42 0 1 0 .92 .66 A.34 .34 0 1 1 .7 .08Z" fill="#fde68a" {...o} />
        <circle cx=".3" cy=".6" r=".05" fill="#f2cf63" />
      </>
    ),
  },
  ufo: {
    tint: true, variants: 2, // lights
    draw: ({ h, v }) => (
      <>
        <path d="M.3 .46 Q.5 -.06 .7 .46Z" fill="#bfe6ff" {...o} />
        <ellipse cx=".5" cy=".56" rx=".48" ry=".18" fill={fill(h)} {...o} />
        {(v === 0 ? [0.26, 0.5, 0.74] : [0.2, 0.37, 0.63, 0.8]).map((x, i) => <circle key={i} cx={x} cy=".6" r=".035" fill="#ffd43b" />)}
        <path d="M.34 .74 L.28 .96 M.66 .74 L.72 .96" stroke={OL} strokeWidth=".03" />
      </>
    ),
  },
  astronaut: {
    flip: true,
    draw: () => (
      <>
        <rect x=".26" y=".46" width=".48" height=".4" rx=".14" fill="#fff" {...o} />
        <rect x=".3" y=".84" width=".14" height=".14" rx=".04" fill="#fff" {...o} /><rect x=".56" y=".84" width=".14" height=".14" rx=".04" fill="#fff" {...o} />
        <circle cx=".5" cy=".28" r=".24" fill="#fff" {...o} />
        <ellipse cx=".5" cy=".28" rx=".16" ry=".13" fill="#2f5fa8" {...o} /><ellipse cx=".45" cy=".25" rx=".04" ry=".03" fill="#fff" opacity=".7" />
        <rect x=".42" y=".56" width=".16" height=".12" rx=".03" fill="#6cc3f5" {...o} />
        <path d="M.26 .52 L.1 .62 M.74 .52 L.9 .4" stroke="#fff" strokeWidth=".1" strokeLinecap="round" />
      </>
    ),
  },
  satellite: {
    tint: true, variants: 2, // dish
    draw: ({ h, v }) => (
      <>
        <rect x=".36" y=".36" width=".28" height=".28" rx=".05" fill="#e5e7eb" {...o} />
        <rect x=".0" y=".4" width=".3" height=".2" fill={fill(h)} {...o} /><rect x=".7" y=".4" width=".3" height=".2" fill={fill(h)} {...o} />
        <path d="M.1 .4 V.6 M.2 .4 V.6 M.8 .4 V.6 M.9 .4 V.6" stroke="#fff" strokeWidth=".02" />
        {v === 1 && <path d="M.5 .36 V.2 q-.14 -.02 -.14 -.14 q.28 0 .28 .14 q0 .0 -.14 .0" fill="#e5e7eb" {...o} />}
      </>
    ),
  },
  castle: {
    tint: true, variants: 3, // windows
    draw: ({ h, v }) => (
      <>
        <rect x=".1" y=".42" width=".8" height=".56" fill="#e7e1f5" {...o} />
        <rect x=".0" y=".3" width=".24" height=".68" fill="#d9d1ee" {...o} /><rect x=".76" y=".3" width=".24" height=".68" fill="#d9d1ee" {...o} />
        <rect x=".36" y=".14" width=".28" height=".5" fill="#d9d1ee" {...o} />
        <path d="M-.02 .32 L.12 .1 L.26 .32Z M.74 .32 L.88 .1 L1.02 .32Z M.34 .16 L.5 -.08 L.66 .16Z" fill={fill(h)} {...o} />
        <path d="M.5 -.08 V-.2 l.14 .04 l-.14 .06" fill="#ef4444" stroke={OL} strokeWidth=".02" transform="translate(0 .2)" />
        <path d="M.4 .98 V.78 q.1 -.16 .2 0 V.98Z" fill="#8a5a2b" {...o} />
        {[[.12, .5], [.88, .5], [.5, .34]].slice(0, v + 1).map(([x, y], i) => <rect key={i} x={x - 0.04} y={y} width=".08" height=".12" rx=".03" fill="#6cc3f5" {...o} />)}
      </>
    ),
  },
  mushroom: {
    tint: true, variants: 2, // dots
    draw: ({ h, v }) => (
      <>
        <rect x=".36" y=".5" width=".28" height=".46" rx=".1" fill="#fff3d6" {...o} />
        <path d="M.02 .56 Q.02 .06 .5 .06 Q.98 .06 .98 .56Z" fill={fill(h)} {...o} />
        {(v === 0 ? [[.3, .3], [.62, .22], [.76, .42]] : [[.3, .3], [.62, .22]]).map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".07" fill="#fff" />)}
      </>
    ),
  },
  lantern: {
    tint: true,
    draw: ({ h }) => (
      <>
        <path d="M.5 0 V.16" stroke={OL} strokeWidth=".04" />
        <path d="M.3 .2 H.7 L.8 .4 Q.84 .66 .7 .86 H.3 Q.16 .66 .2 .4Z" fill={fill(h)} {...o} />
        <rect x=".28" y=".14" width=".44" height=".08" rx=".03" fill={dark(h)} {...o} /><rect x=".28" y=".84" width=".44" height=".08" rx=".03" fill={dark(h)} {...o} />
        <ellipse cx=".5" cy=".52" rx=".1" ry=".16" fill="#fff3b0" />
      </>
    ),
  },
  dragon: {
    tint: true, flip: true, variants: 2, // wing up / down
    draw: ({ h, v }) => (
      <>
        <path d="M.9 .76 q.1 -.1 .08 -.3" stroke={fill(h)} strokeWidth=".1" fill="none" strokeLinecap="round" />
        <path d={v === 0 ? 'M.5 .5 L.4 .1 L.7 .4Z' : 'M.5 .56 L.34 .82 L.72 .7Z'} fill={fill(h + 40)} {...o} />
        <ellipse cx=".56" cy=".64" rx=".32" ry=".2" fill={fill(h)} {...o} />
        <rect x=".38" y=".78" width=".08" height=".18" rx=".03" fill={fill(h)} {...o} /><rect x=".66" y=".78" width=".08" height=".18" rx=".03" fill={fill(h)} {...o} />
        <circle cx=".2" cy=".48" r=".17" fill={fill(h)} {...o} /><path d="M.12 .34 L.16 .22 L.22 .34 M.24 .34 L.3 .22 L.32 .36" fill={fill(h + 40)} {...o} />
        <circle cx=".16" cy=".44" r=".022" fill={OL} /><circle cx=".06" cy=".52" r=".015" fill={OL} />
      </>
    ),
  },
  lamp: {
    variants: 2, // light on or off
    draw: ({ v }) => (
      <>
        <rect x=".44" y=".3" width=".12" height=".68" fill="#4b5563" {...o} /><rect x=".34" y=".92" width=".32" height=".08" rx=".03" fill="#4b5563" {...o} />
        {v === 1 && <circle cx=".5" cy=".16" r=".26" fill="#fff3b0" opacity=".6" />}
        <rect x=".36" y=".04" width=".28" height=".26" rx=".06" fill={v === 1 ? '#ffe066' : '#d1d5db'} {...o} />
        <path d="M.32 .06 H.68" stroke="#4b5563" strokeWidth=".05" />
      </>
    ),
  },
  car: {
    tint: true, flip: true, variants: 2, // roof box
    draw: ({ h, v }) => (
      <>
        <path d="M.04 .66 V.5 Q.04 .42 .14 .4 L.3 .3 H.68 L.84 .42 Q.96 .44 .96 .56 V.66Z" fill={fill(h)} {...o} />
        <path d="M.32 .34 H.5 V.46 H.2Z M.55 .34 H.66 L.78 .46 H.55Z" fill="#bfe6ff" {...o} />
        {v === 1 && <rect x=".4" y=".16" width=".2" height=".14" rx=".03" fill="#ffd43b" {...o} />}
        <circle cx=".26" cy=".7" r=".13" fill="#3b3b58" /><circle cx=".74" cy=".7" r=".13" fill="#3b3b58" /><circle cx=".26" cy=".7" r=".05" fill="#e5e7eb" /><circle cx=".74" cy=".7" r=".05" fill="#e5e7eb" />
      </>
    ),
  },
}
