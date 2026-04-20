import React, { useState } from "react";
import { levels } from "../data/levels";
import "./LevelSelect.css";

// Level 0 is always accessible.
// All other levels require password every session — never saved.
const ALWAYS_UNLOCKED = [0];

function LevelSelect({ setScreen, goToLevel }) {
  const [passwordInputs, setPasswordInputs] = useState({});
  const [errors, setErrors]                 = useState({});
  const [sessionUnlocked, setSessionUnlocked] = useState([...ALWAYS_UNLOCKED]);
  const [justUnlocked, setJustUnlocked]     = useState(null);

  const handlePasswordSubmit = (level) => {
    const input    = (passwordInputs[level.id] || "").trim().toUpperCase();
    const expected = (level.password || "").trim().toUpperCase();

    if (input === expected) {
      setSessionUnlocked((prev) => [...new Set([...prev, level.id])]);
      setJustUnlocked(level.id);
      setErrors((prev) => ({ ...prev, [level.id]: "" }));
      setTimeout(() => setJustUnlocked(null), 2000);
    } else {
      setErrors((prev) => ({ ...prev, [level.id]: "ACCESS DENIED — INVALID PASSWORD" }));
    }
  };

  return (
    <div className="levelselect scanlines">
      <div className="ls-bg">
        <div className="grid-overlay" />
        <div className="glow-orb orb-1" />
      </div>

      <div className="ls-layout">
        {/* HEADER */}
        <div className="ls-header">
          <button className="btn-back" onClick={() => setScreen("landing")}>
            ← BACK
          </button>
          <div className="ls-title-block">
            <span className="ls-label">[ SELECT LEVEL ]</span>
            <h2 className="ls-title">MISSION SELECT</h2>
          </div>
          <div className="ls-status">
            <span>{sessionUnlocked.length} / {levels.length} UNLOCKED</span>
          </div>
        </div>

        {/* LEVELS LIST */}
        <div className="ls-levels">
          {levels.map((level) => {
            const isUnlocked = sessionUnlocked.includes(level.id);
            const isNew      = justUnlocked === level.id;

            return (
              <div
                key={level.id}
                className={`level-card corner-accent ${isUnlocked ? "unlocked" : "locked"} ${isNew ? "just-unlocked" : ""}`}
              >
                <div className="level-card-left">
                  <div className="level-id">
                    <span className="level-num">{String(level.id).padStart(2, "0")}</span>
                    <span className="level-status-dot" />
                  </div>
                  <div className="level-info">
                    <h3 className="level-name">{level.title}</h3>
                    <p className="level-desc">{level.description}</p>
                    {isUnlocked && (
                      <div className="level-meta">
                        <span className="level-type">{level.type.toUpperCase()}</span>
                        {level.requiredFeatures.map((f) => (
                          <span key={f} className="level-tag">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="level-card-right">
                  {isUnlocked ? (
                    <button
                      className="btn btn-green"
                      onClick={() => goToLevel(level)}
                    >
                      ENTER →
                    </button>
                  ) : (
                    <div className="lock-form">
                      <div className="lock-icon">🔒</div>
                      <p className="lock-hint">Enter password to unlock</p>
                      <div className="lock-input-row">
                        <input
                          type="text"
                          className="lock-input"
                          placeholder="PASSWORD_"
                          value={passwordInputs[level.id] || ""}
                          onChange={(e) =>
                            setPasswordInputs((prev) => ({
                              ...prev,
                              [level.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handlePasswordSubmit(level);
                          }}
                        />
                        <button
                          className="btn btn-purple"
                          onClick={() => handlePasswordSubmit(level)}
                        >
                          UNLOCK
                        </button>
                      </div>
                      {errors[level.id] && (
                        <p className="lock-error">{errors[level.id]}</p>
                      )}
                      {isNew && (
                        <p className="lock-success">ACCESS GRANTED ✓</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="ls-footer">
          <span className="ls-footer-note">
            Complete a level to receive the song name — that name is the password for the next level.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LevelSelect;