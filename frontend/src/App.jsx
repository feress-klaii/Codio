import { useState } from "react";
import "./App.css";
import Landing from "./pages/Landing";
import LevelSelect from "./pages/LevelSelect";
import Level from "./pages/Level";

function App() {
  const [screen, setScreen] = useState("landing");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    const saved = localStorage.getItem("codio_unlocked");
    return saved ? JSON.parse(saved) : [0];
  });

  const unlockLevel = (levelId) => {
    const updated = [...new Set([...unlockedLevels, levelId])];
    setUnlockedLevels(updated);
    localStorage.setItem("codio_unlocked", JSON.stringify(updated));
  };

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
          unlockedLevels={unlockedLevels}
          unlockLevel={unlockLevel}
        />
      )}
      {screen === "level" && selectedLevel !== null && (
        <Level
          level={selectedLevel}
          setScreen={setScreen}
          unlockLevel={unlockLevel}
        />
      )}
    </>
  );
}

export default App;