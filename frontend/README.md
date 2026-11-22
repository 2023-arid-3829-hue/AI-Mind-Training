# Frontend prototype

React + Vite routing for the supplied Figma brain-training screens. The original game engine runs locally without backend calls; settings and scores are stored in browser localStorage.

## Start

```powershell
cd frontend
npm install
npm run dev
```

## Routes

- `/` — games listing
- `/games/stroop/{setup|gameplay|results}`
- `/games/memory-match/{setup|gameplay|results}`
- `/games/word-hunt/{setup|gameplay|results}`
- `/games/quick-math/{setup|gameplay|results}`
- `/games/ball-tracker/{setup|gameplay|results}`

Each game has a dedicated React route component. `GameFrame` hosts its local HTML prototype. All screens and the listing page use the shared `public/prototype/styles.css` stylesheet.
