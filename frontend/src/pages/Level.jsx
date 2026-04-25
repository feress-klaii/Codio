import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { levels } from "../data/levels";
import { mockRunCode } from "../utils/Mockrunner";
import XTerminal from "../components/XTerminal";
import "./Level.css";

const USE_MOCK = false;

const LANGUAGES = [
  { key: "python",     label: "Python",     monacoLang: "python"     },
  { key: "javascript", label: "JavaScript", monacoLang: "javascript" },
];

// Starter code per language per level
const STARTER_CODE = {
  0: {
    python:     "# Write your code here\n",
    javascript: "// Write your code here\n",
  },
  1: {
    python:
`class Solution(object):
    def isPalindrome(self, x):
        # Complete this method
        # Return True if x is a palindrome, False otherwise
        pass

# Test runner — do not modify
sol = Solution()
print(sol.isPalindrome(121))
print(sol.isPalindrome(-121))
print(sol.isPalindrome(10))
`,
    javascript:
`/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Complete this function
    // Return true if x is a palindrome, false otherwise
};

// Test runner — do not modify
console.log(isPalindrome(121));
console.log(isPalindrome(-121));
console.log(isPalindrome(10));
`,
  },
};

const getStarterCode = (levelId, lang) => {
  if (lang === "javascript") {
    const lvl = levels.find(l => l.id === levelId);
    return lvl?.starterCodeJS || "// Write your code here\n";
  }
  return (STARTER_CODE[levelId] && STARTER_CODE[levelId][lang])
    ? STARTER_CODE[levelId][lang]
    : "# Write your code here\n";
};

// Broken state: layers play offset + low volume to sound chaotic
const BROKEN_OFFSETS = { drums: 0.8, chords: 1.4, bass: 0.6, melody: 1.9 };
const BROKEN_VOLUMES = { drums: 0.3, chords: 0.25, bass: 0.2, melody: 0.15 };

