import React from "react";
import GameFrame from "../components/GameFrame.jsx";
export default function MemoryMatchGame({ screen }) {
  return <GameFrame game="memory-match" screen={screen} title="Memory Match" />;
}
