import React from "react";

function Landing({ setScreen }) {
  return (
    <div className="landing">
      <h1 className="logo">BeatCode 🎵</h1>

      <p className="description">
        Learn programming through rhythm. Fix code, build music, and level up.
      </p>

      <button onClick={() => setScreen("game")}>
        Start Game 🚀
      </button>
    </div>
  );
}

export default Landing;