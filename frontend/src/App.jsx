import { useState } from 'react'
import './App.css'
import Editor from "@monaco-editor/react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [drums] = useState(new Audio("/audio/drums.wav"));
  const [chords] = useState(new Audio("/audio/chords.mp3"));
  const [bass] = useState(new Audio("/audio/bass.wav"));

  // 🎵 PLAY FUNCTIONS
  const playDrums = () => {
    drums.pause();
    drums.currentTime = 0;
    drums.loop = true;
    drums.play();
  };

  const playChords = () => {
    chords.pause();
    chords.currentTime = 0;
    chords.loop = true;
    chords.play();
  };

  const playBass = () => {
    bass.pause();
    bass.currentTime = 0;
    bass.loop = true;
    bass.play();
  };

  const stopAll = () => {
    drums.pause();
    chords.pause();
    bass.pause();

    drums.currentTime = 0;
    chords.currentTime = 0;
    bass.currentTime = 0;
  };

  // ▶️ RUN CODE
  const runCode = async () => {
    stopAll();
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/run-code", {
        code: code
      });

      setOutput(res.data.output);

      // 🎵 TEMP MUSIC LOGIC
      if (code.includes("for") || code.includes("while")) {
        playDrums();
      }

      if (code.includes("if")) {
        playChords();
      }

      if (code.includes("print")) {
        playBass();
      }

      // 🎮 LEVEL COMPLETE (simple check)
      if (res.data.output.includes("0") && res.data.output.includes("4")) {
        alert("🎉 Level Completed!");
      }

    } catch (err) {
      setOutput("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };
  /*const runCode = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/run-code", {
        code: code,
        language: "python"
      });

      setOutput(res.data.output);

      // 🎵 REAL MAPPING FROM BACKEND ggjhhgjg

      stopAll();

      const analysis = res.data.analysis;

      if (analysis.loops > 0) {
        playDrums();
      }

      if (analysis.conditions > 0) {
        playChords();
      }

      if (analysis.prints > 0) {
        playBass();
      }

    } catch (err) {
      setOutput("Error connecting to backend");
    }
  };*/

  return (
    <div className="container">

      {/* LEFT PANEL */}
      <div className="panel editor-panel">
        <h1>Level 0: Fix the Loop🎯</h1>
        <p>Write a loop that prints numbers from 0 to 4.</p>

        <Editor
          height="60%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />

        <button onClick={runCode} disabled={loading}>
          {loading ? "Running..." : "Run Code"}
        </button>

        <div className="terminal">
          <p>Output:</p>
          <p>🎧 Status: {output ? "Code Executed" : "Waiting..."}</p>
          <pre>{output}</pre>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="panel music-panel">
        <h2>Music Engine 🎵</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={playDrums}>Drums</button>
          <button onClick={playChords}>Chords</button>
          <button onClick={playBass}>Bass</button>
        </div>

        <button onClick={stopAll}>Stop All</button>

        <div style={{ marginTop: "20px" }}>
          <p>🎵 Active Layers:</p>
          <ul>
            {code.includes("for") && <li className="active">Drums</li>}
            {code.includes("if") && <li className="active">Chords</li>}
            {code.includes("print") && <li className="active">Bass</li>}
          </ul>
        </div>
      </div>

    </div>
  );
}

export default App;
