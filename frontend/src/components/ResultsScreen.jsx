import React from 'react';
import { GAME_DATA } from '../data/gameData.js';
import { formatClock } from '../lib/gameStorage.js';

function ResultStat({ label, value }) {
  return <div className="result-stat"><small>{label}</small><strong>{value}</strong></div>;
}

export default function ResultsScreen({ game, result, onPlayAgain, onHome }) {
  const meta = GAME_DATA[game];
  if (!result || typeof result.score !== 'number') return (
    <main className="empty"><h1>{meta.title}</h1><p>Complete a game to see your results.</p><button className="button primary" onClick={onPlayAgain}>START GAME →</button></main>
  );
  const complete = ['word-hunt', 'ball-tracker'].includes(game) ? 'Completed' : 'Complete';
  const accuracy = game === 'word-hunt' && result.correct === 8 ? '✓' : `${result.accuracy}%`;
  let details;
  if (game === 'memory-match') details = <><div className="result-row"><ResultStat label="MATCHED PAIRS" value={`${result.correct}/${result.total}`} /><ResultStat label="ATTEMPTS" value={result.attempts} /></div><ResultStat label="COMPLETION TIME" value={formatClock(result.seconds)} /></>;
  else if (game === 'word-hunt') details = <div className="result-row"><ResultStat label="WORDS FOUND" value={`${result.correct}/8`} /><ResultStat label="TIME TAKEN" value={formatClock(result.seconds)} /></div>;
  else if (game === 'ball-tracker') details = <div className="result-row"><ResultStat label="CORRECT" value={`${result.correct}/10`} /><ResultStat label="INCORRECT" value={`${10 - result.correct}/10`} /></div>;
  else details = <><div className="result-row"><ResultStat label="CORRECT ANSWERS" value={`${result.correct}/${result.attempts}`} /><ResultStat label="BEST STREAK" value={result.streak} /></div><ResultStat label="AVERAGE REACTION TIME" value={`${Number(result.reaction || 0).toFixed(1)} sec`} /></>;
  const modeDetail = `${result.config.mode} · ${result.config.difficulty}${game === 'memory-match' ? ` · ${result.config.theme}` : game === 'quick-math' ? ' · 60 seconds' : game === 'ball-tracker' ? ' · 10 rounds' : ''}`;
  const summary = game === 'word-hunt' ? `${result.correct} words × 100 points · No time bonus` : game === 'ball-tracker' ? `${result.correct} correct × 10 points = ${result.score}. Nice tracking!` : game === 'quick-math' ? 'Nice number crunching!' : 'Your progress, one game at a time.';
  return (
    <main className="layout results">
      <section className="result-intro">
        <span className="eyebrow">✧ {meta.title.toUpperCase()}</span>
        <h1>Game {complete}!</h1>
        <p>{modeDetail}</p>
        <div className={`score-card ${game === 'memory-match' ? 'light' : ''}`}>
          <div><small>FINAL SCORE</small><strong>{result.score}{game === 'ball-tracker' && <sub>/ 100</sub>}</strong></div>
          <div className="accuracy"><b>{accuracy}</b><small>{game === 'word-hunt' && result.correct === 8 ? 'ALL FOUND' : 'ACCURACY'}</small></div>
        </div>
        <p className="footnote">{summary}<br />Fully offline · Your best stays on this device</p>
      </section>
      <section className="result-details">
        {details}
        <div className="personal-best"><span className="star">★</span><div><b>{result.newBest ? 'PERSONAL BEST' : 'LOCAL BEST'} &nbsp;{result.best}</b><small>Saved on this device · Previous best {result.previous}</small></div>{result.newBest && <span className="new-best">NEW BEST</span>}</div>
        <button className="button primary" type="button" onClick={onPlayAgain}>PLAY AGAIN &nbsp;⟳</button>
        <button className="button secondary" type="button" onClick={onHome}>BACK TO GAMES &nbsp;←</button>
      </section>
    </main>
  );
}