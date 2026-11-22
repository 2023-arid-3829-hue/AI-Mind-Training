const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: [
      "Memory Matching",
      "Image Matching",
      "Pattern Recognition",
      "Logic Puzzle",
      "Shape Matching",
      "Brain Training",
    ],
  },
  categoryLabel: { type: String, required: true, trim: true },
  mode: {
    type: String,
    required: true,
    enum: ["Classic", "Timed", "Challenge"],
    default: "Classic",
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },
  instructions: {
    type: String,
    required: [true, "Instructions are required"],
    trim: true,
  },
  bestScore: { type: Number, min: 0, default: 0 },
  iconKey: { type: String, required: true, trim: true },
  accentColor: { type: String, required: true, trim: true },
  displayOrder: { type: Number, min: 1, default: 1 },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Game", gameSchema);
