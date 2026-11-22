import React, { useMemo, useState } from 'react';
import { shuffle } from '../../lib/gameStorage.js';

const ANIMALS = [
  ['🦁', 'Lion'], ['🐻', 'Bear'], ['🦊', 'Fox'], ['🐱', 'Cat'], ['🐶', 'Dog'], ['🦉', 'Owl'],
  ['🐼', 'Panda'], ['🐯', 'Tiger'], ['🐺', 'Wolf'], ['🦌', 'Deer'], ['🐴', 'Horse'], ['🐰', 'Rabbit'],
  ['🐨', 'Koala'], ['🦦', 'Otter'], ['🦓', 'Zebra'], ['🦄', 'Unicorn'], ['🦭', 'Seal'], ['🐭', 'Mouse'],
];
const FRUIT = ['🍎','🍏','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🍍','🥝','🥭','🫐','🍈','🥥','🍐','🍅'];
const SHAPES = ['●','■','▲','◆','★','♥','✦','✨','○','□','△','◇','☆','♡','✷','✶','⬟','⬡'];
const TONES = 8;

export default function MemoryMatchBoard({ config, onAnswer, onAddPoints, onFinish }) {
  const pairCount = config.difficulty === 'hard' ? 18 : 8;
  const deck = useMemo(() => shuffle(Array.from({ length: pairCount }, (_, id) => [id, id]).flat()), [pairCount]);
  const cardTones = useMemo(() => {
    const pairTones = Array.from({ length: pairCount }, () => {
      const first = Math.floor(Math.random() * TONES);
      let second = Math.floor(Math.random() * (TONES - 1));
      if (second >= first) second += 1;
      return [first, second];
    });
    const seen = Array(pairCount).fill(0);
    return deck.map(id => pairTones[id][seen[id]++]);
  }, [deck, pairCount]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState('Flip two cards to find a matching pair');
  const items = config.theme === 'animals' ? ANIMALS : config.theme === 'fruit' ? FRUIT.map(icon => [icon, 'Fruit']) : SHAPES.map(icon => [icon, 'Shape']);
  const timer = React.useRef(null);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = index => {
    if (locked || matched.has(index) || open.includes(index)) return;
    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;
    setLocked(true);
    const isMatch = deck[nextOpen[0]] === deck[nextOpen[1]];
    setStatus(isMatch ? 'Match found! +80 points' : 'Not a match — try to remember them');
    onAnswer({ correct: isMatch, points: 80 });
    timer.current = window.setTimeout(() => {
      const nextMatched = new Set(matched);
      if (isMatch) nextOpen.forEach(card => nextMatched.add(card));
      setMatched(nextMatched);
      setOpen([]);
      setLocked(false);
      if (nextMatched.size === deck.length) {
        onAddPoints(80);
        timer.current = window.setTimeout(onFinish, 350);
      }
    }, 850);
  };

  return <div className="puzzle memory-board">
    <div className="board-heading"><b>Find the matching faces</b><span>{config.theme} · {config.difficulty}</span></div>
    <div className="memory-grid" style={{ '--cols': pairCount === 18 ? 6 : 4 }}>
      {deck.map((id, index) => <button key={index} type="button" className={`memory-card tone-${cardTones[index]} ${open.includes(index) || matched.has(index) ? 'flipped' : ''} ${matched.has(index) ? 'matched' : ''}`} data-card={index} aria-label={matched.has(index) ? 'Matched pair' : `Reveal ${items[id][1]} card`} disabled={matched.has(index)} onClick={() => choose(index)}>
        <span className="back" aria-hidden="true"><span className="memory-back-mark">✦</span><small>FLIP</small></span>
        <span className="face" aria-hidden="true"><span className="face-icon">{items[id][0]}</span>{config.theme === 'animals' && <small>{items[id][1]}</small>}</span>
      </button>)}
    </div>
    <div className="board-status" role="status" aria-live="polite">{status}</div>
  </div>;
}