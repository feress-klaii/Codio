import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Editor from "@monaco-editor/react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const [drums] = useState(new Audio("/audio/drums.wav"));
  const [chords] = useState(new Audio("/audio/chords.mp3"));
  const [bass] = useState(new Audio("/audio/bass.wav"));

  const playDrums = () => {
    drums.loop = true;
    drums.play();
  };

  const playChords = () => {
    chords.loop = true;
    chords.play();
  };

  const playBass = () => {
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

  const runCode = async () => {
  try {
    const res = await axios.post("http://127.0.0.1:8000/run-code", {
      code: code
    });

    setOutput(res.data.output);
  } catch (err) {
    setOutput("Error connecting to backend");
  }

  stopAll();

// TEMP LOGIC
if (code.includes("for") || code.includes("while")) {
  playDrums();
}

if (code.includes("if")) {
  playChords();
}

if (code.includes("print")) {
  playBass();
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
    <div style={{ display: "flex", height: "100vh" }}>

      <div style={{ flex: 1, padding: "10px", background: "#1e1e1e", color: "white" }}>
        <h2>Editor</h2>

        <Editor
          height="80%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
        />
        <button onClick={runCode}>Run Code</button>
        <div style={{ background: "#000", color: "lime", padding: "10px", marginTop: "10px" }}>
          <p>Output:</p>
          <pre>{output}</pre>
        </div>
      </div>

      <div style={{ flex: 1, padding: "10px", background: "#111", color: "white" }}>
        <h2>Music Engine</h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={playDrums}>Drums</button>
          <button onClick={playChords}>Chords</button>
          <button onClick={playBass}>Bass</button>
        </div>

        <br /><br />

        <button onClick={stopAll}>Stop All</button>
      </div>

    </div>
  );
}

export default App;