function Level({ level, setScreen }) {
  const [code, setCode]                   = useState(() => getStarterCode(level.id, "python"));
  const [language, setLanguage]           = useState("python");
  const [langDropdownOpen, setLangOpen]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [completed, setCompleted]         = useState(false);
  const [completionFlash, setFlash]       = useState(false);
  const [songRevealed, setSongRevealed]   = useState(false);
  const [revealedText, setRevealedText]   = useState("");
  const [harmonyScore, setHarmonyScore]   = useState(0);
  const [brokenPlaying, setBrokenPlaying] = useState(false);
  const [refPlaying, setRefPlaying]       = useState(false);
  const refAudioRefs = useRef({});
  const [layerStates, setLayerStates]     = useState({
    drums:  { active: false, synced: false, volume: 0 },
    chords: { active: false, synced: false, volume: 0 },
    bass:   { active: false, synced: false, volume: 0 },
    melody: { active: false, synced: false, volume: 0 },
  });

  const termRef = useRef(null);
  const audioRefs = useRef({});     // live layers
  const brokenRefs = useRef({});    // broken reference layers

  // ── Initialize audio ──
  useEffect(() => {
    const layerKeys = Object.keys(level.layers).filter(k => level.layers[k] !== null);

    layerKeys.forEach((key) => {
      const src = level.layers[key].src;

      // Live layer — starts silent, activated by ML weights
      const live = new Audio(src);
      live.loop   = true;
      live.volume = 0;
      audioRefs.current[key] = live;

      // Broken layer — plays offset/low volume when user hits PLAY
      const broken = new Audio(src);
      broken.loop   = true;
      broken.volume = 0;
      brokenRefs.current[key] = broken;

      // Perfect reference — full volume, in sync
      const ref = new Audio(src);
      ref.loop   = true;
      ref.volume = 1;
      refAudioRefs.current[key] = ref;
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => { a.pause(); a.src = ""; });
      Object.values(brokenRefs.current).forEach(a => { a.pause(); a.src = ""; });
      Object.values(refAudioRefs.current).forEach(a => { a.pause(); a.src = ""; });
    };
  }, [level]);



  // ── Play broken reference (chaotic, offset) ──
  const playBroken = () => {
    Object.entries(brokenRefs.current).forEach(([key, audio]) => {
      audio.volume      = BROKEN_VOLUMES[key] || 0.2;
      audio.currentTime = BROKEN_OFFSETS[key] || 0.5;
      audio.play().catch(() => {});
    });
    setBrokenPlaying(true);
  };

  const stopBroken = () => {
    Object.values(brokenRefs.current).forEach(a => { a.pause(); a.currentTime = 0; });
    setBrokenPlaying(false);
  };

  // ── Play perfect reference ──
  const playRef = () => {
    Object.values(refAudioRefs.current).forEach(a => {
      a.currentTime = 0;
      a.play().catch(() => {});
    });
    setRefPlaying(true);
  };

  const stopRef = () => {
    Object.values(refAudioRefs.current).forEach(a => { a.pause(); a.currentTime = 0; });
    setRefPlaying(false);
  };

  // ── Stop all live layers ──
  const stopAll = () => {
    Object.values(audioRefs.current).forEach(a => { a.pause(); a.currentTime = 0; });
    stopBroken();
    stopRef();
    setLayerStates({
      drums:  { active: false, synced: false, volume: 0 },
      chords: { active: false, synced: false, volume: 0 },
      bass:   { active: false, synced: false, volume: 0 },
      melody: { active: false, synced: false, volume: 0 },
    });
    setHarmonyScore(0);
  };

  // ── Full reset ──
  const resetLevel = () => {
    setCode(getStarterCode(level.id, "python"));
    setLanguage("python");
    stopAll();
    setCompleted(false);
    setSongRevealed(false);
    setRevealedText("");
    setHarmonyScore(0);
    termRef.current?.clear();
  };

  const switchLanguage = (lang) => {
    setLanguage(lang);
    setCode(getStarterCode(level.id, lang));
    setLangOpen(false);
    stopAll();
    termRef.current?.clear();
  };

  // ── Fade audio in/out ──
  const fadeIn = (audio, targetVolume, duration = 500) => {
    audio.volume = 0;
    audio.play().catch(() => {});
    const steps    = 20;
    const interval = duration / steps;
    const step     = targetVolume / steps;
    let current    = 0;
    const timer = setInterval(() => {
      current += step;
      audio.volume = Math.min(current, targetVolume);
      if (current >= targetVolume) clearInterval(timer);
    }, interval);
  };

  // ── Apply ML layers with desync mechanic ──
  const applyMusicLayers = (layers, harmony_score) => {
    const newStates = {};
    const MAX_DELAY = 1.2;

    Object.entries(layers).forEach(([key, data]) => {
      const audio = audioRefs.current[key];
      if (!audio) return;

      if (data.weight > 0) {
        // desync: wrong code = offset playback, perfect = aligned
        const syncScore  = data.synced ? 1.0 : data.weight;
        const delay      = (1 - syncScore) * MAX_DELAY;
        audio.currentTime = delay;
        fadeIn(audio, data.weight * 0.85);
        newStates[key] = { active: true, synced: data.synced, volume: data.weight };
      } else {
        audio.pause();
        audio.currentTime = 0;
        newStates[key] = { active: false, synced: false, volume: 0 };
      }
    });

    // fill missing keys
    ["drums","chords","bass","melody"].forEach(k => {
      if (!newStates[k]) newStates[k] = { active: false, synced: false, volume: 0 };
    });

    setLayerStates(newStates);
    setHarmonyScore(Math.round(harmony_score));
  };

  // ── Mock fallback ──
  const applyMockLayers = (analysis) => {
    const { loops, conditions, function_presence, syntax_error, correct_output } = analysis;
    let layers, score = 0;

    if (level.id === 0) {
      // Level 0: drums=loops, chords=no syntax error, bass=correct output
      const dw = Math.min(loops, 1);
      const cw = syntax_error ? 0 : 1;
      const bw = correct_output ? 1 : 0;
      layers = {
        drums:  { weight: dw, synced: dw > 0 && correct_output },
        chords: { weight: cw, synced: cw > 0 && correct_output },
        bass:   { weight: bw, synced: bw > 0 },
        melody: { weight: 0,  synced: false },
      };
      if (dw > 0) score += layers.drums.synced  ? 35 : 20;
      if (cw > 0) score += layers.chords.synced ? 35 : 20;
      if (bw > 0) score += 30;
    } else {
      // Level 1: drums=correct_output, chords=conditions, bass=functions, melody=no syntax error
      const dw = correct_output ? 1 : 0;
      const cw = Math.min(conditions, 1);
      const bw = function_presence ? 1 : 0;
      const mw = syntax_error ? 0 : 1;
      layers = {
        drums:  { weight: dw, synced: correct_output },
        chords: { weight: cw, synced: cw > 0 && correct_output },
        bass:   { weight: bw, synced: bw > 0 && correct_output },
        melody: { weight: mw, synced: mw > 0 && correct_output },
      };
      if (dw > 0) score += layers.drums.synced  ? 30 : 15;
      if (cw > 0) score += layers.chords.synced ? 25 : 12;
      if (bw > 0) score += layers.bass.synced   ? 25 : 12;
      if (mw > 0) score += layers.melody.synced ? 20 : 10;
    }

    applyMusicLayers(layers, Math.min(100, score));
    return Math.min(100, score);
  };

  // ── Typewriter for song name reveal ──
  const typewriterReveal = (text) => {
    setSongRevealed(true);
    setRevealedText("");
    let i = 0;
    const timer = setInterval(() => {
      setRevealedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 80);
  };

  // ── Completion flash ──
  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 800);
  };

  // ── Harmony bar color (red → orange → yellow → green) ──
  const harmonyColor = (score) => {
    if (score >= 100) return "var(--accent-green)";
    if (score >= 70)  return "#00e5aa";
    if (score >= 40)  return "#f6ad55";
    if (score >= 15)  return "#fc8181";
    return "var(--accent-pink)";
  };

  // ── Build test runner for class-based levels ──
  // Test runner is already embedded in starterCode for class-based levels
  const getTestRunner = () => "";

  // ── Run code ──
  const runCode = async () => {
    stopBroken();  // stop broken, live engine takes over
    stopAll();
    setLoading(true);
    setCompleted(false);
    setSongRevealed(false);
    setRevealedText("");
    termRef.current?.writeLoading();
    await new Promise(r => setTimeout(r, 600));

    try {
      let correctOutput = false;
      let syntaxError   = false;
      let finalScore    = 0;

      if (USE_MOCK) {
        const result = mockRunCode(code, level.expectedOutput);
        syntaxError   = result.analysis.syntax_error;
        correctOutput = result.analysis.correct_output && !syntaxError;
        finalScore    = applyMockLayers(result.analysis);
        termRef.current?.writeOutput(result.output,
          syntaxError ? "error" : correctOutput ? "success" : "wrong");
        if (!syntaxError && !correctOutput)
          termRef.current?.writeHint(`Expected output:\n${level.expectedOutput}`);

      } else {
        const res = await axios.post("http://127.0.0.1:8000/analyze-code", {
          code,
          language,
          level_id:            level.id,
          expected_output:     language === "javascript" ? (level.expectedOutputJS || level.expectedOutput) : level.expectedOutput,
          loops_required:      level.requiredFeatures.includes("loops")      ? 1 : 0,
          conditions_required: level.requiredFeatures.includes("conditions") ? 1 : 0,
          functions_required:  level.requiredFeatures.includes("functions")  ? 1 : 0,
          test_runner:         getTestRunner(),
        });

        const data  = res.data;
        syntaxError   = data.analysis.syntax_error;
        correctOutput = data.analysis.correct_output && !syntaxError;
        finalScore    = data.harmony_score;

        applyMusicLayers(data.layers, data.harmony_score);
        termRef.current?.writeOutput(data.output,
          syntaxError ? "error" : correctOutput ? "success" : "wrong");
        if (!syntaxError && !correctOutput)
          termRef.current?.writeHint(`Expected output:\n${level.expectedOutput}`);
      }

      if (correctOutput && Math.round(finalScore) === 100) {
        setTimeout(() => {
          triggerFlash();
          setCompleted(true);
          // level unlocked via password in LevelSelect — no action needed here
        }, 1200);
      }

    } catch (err) {
      termRef.current?.writeOutput("ERROR: Could not connect to backend.\nMake sure the server is running.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Ctrl+Enter to run ──
  const runCodeRef = useRef(null);
  useEffect(() => { runCodeRef.current = runCode; });
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCodeRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const currentLang = LANGUAGES.find(l => l.key === language);
  const nextLevel   = levels.find(l => l.id === level.id + 1);
  const layerKeys   = ["drums", "chords", "bass", "melody"].filter(k => level.layers[k] !== null);

  const LAYER_DISPLAY = level.id === 0
    ? {
        drums:  { label: "DRUMS",  desc: "Rhythm",               color: "var(--accent-cyan)"   },
        chords: { label: "CHORDS", desc: "Clarity",              color: "var(--accent-purple)" },
        bass:   { label: "BASS",   desc: "Precision",            color: "var(--accent-pink)"   },
        melody: { label: "MELODY", desc: "Harmony",              color: "var(--accent-green)"  },
      }
    : {
        drums:  { label: "DRUMS",  desc: "Precision",            color: "var(--accent-cyan)"   },
        chords: { label: "CHORDS", desc: "Logic",                color: "var(--accent-purple)" },
        bass:   { label: "BASS",   desc: "Structure",            color: "var(--accent-pink)"   },
        melody: { label: "MELODY", desc: "Clarity",              color: "var(--accent-green)"  },
      };

  return (
    <div className={`level-screen scanlines ${completionFlash ? "completion-flash" : ""}`}>

      {/* TOP BAR */}
      <div className="level-topbar">
        <button className="btn-back-small" onClick={() => { stopAll(); setScreen("levelselect"); }}>
          ← LEVELS
        </button>
        <div className="level-topbar-title">
          <span className="level-topbar-id">LEVEL_{String(level.id).padStart(2, "0")}</span>
          <h2 className="level-topbar-name">{level.title}</h2>
        </div>
        <div className="harmony-meter">
          <span className="harmony-label">HARMONY</span>
          <div className="harmony-bar">
            <div className="harmony-fill" style={{
              width: `${harmonyScore}%`,
              background: harmonyColor(harmonyScore),
              transition: "width 0.8s ease, background 0.5s ease",
            }} />
          </div>
          <span className="harmony-score" style={{ color: harmonyColor(harmonyScore) }}>
            {harmonyScore}%
          </span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="level-layout">
        <div className="level-left">

          {/* MISSION BRIEF */}
          <div className="challenge-block corner-accent">
            <div className="challenge-label">[ MISSION BRIEF ]</div>
            <p className="challenge-text">{level.challenge}</p>
            {level.examples && level.examples.length > 0 && (
              <div className="examples-list">
                {level.examples.map((ex, i) => (
                  <div key={i} className="example-row">
                    <span className="example-input">{ex.input}</span>
                    <span className="example-arrow">→</span>
                    <span className="example-output">{ex.output}</span>
                  </div>
                ))}
              </div>
            )}
            {level.hint && (
              <div className="challenge-hint-box">
                {/*<span className="hint-icon">◈</span>*/}
                <p className="challenge-hint">
                  <span className="hint-label">◈ Hint: </span>{level.hint}
                </p>
              </div>
            )}
          </div>

          {/* EDITOR */}
          <div className="editor-wrapper">
            <div className="editor-label">
              <span>[ CODE_EDITOR.{language === "python" ? "py" : "js"} ]</span>
              {USE_MOCK && <span style={{ color: "var(--accent-purple)", marginLeft: "12px" }}>⚠ MOCK</span>}
              <div className="lang-dropdown-wrapper">
                <button className="lang-dropdown-btn" onClick={() => setLangOpen(v => !v)}>
                  {currentLang.label} <span className="lang-arrow">{langDropdownOpen ? "▲" : "▼"}</span>
                </button>
                {langDropdownOpen && (
                  <div className="lang-dropdown-list">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.key}
                        className={`lang-dropdown-item ${language === lang.key ? "lang-dropdown-active" : ""}`}
                        onClick={() => switchLanguage(lang.key)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Editor
              height={level.id === 0 ? "360px" : "380px"}
              language={currentLang.monacoLang}
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v || "")}
              options={{
                fontSize: 14,
                fontFamily: "'Share Tech Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: true,
                lineNumbers: "on",
                lineHeight: 22,
                letterSpacing: 0.5,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  useShadows: false,
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
                overviewRulerLanes: 0,
                wordWrap: "off",
                padding: { top: 12, bottom: 12 },
                roundedSelection: true,
                bracketPairColorization: { enabled: true },
                guides: { indentation: true },
              }}
            />
          </div>

          {/* BUTTONS */}
          <div className="run-row">
            <button className="btn" onClick={runCode} disabled={loading}>
              {loading ? "[ EXECUTING... ]" : "[ RUN CODE ]"}
            </button>
            <span className="shortcut-hint">or Ctrl+Enter</span>
            <button className="btn" style={{ borderColor: "var(--text-muted)", color: "var(--text-muted)", marginLeft: "auto" }} onClick={resetLevel}>
              RESET
            </button>
          </div>

          {/* TERMINAL */}
          <div className="terminal-wrapper corner-accent">
            <div className="terminal-label">[ OUTPUT ]</div>
            <XTerminal ref={termRef} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="level-right">

          {/* REFERENCE TRACK — perfect version */}
          <div className="reference-panel corner-accent">
            <div className="reference-label">[ REFERENCE_TRACK ]</div>
            <p className="reference-desc">
              This is what 100% harmony sounds like.<br />
              Make your code match it.
            </p>
            <div className="reference-layers">
              {layerKeys.map(key => {
                const cfg = LAYER_DISPLAY[key];
                return (
                  <div key={key} className="reference-layer-row" style={{ "--layer-color": cfg.color }}>
                    <div className="ref-dot" />
                    <span className="ref-layer-name">{cfg.label}</span>
                    <div className="ref-wave">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={"wave-bar " + (refPlaying ? "" : "wave-paused")}
                          style={{ animationDelay: i * 0.1 + "s" }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className={"btn " + (refPlaying ? "" : "btn-green")}
              style={{
                width: "100%",
                marginTop: "12px",
                ...(refPlaying && { borderColor: "var(--accent-pink)", color: "var(--accent-pink)" }),
              }}
              onClick={refPlaying ? stopRef : playRef}
            >
              {refPlaying ? "⏹ STOP REFERENCE" : "▶ PLAY REFERENCE"}
            </button>
          </div>

          {/* LIVE ENGINE — starts broken, gets fixed by your code */}{/* LIVE ENGINE */}
          <div className="music-panel corner-accent">
            <div className="music-panel-label">[ LIVE_ENGINE ]</div>
            <p className="reference-desc" style={{ fontSize: "12px", marginBottom: "8px" }}>
              Starts broken. Fix it with your code.
            </p>
            <div className="layers-list">
              {layerKeys.map(key => {
                const state = layerStates[key];
                const cfg   = LAYER_DISPLAY[key];
                return (
                  <div
                    key={key}
                    className={`layer-item ${state.active ? "active" : ""} ${state.synced ? "synced" : ""}`}
                    style={{ "--layer-color": cfg.color }}
                  >
                    <div className="layer-dot" />
                    <div className="layer-info">
                      <span className="layer-name">{cfg.label}</span>
                      <span className="layer-desc">
                        {brokenPlaying && !state.active
                          ? "⚡ BROKEN"
                          : state.active
                            ? state.synced ? "✓ IN SYNC" : "⚠ DRIFTING"
                            : cfg.desc}
                      </span>
                    </div>
                    <div className="layer-right-col">
                      <div className="layer-vol-bar">
                        <div className="layer-vol-fill" style={{ height: `${state.volume * 100}%` }} />
                      </div>
                      <div className="layer-wave">
                        {state.active ? (
                          [...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`wave-bar ${state.synced ? "" : "drifting-wave"}`}
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))
                        ) : (
                          <span className="layer-inactive">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                className={`btn ${brokenPlaying ? "" : "btn-purple"}`}
                style={{
                  flex: 1,
                  ...(brokenPlaying && { borderColor: "var(--accent-pink)", color: "var(--accent-pink)" }),
                }}
                onClick={brokenPlaying ? stopBroken : playBroken}
              >
                {brokenPlaying ? "⏹ STOP" : "▶ PLAY"}
              </button>
              <button
                className="btn"
                style={{ flex: 1, borderColor: "var(--text-muted)", color: "var(--text-muted)" }}
                onClick={stopAll}
              >
                STOP ALL
              </button>
            </div>
          </div>

          {/* SONG REVEAL */}
          {completed && (
            <div className="song-reveal corner-accent">
              <div className="song-reveal-label">[ LEVEL COMPLETE ]</div>
              <div className="song-reveal-score">HARMONY: {harmonyScore}%</div>
              {!songRevealed ? (
                <>
                  <p className="song-reveal-desc">Your code sang perfectly.<br />The song has been unlocked.</p>
                  <button className="btn btn-green" onClick={() => typewriterReveal(level.songName)}>
                    REVEAL SONG NAME
                  </button>
                </>
              ) : (
                <>
                  <p className="song-name-label">SONG NAME (PASSWORD)</p>
                  <div className="song-name-display">
                    {revealedText}<span className="cursor-blink">_</span>
                  </div>
                  {revealedText === level.songName && (
                    <>
                      <p className="song-name-hint">Use this as the password for the next level.</p>
                      {nextLevel && (
                        <button className="btn btn-purple" onClick={() => { stopAll(); setScreen("levelselect"); }}>
                          GO TO LEVEL SELECT →
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Level;