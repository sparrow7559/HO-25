import express from 'express';
import {
  // initializeMinigames,
  // getAllMinigames,
  // getMinigameState,
  // decrementTries,
  // resetTimer,
  // startMinigame,
  startSession,
  getSessionState,
  decrementTrySession,
  completeSession,
  claimMinigameReward
} from '../controllers/minigameController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create or ensure minigames
// router.post('/init', initializeMinigames);

// Read operations
// router.get('/', getAllMinigames);
// router.get('/state', getMinigameState);

// Start a minigame (sets startedAt and initializes tries)
// router.post('/start', startMinigame);

// Per-user session endpoints (protected)
router.post('/session/start', protect, startSession);
router.get('/session/state', protect, getSessionState);
router.post('/session/decrement', protect, decrementTrySession);
router.post('/session/complete', protect, completeSession);
router.post('/session/claim-reward', protect, claimMinigameReward);

// Mutations (decrement tries and reset timer)
// router.post('/decrement-tries', decrementTries);
// router.post('/reset-timer', resetTimer);

export default router;
