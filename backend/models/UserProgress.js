const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalGamesPlayed: { type: Number, min: 0, default: 0 },
  totalScore: { type: Number, min: 0, default: 0 },
  averageAccuracy: { type: Number, min: 0, max: 100, default: 0 },
  currentLevel: { type: Number, min: 1, default: 1 },
});

module.exports = mongoose.model("UserProgress", userProgressSchema);
