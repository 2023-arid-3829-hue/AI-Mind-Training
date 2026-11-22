import React from 'react';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import StroopGame from './games/StroopGame.jsx';
import MemoryMatchGame from './games/MemoryMatchGame.jsx';
import WordHuntGame from './games/WordHuntGame.jsx';
import QuickMathGame from './games/QuickMathGame.jsx';
import BallTrackerGame from './games/BallTrackerGame.jsx';

const gamePages = {
  stroop: StroopGame,
  'memory-match': MemoryMatchGame,
  'word-hunt': WordHuntGame,
  'quick-math': QuickMathGame,
  'ball-tracker': BallTrackerGame,
};
const validScreens = new Set(['setup', 'gameplay', 'results']);

export function navigate(path) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    const onMessage = event => {
      if (event.origin !== window.location.origin || event.data?.type !== 'mindpop:navigate') return;
      if (event.data.path === '/') { navigate('/'); return; }
      const match = /^\/games\/([a-z-]+)\/(setup|gameplay|results)$/.exec(event.data.path || '');
      if (match && gamePages[match[1]] && validScreens.has(match[2])) navigate(event.data.path);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  if (pathname === '/') return <HomePage />;
  const match = /^\/games\/([a-z-]+)(?:\/(setup|gameplay|results))?$/.exec(pathname);
  if (match && gamePages[match[1]]) {
    const GamePage = gamePages[match[1]];
    const screen = match[2] || 'setup';
    return <GamePage screen={validScreens.has(screen) ? screen : 'setup'} />;
  }
  return <main className="route-empty"><h1>Page not found</h1><a href="/">Back to all games</a></main>;
}
