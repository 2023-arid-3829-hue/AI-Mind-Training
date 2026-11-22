import React from 'react';
import GameExperience from '../components/GameExperience.jsx';
export default function StroopGame({ screen, onNavigate }) { return <GameExperience game="stroop" screen={screen} onNavigate={onNavigate} />; }