import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { levels } from "../data/levels";
import { mockRunCode } from "../utils/Mockrunner";
import XTerminal from "../components/XTerminal";
import "./Level.css";

// 🔧 SET TO true TO USE MOCK (no backend), false TO USE REAL BACKEND
const USE_MOCK = false;

const LAYER_DELAYS = {
  drums:  0.6,
  chords: 0.9,
  bass:   0.4,
};

const LAYER_CONFIG = [
  { key: "drums",  label: "DRUMS",  desc: "Loops detected",     color: "var(--accent-cyan)"   },
  { key: "chords", label: "CHORDS", desc: "Conditions detected", color: "var(--accent-purple)" },
  { key: "bass",   label: "BASS",   desc: "Functions detected",  color: "var(--accent-pink)"   },
];

function Level({ level, setScreen, unlockLevel }) {
  const [code, setCode]                 = useState(level.starterCode);
  const [loading, setLoading]           = useState(false);
  const [completed, setCompleted]       = useState(false);
  const [songRevealed, setSongRevealed] = useState(false);
  const [harmonyScore, setHarmonyScore] = useState(0);
  const [refPlaying, setRefPlaying]     = useState(false);
  const [layerStates, setLayerStates]   = useState({
    drums:  { active: false, synced: false, volume: 0 },
    chords: { active: false, synced: false, volume: 0 },
    bass:   { active: false, synced: false, volume: 0 },
  });

  const termRef      = useRef(null);
  const drumsRef     = useRef(null);
  const chordsRef    = useRef(null);
  const bassRef      = useRef(null);
  const refDrumsRef  = useRef(null);
  const refChordsRef = useRef(null);
  const refBassRef   = useRef(null);

  useEffect(() => {
    drumsRef.current  = new Audio("/audio/drums.wav");
    chordsRef.current = new Audio("/audio/chords.mp3");
    bassRef.current   = new Audio("/audio/bass.wav");
    drumsRef.current.loop  = true;
    chordsRef.current.loop = true;
    bassRef.current.loop   = true;

    refDrumsRef.current  = new Audio("/audio/drums.wav");
    refChordsRef.current = new Audio("/audio/chords.mp3");
    refBassRef.current   = new Audio("/audio/bass.wav");
    refDrumsRef.current.loop    = true;
    refChordsRef.current.loop   = true;
    refBassRef.current.loop     = true;
    refDrumsRef.current.volume  = 1;
    refChordsRef.current.volume = 1;
    refBassRef.current.volume   = 1;

    return () => {
      [drumsRef, chordsRef, bassRef,
       refDrumsRef, refChordsRef, refBassRef].forEach((ref) => {
        if (ref.current) { ref.current.pause(); ref.current.src = ""; }
      });
    };
  }, []);

  const playReference = () => {
    [refDrumsRef, refChordsRef, refBassRef].forEach((ref) => {
      if (ref.current) { ref.current.currentTime = 0; ref.current.play().catch(() => {}); }
    });
    setRefPlaying(true);
  };

  const stopReference = () => {
    [refDrumsRef, refChordsRef, refBassRef].forEach((ref) => {
      if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; }
    });
    setRefPlaying(false);
  };

  const stopAll = () => {
    [drumsRef, chordsRef, bassRef].forEach((ref) => {
      if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; }
    });
    stopReference();
    setLayerStates({
      drums:  { active: false, synced: false, volume: 0 },
      chords: { active: false, synced: false, volume: 0 },
      bass:   { active: false, synced: false, volume: 0 },
    });
    setHarmonyScore(0);
  };

  // ── Full level reset ──
  const resetLevel = () => {
    setCode(level.starterCode);
    stopAll();
    setCompleted(false);
    setSongRevealed(false);
    setHarmonyScore(0);
    termRef.current?.clear();
  };

  const playLayerWithSync = (ref, volume, synced, layerKey) => {
    if (!ref.current) return;
    ref.current.volume = Math.max(0, Math.min(1, volume));
    ref.current.currentTime = synced ? 0 : LAYER_DELAYS[layerKey];
    ref.current.play().catch(() => {});
  };

  // ── ML-powered music layer application ──
  const applyMusicLayers = (layers, harmony_score) => {
    const { drums, chords, bass } = layers;

    if (drums.weight > 0) {
      playLayerWithSync(drumsRef, drums.weight * 0.85, drums.synced, "drums");
    } else {
      if (drumsRef.current) { drumsRef.current.pause(); drumsRef.current.currentTime = 0; }
    }

    if (chords.weight > 0) {
      playLayerWithSync(chordsRef, chords.weight * 0.75, chords.synced, "chords");
    } else {
      if (chordsRef.current) { chordsRef.current.pause(); chordsRef.current.currentTime = 0; }
    }

    if (bass.weight > 0) {
      playLayerWithSync(bassRef, bass.weight * 0.70, bass.synced, "bass");
    } else {
      if (bassRef.current) { bassRef.current.pause(); bassRef.current.currentTime = 0; }
    }

    setLayerStates({
      drums:  { active: drums.weight  > 0, synced: drums.synced,  volume: drums.weight  },
      chords: { active: chords.weight > 0, synced: chords.synced, volume: chords.weight },
      bass:   { active: bass.weight   > 0, synced: bass.synced,   volume: bass.weight   },
    });

    setHarmonyScore(Math.round(harmony_score));
  };

  // ── Mock fallback ──
  const applyMusicLayersMock = (analysis) => {
    const { loops, conditions, function_presence, syntax_error, correct_output } = analysis;

    const drumWeight  = syntax_error ? 0 : Math.min(loops, 1);
    const chordWeight = syntax_error ? 0 : Math.min(conditions, 1);
    const bassWeight  = syntax_error ? 0 : (function_presence ? 1 : 0);

    const drumSynced  = drumWeight  > 0 && correct_output;
    const chordSynced = chordWeight > 0 && correct_output;
    const bassSynced  = bassWeight  > 0 && correct_output;

    const layers = {
      drums:  { weight: drumWeight,  synced: drumSynced  },
      chords: { weight: chordWeight, synced: chordSynced },
      bass:   { weight: bassWeight,  synced: bassSynced  },
    };

    let score = 0;
    if (drumWeight  > 0) score += drumSynced  ? 35 : 20;
    if (chordWeight > 0) score += chordSynced ? 30 : 15;
    if (bassWeight  > 0) score += bassSynced  ? 25 : 12;
    if (correct_output && !syntax_error) score += 10;

    applyMusicLayers(layers, Math.min(100, score));
    return Math.min(100, score);
  };

  const runCode = async () => {
    stopAll();
    setLoading(true);
    setCompleted(false);
    setSongRevealed(false);
    termRef.current?.writeLoading();

    await new Promise((r) => setTimeout(r, 600));

    try {
      let correctOutput = false;
      let syntaxError   = false;
      let finalScore    = 0;

      if (USE_MOCK) {
        const result = mockRunCode(code, level.expectedOutput);
        syntaxError   = result.analysis.syntax_error;
        correctOutput = result.analysis.correct_output && !syntaxError;
        finalScore    = applyMusicLayersMock(result.analysis);

        termRef.current?.writeOutput(
          result.output,
          syntaxError ? "error" : correctOutput ? "success" : "wrong"
        );
        if (!syntaxError && !correctOutput) {
          termRef.current?.writeHint(`Expected output:\n${level.expectedOutput}`);
        }

      } else {
        const res = await axios.post("http://127.0.0.1:8000/analyze-code", {
          code,
          expected_output:     level.expectedOutput,
          loops_required:      level.requiredFeatures.includes("loops")      ? 1 : 0,
          conditions_required: level.requiredFeatures.includes("conditions") ? 1 : 0,
          functions_required:  level.requiredFeatures.includes("functions")  ? 1 : 0,
        });

        const data  = res.data;
        syntaxError   = data.analysis.syntax_error;
        correctOutput = data.analysis.correct_output && !syntaxError;
        finalScore    = data.harmony_score;

        applyMusicLayers(data.layers, data.harmony_score);

        termRef.current?.writeOutput(
          data.output,
          syntaxError ? "error" : correctOutput ? "success" : "wrong"
        );
        if (!syntaxError && !correctOutput) {
          termRef.current?.writeHint(`Expected output:\n${level.expectedOutput}`);
        }
      }

      // ── Only reveal song if harmony is exactly 100 ──
      if (correctOutput && Math.round(finalScore) === 100) {
        setTimeout(() => {
          setCompleted(true);
          unlockLevel(level.id + 1);
        }, 1200);
      }

    } catch (err) {
      termRef.current?.writeOutput("ERROR: Something went wrong.\nCheck the console for details.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextLevel = levels.find((l) => l.id === level.id + 1);

  return (
    <div className="level-screen scanlines">

      <div className="level-topbar">
        <button className="btn-back-small" onClick={() => { stopAll(); setScreen("levelselect"); }}>
          ← LEVELS
        </button>
        <div className="level-topbar-title">
          <span className="level-topbar-id">LEVEL_{String(level.id).padStart(2, "0")}</span>
          <span className="level-topbar-name">{level.title}</span>
        </div>
        <div className="harmony-meter">
          <span className="harmony-label">HARMONY</span>
          <div className="harmony-bar">
            <div
              className="harmony-fill"
              style={{
                width: `${harmonyScore}%`,
                background: harmonyScore === 100
                  ? "var(--accent-green)"
                  : "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
              }}
            />
          </div>
          <span
            className="harmony-score"
            style={{ color: harmonyScore === 100 ? "var(--accent-green)" : "var(--accent-cyan)" }}
          >
            {harmonyScore}%
          </span>
        </div>
      </div>

      <div className="level-layout">
        <div className="level-left">
          <div className="challenge-block corner-accent">
            <div className="challenge-label">[ MISSION BRIEF ]</div>
            <p className="challenge-text">{level.challenge}</p>
            {level.hint && <p className="challenge-hint">Hint: {level.hint}</p>}
          </div>

          <div className="editor-wrapper">
            <div className="editor-label">
              <span>[ CODE_EDITOR.py ]</span>
              {USE_MOCK && (
                <span style={{ color: "var(--accent-purple)", marginLeft: "12px" }}>
                  ⚠ MOCK MODE — no backend
                </span>
              )}
            </div>
            <Editor
              height="320px"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                fontSize: 14,
                fontFamily: "'Share Tech Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
              }}
            />
          </div>

          <div className="run-row">
            <button className="btn" onClick={runCode} disabled={loading}>
              {loading ? "[ EXECUTING... ]" : "[ RUN CODE ]"}
            </button>
            <button
              className="btn"
              style={{ borderColor: "var(--text-muted)", color: "var(--text-muted)" }}
              onClick={resetLevel}
            >
              RESET
            </button>
          </div>

          <div className="terminal-wrapper corner-accent">
            <div className="terminal-label">[ OUTPUT ]</div>
            <XTerminal ref={termRef} />
          </div>
        </div>

        <div className="level-right">
          <div className="reference-panel corner-accent">
            <div className="reference-label">[ REFERENCE_TRACK ]</div>
            <p className="reference-desc">
              This is what 100% harmony sounds like.<br />
              Make your code match it.
            </p>
            <div className="reference-layers">
              {LAYER_CONFIG.map((layer) => (
                <div
                  key={layer.key}
                  className="reference-layer-row"
                  style={{ "--layer-color": layer.color }}
                >
                  <div className="ref-dot" />
                  <span className="ref-layer-name">{layer.label}</span>
                  <div className="ref-wave">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`wave-bar ${refPlaying ? "" : "wave-paused"}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className={`btn ${refPlaying ? "" : "btn-green"}`}
              style={{
                width: "100%",
                marginTop: "12px",
                ...(refPlaying && { borderColor: "var(--accent-pink)", color: "var(--accent-pink)" }),
              }}
              onClick={refPlaying ? stopReference : playReference}
            >
              {refPlaying ? "⏹ STOP REFERENCE" : "▶ PLAY REFERENCE"}
            </button>
          </div>

          <div className="music-panel corner-accent">
            <div className="music-panel-label">[ LIVE_ENGINE ]</div>
            <div className="layers-list">
              {LAYER_CONFIG.map((layer) => {
                const state = layerStates[layer.key];
                return (
                  <div
                    key={layer.key}
                    className={`layer-item ${state.active ? "active" : ""} ${state.synced ? "synced" : ""}`}
                    style={{ "--layer-color": layer.color }}
                  >
                    <div className="layer-dot" />
                    <div className="layer-info">
                      <span className="layer-name">{layer.label}</span>
                      <span className="layer-desc">
                        {state.active
                          ? state.synced ? "✓ IN SYNC" : "⚠ DRIFTING"
                          : layer.desc}
                      </span>
                    </div>
                    <div className="layer-right-col">
                      <div className="layer-vol-bar">
                        <div
                          className="layer-vol-fill"
                          style={{ height: `${state.volume * 100}%` }}
                        />
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
            <button
              className="btn"
              style={{ width: "100%", marginTop: "16px", borderColor: "var(--text-muted)", color: "var(--text-muted)" }}
              onClick={stopAll}
            >
              STOP ALL
            </button>
          </div>

          {completed && (
            <div className="song-reveal corner-accent">
              <div className="song-reveal-label">[ LEVEL COMPLETE ]</div>
              <div className="song-reveal-score">HARMONY: {harmonyScore}%</div>
              {!songRevealed ? (
                <>
                  <p className="song-reveal-desc">
                    Your code sang perfectly.<br />The song has been unlocked.
                  </p>
                  <button className="btn btn-green" onClick={() => setSongRevealed(true)}>
                    REVEAL SONG NAME
                  </button>
                </>
              ) : (
                <>
                  <p className="song-name-label">SONG NAME (PASSWORD)</p>
                  <div className="song-name-display">{level.songName}</div>
                  <p className="song-name-hint">Use this as the password for the next level.</p>
                  {nextLevel && (
                    <button className="btn btn-purple" onClick={() => { stopAll(); setScreen("levelselect"); }}>
                      GO TO LEVEL SELECT →
                    </button>
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