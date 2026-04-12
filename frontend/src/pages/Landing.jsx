import React, { useEffect, useState } from "react";
import "./Landing.css";

function Landing({ setScreen }) {
  const [typed, setTyped] = useState("");
  const fullText = "Learn to code. Hear the difference.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTyped(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing scanlines">
      <div className="landing-bg">
        <div className="grid-overlay" />
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
      </div>

      <div className="landing-content">
        <div className="logo-wrapper">
          <div className="logo-tag">&lt; system.boot /&gt;</div>
          <h1 className="logo glitch">CODIO_</h1>
          <div className="logo-sub">v0.1.0 — ALPHA BUILD</div>
        </div>

        <p className="tagline">
          <span className="tagline-text">{typed}</span>
          <span className="cursor-blink">_</span>
        </p>

        <div className="landing-divider">
          <span className="divider-line" />
          <span className="divider-icon">◈</span>
          <span className="divider-line" />
        </div>

        <p className="landing-desc">
          A rhythm-based coding platform. Each level hides a song.<br />
          Solve the challenge. Unlock the music. Find the password.
        </p>

        <div className="landing-actions">
          <button className="btn" onClick={() => setScreen("levelselect")}>
            Initialize System
          </button>
        </div>

        <div className="landing-footer">
          <span>[ CODIO PLATFORM ]</span>
          <span>[ EDUCATIONAL SYSTEM ]</span>
          <span>[ 2 LEVELS ACTIVE ]</span>
        </div>
      </div>
    </div>
  );
}

export default Landing;