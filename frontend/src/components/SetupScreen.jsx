import React from "react";
import { GAME_DATA } from "../data/gameData.js";
import { bestScoreKey, readStorage } from "../lib/gameStorage.js";

function ChoiceGroup({ label, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="choices">
        {options.map(([optionValue, heading, detail, icon]) => (
          <label className="choice" key={optionValue}>
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(name, optionValue)}
            />
            <span className="choice-icon" aria-hidden="true">
              {icon}
            </span>
            <strong>{heading}</strong>
            <small>{detail}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function GameIntro({ game, config, best }) {
  if (game === "stroop")
    return (
      <>
        <div className="note">
          <b className="mini">×2</b>
          <div>
            <strong>Combo multiplier</strong>
            <small>
              5 correct in a row = ×2 points.
              <br />A mistake resets your streak.
            </small>
          </div>
        </div>
        <div className="demo">
          <small>THE WORD SAYS</small>
          <strong className="blue">RED</strong>
          <span>
            ✓ CORRECT
            <br />
            <small>
              Correct answer: <b className="blue">BLUE</b>
            </small>
          </span>
        </div>
        <BestNote game={game} config={config} best={best} />
      </>
    );
  if (game === "quick-math")
    return (
      <>
        <div className="note">
          <b className="mini">×2</b>
          <div>
            <strong>Combo multiplier</strong>
            <small>
              5 correct in a row = ×2 points.
              <br />A mistake resets your streak.
            </small>
          </div>
        </div>
        <div className="demo">
          <small>GIVE YOUR BRAIN A WARM-UP</small>
          <strong>24 + 18</strong>
          <span>
            ✓ &nbsp;42<small>+20 points</small>
          </span>
        </div>
        <BestNote game={game} config={config} best={best} />
      </>
    );
  if (game === "memory-match")
    return (
      <>
        <div className="best-strip">
          🏆 BEST SCORE <b>{best}</b>
          {config.mode} / {config.difficulty} · On this device
        </div>
        <div className="match-demo">
          <div>
            🐯 → 🦊<b>MISMATCH</b>
            <small>Flips face down again</small>
          </div>
          <div>
            🐯 → 🐯<b>MATCH</b>
            <small>Pair disappears</small>
          </div>
        </div>
      </>
    );
  if (game === "word-hunt")
    return (
      <div className="word-demo">
        <strong>
          C A T<small>↔ DRAG TO FIND</small>
        </strong>
        <div>
          <b>One word. 100 points.</b>
          <small>Find every target to complete the puzzle.</small>
        </div>
      </div>
    );
  return (
    <div className="demo ball-demo">
      <small>ONE BALL. KEEP IT IN SIGHT.</small>
      <div className="cup-art" aria-hidden="true">
        <i />
        <i />
        <i />
        <b />
      </div>
      <b>Watch it hide → Follow the shuffle → Pick a cup</b>
    </div>
  );
}

function BestNote({ game, config, best }) {
  return (
    <div className="note">
      <b className="star">★</b>
      <div>
        <strong>PERSONAL BEST &nbsp; {best}</strong>
        <small>
          {config.mode} · {config.difficulty} · Saved on this device
        </small>
      </div>
    </div>
  );
}

export default function SetupScreen({ game, config, onConfigChange, onStart }) {
  const meta = GAME_DATA[game];
  const best = Number(readStorage(bestScoreKey(game, config), 0)) || 0;
  const difficultyOptions = [
    ["easy", "Easy", meta.easy, "▦"],
    ["hard", "Hard", meta.hard, "⚡"],
  ];
  return (
    <main className="layout setup">
      <section>
        {game === "memory-match" && (
          <span className="eyebrow">● MEMORY BOOST READY</span>
        )}
        <h1>{meta.title}</h1>
        <p className="subtitle">{meta.setupDescription}</p>
        <GameIntro game={game} config={config} best={best} />
        {game !== "stroop" && (
          <p className="footnote">Play anywhere · Fully offline</p>
        )}
      </section>
      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        {game === "memory-match" && (
          <ChoiceGroup
            label="Symbol theme"
            name="theme"
            value={config.theme}
            onChange={onConfigChange}
            options={[
              ["animals", "Animals", "Friendly creatures", "🐯"],
              ["fruit", "Fruit", "Colorful favorites", "🍓"],
              ["shapes", "Shapes", "Classic forms", "◆"],
            ]}
          />
        )}
        <ChoiceGroup
          label="Game Mode"
          name="mode"
          value={config.mode}
          onChange={onConfigChange}
          options={meta.modes}
        />
        <ChoiceGroup
          label="Difficulty"
          name="difficulty"
          value={config.difficulty}
          onChange={onConfigChange}
          options={difficultyOptions}
        />
        <button className="button primary" type="submit">
          START GAME &nbsp;→
        </button>
      </form>
    </main>
  );
}
