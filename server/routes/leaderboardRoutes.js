import express from "express";
import { getLeaderboard, getLeaderboardWithCurrentUser } from "../controllers/leaderboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/leaderboard
router.get("/", getLeaderboard);
router.get("/current", protect, getLeaderboardWithCurrentUser);

export default router;