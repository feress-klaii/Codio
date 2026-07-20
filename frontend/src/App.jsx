import { useState } from "react";
import "./App.css";
import Landing from "./pages/Landing";
import LevelSelect from "./pages/LevelSelect";
import Level from "./pages/Level";

function App() {
  const [screen, setScreen]             = useState("landing");
  const [selectedLevel, setSelectedLevel] = useState(null);

  const goToLevel = (level) => {
    setSelectedLevel(level);
    setScreen("level");
  };

  return (
    <>
      {screen === "landing" && (
        <Landing setScreen={setScreen} />
      )}
      {screen === "levelselect" && (
        <LevelSelect
          setScreen={setScreen}
          goToLevel={goToLevel}
        />
      )}
      {screen === "level" && selectedLevel !== null && (
        // key={selectedLevel.id} forces a full remount whenever the level
        // changes, so component state (code, language, harmony, etc.)
        // never leaks between levels — even if two levels briefly share
        // a stale id during a mid-edit, or you jump between levels fast.
        <Level
          key={selectedLevel.id}
          level={selectedLevel}
          setScreen={setScreen}
        />
      )}
    </>
  );
}

export default App;