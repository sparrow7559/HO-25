import Minigame from '../models/minigameSchema.js';
import MiniggameSession from '../models/minigameSession.js';
import User from '../models/user.js';

// Base scores per minigame (from user specification)
// MODIFIED: Added base scores for new minigames M16-M20
const BASE_SCORES = {
  M1: 150,
  M2: 100,
  M3: 200,
  M4: 250,
  M5: 200,
  M6: 150,
  M7: 150,
  M8: 150,
  M9A: 150,
  M9B: 150,
  M10: 200,
  M11: 200,
  M12: 250,
  M13: 250,
  M14: 300,
  M15: 300,
  M16: 400, 
  M17: 400, 
  M18: 450, 
  M19: 350, 
  M20: 350, 
};

// ---------------- Per-User Session Endpoints ----------------
// helper: compute remaining seconds based on startedAt + timerSeconds
const computeRemaining = (session) => {
  if (!session.startedAt) return session.timerSeconds; // not started yet
  const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  const remaining = session.timerSeconds - elapsed;
  return remaining > 0 ? remaining : 0;
};

export const startSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });

    // Ensure base minigame exists for config reference
    // ponytail: /init was dead code (route commented out), so no Minigame docs ever
    // got seeded and every session start 404'd. Create the base doc lazily instead.
    let base = await Minigame.findOne({ minigameId });
    if (!base) {
      base = await new Minigame({ minigameId }).save();
    }

    let session = await MiniggameSession.findOne({ user: userId, minigameId });
    if (!session) {
      // MODIFIED: Added new games and logic to assign 5 tries to M16-M20
      const triesGames3 = ['M4','M5','M6','M8','M9A','M9B','M10','M11','M12','M13','M14','M15'];
      const triesGames5 = ['M16', 'M17', 'M18', 'M19', 'M20'];
      
      let initialTries = 0;
      if (triesGames3.includes(minigameId)) {
          initialTries = 3;
      } else if (triesGames5.includes(minigameId)) {
          initialTries = 5;
      }

      session = new MiniggameSession({
        user: userId,
        minigameId,
        timerSeconds: base.timer || 300,
        triesLeft: initialTries,
        startedAt: new Date(),
      });
      await session.save();
    } else if (!session.completed) {
      // If not completed and no active startedAt (e.g. expired earlier), restart if time is zero
      const remaining = computeRemaining(session);
      if (remaining === 0) {
        session.startedAt = new Date();
        await session.save();
      }
    }
    return res.json({
      message: 'Session started',
      session: {
        id: session._id,
        minigameId: session.minigameId,
        remainingSeconds: computeRemaining(session),
        triesLeft: session.triesLeft,
        completed: session.completed,
        score: session.score,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getSessionState = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.query;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const session = await MiniggameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const remainingSeconds = computeRemaining(session);
    return res.json({
      session: {
        id: session._id,
        minigameId: session.minigameId,
        remainingSeconds,
        triesLeft: session.triesLeft,
        completed: session.completed,
        score: session.score,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const decrementTrySession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    
    // MODIFIED: Added new games M16-M20 to this list so their tries can be decremented
    const gamesWithTries = ['M4','M5','M6', 'M8', 'M9A', 'M9B', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20'];
    if (!gamesWithTries.includes(minigameId)) {
      return res.status(400).json({ message: 'No tries for this minigame' });
    }
    const session = await MiniggameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.triesLeft <= 0) return res.status(400).json({ message: 'No tries left' });
    session.triesLeft -= 1;
    // If tries reach zero, mark session as completed (failed)
    if (session.triesLeft <= 0) {
      session.completed = true;
      session.completedAt = new Date();
    }
    await session.save();
    return res.json({ message: 'Try decremented', triesLeft: session.triesLeft, completed: session.completed });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const completeSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const session = await MiniggameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.completed) return res.json({ message: 'Already completed', score: session.score });

    const elapsed = session.startedAt ? Math.floor((Date.now() - session.startedAt.getTime())/1000) : session.timerSeconds;
    const timer = session.timerSeconds;
    const baseScore = BASE_SCORES[minigameId] || 100; // fallback to 100 if missing
    let score;

    // ======================= MODIFIED SCORING LOGIC START =======================
    const formulaGamesOld = ['M8', 'M9A', 'M9B', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15'];
    const formulaGamesNew = ['M16', 'M17', 'M18', 'M19', 'M20'];

    if (formulaGamesOld.includes(minigameId)) {
        // --- Existing complex formula for games M8-M15 ---
        const x = baseScore;
        const a = 3; // Initial tries for these games is 3
        const i = a - session.triesLeft; // 'i' is the number of tries used
        const t_used = elapsed;
        const t_lim = timer;

        const logTerm = Math.log((i + 1) / 2) / Math.log(a);
        const valueA = (-x / (a - i + 1)) * logTerm;

        let valueB;
        if (t_used < 60) {
            valueB = x;
        } else if (t_used >= t_lim) {
            valueB = 0;
        } else {
            const penaltyFraction = (t_used - 60) / (t_lim - 60);
            valueB = x * (1 - penaltyFraction);
        }
        score = Math.round(Math.max(0, valueA, valueB));

    } else if (formulaGamesNew.includes(minigameId)) {
        // --- New formula from image for games M16-M20 ---
        const x = baseScore;
        const a = 5; // Initial tries for these games is 5
        const i = a - session.triesLeft;
        const t_used = elapsed;
        const t_lim = timer;

        // Part A: Try-based penalty value.
        // Formula: -x / (5 - i + 1) * log(i + 5)
        const valueA = (-x / (6 - i)) * Math.log(i + 5);

        // Part B: Time-based score value. This can become negative.
        // Formula: x * [1 - max(0, (t_used - 60) / (t_lim - 60))]
        const timeRatio = (t_used - 60) / (t_lim - 60);
        const timePenalty = Math.max(0, timeRatio);
        const valueB = x * (1 - timePenalty);
        
        // Final score is the integer of the maximum of the two values.
        score = Math.round(Math.max(valueA, valueB));

        // Ensure the final score stored is never negative.
        score = Math.max(0, score);

    } else {
        // --- Existing simple scoring logic for all other games ---
        if (elapsed < 60) {
            score = baseScore;
        } else if (elapsed >= timer) {
            score = 0;
        } else {
            const penaltyFraction = Math.max(0, (elapsed - 60) / (timer - 60));
            score = Math.max(0, Math.round(baseScore * (1 - penaltyFraction)));
        }
    }
    // ======================== MODIFIED SCORING LOGIC END ========================

    session.completed = true;
    session.completedAt = new Date();
    session.score = score;
    await session.save();

    return res.json({ message: 'Session completed', score, sessionId: session._id, minigameId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const claimMinigameReward = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const session = await MiniggameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.completed) return res.status(400).json({ message: 'Minigame not completed yet' });
    if (session.rewardClaimed) {
      return res.json({ message: 'Reward already claimed', score: session.score, claimed: true });
    }

    // Directly update user points with session score
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.points = (user.points || 0) + session.score;
    await user.save();

    session.rewardClaimed = true;
    await session.save();

    return res.json({
      message: 'Reward claimed',
      score: session.score,
      userPoints: user.points
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- Commented out code remains unchanged ---



// Centralized helper: check all minigames for expired timers and decrement tries for M4-M6 when expired
/*
export const checkAndExpireTimers = async () => {
  try {
    const now = Date.now();
    const minigames = await Minigame.find({});
    const changed = [];
    for (const mg of minigames) {
      // if a startedAt exists and timer is set, evaluate expiry
      if (mg.startedAt && mg.timer) {
        const elapsed = Math.floor((now - mg.startedAt) / 1000); // seconds elapsed
        if (elapsed >= mg.timer) {
          // Timer expired
          if (["M4", "M5", "M6"].includes(mg.minigameId)) {
            if (typeof mg.tries === 'number' && mg.tries > 0) {
              mg.tries -= 1;
            }
          }
          // clear startedAt so we don't repeatedly decrement
          delete mg.startedAt;
          changed.push(mg);
        }
      }
    }
    if (changed.length) {
      for (const m of changed) await m.save();
    }
    return changed.length;
  } catch (err) {
    console.error('checkAndExpireTimers error:', err);
    throw err;
  }
};
*/

// Combined endpoints using schema values
/*
export const initializeMinigames = async (req, res) => {
  try {
    const minigameIds = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9A", "M9B", "M10", "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19", "M20"];
    const created = [];
    for (const id of minigameIds) {
      let minigame = await Minigame.findOne({ minigameId: id });
      if (!minigame) {
        minigame = new Minigame({ minigameId: id });
        await minigame.save();
        created.push(minigame);
      }
    }
    return res.json({ message: "Minigames initialized", minigames: created });
  } catch (err) {
    console.error("Initialize minigames error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// export const getAllMinigames = async (req, res) => {
//   try {
//     // run expiry check before returning state
//     await checkAndExpireTimers();
//     const minigames = await Minigame.find({});
//     return res.json({ minigames });
//   } catch (err) {
//     console.error("Get all minigames error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

/*
export const getMinigameState = async (req, res) => {
  try {
    await checkAndExpireTimers();
    const { minigameId } = req.query;
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    return res.json({ minigameId: mg.minigameId, timer: mg.timer, tries: mg.tries });
  } catch (err) {
    console.error('Get minigame state error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
*/

/*
export const decrementTries = async (req, res) => {
  try {
    const { minigameId } = req.body;
    if (!["M4", "M5", "M6"].includes(minigameId)) return res.status(400).json({ message: "Only M4, M5, M6 have tries" });
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    if (typeof mg.tries !== 'number') return res.status(400).json({ message: 'Minigame does not use tries' });
    if (mg.tries <= 0) return res.status(400).json({ message: 'No tries left' });
    mg.tries -= 1;
    await mg.save();
    return res.json({ message: 'Tries decremented', minigameId, tries: mg.tries });
  } catch (err) {
    console.error('Decrement tries error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
*/

/*
export const resetTimer = async (req, res) => {
  try {
    const { minigameId } = req.body;
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    mg.timer = 300;
    delete mg.startedAt;
    await mg.save();
    return res.json({ message: 'Timer reset', minigameId, timer: mg.timer });
  } catch (err) {
    console.error('Reset timer error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
*/

// Start a minigame: set startedAt and ensure timer/tries are initialized
/*
export const startMinigame = async (req, res) => {
  try {
    const { minigameId } = req.body;
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });

    // initialize tries for M4-M6 if absent
    if (["M4", "M5", "M6"].includes(minigameId) && (mg.tries === null || mg.tries === undefined)) {
      mg.tries = 3;
    }

    // set startedAt to now
    mg.startedAt = new Date();
    await mg.save();
    return res.json({ message: 'Minigame started', minigameId: mg.minigameId, timer: mg.timer, tries: mg.tries, startedAt: mg.startedAt });
  } catch (err) {
    console.error('Start minigame error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
*/