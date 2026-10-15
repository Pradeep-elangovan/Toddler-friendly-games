# Toddler Friendly Games

Offline-first React + Vite TypeScript scaffold for a simple toddler-friendly Pattern Match game.

Run locally:

1. npm install
2. npm run dev
3. Open the local URL shown (usually http://localhost:5173)

Build and preview (to test service worker on production build):

1. npm run build
2. npm run preview
3. Visit the preview URL. After first load online, the app shell will be cached and should work offline on reload.

Notes:
- Progress is ephemeral and kept in memory only. Refreshing the page resets to level 1.
- Offline behavior: a simple service worker is included (public/sw.js) and registers on load; it caches the app shell and dynamically caches fetched assets.
- No analytics, accounts, payments, or external tracking.

