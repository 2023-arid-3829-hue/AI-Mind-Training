import React, { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
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
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const isHome = pathname === '/';
  useEffect(() => {
    document.body.classList.toggle('home-prototype', isHome);
    return () => document.body.classList.remove('home-prototype');
  }, [isHome]);

  const match = /^\/games\/([a-z-]+)(?:\/(setup|gameplay|results))?$/.exec(pathname);
  const GamePage = match ? gamePages[match[1]] : null;
  const screen = match?.[2] || 'setup';
  const isPlaying = Boolean(GamePage && screen === 'gameplay');

  return <div className="app-shell">
    {!isHome && <AppHeader onHome={() => navigate('/')} isPlaying={isPlaying} />}
    {isHome ? <HomePage onNavigate={navigate} /> : GamePage && validScreens.has(screen)
      ? <GamePage screen={screen} onNavigate={navigate} />
      : <main className="route-empty"><h1>Page not found</h1><button className="button primary" onClick={() => navigate('/')}>Back to all games</button></main>}
  </div>;
}