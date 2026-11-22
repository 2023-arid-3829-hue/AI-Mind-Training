import React, { useState } from 'react';

export default function AppHeader({ onHome, isPlaying }) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const requestHome = () => isPlaying ? setConfirmLeave(true) : onHome();
  return (
    <>
      <header className="app-header">
        <a className="brand" href="/" onClick={event => { event.preventDefault(); requestHome(); }}>
          <span className="mark" aria-hidden="true">•••</span>MIND·POP
        </a>
        <button className="nav" type="button" onClick={requestHome}>All Games</button>
        <span className="offline">Offline mode · Best scores saved on this device</span>
      </header>
      {confirmLeave && (
        <div className="leave-game-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmLeave(false); }}>
          <section className="leave-game-dialog" role="dialog" aria-modal="true" aria-labelledby="leave-game-title" aria-describedby="leave-game-copy">
            <h2 id="leave-game-title">Leave this game?</h2>
            <p id="leave-game-copy" className="leave-game-copy">If you go to All Games now, this round will be cancelled and your current progress will be lost.</p>
            <div className="leave-game-actions">
              <button className="button secondary" type="button" onClick={() => setConfirmLeave(false)}>Stay in game</button>
              <button className="button primary" type="button" onClick={onHome}>Leave game</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}