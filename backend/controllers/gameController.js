const Game = require("../models/Game");

const getGames = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    const filters = { isActive: true };

    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;

    const games = await Game.find(filters).sort({ displayOrder: 1 });
    res.json({ success: true, count: games.length, data: games });
  } catch (error) {
    next(error);
  }
};

const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game)
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    res.json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGames, getGameById };
