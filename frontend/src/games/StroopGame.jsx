import React from "react";
import GameFrame from "../components/GameFrame.jsx";
export default function StroopGame({ screen }) {
  return <GameFrame game="stroop" screen={screen} title="Stroop Challenge" />;
}
