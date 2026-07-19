# 🎵 Codio — Where Code Meets Sound

> An interactive web-based educational platform that transforms programming into a real-time musical experience.

![Codio](https://img.shields.io/badge/version-0.1.0--alpha-blueviolet?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat-square&logo=scikit-learn)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📖 What is Codio?

Codio is a gamified coding platform where **your code becomes music**. Each level presents a programming challenge. As you write and execute your solution, the system analyzes its structure and maps programming constructs to musical audio layers in real time.

- ✅ Correct code with the right structure → music plays in full harmony
- ⚠️ Partial or incorrect code → layers drift out of sync
- ❌ Broken code → silence and distortion

The platform is inspired by [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) for its level/password progression mechanic and [LeetCode](https://leetcode.com) for its challenge format.

---

## 🎮 How It Works

1. **Enter a level** — read the mission brief, hear the broken reference track
2. **Write your solution** — Python or JavaScript, in a Monaco editor (same engine as VS Code)
3. **Run your code** — the backend executes it safely and analyzes its structure via AST
4. **Hear the result** — a trained ML model maps code features to audio layer weights
5. **Reach 100% harmony** — the level completes and reveals a **song name**
6. **Use the song name as the password** for the next level — just like Bandit

---

## 🧠 Code → Music Mapping

| Layer | Maps to |
|---|---|
| 🥁 Drums | Loops (`for`, `while`) |
| 🎸 Chords | Conditions (`if`, `elif`) |
| 🎵 Bass | Functions / class methods |
| 🎶 Melody | Output correctness |

Each layer has three states: **BROKEN** (not yet run), **DRIFTING** (partial), **IN SYNC** (correct).

---

## 🚀 Tech Stack

### Frontend
- [React](https://reactjs.org/) — UI framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code-powered code editor
- [xterm.js](https://xtermjs.org/) — real terminal emulator
- Web Audio API — layered audio playback engine
- Plain CSS with CSS variables — cyberpunk theme

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) — REST API
- Python `ast` module — code structure analysis
- [scikit-learn](https://scikit-learn.org/) — `RandomForestRegressor` ML model
- [joblib](https://joblib.readthedocs.io/) — model persistence
- `subprocess` — sandboxed code execution (Python + JavaScript)

---

## 📁 Project Structure

```
Codio/
├── frontend/
│   ├── public/
│   │   └── audio/              # Audio stem files (.wav / .mp3)
│   └── src/
│       ├── components/
│       │   └── XTerminal.jsx   # xterm.js terminal component
│       ├── data/
│       │   └── levels.js       # Level config (challenges, passwords, songs)
│       ├── pages/
│       │   ├── Landing.jsx     # Landing page
│       │   ├── LevelSelect.jsx # Level selection + password system
│       │   └── Level.jsx       # Game screen
│       ├── utils/
│       │   └── Mockrunner.js   # Local test runner (no backend needed)
│       ├── App.jsx             # Routing
│       └── App.css             # Global cyberpunk styles
└── backend/
    └── sprint1/
        ├── main.py             # FastAPI server + endpoints
        └── train_model.py      # ML model training script
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- pip
- Node.js (for JavaScript execution support)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/codio.git
cd codio
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Backend setup

```bash
cd backend/sprint1
pip install fastapi uvicorn scikit-learn joblib numpy
```

### 4. Train the ML model

```bash
python train_model.py
```

This generates `harmony_model.pkl` in the same directory.

### 5. Start the backend

```bash
python -m uvicorn main:app --reload
```

Backend runs on `http://127.0.0.1:8000`

### 6. Add audio files

Place your audio stem files in `frontend/public/audio/`:

```
public/audio/
├── drums.wav       # Level 0 — drums layer
├── chords.mp3      # Level 0 — chords layer
├── bass.wav        # Level 0 — bass layer
├── l1_drums.wav    # Level 1 — drums layer
├── l1_chords.wav   # Level 1 — chords layer
├── l1_bass.wav     # Level 1 — bass layer
└── l1_melody.wav   # Level 1 — melody layer
```

---

## 🎯 API Reference

### `POST /analyze-code`

Executes code, extracts features via AST, and returns ML-predicted harmony weights.

**Request:**
```json
{
  "code": "for i in range(5):\n    print(i)",
  "language": "python",
  "level_id": 0,
  "expected_output": "0\n1\n2\n3\n4",
  "loops_required": 1,
  "conditions_required": 0,
  "functions_required": 0,
  "test_runner": ""
}
```

**Response:**
```json
{
  "output": "0\n1\n2\n3\n4",
  "harmony_score": 100,
  "layers": {
    "drums":  { "weight": 1.0, "synced": true },
    "chords": { "weight": 1.0, "synced": true },
    "bass":   { "weight": 0.0, "synced": false },
    "melody": { "weight": 0.0, "synced": false }
  },
  "analysis": {
    "loops": 1,
    "conditions": 0,
    "function_presence": false,
    "nested_depth": 2,
    "syntax_error": false,
    "correct_output": true
  }
}
```

### `POST /run-code`

Executes code and returns raw output with basic AST analysis. No ML inference.

---

## 🔐 Level Progression

Codio uses a **session-based password system** — nothing is saved between sessions.

- **Level 0** is always accessible
- Completing a level at 100% harmony reveals the **song name**
- That song name is the **password** for the next level
- On every new session, the password must be re-entered

| Level | Challenge | Password to enter | Song revealed |
|---|---|---|---|
| 0 | Write a loop (0 to 4) | none | THE BEGINNING |
| 1 | Complete isPalindrome | THE BEGINNING | CYBERPATH |

---

## 🤖 ML Model

The harmony model is a `RandomForestRegressor` wrapped in `MultiOutputRegressor` from scikit-learn.

**Input features (8):**
```
loops, conditions, function_presence, correct_output,
nested_depth, loops_required, conditions_required, functions_required
```

**Output values (4):**
```
harmony_score (0–100), drum_weight (0–1), chord_weight (0–1), bass_weight (0–1)
```

Trained on ~60 manually crafted samples. To retrain:
```bash
python train_model.py
```

**Key property:** The model evaluates *what* constructs are present and whether the output is correct — not *how* the code is written. Any valid solution scores equally regardless of implementation style.

---

## 🗺️ Roadmap

- [ ] Level 2+ (recursion, data structures, algorithms)
- [ ] LLM-powered contextual hints
- [ ] Adaptive difficulty based on user history
- [ ] Java / TypeScript support
- [ ] Auto-generate level configs from problem descriptions
- [ ] Multiplayer mode — shared audio layers
- [ ] Mobile version

---

## 👥 Team

| Role | Responsibility |
|---|---|
| Frontend + AI | React UI, ML integration, audio engine |
| Backend | FastAPI, AST analysis, code execution, ML training |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built as a PFA project · 2026</sub>
</div>
