import React from "react";
import GameExperience from "../components/GameExperience.jsx";
export default function WordHuntGame({ screen, onNavigate }) {
  return (
    <GameExperience game="word-hunt" screen={screen} onNavigate={onNavigate} />
  );
}
