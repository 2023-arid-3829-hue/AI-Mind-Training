import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_DATA } from '../data/gameData.js';
import { bestScoreKey, formatClock, readStorage, writeStorage } from '../lib/gameStorage.js';
import QuestionBoard from './boards/QuestionBoard.jsx';
import MemoryMatchBoard from './boards/MemoryMatchBoard.jsx';
import WordHuntBoard from './boards/WordHuntBoard.jsx';
import BallTrackerBoard from './boards/BallTrackerBoard.jsx';

function initialStats(game, config) {
  return {
    score: 0, correct: 0, attempts: 0, streak: 0, maxStreak: 0,
    total: game === 'memory-match' ? (config.difficulty === 'hard' ? 18 : 8) : game === 'word-hunt' ? 8 : game === 'ball-tracker' ? 10 : 20,
    round: 1, reactions: 0,
  };
}

function timeLimit(game, config) {
  if (game === 'memory-match') return config.difficulty === 'hard' ? 180 : 90;
  if (game === 'word-hunt') return config.difficulty === 'hard' ? 180 : 120;
  return 60;
}

export default function GamePlayScreen({ game, config, onFinish }) {
  const meta = GAME_DATA[game];
  const timed = config.mode === 'timed';
  const limit = timeLimit(game, config);
  const statsRef = useRef(initialStats(game, config));
  const [stats, setStats] = useState(statsRef.current);
  const startedAt = useRef(performance.now());
  const pausedAt = useRef(null);
  const pauseTotal = useRef(0);
  const elapsedRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const finished = useRef(false);
  const finishRef = useRef(null);

  const readElapsed = useCallback(() => {
    const now = pausedAt.current ?? performance.now();
    return Math.max(0, (now - startedAt.current - pauseTotal.current) / 1000);
  }, []);

  const updateStats = useCallback(updater => {
    const next = typeof updater === 'function' ? updater(statsRef.current) : updater;
    statsRef.current = next;
    setStats(next);
    return next;
  }, []);

  const finishGame = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const current = statsRef.current;
    const seconds = readElapsed();
    const previous = Number(readStorage(bestScoreKey(game, config), 0)) || 0;
    const result = {
      ...current,
      seconds,
      reaction: current.attempts ? current.reactions / current.attempts : 0,
      accuracy: current.attempts ? Math.round((current.correct / current.attempts) * 100) : 0,
      previous,
      best: Math.max(previous, current.score),
      newBest: current.score > previous,
      config,
    };
    writeStorage(bestScoreKey(game, config), result.best);
    writeStorage(`${game}:result`, result);
    onFinish();
  }, [config, game, onFinish, readElapsed]);
  finishRef.current = finishGame;

  const recordAnswer = useCallback(({ correct, points = 0, reaction = 0, combo = false, countAttempt = 1 }) => {
    let awarded = 0;
    const next = updateStats(current => {
      const streak = combo ? (correct ? current.streak + 1 : 0) : current.streak;
      awarded = correct ? (typeof points === 'function' ? points(streak) : points) : 0;
      return {
        ...current,
        score: current.score + awarded,
        correct: current.correct + (correct ? 1 : 0),
        attempts: current.attempts + countAttempt,
        streak,
        maxStreak: Math.max(current.maxStreak, streak),
        reactions: current.reactions + reaction,
      };
    });
    return { points: awarded, attempts: next.attempts, stats: next };
  }, [updateStats]);

  const addPoints = useCallback(points => updateStats(current => ({ ...current, score: current.score + points })), [updateStats]);
  const setRound = useCallback(round => updateStats(current => ({ ...current, round })), [updateStats]);

  useEffect(() => {
    if (paused || finished.current) return undefined;
    const interval = window.setInterval(() => {
      const seconds = readElapsed();
      elapsedRef.current = seconds;
      setElapsed(seconds);
      if (timed && seconds >= limit) finishRef.current?.();
    }, 150);
    return () => window.clearInterval(interval);
  }, [limit, paused, readElapsed, timed]);

  const togglePause = useCallback(() => {
    if (pausedAt.current === null) {
      pausedAt.current = performance.now();
      setPaused(true);
    } else {
      pauseTotal.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      setPaused(false);
    }
  }, []);

  const secondLabel = game === 'memory-match' ? 'MATCHED PAIRS' : game === 'word-hunt' ? 'WORDS FOUND' : game === 'ball-tracker' ? 'ROUND' : 'STREAK';
  const secondValue = game === 'memory-match' ? `${stats.correct}/${stats.total}` : game === 'word-hunt' ? `${stats.correct}/8` : game === 'ball-tracker' ? `${stats.round}/10` : `⚡ ${stats.streak}`;
  const thirdLabel = game === 'memory-match' ? 'ATTEMPTS' : timed ? 'TIME LEFT' : 'QUESTION';
  const thirdValue = game === 'memory-match' ? stats.attempts : timed ? formatClock(Math.max(0, Math.ceil(limit - elapsed))) : `${Math.min(stats.attempts + 1, 20)}/20`;
  const progress = Math.min(100, (100 * stats.correct) / Math.max(1, stats.total));

  return (
    <main className="layout play-layout">
      <aside>
        <h1>{meta.title}</h1>
        <div className="stats">
          <div><small>SCORE</small><b>{stats.score}</b></div>
          <div><small>{secondLabel}</small><b>{secondValue}</b></div>
          {!['word-hunt', 'ball-tracker'].includes(game) && <div><small>{thirdLabel}</small><b>{thirdValue}</b></div>}
        </div>
        <div className="progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="mode-bar"><span>● {config.mode} mode</span><span>{config.difficulty}</span></div>
        {['stroop', 'quick-math'].includes(game) && <div className="combo-bar">{stats.streak >= 5 ? '×2 COMBO ACTIVE · 5+ CORRECT IN A ROW' : '×1 COMBO · BUILD A STREAK OF 5'}</div>}
        <p className="instructions">{meta.playInstructions}</p>
        {timed && <p className="footnote">Time left: {formatClock(Math.max(0, Math.ceil(limit - elapsed)))}</p>}
        {game === 'word-hunt' && <button className="button quiet" type="button" onClick={togglePause}>{paused ? '▶ Resume' : 'Ⅱ Pause'}</button>}
      </aside>
      <section id="board" aria-label="Game board" className={paused ? 'paused' : ''}>
        {game === 'stroop' || game === 'quick-math' ? <QuestionBoard game={game} config={config} onAnswer={recordAnswer} onFinish={finishGame} /> : null}
        {game === 'memory-match' ? <MemoryMatchBoard config={config} onAnswer={recordAnswer} onAddPoints={addPoints} onFinish={finishGame} /> : null}
        {game === 'word-hunt' ? <WordHuntBoard config={config} paused={paused} onAnswer={recordAnswer} onFinish={finishGame} /> : null}
        {game === 'ball-tracker' ? <BallTrackerBoard config={config} round={stats.round} onAnswer={recordAnswer} onNextRound={setRound} onFinish={finishGame} /> : null}
      </section>
    </main>
  );
}