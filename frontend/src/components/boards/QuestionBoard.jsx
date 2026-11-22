import React, { useEffect, useRef, useState } from 'react';
import { shuffle } from '../../lib/gameStorage.js';

function createQuestion(game, difficulty) {
  if (game === 'stroop') {
    const colors = { BLUE: '#28d7ff', RED: '#ff4f86', GREEN: '#19cd5b', YELLOW: '#ffb500' };
    const options = Object.keys(colors).slice(0, difficulty === 'hard' ? 4 : 3);
    return { prompt: options[Math.floor(Math.random() * options.length)], answer: options[Math.floor(Math.random() * options.length)], options, ink: null };
  }
  const operators = difficulty === 'hard' ? ['+', '−', '×', '÷'] : ['+', '−'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  let a = 10 + Math.floor(Math.random() * 80);
  let b = 10 + Math.floor(Math.random() * 40);
  if (operator === '−' && a < b) [a, b] = [b, a];
  if (operator === '×') { a = 10 + Math.floor(Math.random() * 20); b = 2 + Math.floor(Math.random() * 11); }
  if (operator === '÷') { b = 2 + Math.floor(Math.random() * 11); a = b * (2 + Math.floor(Math.random() * 18)); }
  const answer = operator === '+' ? a + b : operator === '−' ? a - b : operator === '×' ? a * b : a / b;
  const values = new Set([answer]);
  while (values.size < 4) values.add(Math.max(0, answer + [-20, -10, -5, -2, 2, 5, 10, 20][Math.floor(Math.random() * 8)]));
  return { prompt: `${a} ${operator} ${b} = ?`, answer, options: shuffle([...values]), ink: null };
}

const COLORS = { BLUE: '#28d7ff', RED: '#ff4f86', GREEN: '#19cd5b', YELLOW: '#ffb500' };

export default function QuestionBoard({ game, config, onAnswer, onFinish }) {
  const [question, setQuestion] = useState(() => createQuestion(game, config.difficulty));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const questionStarted = useRef(performance.now());
  const timeout = useRef(null);
  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const answer = (option, index) => {
    if (selected !== null) return;
    const correct = option === question.answer;
    setSelected(index);
    setFeedback({ correct, text: game === 'stroop' ? (correct ? 'Great focus!' : `The ink color was ${question.answer}`) : (correct ? 'Correct!' : `Not quite. Correct answer: ${question.answer}`) });
    const result = onAnswer({ correct, reaction: (performance.now() - questionStarted.current) / 1000, combo: true, points: streak => streak >= 5 ? 40 : 20 });
    timeout.current = window.setTimeout(() => {
      if (game === 'stroop' && config.mode === 'classic' && result.attempts >= 20) onFinish();
      else {
        setQuestion(createQuestion(game, config.difficulty));
        setSelected(null);
        setFeedback(null);
        questionStarted.current = performance.now();
      }
    }, game === 'stroop' ? 1600 : 650);
  };

  const isStroop = game === 'stroop';
  const prompt = isStroop ? question.prompt : question.prompt;
  return (
    <>
      <div className="question">
        <p>{isStroop ? '✦ CLICK THE INK COLOR' : 'QUICK MATH · SOLVE THE EQUATION'}</p>
        <h2 style={isStroop ? { color: COLORS[question.answer] } : undefined}>{prompt}</h2>
        <div className={`feedback ${feedback ? (feedback.correct ? 'success show' : 'error show') : ''}`} role="status" aria-live="polite">{feedback?.text ?? '\u00a0'}</div>
      </div>
      <div className="answers">
        {question.options.map((option, index) => {
          const isCorrect = selected !== null && option === question.answer;
          const isWrong = selected === index && option !== question.answer;
          return <button key={`${String(option)}-${index}`} type="button" disabled={selected !== null} className={`answer ${isStroop ? String(option).toLowerCase() : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} onClick={() => answer(option, index)}>{option}</button>;
        })}
      </div>
    </>
  );
}