const express = require("express");
const { getUserProgress } = require("../controllers/progressController");

const router = express.Router();

router.get("/:userId", getUserProgress);

module.exports = router;
