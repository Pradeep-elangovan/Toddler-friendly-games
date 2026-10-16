# Toddler Friendly Games

Offline-first React + Vite + TypeScript app with two playable games: **Pattern Match** and **Tile Match**.

## Home screen

- Two big cards start the games. "Sound Match" is a placeholder for a future game.
- Top left: a **colour / black-and-white** switch. Black-and-white turns the whole app grey (including confetti), which is handy for calmer play or for practising telling icons apart by shape only.
- Top right: a **sound on / off** switch.
- Both choices are remembered on the device (in the browser's local storage only; nothing is sent anywhere).

## Pattern Match

There are 10 levels. Every level shows **one reference icon** at the top, then a set of options:

| Level | Options shown | Match the reference | Wrong |
| ----- | ------------- | ------------------- | ----- |
| 1     | 2             | 1                   | 1     |
| 2     | 3             | 2                   | 1     |
| 3     | 4             | 3                   | 1     |
| ...   | ...           | ...                 | ...   |
| 10    | 11            | 10                  | 1     |

The child taps every option that matches the reference. The reference icon is random each level, and the wrong icon is always a different one.

## Tile Match

A mahjong-style board of icon tiles (4 x 4). Tap one tile, then another tile with the **same icon**, and both disappear. Clear the whole board to finish the level. There are 3 levels; the board stays the same size, but the icons get harder to tell apart:

1. **Easy:** only 4 very different icons, so there are lots of matches to find.
2. **Medium:** 8 different icons to look through.
3. **Hard:** look-alikes: four yellow faces (smile, sleepy, surprised, wink) and two faces-in-stars that differ only in small details.

A wrong pair just wobbles and both tiles go back, so there is no penalty. To change the board size or the icon pools, edit `tileLevels` in `src/gameData.ts`.

## Toddler-friendly details

- Big, colourful icons and large tap targets; almost no reading needed.
- Gentle feedback: a rising happy sound for each correct tap, a soft "boop" and wobble for a wrong tap, stars fill up as matches are found.
- If a child pauses for a few seconds, a match softly pulses as a hint.
- Progress dots at the top instead of text; confetti and a cheer after each level.
- The Home button inside a game must be **held** for a moment, so little fingers can't leave by accident.
- Respects "reduce motion". Sounds are generated in the browser (Web Audio), so there are no audio files to download.

## Run locally

1. `npm install`
2. `npm run dev`
3. Open the local URL shown (usually <http://localhost:5173>)

## Build and preview

1. `npm run build`
2. `npm run preview`
3. Visit the preview URL. After the first online load, the app is cached and works offline on reload.

## Notes

- Game progress is kept in memory only: refreshing the page goes back to the home screen and level 1. Only the colour and sound switches are remembered.
- Offline: `public/sw.js` registers only in production builds. Pages are fetched network-first (new deploys show up straight away) and fall back to the cache when offline. Built assets are cached as they are fetched. Bump `CACHE_NAME` in `sw.js` if the caching strategy changes.
- No analytics, accounts, payments, or external tracking.

## Code map

- `src/gameData.ts`: Pattern Match levels (`makeRound`), Tile Match levels (`tileLevels`, `makeTiles`), home cards
- `src/icons.tsx`: the colourful SVG icons (11 main icons plus the look-alike faces/stars for Tile Match level 3)
- `src/ui.tsx`: shared buttons and glyphs (hold-to-exit button, colour and sound icons) and the saved on/off settings
- `src/sound.ts`: sound effects
- `src/App.tsx`: home, Pattern Match, finish screen, and the colour / sound switches
- `src/TileGame.tsx`: the Tile Match game
- `src/styles.css`: styling and animations
