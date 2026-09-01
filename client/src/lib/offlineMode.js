// Client-only game engine used for guest play and the demo account.
// Mirrors server/controllers/storyController.js and minigameController.js
// against localStorage instead of Mongo, so /play never touches the backend.
import storyData from "./offlineStoryData.json";

export const OFFLINE_FLAG = "offlineMode";
export const OFFLINE_TOKEN = "offline-local-session";
const USER_KEY = "offlineUser";
const SESSIONS_KEY = "offlineMinigameSessions";

const DEFAULT_INVENTORY = () => ({
  script: { value: false, description: "" },
  journal: { value: false, description: "" },
  kumbh: { value: false, description: "" },
  sword: { value: false, description: "" },
  pickaxe: { value: false, description: "" },
  axe: { value: false, description: "" },
});

export function isOfflineMode() {
  return localStorage.getItem(OFFLINE_FLAG) === "true";
}

function freshUser(name) {
  return {
    _id: "offline-" + Date.now(),
    teamId: "OFFLINE",
    teamLeader: { name },
    currentStoryId: "0001",
    points: 100,
    money: 100,
    health: 100,
    rf: 100,
    inventory: DEFAULT_INVENTORY(),
    minicounter: Array(18).fill(3),
  };
}

// Starts (or resumes, for the fixed demo profile) a local offline session.
export function startOfflineSession({ demo = false } = {}) {
  const key = demo ? USER_KEY + ":demo" : USER_KEY;
  let user = demo ? JSON.parse(localStorage.getItem(key) || "null") : null;
  if (!user) user = freshUser(demo ? "Demo Team" : "Guest Player");

  localStorage.setItem(key, JSON.stringify(user));
  localStorage.setItem("offlineUserKey", key);
  localStorage.setItem(OFFLINE_FLAG, "true");
  localStorage.setItem("token", OFFLINE_TOKEN);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function clearOfflineSession() {
  localStorage.removeItem(OFFLINE_FLAG);
  localStorage.removeItem("offlineUserKey");
  localStorage.removeItem(SESSIONS_KEY);
}

function getUserKey() {
  return localStorage.getItem("offlineUserKey") || USER_KEY;
}

function getUser() {
  return JSON.parse(localStorage.getItem(getUserKey()) || "null") || freshUser("Guest Player");
}

function saveUser(user) {
  localStorage.setItem(getUserKey(), JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));
}

function findStory(storyId) {
  return storyData.find((s) => s.storyID === storyId) || null;
}

function userState(user) {
  return {
    points: user.points,
    money: user.money,
    health: user.health,
    rf: user.rf,
    inventory: user.inventory,
    minicounter: user.minicounter,
  };
}

const MINIGAME_CONFIG = { M1: 3, M2: 3, M3: 3, M4: 3, M5: 3, M6: 3, M7: 3 };

// Mirrors GET /api/story/current/me
export function getCurrentStory() {
  const user = getUser();
  const story = findStory(user.currentStoryId);
  return { story, userState: userState(user) };
}

// Mirrors GET /api/story/:storyId
export function fetchStoryById(storyId) {
  return findStory(storyId);
}

// Mirrors POST /api/story/current/choice
export function makeChoice(storyId, choiceIndex) {
  const user = getUser();
  const story = findStory(storyId);
  if (!story || choiceIndex === undefined || choiceIndex < 0 || choiceIndex >= story.nextID.length) {
    return null;
  }

  user.currentStoryId = story.nextID[choiceIndex];
  saveUser(user);

  if (user.currentStoryId.startsWith("M")) {
    return {
      minigame: { id: user.currentStoryId, config: MINIGAME_CONFIG },
      userState: userState(user),
    };
  }

  const nextStory = findStory(user.currentStoryId);
  return { nextStory, userState: userState(user) };
}

// Mirrors POST /api/story/level-end
export function updateStoryOnLevelEnd(storyId, success) {
  const user = getUser();
  const levelStory = findStory(storyId);
  if (!levelStory || !levelStory.levelEnd) return null;

  let nextStoryId;
  if (storyId.startsWith("M")) {
    if (Array.isArray(levelStory.nextID) && levelStory.nextID.length > (success ? 0 : 1)) {
      nextStoryId = levelStory.nextID[success ? 0 : 1];
    } else {
      nextStoryId = levelStory.nextID;
    }
  } else {
    user.currentStoryId = levelStory.storyID;
    if (levelStory.nextID?.length > 0) nextStoryId = levelStory.nextID[0];
  }

  if (nextStoryId) user.currentStoryId = nextStoryId;
  saveUser(user);

  const nextStory = nextStoryId ? findStory(nextStoryId) : null;
  return { nextStory, userState: userState(user) };
}

// Mirrors POST /api/story/current/minigame-reward
const DEFAULT_REWARDS = {
  M1: { pointsRange: [10, 30], item: "script" },
  M2: { pointsRange: [5, 20], item: "journal" },
  M3: { pointsRange: [15, 35], item: "kumbh" },
  M4: { pointsRange: [20, 50], item: "sword" },
  M5: { pointsRange: [8, 25], item: "pickaxe" },
  M6: { pointsRange: [12, 28], item: "axe" },
  M7: { pointsRange: [25, 60], item: "script" },
};

