import React, { useState } from 'react';
import { GAME_DATA } from '../data/gameData.js';
import { makeConfig, readStorage, writeStorage } from '../lib/gameStorage.js';
import SetupScreen from './SetupScreen.jsx';
import GamePlayScreen from './GamePlayScreen.jsx';
import ResultsScreen from './ResultsScreen.jsx';

export default function GameExperience({ game, screen, onNavigate }) {
  const meta = GAME_DATA[game];
  const [config, setConfig] = useState(() => makeConfig(game, meta));
  const changeConfig = (key, value) => setConfig(current => ({ ...current, [key]: value }));
  const start = () => {
    writeStorage(`${game}:config`, config);
    try { localStorage.removeItem(`${game}:result`); } catch {}
    onNavigate(`/games/${game}/gameplay`);
  };
  if (screen === 'setup') return <SetupScreen game={game} config={config} onConfigChange={changeConfig} onStart={start} />;
  if (screen === 'results') return <ResultsScreen game={game} result={readStorage(`${game}:result`, null)} onPlayAgain={() => onNavigate(`/games/${game}/gameplay`)} onHome={() => onNavigate('/')} />;
  return <GamePlayScreen key={`${game}-run`} game={game} config={config} onFinish={() => onNavigate(`/games/${game}/results`)} />;
}