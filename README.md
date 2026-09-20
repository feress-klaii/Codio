# 🎵 Codio — Where Code Meets Sound

> An interactive web-based educational platform that transforms programming into a real-time musical experience.

![Codio](https://img.shields.io/badge/version-0.1.0--alpha-blueviolet?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview

Codio is a gamified coding platform where your code becomes music. Players move through a sequence of programming challenges, write and test solutions, and receive a harmony score based on code structure, correctness, and hidden validation.

The project combines:

- a Vite + React frontend for the gameplay experience
- a Python FastAPI backend for execution and scoring
- a level system with passwords, progression, and challenge metadata
- a harmony-model scoring pipeline for evaluating code quality

---

## What the app does

Each level presents a programming challenge in a browser-based editor. The user writes a solution in Python or JavaScript, submits it, and the backend analyzes:

- syntax validity
- loop and condition usage
- function presence
- runtime correctness
- hidden test pass/fail conditions

The evaluated result is translated into a harmony score and layered visual/audio feedback.

---

## Tech stack

### Frontend
- React 19
- Vite
- Monaco-style editor experience via `@monaco-editor/react`
- xTerm integration for terminal-style feedback
- Axios for API calls
- CSS-based game interface

### Backend
- Python 3.12
- FastAPI
- `ast` parsing for Python code analysis
- Node-based JavaScript analysis fallback
- `subprocess` execution for code validation
- joblib + scikit-learn model artifacts for harmony scoring

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

## Frontend app flow

The frontend is organized around a screen-based flow:

1. Landing screen
2. Level selection screen
3. Active challenge screen

The main app state is managed in `frontend/src/App.jsx`, which switches between these screens and passes the currently selected level into the gameplay view.

---

## Backend behavior

The primary backend service lives in `frontend/backend/sprint1/main.py` and exposes the following API endpoints:

- `POST /run-code`
  - runs submitted code
  - returns stdout/stderr output
  - performs basic AST-based analysis

- `POST /analyze-code`
  - runs code against expected output
  - checks hidden tests for the level
  - calculates harmony score from criteria
  - returns per-layer score state

The backend uses level-specific rules from `LEVEL_CRITERIA` and `LEVEL_HIDDEN_TESTS`, so scoring is driven by the server rather than by stale client-side assumptions.

---

## Level system

Levels are defined in `frontend/src/data/levels.js` and include:

- unique IDs and ordering
- challenge names and descriptions
- starter code for Python and JavaScript
- expected outputs
- validation criteria
- password progression metadata
- layer display and soundtrack references

The project includes progression-based gameplay with hidden task validation and “song password” mechanics.

---

## Setup

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

The frontend runs at:

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

Train the harmony model if needed:

```bash
python train_model.py
```

Then start the API:

```bash
python -m uvicorn main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

---

## Notes

- The active backend in this repository is under `frontend/backend/sprint1`, not at the repo root.
- Audio assets are stored in `frontend/public/audio/` and are used as the layer soundtrack references for the game.
- The project is currently a gameplay prototype with educational algorithm challenges, hidden tests, and music-inspired scoring.

---

## License

MIT License

---

## Project summary

Codio is an educational coding game that turns code writing into a harmonic challenge. It blends frontend interactivity, backend validation, and game-based progression to create a playful learning loop where correctness and structure both matter.