export function awardMinigameReward(storyId, success) {
  const user = getUser();
  if (!success) return { awarded: null, userState: userState(user) };

  const cfg = DEFAULT_REWARDS[storyId] || { pointsRange: [5, 10], item: null };
  const [minP, maxP] = cfg.pointsRange;
  const awardedPoints = Math.floor(Math.random() * (maxP - minP + 1)) + minP;

  let awardedItem = null;
  if (cfg.item && user.inventory[cfg.item] && !user.inventory[cfg.item].value) {
    user.inventory[cfg.item].value = true;
    user.inventory[cfg.item].description = `Awarded from ${storyId}`;
    awardedItem = cfg.item;
  }

  user.points = (user.points || 0) + awardedPoints;
  saveUser(user);

  return { awarded: { points: awardedPoints, item: awardedItem }, userState: userState(user) };
}

// ---------------- Minigame session engine (mirrors minigameController.js) ----------------
const BASE_SCORES = {
  M1: 150, M2: 100, M3: 200, M4: 250, M5: 200, M6: 150, M7: 150,
  M8: 150, M9A: 150, M9B: 150, M10: 200, M11: 200, M12: 250, M13: 250,
  M14: 300, M15: 300, M16: 400, M17: 400, M18: 450, M19: 350, M20: 350,
};
const TRIES_GAMES_3 = ["M4", "M5", "M6", "M8", "M9A", "M9B", "M10", "M11", "M12", "M13", "M14", "M15"];
const TRIES_GAMES_5 = ["M16", "M17", "M18", "M19", "M20"];
const TIMER_SECONDS = 300;

function getSessions() {
  return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "{}");
}
function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
function computeRemaining(session) {
  if (!session.startedAt) return session.timerSeconds;
  const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
  const remaining = session.timerSeconds - elapsed;
  return remaining > 0 ? remaining : 0;
}
function toClientSession(session) {
  return {
    minigameId: session.minigameId,
    remainingSeconds: computeRemaining(session),
    triesLeft: session.triesLeft,
    completed: session.completed,
    score: session.score,
  };
}

export function offlineStartSession(minigameId) {
  const sessions = getSessions();
  let session = sessions[minigameId];
  if (!session) {
    let initialTries = 0;
    if (TRIES_GAMES_3.includes(minigameId)) initialTries = 3;
    else if (TRIES_GAMES_5.includes(minigameId)) initialTries = 5;

    session = {
      minigameId,
      timerSeconds: TIMER_SECONDS,
      triesLeft: initialTries,
      startedAt: Date.now(),
      completed: false,
      score: 0,
      rewardClaimed: false,
    };
  } else if (!session.completed && computeRemaining(session) === 0) {
    session.startedAt = Date.now();
  }
  sessions[minigameId] = session;
  saveSessions(sessions);
  return toClientSession(session);
}

export function offlineGetSessionState(minigameId) {
  const session = getSessions()[minigameId];
  return session ? toClientSession(session) : null;
}

export function offlineDecrementTry(minigameId) {
  const sessions = getSessions();
  const session = sessions[minigameId];
  if (!session || session.triesLeft <= 0) return null;
  session.triesLeft -= 1;
  if (session.triesLeft <= 0) session.completed = true;
  saveSessions(sessions);
  return toClientSession(session);
}

export function offlineCompleteSession(minigameId) {
  const sessions = getSessions();
  const session = sessions[minigameId];
  if (!session) return null;
  if (session.completed) return { score: session.score };

  const elapsed = session.startedAt ? Math.floor((Date.now() - session.startedAt) / 1000) : session.timerSeconds;
  const timer = session.timerSeconds;
  const baseScore = BASE_SCORES[minigameId] || 100;
  let score;
  const formulaGamesOld = ["M8", "M9A", "M9B", "M10", "M11", "M12", "M13", "M14", "M15"];

  if (formulaGamesOld.includes(minigameId)) {
    const x = baseScore, a = 3, i = a - session.triesLeft, t_used = elapsed, t_lim = timer;
    const logTerm = Math.log((i + 1) / 2) / Math.log(a);
    const valueA = (-x / (a - i + 1)) * logTerm;
    let valueB;
    if (t_used < 60) valueB = x;
    else if (t_used >= t_lim) valueB = 0;
    else valueB = x * (1 - (t_used - 60) / (t_lim - 60));
    score = Math.round(Math.max(0, valueA, valueB));
  } else if (TRIES_GAMES_5.includes(minigameId)) {
    const x = baseScore, a = 5, i = a - session.triesLeft, t_used = elapsed, t_lim = timer;
    const valueA = (-x / (6 - i)) * Math.log(i + 5);
    const timePenalty = Math.max(0, (t_used - 60) / (t_lim - 60));
    const valueB = x * (1 - timePenalty);
    score = Math.max(0, Math.round(Math.max(valueA, valueB)));
  } else {
    if (elapsed < 60) score = baseScore;
    else if (elapsed >= timer) score = 0;
    else score = Math.max(0, Math.round(baseScore * (1 - (elapsed - 60) / (timer - 60))));
  }

  session.completed = true;
  session.score = score;
  saveSessions(sessions);
  return { score };
}

export function offlineClaimReward(minigameId) {
  const sessions = getSessions();
  const session = sessions[minigameId];
  if (!session || !session.completed) return null;
  if (session.rewardClaimed) return { score: session.score, claimed: true };

  const user = getUser();
  user.points = (user.points || 0) + session.score;
  saveUser(user);

  session.rewardClaimed = true;
  saveSessions(sessions);
  return { score: session.score, userPoints: user.points };
}
