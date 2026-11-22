"use strict";

/* ---------- Shared configuration ---------- */

const game = document.body.dataset.game;
const view = document.body.dataset.view;

const titles = {
  "stroop": "Stroop Challenge",
  "memory-match": "Memory Match",
  "word-hunt": "Word Hunt",
  "quick-math": "Quick Math",
  "ball-tracker": "Ball Tracker"
};

const title = titles[game];
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gameplay remains available if browser storage is blocked.
  }
};

const pick = array => array[Math.floor(Math.random() * array.length)];

const shuffle = array => {
  array = [...array];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

const cap = text => text[0].toUpperCase() + text.slice(1);
const go = screen => {
  const path = `/games/${game}/${screen}`;
  if (window.parent !== window) {
    window.parent.postMessage({ type: "mindpop:navigate", path }, window.location.origin);
    return;
  }
  location.href = `${game}-${screen}.html`;
};

const defaults = {
  mode: game === "quick-math" ? "timed" : "classic",
  difficulty: game === "stroop" ? "hard" : "easy",
  theme: "animals"
};

const stored = read(`${game}:config`, {});
const config = { ...defaults };

for (const key of ["mode", "difficulty", "theme"]) {
  const allowed = {
    mode: ["classic", "timed"],
    difficulty: ["easy", "hard"],
    theme: ["animals", "fruit", "shapes"]
  }[key];

  if (allowed.includes(stored?.[key])) {
    config[key] = stored[key];
  }
}

if (game === "quick-math") config.mode = "timed";
if (game === "ball-tracker") config.mode = "classic";

const keyForBest = () =>
  `${game}:best:${config.mode}:${config.difficulty}:${
    game === "memory-match" ? config.theme : ""
  }`;

const best = () => Number(read(keyForBest(), 0)) || 0;

const clock = seconds =>
  `${Math.floor(seconds / 60)}`.padStart(2, "0") +
  ":" +
  `${Math.floor(seconds % 60)}`.padStart(2, "0");

const button = (text, id, kind = "primary") =>
  `<button class="button ${kind}" id="${id}" type="button">
    ${text}
  </button>`;

const combo = `
  <div class="note">
    <b class="mini">×2</b>
    <div>
      <strong>Combo multiplier</strong>
      <small>
        5 correct in a row = ×2 points.<br>
        A mistake resets your streak.
      </small>
    </div>
  </div>
`;

const cups = `
  <div class="cup-art" aria-hidden="true">
    <i></i><i></i><i></i><b></b>
  </div>
`;

let S = null;

/* ---------- Shared header ---------- */

document.body.innerHTML = `
  <header>
    <a class="brand" href="${game}-setup.html">
      <span class="mark">•••</span>
      MIND•POP
    </a>

    <button class="nav" id="all-games" type="button">
      All Games
    </button>

    <span class="offline">
      ● &nbsp; Offline mode · Best scores saved on this device
    </span>
  </header>

  <main id="app"></main>

  <dialog id="games-dialog">
    <h2>Choose your challenge</h2>

    <nav>
      ${Object.entries(titles)
        .map(
          ([id, name]) =>
            `<a href="${id}-setup.html">${name} →</a>`
        )
        .join("")}
    </nav>

    <button class="button primary" id="close-dialog" type="button">
      Close
    </button>
  </dialog>
`;

$("#all-games").onclick = () => $("#games-dialog").showModal();
$("#close-dialog").onclick = () => $("#games-dialog").close();
$(".brand").addEventListener("click", event => {
  if (window.parent === window) return;
  event.preventDefault();
  go("setup");
});

$("#games-dialog nav").addEventListener("click", event => {
  const link = event.target.closest("a");
  if (!link || window.parent === window) return;
  event.preventDefault();
  const slug = link.getAttribute("href").replace(/-setup\.html$/, "");
  window.parent.postMessage({ type: "mindpop:navigate", path: `/games/${slug}/setup` }, window.location.origin);
});

/* ---------- Setup pages ---------- */

function group(label, name, items) {
  return `
    <fieldset>
      <legend>${label}</legend>

      <div class="choices">
        ${items
          .map(
            ([value, heading, detail, icon]) => `
              <label class="choice">
                <input
                  type="radio"
                  name="${name}"
                  value="${value}"
                  ${config[name] === value ? "checked" : ""}
                >
                <span class="choice-icon">${icon || "◈"}</span>
                <strong>${heading}</strong>
                <small>${detail}</small>
              </label>
            `
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function setup() {
  const descriptions = {
    "stroop": "Select the color of the text, not the word.",
    "memory-match": "Reveal two cards and find every matching pair.",
    "word-hunt":
      "Spot hidden words. Click and drag across the letters to select each one.",
    "quick-math": "Solve it fast. Click the right answer.",
    "ball-tracker":
      "Keep your eyes on the cup.<br>Find the hidden ball."
  };

  let intro = "";

  if (game === "stroop") {
    intro = combo + `
      <div class="demo">
        <small>THE WORD SAYS</small>
        <strong class="blue">RED</strong>
        <span>
          ✓ CORRECT
          <br>
          <small>Correct Answer: <b class="blue">BLUE</b></small>
        </span>
      </div>
    `;
  }

  if (game === "quick-math") {
    intro = combo + `
      <div class="demo">
        <small>GIVE YOUR BRAIN A WARM-UP</small>
        <strong>24 + 18</strong>
        <span>
          ✓ &nbsp;42
          <small>+20 points</small>
        </span>
      </div>
    `;
  }

  if (game === "memory-match") {
    intro = `
      <div class="best-strip">
        🏆 BEST SCORE
        <b>${best()}</b>
        ${cap(config.mode)} / ${cap(config.difficulty)} · On this device
      </div>

      <div class="match-demo">
        <div>
          ♞ → ♜
          <b>MISMATCH</b>
          <small>Flips face down again</small>
        </div>

        <div>
          ♞ → ♞
          <b>MATCH</b>
          <small>Pair disappears</small>
        </div>
      </div>
    `;
  }

  if (game === "word-hunt") {
    intro = `
      <div class="word-demo">
        <strong>
          C A T
          <small>↔ DRAG TO FIND</small>
        </strong>

        <div>
          <b>One word. 100 points.</b>
          <small>Find every target to complete the puzzle.</small>
        </div>
      </div>
    `;
  }

  if (game === "ball-tracker") {
    intro = `
      <div class="demo ball-demo">
        <small>ONE BALL. KEEP IT IN SIGHT.</small>
        ${cups}
        <b>Watch it hide → Follow the shuffle → Click a cup</b>
      </div>
    `;
  }

  let modes;

  if (game === "quick-math") {
    modes = [
      ["timed", "Timed", "60 seconds · Answer as many as you can", "◷"]
    ];
  } else if (game === "ball-tracker") {
    modes = [
      ["classic", "Classic", "10 rounds · +10 per correct answer", "◇"]
    ];
  } else {
    modes = [
      [
        "classic",
        "Classic",
        game === "stroop"
          ? "20 focused rounds"
          : game === "memory-match"
          ? "Complete the whole grid"
          : "No time limit<br>Find all words to finish",
        "▱"
      ],
      [
        "timed",
        "Timed",
        game === "stroop"
          ? "Race the clock"
          : "Find them before time runs out",
        "◷"
      ]
    ];
  }

  const easy = {
    "stroop": "3 colors · relaxed",
    "memory-match": "4×4 · 8 pairs",
    "word-hunt": "6×6 grid<br>Horizontal + vertical",
    "quick-math":
      "Addition +<br>Subtraction −<br>Two-digit numbers",
    "ball-tracker": "3 cups · Slow shuffle<br>A gentle start"
  };

  const hard = {
    "stroop": "4 colors · rapid mix",
    "memory-match": "6×6 · 18 pairs",
    "word-hunt": "8×8 grid<br>Horizontal + vertical + diagonal",
    "quick-math":
      "Addition + · Subtraction −<br>Multiply × · Divide ÷<br>Two-digit numbers",
    "ball-tracker": "4 cups · Fast shuffle<br>A sharper challenge"
  };

  $("#app").innerHTML = `
    <div class="layout setup">
      <section>
        ${
          game === "memory-match"
            ? '<span class="eyebrow">● MEMORY BOOST READY</span>'
            : ""
        }

        <h1>${title}</h1>
        <p class="subtitle">${descriptions[game]}</p>

        ${intro}

        ${
          !["memory-match", "word-hunt"].includes(game)
            ? `
              <div class="note">
                <b class="star">★</b>
                <div>
                  <strong>
                    PERSONAL BEST &nbsp;
                    <span id="best-value">${best()}</span>
                  </strong>
                  <small>
                    ${cap(config.mode)} ·
                    ${cap(config.difficulty)} · Saved on this device
                  </small>
                </div>
              </div>
            `
            : ""
        }

        ${
          game !== "stroop"
            ? '<p class="footnote">Play anywhere · Fully offline</p>'
            : ""
        }
      </section>

      <form id="settings">
        ${
          game === "memory-match"
            ? group("Symbol theme", "theme", [
                ["animals", "Animals", "", "♞"],
                ["fruit", "Fruit", "", "♧"],
                ["shapes", "Shapes", "", "□"]
              ])
            : ""
        }

        ${group("Game Mode", "mode", modes)}

        ${group("Difficulty", "difficulty", [
          ["easy", "Easy", easy[game], "▦"],
          ["hard", "Hard", hard[game], "ϟ"]
        ])}

        <button class="button primary" type="submit">
          START GAME &nbsp;→
        </button>
      </form>
    </div>
  `;

  $("#settings").onchange = () => {
    for (const key of ["mode", "difficulty", "theme"]) {
      const input = $(`input[name="${key}"]:checked`);
      if (input) config[key] = input.value;
    }

    if ($("#best-value")) {
      $("#best-value").textContent = best();
    }
  };

  $("#settings").onsubmit = event => {
    event.preventDefault();
    save(`${game}:config`, config);

    try {
      localStorage.removeItem(`${game}:result`);
    } catch {}

    go("gameplay");
  };
}

/* ---------- Shared gameplay state ---------- */

function elapsed() {
  return Math.max(
    0,
    (
      (S.pausedAt || performance.now()) -
      S.started -
      S.pauseTotal
    ) / 1000
  );
}

function finish() {
  if (S.finished) return;

  S.finished = true;
  clearInterval(S.timer);

  const previous = best();

  const result = {
    score: S.score,
    correct: S.correct,
    attempts: S.attempts,
    total: S.total,
    streak: S.maxStreak,
    seconds: elapsed(),
    reaction: S.attempts ? S.reactions / S.attempts : 0,
    accuracy: S.attempts
      ? Math.round(S.correct / S.attempts * 100)
      : 0,
    previous,
    best: Math.max(previous, S.score),
    newBest: S.score > previous,
    config
  };

  save(keyForBest(), result.best);
  save(`${game}:result`, result);
  go("results");
}

function sync() {
  if ($("#score")) $("#score").textContent = S.score;

  if ($("#progress")) {
    $("#progress").style.width =
      `${Math.min(100, 100 * S.correct / Math.max(1, S.total))}%`;
  }

  if ($("#second")) {
    $("#second").textContent =
      game === "memory-match"
        ? `${S.correct}/${S.total}`
        : game === "word-hunt"
        ? `${S.correct}/8`
        : game === "ball-tracker"
        ? `${S.round}/10`
        : `ϟ ${S.streak}`;
  }

  if ($("#third")) {
    $("#third").textContent =
      game === "memory-match"
        ? S.attempts
        : config.mode === "timed"
        ? clock(Math.max(0, Math.ceil(S.limit - elapsed())))
        : `${Math.min(S.attempts + 1, 20)}/20`;
  }

  if ($("#combo-status")) {
    $("#combo-status").textContent =
      S.streak >= 5
        ? "×2 COMBO ACTIVE · 5+ CORRECT IN A ROW"
        : "×1 COMBO · BUILD A STREAK OF 5";
  }
}

function play() {
  const timed = config.mode === "timed";

  S = {
    score: 0,
    correct: 0,
    attempts: 0,
    streak: 0,
    maxStreak: 0,
    total:
      game === "memory-match"
        ? config.difficulty === "hard" ? 18 : 8
        : game === "word-hunt"
        ? 8
        : game === "ball-tracker"
        ? 10
        : 20,
    round: 1,
    reactions: 0,
    started: performance.now(),
    pauseTotal: 0,
    pausedAt: 0,
    finished: false,
    locked: false
  };

  /*
   * Durations are implementation defaults where the design
   * does not specify an exact timed-mode duration.
   */
  S.limit =
    game === "memory-match"
      ? config.difficulty === "hard" ? 180 : 90
      : game === "word-hunt"
      ? config.difficulty === "hard" ? 180 : 120
      : 60;

  const secondLabel =
    game === "memory-match"
      ? "MATCHED PAIRS"
      : game === "word-hunt"
      ? "WORDS FOUND"
      : game === "ball-tracker"
      ? "ROUND"
      : "STREAK";

  $("#app").innerHTML = `
    <div class="layout play-layout">
      <aside>
        <h1>${title}</h1>

        <div class="stats">
          <div>
            <small>SCORE</small>
            <b id="score">0</b>
          </div>

          <div>
            <small>${secondLabel}</small>
            <b id="second">0</b>
          </div>

          ${
            !["word-hunt", "ball-tracker"].includes(game)
              ? `
                <div>
                  <small>
                    ${
                      game === "memory-match"
                        ? "ATTEMPTS"
                        : timed ? "TIME LEFT" : "QUESTION"
                    }
                  </small>
                  <b id="third">0</b>
                </div>
              `
              : ""
          }
        </div>

        <div class="progress"><i id="progress"></i></div>

        <div class="mode-bar">
          <span>● ${cap(config.mode)} mode</span>
          <span>${cap(config.difficulty)}</span>
        </div>

        ${
          ["stroop", "quick-math"].includes(game)
            ? '<div class="combo-bar" id="combo-status"></div>'
            : ""
        }

        <p class="instructions">
          ${
            game === "stroop"
              ? "Choose the text color — ignore what the word says."
              : game === "quick-math"
              ? "Click the correct answer. Keep your streak going!"
              : game === "memory-match"
              ? "Matched pairs disappear. Other cards stay in place."
              : game === "word-hunt"
              ? "Click and drag across letters.<br>Or select the first and last letters with the keyboard."
              : "Watch the reveal. Follow the shuffle. Click a cup."
          }
        </p>

        ${timed ? '<p class="footnote" id="countdown"></p>' : ""}
        ${game === "word-hunt" ? button("Ⅱ Pause", "pause", "quiet") : ""}
      </aside>

      <section id="board" aria-label="Game board"></section>
    </div>
  `;

  S.timer = setInterval(() => {
    if (S.finished || S.pausedAt) return;

    const remaining = Math.max(0, Math.ceil(S.limit - elapsed()));

    if (timed) {
      if ($("#countdown")) {
        $("#countdown").textContent = `Time left: ${clock(remaining)}`;
      }

      if (remaining === 0) {
        finish();
        return;
      }
    }

    sync();
  }, 100);

  if (["stroop", "quick-math"].includes(game)) question();
  if (game === "memory-match") memory();
  if (game === "word-hunt") wordHunt();
  if (game === "ball-tracker") ball();

  sync();
}

/* ---------- Stroop and Quick Math ---------- */

function question() {
  if (S.finished) return;
  S.locked = false;

  let prompt;
  let options;
  let answer;
  let styles = "";

  if (game === "stroop") {
    const colors = {
      BLUE: "#28d7ff",
      RED: "#ff4f86",
      GREEN: "#19cd5b",
      YELLOW: "#ffb500"
    };

    options = config.difficulty === "hard"
      ? Object.keys(colors)
      : Object.keys(colors).slice(0, 3);

    answer = pick(options);
    prompt = pick(options);
    styles = `color:${colors[answer]}`;
  } else {
    const operator = pick(
      config.difficulty === "hard"
        ? ["+", "−", "×", "÷"]
        : ["+", "−"]
    );

    let a = 10 + Math.floor(Math.random() * 80);
    let b = 10 + Math.floor(Math.random() * 40);

    if (operator === "−" && a < b) [a, b] = [b, a];

    if (operator === "×") {
      a = 10 + Math.floor(Math.random() * 20);
      b = 2 + Math.floor(Math.random() * 11);
    }

    if (operator === "÷") {
      b = 2 + Math.floor(Math.random() * 11);
      a = b * (2 + Math.floor(Math.random() * 18));
    }

    answer =
      operator === "+"
        ? a + b
        : operator === "−"
        ? a - b
        : operator === "×"
        ? a * b
        : a / b;

    prompt = `${a} ${operator} ${b} = ?`;

    const values = new Set([answer]);

    while (values.size < 4) {
      values.add(
        Math.max(0, answer + pick([-20, -10, -5, -2, 2, 5, 10, 20]))
      );
    }

    options = shuffle([...values]);
  }

  $("#board").innerHTML = `
    <div class="question">
      <p>
        ${
          game === "stroop"
            ? "✥ CLICK THE INK COLOR"
            : "QUICK MATH · SOLVE THE EQUATION"
        }
      </p>

      <h2 style="${styles}">${prompt}</h2>
      <div class="feedback" role="status" aria-live="polite">&nbsp;</div>
    </div>

    <div class="answers">
      ${options
        .map(
          (option, index) => `
            <button
              type="button"
              class="answer ${game === "stroop" ? String(option).toLowerCase() : ""}"
              data-index="${index}"
            >${option}</button>
          `
        )
        .join("")}
    </div>
  `;

  S.questionStarted = performance.now();

  $$(".answer").forEach((element, index) => {
    element.onclick = () => {
      if (S.locked || S.finished) return;
      S.locked = true;

      const correct = options[index] === answer;

      S.attempts++;
      S.reactions += (performance.now() - S.questionStarted) / 1000;

      if (correct) {
        S.correct++;
        S.streak++;
        S.maxStreak = Math.max(S.maxStreak, S.streak);

        const points = S.streak >= 5 ? 40 : 20;
        S.score += points;

        $(".feedback").textContent = `Correct! +${points}`;
        element.classList.add("correct");
      } else {
        S.streak = 0;
        $(".feedback").textContent =
          `Not quite. Correct answer: ${answer}`;
        element.classList.add("wrong");
      }

      $$(".answer").forEach(answerButton => {
        answerButton.disabled = true;
      });

      sync();

      setTimeout(() => {
        if (S.finished) return;

        if (
          game === "stroop" &&
          config.mode === "classic" &&
          S.attempts >= 20
        ) {
          finish();
        } else {
          question();
        }
      }, 650);
    };
  });
}

/* ---------- Memory Match ---------- */

function memory() {
  const symbols = {
    fruit: [
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉",
      "🍇", "🍓", "🍒", "🍑", "🍍", "🥝",
      "🥭", "🫐", "🍈", "🥥", "🍏", "🫒"
    ],
    shapes: [
      "●", "■", "▲", "◆", "★", "♥",
      "✦", "✚", "○", "□", "△", "◇",
      "☆", "♡", "✧", "✖", "⬟", "⬡"
    ]
  };

  // Text labels replace the design's animal photographs.
  const animalLabels = [
    "Lion", "Bear", "Fox", "Cat", "Dog", "Owl",
    "Panda", "Tiger", "Wolf", "Deer", "Horse", "Rabbit",
    "Koala", "Otter", "Zebra", "Lynx", "Seal", "Mouse"
  ];

  const deck = shuffle(
    [...Array(S.total).keys()].flatMap(id => [id, id])
  );

  let open = [];

  $("#board").innerHTML = `
    <div class="puzzle memory-board">
      <div class="board-heading">
        <b>♧ Find matching pairs</b>
        <span>${cap(config.theme)} · ${cap(config.difficulty)}</span>
      </div>

      <div class="memory-grid" style="--cols:${S.total === 18 ? 6 : 4}">
        ${deck
          .map(
            (id, index) => `
              <button
                type="button"
                class="memory-card tone-${id % 8}"
                data-card="${index}"
                aria-label="Reveal card ${index + 1}"
              >
                <span class="back">✦<small>•••</small></span>
                <span class="face">${
                  config.theme === "animals"
                    ? animalLabels[id]
                    : symbols[config.theme][id]
                }</span>
              </button>
            `
          )
          .join("")}
      </div>

      <div class="board-status" role="status" aria-live="polite">
        Reveal two cards to find a pair
      </div>
    </div>
  `;

  $$(".memory-card").forEach((element, index) => {
    element.onclick = () => {
      if (
        S.locked ||
        S.finished ||
        element.disabled ||
        open.includes(index)
      ) return;

      element.classList.add("flipped");
      element.setAttribute(
        "aria-label",
        config.theme === "animals"
          ? animalLabels[deck[index]]
          : symbols[config.theme][deck[index]]
      );

      open.push(index);
      if (open.length !== 2) return;

      S.attempts++;
      S.locked = true;

      const pair = [...open];
      const matched = deck[pair[0]] === deck[pair[1]];

      $(".board-status").textContent = matched
        ? "Match found! +80 points"
        : "No match — these cards flip back";

      if (matched) {
        S.correct++;
        S.score += 80;
      }

      sync();

      setTimeout(() => {
        if (S.finished) return;

        pair.forEach(cardIndex => {
          const card = $(`[data-card="${cardIndex}"]`);

          if (matched) {
            card.classList.add("matched");
            card.disabled = true;
            card.setAttribute("aria-label", "Matched pair");
          } else {
            card.classList.remove("flipped");
            card.setAttribute(
              "aria-label",
              `Reveal card ${cardIndex + 1}`
            );
          }
        });

        open = [];
        S.locked = false;

        if (S.correct === S.total) {
          S.score += 80; // Completion bonus.
          finish();
        }
      }, 850);
    };
  });
}

/* ---------- Word Hunt ---------- */

function wordHunt() {
  const size = config.difficulty === "hard" ? 8 : 6;
  const targets = ["CAT", "DOG", "SUN", "MAP", "BEE", "FOX", "OWL", "ANT"];

  let cells;

  if (size === 6) {
    // Same starting letter arrangement as the selected design.
    cells = [
      "CATDOG",
      "SMAPBO",
      "UFOXEW",
      "NANTEL",
      "RHQZVK",
      "JUPXSI"
    ].join("").split("");
  } else {
    cells = Array(size * size).fill("");
    const directions = [[0, 1], [1, 0], [1, 1]];

    for (const word of targets) {
      let placed = false;

      for (let trial = 0; trial < 1000 && !placed; trial++) {
        const [dr, dc] = pick(directions);
        const row = Math.floor(Math.random() * size);
        const column = Math.floor(Math.random() * size);

        const positions = [...word].map((_, index) => [
          row + dr * index,
          column + dc * index
        ]);

        const fits = positions.every(([y, x], index) =>
          y < size &&
          x < size &&
          (
            !cells[y * size + x] ||
            cells[y * size + x] === word[index]
          )
        );

        if (fits) {
          positions.forEach(([y, x], index) => {
            cells[y * size + x] = word[index];
          });
          placed = true;
        }
      }

      if (!placed) {
        wordHunt();
        return;
      }
    }

    cells = cells.map(
      cell => cell || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))
    );
  }

  const found = new Set();
  let start = null;
  let current = [];
  let dragging = false;
  let keyboardStart = null;

  $("#board").innerHTML = `
    <div class="puzzle word-board">
      <div class="board-heading">
        <b>Find these words</b>
        <span id="remaining">8 TO GO</span>
      </div>

      <div class="targets">
        ${targets
          .map(word => `<span data-word="${word}">${word}</span>`)
          .join("")}
      </div>

      <div class="word-grid" style="--cols:${size}">
        ${cells
          .map(
            (letter, index) => `
              <button
                class="letter"
                type="button"
                data-cell="${index}"
                aria-label="${letter}, row ${
                  Math.floor(index / size) + 1
                }, column ${index % size + 1}"
              >${letter}</button>
            `
          )
          .join("")}
      </div>

      <div class="sr-only" id="word-status" aria-live="polite"></div>
    </div>
  `;

  const grid = $(".word-grid");

  function path(first, last) {
    const row = Math.floor(first / size);
    const column = first % size;
    const dy = Math.floor(last / size) - row;
    const dx = last % size - column;

    if (
      dx &&
      dy &&
      (size === 6 || Math.abs(dx) !== Math.abs(dy))
    ) return [];

    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    return Array.from(
      { length: steps + 1 },
      (_, index) =>
        (row + Math.sign(dy) * index) * size +
        column +
        Math.sign(dx) * index
    );
  }

  function clearSelection() {
    $$(".selecting").forEach(element => {
      element.classList.remove("selecting");
    });
  }

  function preview(end) {
    clearSelection();
    current = path(start, end);

    current.forEach(index => {
      $(`[data-cell="${index}"]`).classList.add("selecting");
    });
  }

  function commit() {
    const word = current.map(index => cells[index]).join("");
    const reverse = [...word].reverse().join("");

    const match = targets.find(
      target => target === word || target === reverse
    );

    if (match && !found.has(match)) {
      found.add(match);

      const tone = [
        "#45e0a8",
        "#ffc83d",
        "#ff4f86",
        "#bca5ff"
      ][found.size % 4];

      current.forEach(index => {
        const element = $(`[data-cell="${index}"]`);
        element.style.background = tone;
        element.classList.add("found");
      });

      const label = $(`[data-word="${match}"]`);
      label.classList.add("done");
      label.style.background = tone;

      S.correct++;
      S.score += 100;
      S.attempts = S.correct;

      $("#remaining").textContent = `${8 - found.size} TO GO`;
      $("#word-status").textContent = `${match} found`;

      sync();

      if (found.size === 8) {
        setTimeout(finish, 400);
      }
    }

    clearSelection();
    current = [];
    start = null;
  }

  grid.onpointerdown = event => {
    if (
      S.pausedAt ||
      S.finished ||
      !event.target.matches(".letter")
    ) return;

    event.preventDefault();
    keyboardStart = null;
    start = Number(event.target.dataset.cell);
    dragging = true;

    grid.setPointerCapture(event.pointerId);
    preview(start);
  };

  grid.onpointermove = event => {
    if (!dragging) return;

    const cell = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-cell]");

    if (cell && grid.contains(cell)) {
      preview(Number(cell.dataset.cell));
    }
  };

  grid.onpointerup = () => {
    if (!dragging) return;
    dragging = false;

    if (S.pausedAt) {
      current = [];
      start = null;
      clearSelection();
    } else {
      commit();
    }
  };

  grid.onpointercancel = () => {
    dragging = false;
    current = [];
    start = null;
    clearSelection();
  };

  // Keyboard alternative: activate the first and last letter.
  grid.onclick = event => {
    if (
      event.detail !== 0 ||
      S.pausedAt ||
      S.finished ||
      !event.target.matches(".letter")
    ) return;

    const index = Number(event.target.dataset.cell);

    if (keyboardStart === null) {
      keyboardStart = index;
      start = index;
      preview(index);
      $("#word-status").textContent =
        "First letter selected. Select the last letter.";
    } else {
      start = keyboardStart;
      preview(index);
      commit();
      keyboardStart = null;
    }
  };

  $("#pause").onclick = () => {
    if (S.finished) return;

    if (S.pausedAt) {
      S.pauseTotal += performance.now() - S.pausedAt;
      S.pausedAt = 0;
      $("#pause").textContent = "Ⅱ Pause";
    } else {
      S.pausedAt = performance.now();
      $("#pause").textContent = "▶ Resume";
    }

    $("#board").classList.toggle("paused", Boolean(S.pausedAt));
  };
}

/* ---------- Ball Tracker ---------- */

const delay = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

async function ball() {
  const count = config.difficulty === "hard" ? 4 : 3;
  const order = Array.from({ length: count }, (_, index) => index);
  const winning = pick(order);

  S.locked = true;
  let answered = false;

  $("#board").innerHTML = `
    <div class="ball-stage">
      <p>PICK THE CUP</p>
      <h2 id="ball-question">Watch the ball</h2>

      <div class="cup-track" style="--cups:${count}">
        ${order
          .map(
            id => `
              <button
                class="cup-button"
                data-cup="${id}"
                type="button"
                disabled
                aria-label="Select cup ${id + 1}"
                style="--slot:${id}"
              >
                <span class="cup-shape"></span>
                <span
                  class="ball-dot"
                  ${id === winning ? "" : "hidden"}
                ></span>
                <b>${id + 1}</b>
              </button>
            `
          )
          .join("")}
      </div>

      <p id="ball-hint" role="status">
        Watch it hide → Follow the shuffle
      </p>
    </div>

    <div class="ball-feedback" role="status" aria-live="polite">
      Keep your eyes on the cup.
    </div>

    ${button("NEXT ROUND &nbsp;→", "next-round")}
  `;

  $("#next-round").disabled = true;

  const winner = $(`[data-cup="${winning}"]`);

  winner.classList.add("lift");
  await delay(1400);
  if (S.finished) return;

  winner.classList.remove("lift");
  await delay(450);
  if (S.finished) return;

  winner.querySelector(".ball-dot").hidden = true;
  $("#ball-question").textContent = "Follow the shuffle";

  for (let index = 0; index < (count === 4 ? 8 : 5); index++) {
    if (S.finished) return;

    const first = Math.floor(Math.random() * count);
    const second =
      (first + 1 + Math.floor(Math.random() * (count - 1))) % count;

    [order[first], order[second]] = [order[second], order[first]];

    order.forEach((id, slot) => {
      const cup = $(`[data-cup="${id}"]`);
      cup.style.setProperty("--slot", slot);
      cup.querySelector("b").textContent = slot + 1;
      cup.setAttribute("aria-label", `Select cup ${slot + 1}`);
    });

    await delay(count === 4 ? 420 : 700);
  }

  if (S.finished) return;

  $("#ball-question").textContent = "Where is the ball?";
  $("#ball-hint").textContent = "Shuffle stopped. Click a cup.";
  S.locked = false;

  $$(".cup-button").forEach(element => {
    element.disabled = false;

    element.onclick = () => {
      if (S.locked || answered || S.finished) return;

      answered = true;
      S.locked = true;
      S.attempts++;

      const correct = Number(element.dataset.cup) === winning;

      if (correct) {
        S.correct++;
        S.score += 10;
      }

      winner.classList.add("lift");
      winner.querySelector(".ball-dot").hidden = false;

      $$(".cup-button").forEach(cup => {
        cup.disabled = true;
      });

      $("#ball-hint").textContent =
        `Ball found under cup ${order.indexOf(winning) + 1}`;

      $(".ball-feedback").textContent = correct
        ? "✓ Correct! +10 points"
        : "Not quite. Watch closely next round.";

      $(".ball-feedback").classList.toggle("wrong-feedback", !correct);

      $("#next-round").disabled = false;
      $("#next-round").textContent =
        S.round === 10 ? "VIEW RESULTS →" : "NEXT ROUND →";

      sync();
    };
  });

  $("#next-round").onclick = () => {
    if (!answered) return;

    if (S.round === 10) {
      finish();
    } else {
      S.round++;
      sync();
      ball();
    }
  };
}

/* ---------- Results pages ---------- */

function results() {
  const result = read(`${game}:result`, null);

  if (!result || typeof result.score !== "number") {
    $("#app").innerHTML = `
      <div class="empty">
        <h1>${title}</h1>
        <p>Complete a game to see your results.</p>
        ${button("START GAME →", "start")}
      </div>
    `;

    $("#start").onclick = () => go("setup");
    return;
  }

  Object.assign(config, result.config);

  const info = (label, value) => `
    <div class="result-stat">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `;

  const accuracy =
    game === "word-hunt" && result.correct === 8
      ? "✓"
      : `${result.accuracy}%`;

  let details = "";

  if (game === "memory-match") {
    details = `
      <div class="result-row">
        ${info("MATCHED PAIRS", `${result.correct}/${result.total}`)}
        ${info("ATTEMPTS", result.attempts)}
      </div>

      ${info("COMPLETION TIME", clock(result.seconds))}
    `;
  } else if (game === "word-hunt") {
    details = `
      <div class="result-row">
        ${info("WORDS FOUND", `${result.correct}/8`)}
        ${info("TIME TAKEN", clock(result.seconds))}
      </div>
    `;
  } else if (game === "ball-tracker") {
    details = `
      <div class="result-row">
        ${info("CORRECT", `${result.correct}/10`)}
        ${info("INCORRECT", `${10 - result.correct}/10`)}
      </div>
    `;
  } else {
    details = `
      <div class="result-row">
        ${info("CORRECT ANSWERS", `${result.correct}/${result.attempts}`)}
        ${info("BEST STREAK", result.streak)}
      </div>

      ${info("AVERAGE REACTION TIME", `${result.reaction.toFixed(1)} sec`)}
    `;
  }

  $("#app").innerHTML = `
    <div class="layout results">
      <section class="result-intro">
        <span class="eyebrow">✦ ${title.toUpperCase()}</span>

        <h1>
          Game ${
            ["word-hunt", "ball-tracker"].includes(game)
              ? "Completed"
              : "Complete"
          }!
        </h1>

        <p>
          ${cap(config.mode)} · ${cap(config.difficulty)}
          ${
            game === "memory-match"
              ? " · " + cap(config.theme)
              : game === "quick-math"
              ? " · 60 seconds"
              : game === "ball-tracker"
              ? " · 10 rounds"
              : ""
          }
        </p>

        <div class="score-card ${game === "memory-match" ? "light" : ""}">
          <div>
            <small>FINAL SCORE</small>
            <strong>
              ${result.score}
              ${game === "ball-tracker" ? "<sub>/ 100</sub>" : ""}
            </strong>
          </div>

          <div class="accuracy">
            <b>${accuracy}</b>
            <small>
              ${
                game === "word-hunt" && result.correct === 8
                  ? "ALL FOUND"
                  : "ACCURACY"
              }
            </small>
          </div>
        </div>

        <p class="footnote">
          ${
            game === "word-hunt"
              ? `${result.correct} words × 100 points · No time bonus`
              : game === "ball-tracker"
              ? `${result.correct} correct × 10 points = ${result.score}. Nice tracking!`
              : game === "quick-math"
              ? "Nice number crunching!"
              : "Your progress, one game at a time."
          }
          <br>
          Fully offline · Your best stays on this device
        </p>
      </section>

      <section class="result-details">
        ${details}

        <div class="personal-best">
          <span class="star">★</span>

          <div>
            <b>
              ${result.newBest ? "PERSONAL BEST" : "LOCAL BEST"}
              &nbsp;${result.best}
            </b>
            <small>
              Saved on this device · Previous best ${result.previous}
            </small>
          </div>

          ${result.newBest ? '<span class="new-best">NEW BEST</span>' : ""}
        </div>

        ${button("PLAY AGAIN &nbsp;⟳", "again")}
        ${button("BACK TO GAMES &nbsp;←", "back", "secondary")}
      </section>
    </div>
  `;

  $("#again").onclick = () => go("gameplay");
  $("#back").onclick = () => $("#games-dialog").showModal();
}

/* ---------- Route initialization ---------- */

if (!title) throw new Error("Unknown game");

if (view === "setup") {
  setup();
} else if (view === "gameplay") {
  play();
} else {
  results();
}
