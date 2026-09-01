// routes/storyRoutes.js
import express from "express";
import {
  getStoryById,
  getCurrentStory,
  makeChoice,
  updateUserStoryOnLevelEnd
  , awardMinigameReward
  
//   getLocalStoryById,
//   getLocalStoryAll
} from "../controllers/storyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:storyId", getStoryById);               // MongoDB story
// router.get("/local/:storyId", getLocalStoryById);   // Local JSON story
// router.get("/local", getLocalStoryAll);             // All stories from local JSON

// Player routes
router.get("/current/me", protect, getCurrentStory);
router.post("/current/choice", protect, makeChoice);
router.post("/current/minigame-reward", protect, awardMinigameReward);
router.post("/level-end", protect, updateUserStoryOnLevelEnd);

export default router;