export function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The games stay playable when browser storage is unavailable.
  }
}

export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function formatClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function makeConfig(game, meta) {
  const defaults = {
    mode: meta.defaultMode,
    difficulty: meta.defaultDifficulty,
    theme: meta.defaultTheme ?? 'animals',
  };
  const saved = readStorage(`${game}:config`, {});
  const config = { ...defaults };
  if (['classic', 'timed'].includes(saved.mode)) config.mode = saved.mode;
  if (['easy', 'hard'].includes(saved.difficulty)) config.difficulty = saved.difficulty;
  if (['animals', 'fruit', 'shapes'].includes(saved.theme)) config.theme = saved.theme;
  if (game === 'quick-math') config.mode = 'timed';
  if (game === 'ball-tracker') config.mode = 'classic';
  return config;
}

export function bestScoreKey(game, config) {
  return `${game}:best:${config.mode}:${config.difficulty}:${game === 'memory-match' ? config.theme : ''}`;
}