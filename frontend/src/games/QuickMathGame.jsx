import React from "react";
import GameExperience from "../components/GameExperience.jsx";
export default function QuickMathGame({ screen, onNavigate }) {
  return (
    <GameExperience game="quick-math" screen={screen} onNavigate={onNavigate} />
  );
}
