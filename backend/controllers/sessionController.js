const GameSession = require("../models/GameSession");
const Game = require("../models/Game");
const UserProgress = require("../models/UserProgress");

const createSession = async (req, res, next) => {
  try {
    const {
      userId,
      gameId,
      score,
      attempts,
      mistakes,
      completionTime,
      difficulty,
    } = req.body;

    const game = await Game.findById(gameId);
    if (!game)
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });

    const session = await GameSession.create({
      userId,
      gameId,
      score,
      attempts,
      mistakes,
      completionTime,
      difficulty,
    });

    const accuracy =
      attempts > 0 ? Math.max(0, ((attempts - mistakes) / attempts) * 100) : 0;
    let progress = await UserProgress.findOne({ userId });

    if (progress) {
      const newGamesPlayed = progress.totalGamesPlayed + 1;
      const newTotalScore = progress.totalScore + (score || 0);
      progress.totalGamesPlayed = newGamesPlayed;
      progress.totalScore = newTotalScore;
      progress.averageAccuracy =
        (progress.averageAccuracy * (newGamesPlayed - 1) + accuracy) /
        newGamesPlayed;
      progress.currentLevel = Math.floor(progress.totalScore / 500) + 1;
      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId,
        totalGamesPlayed: 1,
        totalScore: score || 0,
        averageAccuracy: accuracy,
        currentLevel: 1,
      });
    }

    res.status(201).json({ success: true, data: session, progress });
  } catch (error) {
    next(error);
  }
};

const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await GameSession.find({ userId: req.params.userId })
      .populate("gameId", "title category difficulty")
      .sort({ playedAt: -1 });

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSession, getUserSessions };
