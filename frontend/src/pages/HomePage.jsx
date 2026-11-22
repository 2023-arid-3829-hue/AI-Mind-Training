import React from 'react';
import { GAME_DATA, GAME_IDS } from '../data/gameData.js';
import { readStorage } from '../lib/gameStorage.js';

function BallTrackerIcon() {
  return (
    <svg viewBox="0 0 88 88" focusable="false">
      <ellipse cx="44" cy="74" rx="37" ry="6" fill="#20183d" opacity=".15" />
      <g fill="#f0445a" stroke="#fff" strokeWidth="1.5">
        <path d="M12 37h15l5 31H6z" />
        <path d="M36 20h17l6 36H30z" />
        <path d="M63 37h15l5 31H57z" />
      </g>
      <g stroke="#fff" strokeWidth="3" opacity=".55">
        <path d="m14 43-2 17M38 27l-2 19M65 43l-2 17" />
      </g>
      <g fill="#ff768a">
        <rect x="5" y="66" width="29" height="6" rx="2" />
        <rect x="28" y="54" width="33" height="6" rx="2" />
        <rect x="56" y="66" width="29" height="6" rx="2" />
      </g>
      <circle cx="44" cy="70" r="8" fill="#ffc83d" />
      <circle cx="42" cy="67" r="2.3" fill="#fff0ab" />
    </svg>
  );
}

function HomeIllustration({ game }) {
  if (game === 'stroop') return <div className="color-tile"><strong>RED</strong><div className="color-dots"><i /><i /><i /><i /></div></div>;
  if (game === 'memory-match') return <div className="tiles memory-tiles"><span>🐯</span><span>🦊</span><span>🐼</span><span>🐻</span></div>;
  if (game === 'word-hunt') return <div className="word-art"><div className="letters"><span>C</span><span>A</span><span>T</span><span>D</span><span>O</span><span>G</span></div><div className="target">✓ CAT</div></div>;
  if (game === 'quick-math') return <div className="tiles math-tiles"><span>+</span><span>−</span><span>×</span><span>÷</span></div>;
  return <div className="home-cup"><BallTrackerIcon /></div>;
}

function GameCard({ game, onNavigate }) {
  const meta = GAME_DATA[game];
  const config = readStorage(`${game}:config`, { mode: meta.defaultMode, difficulty: meta.defaultDifficulty });
  const bestKey = `${game}:best:${config.mode}:${config.difficulty}:${game === 'memory-match' ? config.theme ?? meta.defaultTheme : ''}`;
  const best = Number(readStorage(bestKey, 0)) || 0;
  return (
    <article className={`card ${meta.cardClass}`}>
      <div className="summary">
        <div className="illustration" aria-hidden="true"><HomeIllustration game={game} /></div>
        <div className="copy">
          <span className="category">{meta.category}</span>
          <h3>{meta.title}</h3>
          <p className="description">{meta.cardDescription}</p>
        </div>
      </div>
      <div className="card-footer">
        <div className="details"><span>BEST {best}</span><span className="dot" /><span className="mode">{config.mode.toUpperCase()} · {config.difficulty.toUpperCase()}</span></div>
        <button className="play" type="button" onClick={() => onNavigate(`/games/${game}/setup`)} aria-label={`Play ${meta.title}`}>
          PLAY <span aria-hidden="true">▷</span>
        </button>
      </div>
    </article>
  );
}

export default function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      <header className="header">
        <nav className="navigation" aria-label="Main navigation">
          <a className="brand" href="/" onClick={event => { event.preventDefault(); onNavigate('/'); }} aria-label="Mind Pop home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            MIND·POP
          </a>
          <a className="nav-link" href="#games">All Games</a>
        </nav>
        <div className="offline">Offline mode · Best scores saved on this device</div>
      </header>

      <main>
        <h1>Ready to level up?</h1>
        <p className="subtitle">Five quick games. One sharper mind.</p>
        <section aria-labelledby="games-heading">
          <div className="section-heading">
            <h2 id="games-heading">Choose your challenge</h2>
            <span className="count">5 GAMES</span>
          </div>
          <div className="games" id="games">
            {GAME_IDS.map(game => <GameCard key={game} game={game} onNavigate={onNavigate} />)}
          </div>
        </section>
      </main>
    </div>
  );
}