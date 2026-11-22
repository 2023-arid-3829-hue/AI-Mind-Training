import React, { useMemo, useRef, useState } from 'react';
import { shuffle } from '../../lib/gameStorage.js';

const WORDS = ['CAT', 'DOG', 'SUN', 'MAP', 'BEE', 'FOX', 'OWL', 'ANT'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function makeGrid(size) {
  if (size === 6) return 'CATDOGSMAPBOUFOXEWNANTELRHQZVKJUPXSI'.split('');
  const cells = Array(size * size).fill('');
  const directions = [[0, 1], [1, 0], [1, 1]];
  for (const word of WORDS) {
    let placed = false;
    for (let attempt = 0; attempt < 1000 && !placed; attempt += 1) {
      const [dy, dx] = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const column = Math.floor(Math.random() * size);
      const positions = [...word].map((_, offset) => [row + dy * offset, column + dx * offset]);
      const fits = positions.every(([y, x], offset) => y < size && x < size && (!cells[y * size + x] || cells[y * size + x] === word[offset]));
      if (fits) {
        positions.forEach(([y, x], offset) => { cells[y * size + x] = word[offset]; });
        placed = true;
      }
    }
  }
  return cells.map(letter => letter || ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
}

function getPath(first, last, size) {
  const row = Math.floor(first / size);
  const column = first % size;
  const dy = Math.floor(last / size) - row;
  const dx = (last % size) - column;
  if (dx && dy && (size === 6 || Math.abs(dx) !== Math.abs(dy))) return [];
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  return Array.from({ length: steps + 1 }, (_, offset) => (row + Math.sign(dy) * offset) * size + column + Math.sign(dx) * offset);
}

export default function WordHuntBoard({ config, paused, onAnswer, onFinish }) {
  const size = config.difficulty === 'hard' ? 8 : 6;
  const cells = useMemo(() => makeGrid(size), [size]);
  const [found, setFound] = useState(() => new Set());
  const [foundCells, setFoundCells] = useState({});
  const [selection, setSelection] = useState([]);
  const [status, setStatus] = useState('');
  const start = useRef(null);
  const pathRef = useRef([]);
  const drag = useRef(false);
  const keyboardStart = useRef(null);
  const finishTimer = useRef(null);
  React.useEffect(() => () => window.clearTimeout(finishTimer.current), []);

  const preview = (first, last) => {
    const path = getPath(first, last, size);
    pathRef.current = path;
    setSelection(path);
  };

  const clear = () => {
    pathRef.current = [];
    setSelection([]);
    start.current = null;
  };

  const commit = () => {
    const path = pathRef.current;
    const value = path.map(index => cells[index]).join('');
    const reversed = [...value].reverse().join('');
    const match = WORDS.find(word => word === value || word === reversed);
    if (match && !found.has(match)) {
      const nextFound = new Set(found).add(match);
      const tone = (nextFound.size - 1) % 4;
      setFound(nextFound);
      setFoundCells(current => {
        const next = { ...current };
        path.forEach(index => { next[index] = tone; });
        return next;
      });
      setStatus(`${match} found`);
      onAnswer({ correct: true, points: 100 });
      if (nextFound.size === WORDS.length) finishTimer.current = window.setTimeout(onFinish, 400);
    }
    clear();
  };

  const onPointerDown = event => {
    if (paused || !event.target.closest('.letter')) return;
    const cell = event.target.closest('.letter');
    event.preventDefault();
    keyboardStart.current = null;
    start.current = Number(cell.dataset.cell);
    drag.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    preview(start.current, start.current);
  };

  const onPointerMove = event => {
    if (!drag.current || start.current === null) return;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('.letter');
    if (cell) preview(start.current, Number(cell.dataset.cell));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = false;
    if (!paused) commit(); else clear();
  };

  const onKeyboardClick = event => {
    if (event.detail !== 0 || paused || !event.target.closest('.letter')) return;
    const index = Number(event.target.closest('.letter').dataset.cell);
    if (keyboardStart.current === null) {
      keyboardStart.current = index;
      start.current = index;
      preview(index, index);
      setStatus('First letter selected. Select the last letter.');
    } else {
      start.current = keyboardStart.current;
      preview(keyboardStart.current, index);
      commit();
      keyboardStart.current = null;
    }
  };

  return <div className="puzzle word-board">
    <div className="board-heading"><b>Find these words</b><span>{WORDS.length - found.size} TO GO</span></div>
    <div className="targets">{WORDS.map(word => <span key={word} className={found.has(word) ? 'done' : ''} data-word={word}>{word}</span>)}</div>
    <div className="word-grid" style={{ '--cols': size }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { drag.current = false; clear(); }} onClick={onKeyboardClick}>
      {cells.map((letter, index) => <button key={index} className={`letter ${selection.includes(index) ? 'selecting' : ''} ${foundCells[index] !== undefined ? `found found-${foundCells[index]}` : ''}`} type="button" data-cell={index} aria-label={`${letter}, row ${Math.floor(index / size) + 1}, column ${index % size + 1}`}>{letter}</button>)}
    </div>
    <div className="sr-only" aria-live="polite">{status}</div>
  </div>;
}