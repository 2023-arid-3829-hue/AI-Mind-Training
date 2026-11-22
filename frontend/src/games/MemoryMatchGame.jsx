import React from "react";
import GameExperience from "../components/GameExperience.jsx";
export default function MemoryMatchGame({ screen, onNavigate }) {
  return (
    <GameExperience
      game="memory-match"
      screen={screen}
      onNavigate={onNavigate}
    />
  );
}
