import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { levels } from "../data/levels";
import "./Level.css";

function Level({ level, setScreen, unlockLevel }) {
  const [code, setCode] = useState(level.starterCode);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [songRevealed, setSongRevealed] = useState(false);
  const [activeLayers, setActiveLayers] = useState({ drums: false, chords: false, bass: false });
  const [harmonyScore, setHarmonyScore] = useState(0);

  const drumsRef = useRef(null);
  const chordsRef = useRef(null);
  const bassRef = useRef(null);

  useEffect(() => {
    drumsRef.current = new Audio("/audio/drums.wav");
    chordsRef.current = new Audio("/audio/chords.mp3");
    bassRef.current = new Audio("/audio/bass.wav");

    drumsRef.current.loop = true;
    chordsRef.current.loop = true;
    bassRef.current.loop = true;

    return () => {
      [drumsRef, chordsRef, bassRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
        }
      });
    };
  }, []);

  const setVolume = (ref, volume) => {
    if (ref.current) ref.current.volume = Math.max(0, Math.min(1, volume));
  };

  const playLayer = (ref) => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  };

  const stopAll = () => {
    [drumsRef, chordsRef, bassRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
    setActiveLayers({ drums: false, chords: false, bass: false });
    setHarmonyScore(0);
  };

  const applyMusicLayers = (analysis) => {
    const newLayers = { drums: false, chords: false, bass: false };
    let score = 0;

    if (analysis.loops > 0) {
      playLayer(drumsRef);
      setVolume(drumsRef, 0.8);
      newLayers.drums = true;
      score += 30;
    }

    if (analysis.conditions > 0) {
      playLayer(chordsRef);
      setVolume(chordsRef, 0.7);
      newLayers.chords = true;
      score += 25;
    }

    if (analysis.function_presence) {
      playLayer(bassRef);
      setVolume(bassRef, 0.6);
      newLayers.bass = true;
      score += 25;
    }

    if (analysis.syntax_error === false && analysis.correct_output === true) {
      score += 20;
    }

    setActiveLayers(newLayers);
    setHarmonyScore(score);
    return score;
  };

  const runCode = async () => {
    stopAll();
    setLoading(true);
    setOutput("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/run-code", {
        code,
        expected_output: level.expectedOutput,
      });

      setOutput(res.data.output);

      const analysis = res.data.analysis || {};
      const score = applyMusicLayers(analysis);

      if (
        res.data.output.trim() === level.expectedOutput.trim() &&
        !res.data.syntax_error
      ) {
        setTimeout(() => {
          setCompleted(true);
          unlockLevel(level.id + 1);
        }, 1200);
      }
    } catch (err) {
      setOutput("// ERROR: Could not connect to backend.\n// Make sure the server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const nextLevel = levels.find((l) => l.id === level.id + 1);

  return (
    <div className="level-screen scanlines">
      {/* TOP BAR */}
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
              style={{ width: `${harmonyScore}%` }}
            />
          </div>
          <span className="harmony-score">{harmonyScore}%</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="level-layout">
        {/* LEFT: CHALLENGE + EDITOR */}
        <div className="level-left">
          <div className="challenge-block corner-accent">
            <div className="challenge-label">[ MISSION BRIEF ]</div>
            <p className="challenge-text">{level.challenge}</p>
            {level.hint && (
              <p className="challenge-hint">Hint: {level.hint}</p>
            )}
          </div>

          <div className="editor-wrapper">
            <div className="editor-label">
              <span>[ CODE_EDITOR.py ]</span>
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
            <button className="btn" style={{ borderColor: "var(--text-muted)", color: "var(--text-muted)" }}
              onClick={() => setCode(level.starterCode)}>
              RESET
            </button>
          </div>

          <div className="terminal corner-accent">
            <div className="terminal-label">[ OUTPUT ]</div>
            <pre className="terminal-output">
              {output || "// Waiting for execution..."}
            </pre>
          </div>
        </div>

        {/* RIGHT: MUSIC PANEL */}
        <div className="level-right">
          <div className="music-panel corner-accent">
            <div className="music-panel-label">[ MUSIC_ENGINE ]</div>

            <div className="layers-list">
              {[
                { key: "drums", label: "DRUMS", desc: "Loops detected", color: "var(--accent-cyan)" },
                { key: "chords", label: "CHORDS", desc: "Conditions detected", color: "var(--accent-purple)" },
                { key: "bass", label: "BASS", desc: "Functions detected", color: "var(--accent-pink)" },
              ].map((layer) => (
                <div
                  key={layer.key}
                  className={`layer-item ${activeLayers[layer.key] ? "active" : ""}`}
                  style={{ "--layer-color": layer.color }}
                >
                  <div className="layer-dot" />
                  <div className="layer-info">
                    <span className="layer-name">{layer.label}</span>
                    <span className="layer-desc">{layer.desc}</span>
                  </div>
                  <div className="layer-wave">
                    {activeLayers[layer.key] ? (
                      [...Array(5)].map((_, i) => (
                        <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))
                    ) : (
                      <span className="layer-inactive">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn" style={{ width: "100%", marginTop: "16px" }} onClick={stopAll}>
              STOP ALL
            </button>
          </div>

          {/* SONG REVEAL on completion */}
          {completed && (
            <div className="song-reveal corner-accent">
              <div className="song-reveal-label">[ LEVEL COMPLETE ]</div>
              <div className="song-reveal-score">HARMONY: {harmonyScore}%</div>
              {!songRevealed ? (
                <>
                  <p className="song-reveal-desc">Your code sang perfectly.<br />The song has been unlocked.</p>
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