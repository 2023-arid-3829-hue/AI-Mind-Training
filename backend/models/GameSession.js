const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  score: { type: Number, required: true, min: 0, default: 0 },
  attempts: { type: Number, required: true, min: 1 },
  mistakes: { type: Number, required: true, min: 0, default: 0 },
  completionTime: { type: Number, required: true, min: 0 },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
