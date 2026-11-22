const UserProgress = require("../models/UserProgress");

const getUserProgress = async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.params.userId });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          userId: req.params.userId,
          totalGamesPlayed: 0,
          totalScore: 0,
          averageAccuracy: 0,
          currentLevel: 1,
        },
      });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProgress };
