# Frontend

React + Vite frontend for the AI Brain Training project. Home, setup, gameplay, and results screens are native React components; games do not use embedded HTML pages.

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

Game screens and mechanics live in `src/games`, `src/components/boards`, and shared React components. Shared styling is in `src/styles.css`. Scores and settings are stored in browser localStorage; the prototype does not call the backend.