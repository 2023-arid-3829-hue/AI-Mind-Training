import React, { useEffect, useState } from 'react';

const wait = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds));

export default function BallTrackerBoard({ config, round, onAnswer, onNextRound, onFinish }) {
  const count = config.difficulty === 'hard' ? 4 : 3;
  const ids = Array.from({ length: count }, (_, index) => index);
  const [order, setOrder] = useState(ids);
  const [winning, setWinning] = useState(null);
  const [phase, setPhase] = useState('watch');
  const [hint, setHint] = useState('Watch it hide → Follow the shuffle');
  const [feedback, setFeedback] = useState('Keep your eyes on the cup.');
  const [selected, setSelected] = useState(null);
  const [showBall, setShowBall] = useState(true);

  useEffect(() => {
    let active = true;
    const runShuffle = async () => {
      const hiddenCup = Math.floor(Math.random() * count);
      let nextOrder = [...ids];
      setWinning(hiddenCup);
      setOrder(nextOrder);
      setSelected(null);
      setShowBall(true);
      setPhase('watch');
      setHint('Watch it hide → Follow the shuffle');
      setFeedback('Keep your eyes on the cup.');
      await wait(1400);
      if (!active) return;
      setShowBall(false);
      await wait(450);
      if (!active) return;
      setPhase('shuffle');
      const swaps = count === 4 ? 8 : 5;
      for (let index = 0; index < swaps; index += 1) {
        const first = Math.floor(Math.random() * count);
        const second = (first + 1 + Math.floor(Math.random() * (count - 1))) % count;
        [nextOrder[first], nextOrder[second]] = [nextOrder[second], nextOrder[first]];
        setOrder([...nextOrder]);
        await wait(count === 4 ? 420 : 700);
        if (!active) return;
      }
      if (!active) return;
      setPhase('ready');
      setHint('Shuffle stopped. Pick the cup hiding the ball.');
    };
    runShuffle();
    return () => { active = false; };
  }, [count, round]);

  const choose = id => {
    if (phase !== 'ready' || winning === null) return;
    const correct = id === winning;
    setSelected(id);
    setShowBall(true);
    setPhase('answered');
    setHint(`The ball was under cup ${order.indexOf(winning) + 1}`);
    setFeedback(correct ? '✓ Correct! +10 points' : 'Not quite. Watch closely next round.');
    onAnswer({ correct, points: 10 });
  };

  const next = () => {
    if (phase !== 'answered') return;
    if (round >= 10) onFinish();
    else onNextRound(round + 1);
  };

  return <>
    <div className="ball-stage">
      <p>ROUND {round} OF 10</p>
      <h2>{phase === 'watch' ? 'Watch the ball' : phase === 'shuffle' ? 'Follow the shuffle' : phase === 'ready' ? 'Where is the ball?' : 'Round complete'}</h2>
      <div className="cup-track" style={{ '--cups': count }}>
        {ids.map(id => <button key={id} className={`cup-button ${phase === 'watch' && winning === id ? 'lift' : ''} ${phase === 'answered' && winning === id ? 'lift' : ''}`} data-cup={id} type="button" disabled={phase !== 'ready'} aria-label={`Select cup ${order.indexOf(id) + 1}`} style={{ '--slot': order.indexOf(id), '--cups': count }} onClick={() => choose(id)}>
          <span className="cup-shape" />
          <span className="ball-dot" hidden={!(showBall && winning === id)} />
          <b>{order.indexOf(id) + 1}</b>
        </button>)}
      </div>
      <p>{hint}</p>
    </div>
    <div className={`ball-feedback ${phase === 'answered' && selected !== winning ? 'wrong-feedback' : ''}`} role="status" aria-live="polite">{feedback}</div>
    <button className="button primary" type="button" disabled={phase !== 'answered'} onClick={next}>{round >= 10 ? 'VIEW RESULTS →' : 'NEXT ROUND →'}</button>
  </>;
}