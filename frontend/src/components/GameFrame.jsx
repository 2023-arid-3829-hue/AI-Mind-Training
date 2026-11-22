import React from 'react';
export default function GameFrame({ game, screen, title }) {
  return (
    <main className="prototype-shell">
      <iframe key={`${game}-${screen}`} className="prototype-frame" src={`/prototype/${game}-${screen}.html`} title={`${title} — ${screen}`} allow="fullscreen" />
    </main>
  );
}
