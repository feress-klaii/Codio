<div align="center">
  <img src="https://img.shields.io/badge/Codio-Code%20Meets%20Sound-0A0F1C?style=for-the-badge&logo=code" alt="Codio" />
  <h1><img src="https://img.shields.io/badge/🎵-Codio-00F5FF?style=flat-square" alt="Codio logo" /> Codio</h1>
  <p>
    <strong>Code. Jam. Sync.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-API-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/License-MIT-00FF9C?style=flat-square" alt="MIT License" />
  </p>
</div>

<p align="center">
  A cyberpunk coding game where every solution is turned into rhythm, logic, and harmony.
</p>

---

## Overview

Codio is a browser-based programming challenge game where players solve coding tasks, submit their answers, and get instant feedback through a harmony scoring system.

Instead of a normal judge, the app turns your code into a layered soundscape:

- loops drive the drums
- conditions shape the chords
- functions anchor the bass
- correctness and hidden tests complete the melody

The result is a game-like coding experience with progression, challenge unlocks, and a dark neon sci-fi aesthetic.

---

## Why it feels different

Codio blends classic coding practice with game feedback:

- write code in a browser editor
- execute and validate it on the backend
- review syntax and runtime output
- score your result against level criteria
- unlock new challenge states with passwords and progression

This creates a learning loop that feels more like a rhythm-based puzzle than a plain coding exercise.

---

## Feature highlights

<table>
  <tr>
    <td align="center" valign="top" width="33%">
      <h3>🎮 Game-driven progression</h3>
      <p>Levels unlock through challenge flow, password gates, and nested problem progression.</p>
    </td>
    <td align="center" valign="top" width="33%">
      <h3>🧠 Code analysis</h3>
      <p>Python and JavaScript submissions are checked for structure, logic, syntax, and hidden behavior.</p>
    </td>
    <td align="center" valign="top" width="33%">
      <h3>🎵 Harmony scoring</h3>
      <p>Correct solutions push the layers into sync and reveal the soundtrack of a level.</p>
    </td>
  </tr>
</table>

---

## Stack

### Frontend

- React 19
- Vite
- `@monaco-editor/react`
- `@xterm/xterm`
- Axios
- CSS-driven cyberpunk UI

### Backend

- Python 3.12
- FastAPI
- AST-based Python analysis
- JavaScript validation via Node
- `subprocess` execution sandbox
- joblib + scikit-learn model artifacts

---

## Repository structure

```text
Codio/
├── README.md
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── audio/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       │   └── XTerminal.jsx
│       ├── data/
│       │   └── levels.js
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Landing.css
│       │   ├── LevelSelect.jsx
│       │   ├── LevelSelect.css
│       │   ├── Level.jsx
│       │   └── Level.css
│       └── utils/
│           └── Mockrunner.js
│
└── frontend/backend/
    ├── sprint1/
    │   ├── main.py
    │   ├── train_model.py
    │   ├── analyze_js.js
    │   ├── dump_levels.mjs
    │   ├── verify_levels.py
    │   ├── harmony_model.pkl
    │   ├── harmony_model_meta.pkl
    │   ├── package.json
    │   ├── package-lock.json
    │   └── venv/
    └── harmony-backend/
        └── venv/
```

---

## App flow

The application is built around a small state-driven screen flow:

1. Landing screen
2. Level selection menu
3. Active coding challenge screen

The main screen routing is centralized in `frontend/src/App.jsx`, while the level definitions and challenge data live in `frontend/src/data/levels.js`.

---

## Backend logic

The core service lives in `frontend/backend/sprint1/main.py` and includes:

- `POST /run-code`
  - executes submitted code
  - checks output and syntax errors
  - returns runtime analysis

- `POST /analyze-code`
  - validates correctness
  - runs hidden tests for each level
  - computes harmony score from criteria
  - returns per-layer score state

This backend is the authoritative scoring source, which keeps evaluation consistent even as the frontend changes.

---

## Level system

Each challenge includes:

- challenge text and examples
- starter code for Python/JS
- expected output
- hidden tests
- required structural features
- password progression metadata
- layer-specific scoring criteria

This keeps the game progression aligned with the actual challenge difficulty and hidden logic checks.

---

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- npm
- pip

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Backend

```bash
cd frontend/backend/sprint1
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn scikit-learn joblib numpy
```

Train the model if needed:

```bash
python train_model.py
```

Run the API:

```bash
python -m uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

---

## Notes

- The active backend is located under `frontend/backend/sprint1`.
- Audio and static assets live in `frontend/public/`.
- The project is a prototype game with music-inspired feedback, level progression, and algorithmic challenge logic.

---

## License

MIT License

---

## Project summary

Codio turns problem-solving into a neon-lit coding challenge. It blends a modern React interface, a FastAPI validation layer, and a harmony-based scoring model to make code practice feel immersive, interactive, and rewarding.
