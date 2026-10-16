# Toddler Friendly Games

Offline-first React + Vite + TypeScript app. Currently one playable game: **Pattern Match**.

## How Pattern Match works

There are 10 levels. Every level shows **one reference icon** at the top, then a set of options:

| Level | Options shown | Match the reference | Wrong |
| ----- | ------------- | ------------------- | ----- |
| 1     | 2             | 1                   | 1     |
| 2     | 3             | 2                   | 1     |
| 3     | 4             | 3                   | 1     |
| ...   | ...           | ...                 | ...   |
| 10    | 11            | 10                  | 1     |

The child taps every option that matches the reference. The reference icon is random each level, and the wrong icon is always a different one.

### Toddler-friendly details

- Big, colourful icons and large tap targets; almost no reading needed.
- Gentle feedback: a rising happy sound for each correct tap, a soft "boop" and wobble for a wrong tap (the wrong option fades so the next try is easier), stars fill up as matches are found.
- If a child pauses for a few seconds, the remaining matches softly pulse as a hint.
- Progress dots at the top instead of text; confetti and a cheer after each level.
- The Home button inside a game must be **held** for a moment, so little fingers can't leave by accident.
- Sound can be muted with the speaker button. Respects "reduce motion".
- Sounds are generated in the browser (Web Audio), so there are no audio files to download.

## Run locally

1. `npm install`
2. `npm run dev`
3. Open the local URL shown (usually <http://localhost:5173>)

## Build and preview

1. `npm run build`
2. `npm run preview`
3. Visit the preview URL. After the first online load, the app is cached and works offline on reload.

## Notes

- Progress is kept in memory only. Refreshing the page resets to level 1.
- Offline: `public/sw.js` registers only in production builds. Pages are fetched network-first (new deploys show up straight away) and fall back to the cache when offline. Built assets are cached as they are fetched. Bump `CACHE_NAME` in `sw.js` if the caching strategy changes.
- No analytics, accounts, payments, or external tracking.

## Code map

- `src/gameData.ts`: levels, `makeRound()` (builds the reference + matching + wrong options), home cards
- `src/icons.tsx`: the 11 colourful SVG icons
- `src/sound.ts`: sound effects
- `src/App.tsx`: screens (home, game, winner) and game flow
- `src/styles.css`: styling and animations
