# Toddler Friendly Games

Offline-first React + Vite + TypeScript app with seven playable games: **Pattern Match**, **Tile Match**, **Fruit Sort**, **Counting**, **Memory Match**, **Clock Time** and **Missing Letter**.

## Home screen

- Seven big cards start the games.
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

**Mistakes end the run.** If the child taps the one that doesn't match, that tile turns red with a cross and a soft sad sound plays. Then an "Oops!" screen shows the level they reached, with a big Home button. Playing again from Home starts back at level 1. (Tile Match is gentler: wrong pairs just wobble and the child tries again.)

## Tile Match

A mahjong-style board of icon tiles. Tap one tile, then another tile with the **same icon**, and both disappear. Clear the whole board to finish the level. There are 5 levels. The first three keep the same 4 x 4 board and get harder only because the icons are harder to tell apart; levels 4 and 5 then add more tiles as well:

| Level | Board | Tiles | Different icons | What makes it harder |
| ----- | ----- | ----- | --------------- | -------------------- |
| 1     | 4 x 4 | 16    | 4               | Only very different icons, lots of repeats |
| 2     | 4 x 4 | 16    | 8               | More icons to look through |
| 3     | 4 x 4 | 16    | 6               | Look-alikes: four yellow faces and two faces-in-stars that differ only in small details |
| 4     | 5 x 5 | 24    | 12              | Bigger board (the centre cell is left empty so the tiles still pair up); look-alikes mixed with ordinary icons, each icon only twice |
| 5     | 6 x 6 | 36    | 18              | The biggest board; almost every icon in the game, including the look-alike faces (smile, sleepy, surprised, wink, cool, laughing, crying) and both stars, each exactly twice |

A wrong pair just wobbles and both tiles go back, so there is no penalty. To change the board size or the icon pools, edit `tileLevels` in `src/gameData.ts` (an odd `size` automatically leaves the centre cell empty).

## Fruit Sort

Drag and drop fruit into the matching bucket. Fruit start jumbled on a table; each bucket shows the fruit it takes.

| Level | Fruit | Buckets |
| --- | --- | --- |
| 1 | 6 | 2 |
| 2 | 12 | 3 |
| 3 | 18 | 3 |
| 4 | 24 | 4 |
| 5 | 30 | 5 |

Only the number of fruit and buckets grows. A fruit can be dropped into the wrong bucket, but the bucket can't digest it: it shakes, makes a yucky sound, puffs, and throws the fruit out in a random direction onto the table, never into its pile. A fruit dropped on nothing slides back. After 8 idle seconds a fruit and its bucket gently hint.

## Counting

Level N (1 to 9) shows N of the same item in a tidy grid and asks "How many?". Pick the right number out of three (always between 1 and 9). Nothing else changes between levels. A wrong pick ends the run, like Pattern Match: the number turns red, a sad sound plays and the "Oops" screen shows the level reached; playing again from Home starts at level 1. After 9 idle seconds the right number pulses. Tapping an item makes it bounce.

## Memory Match

Like Tile Match, but every card starts face down. Flip one card, then a second (never more than two are open). Two the same disappear; two different flip back after a moment so the child can try to remember where they were. Mistakes never end the run.

| Level | Cards | Pairs |
| --- | --- | --- |
| 1 | 6 | 3 |
| 2 | 8 | 4 |
| 3 | 12 | 6 |
| 4 | 16 | 8 |
| 5 | 20 | 10 |

## Clock Time

Reading, setting and copying the hands of a clock, using only the numbers 1 to 12 (no minutes to convert). The short hand is thick and red, the long hand is thin and blue, and the hand being asked about is drawn on top while the other fades. Every level asks two questions: the short hand first, then the long hand.

| Level | What the child does |
| --- | --- |
| 1 | Both hands on different numbers: choose the number each one points at (3 options) |
| 2 | Both hands on the same number |
| 3 | The short hand sits between two numbers (choose the closer one); the long hand is on a number |
| 4 | Both hands sit between numbers (choose the closer one each time) |
| 5 | Move the hands to the asked number (12, 3, 6 or 9): touch the clock or drag |
| 6 | The same, with the other numbers (1, 2, 4, 5, 7, 8, 10, 11) |
| 7 | Show the time it is right now: the child looks at a real clock (there is no clock to copy on screen) and moves the short hand, then the long hand, to show it. The time comes from the device, rounded to the nearest 5 minutes; if the short hand is exactly half way between two numbers, either one counts, and the time from 3 minutes ago is accepted too |

On levels 1 to 4 a wrong answer ends the run, like Pattern Match and Counting: the "Oops" screen shows the level reached and playing again starts at level 1. Levels 5 to 7 never fail: moving hands is hard for little fingers, so a wrong placement wobbles, the hand springs back and the right number pulses until the child gets it. On levels 1 to 4 the same three numbers are shown for both questions: the two answers plus one extra. Once the child picks the short hand's number it is used up (greyed out and disabled), and the long hand is answered from what is left. (Level 2 has the same answer for both hands, so that number stays available.) When a hand sits between two numbers, its other neighbour is used as the extra number where possible.

## Missing Letter

A run of letters in alphabet order with one missing in between (never the first or last). The child drags the missing letter, out of three, into the gap. Ten levels: capitals first, then the same five runs in small letters.

| Levels | Letters |
| --- | --- |
| 1 / 6 | A to E / a to e |
| 2 / 7 | F to K / f to k |
| 3 / 8 | L to P / l to p |
| 4 / 9 | Q to U / q to u |
| 5 / 10 | V to Z / v to z |

The two wrong options are random letters (same case) that are not already shown. The right letter fits and its neighbours lean in and hug it (with a little heart). A wrong letter doesn't fit: the neighbours squeeze together and push it out of the gap, and it is flung away in a random direction. That ends the run, like Pattern Match: the "Oops" screen shows the level reached and playing again starts at level 1. Dropping a letter anywhere but the gap just slides it back.

## Toddler-friendly details

- Big, colourful icons and large tap targets; almost no reading needed.
- Gentle feedback: a rising happy sound for each correct tap, stars fill up as matches are found, and a soft falling "aww" (never a buzzer) when a Pattern Match run ends.
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
- `src/icons.tsx`: the colourful SVG icons (11 main icons plus the look-alike faces and star used by Tile Match levels 3 to 5)
- `src/ui.tsx`: shared buttons and glyphs (hold-to-exit button, colour and sound icons) and the saved on/off settings
- `src/sound.ts`: sound effects
- `src/App.tsx`: home, Pattern Match, finish screen, and the colour / sound switches
- `src/TileGame.tsx`: the Tile Match game
- `src/SeriesGame.tsx`, `src/seriesLogic.ts`: the Missing Letter game and its levels
- `src/ClockGame.tsx`, `src/clockLogic.ts`: the Clock Time game and its levels
- `src/MemoryGame.tsx`, `src/memoryLogic.ts`: the Memory Match game and its levels
- `src/CountGame.tsx`, `src/countLogic.ts`: the Counting game and its levels
- `src/SortGame.tsx`, `src/sortLogic.ts`, `src/bucketArt.tsx`: the Fruit Sort game, its pure logic (levels, layout, throw) and the bucket art
- `src/styles.css`: styling and animations
