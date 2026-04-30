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
        <Level
          level={selectedLevel}
          setScreen={setScreen}
        />
      )}
    </>
  );
}

export default App;