// controllers/storyController.js
import fs from "fs";
import path from "path";
import Story from "../models/storySchema.js";
import User from "../models/user.js";

// Get absolute path to JSON file
const __dirname = path.resolve();
const storyPath = path.join(__dirname, "story/storyreal.json");

// Load JSON file
// const storyreal = JSON.parse(fs.readFileSync(storyPath, "utf-8"));

/** MongoDB: Get story by ID */
export const getStoryById = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findOne({ storyID: storyId });
    if (!story) return res.status(404).json({ message: "Story not found" });
    return res.json(story);
  } catch (err) {
    // console.error("Get story error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/** Award user points/inventory for minigame completion (success only) */
export const awardMinigameReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, success, rewardConfig } = req.body; // rewardConfig optional override

    if (!storyId) return res.status(400).json({ message: 'storyId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only award on success
    if (!success) {
      return res.json({ message: 'No reward: minigame not successful', awarded: null, userState: { points: user.points, inventory: user.inventory } });
    }

    // Default per-minigame reward map - tweak as required
    const defaultRewards = {
      M1: { pointsRange: [10, 30], item: 'script' },
      M2: { pointsRange: [5, 20], item: 'journal' },
      M3: { pointsRange: [15, 35], item: 'kumbh' },
      M4: { pointsRange: [20, 50], item: 'sword' },
      M5: { pointsRange: [8, 25], item: 'pickaxe' },
      M6: { pointsRange: [12, 28], item: 'axe' },
      M7: { pointsRange: [25, 60], item: 'script' },
    };

    const cfg = (rewardConfig && typeof rewardConfig === 'object') ? rewardConfig : (defaultRewards[storyId] || { pointsRange: [5, 10], item: null });

    // Random points between inclusive range
    const [minP, maxP] = cfg.pointsRange || [5, 10];
    const awardedPoints = Math.floor(Math.random() * (maxP - minP + 1)) + minP;

    // Award item if specified and not already owned
    const awardedItemKey = cfg.item || null;
    let awardedItem = null;
    if (awardedItemKey && user.inventory && Object.prototype.hasOwnProperty.call(user.inventory, awardedItemKey)) {
      if (!user.inventory[awardedItemKey].value) {
        user.inventory[awardedItemKey].value = true;
        user.inventory[awardedItemKey].description = `Awarded from ${storyId}`;
        awardedItem = awardedItemKey;
      }
    }

    // Apply points
    user.points = (user.points || 0) + awardedPoints;
    await user.save();

    return res.json({
      message: 'Minigame reward applied',
      awarded: { points: awardedPoints, item: awardedItem },
      userState: { points: user.points, inventory: user.inventory }
    });
  } catch (err) {
    // console.error('Award minigame reward error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** Local JSON: Get story by ID 
export const getLocalStoryById = (req, res) => {
  const { storyId } = req.params;
  const story = storyreal.find(s => s.storyID === storyId);
  if (!story) return res.status(404).json({ message: "Story not found in local JSON" });
  res.json(story);
};

/** Local JSON: Get all stories 
export const getLocalStoryAll = (req, res) => {
  res.json(storyreal);
};*/

/** MongoDB: Get current story for logged-in user */
export const getCurrentStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const storyId = user.currentStoryId;
    const story = await Story.findOne({ storyID: storyId });
    if (!story) return res.status(404).json({ message: "Story not found" });

    return res.json({
      story,
      userState: {
        points: user.points,
        money: user.money,
        health: user.health,
        rf: user.rf,
        inventory: user.inventory,
        minicounter: user.minicounter,
      },
    });
  } catch (err) {
    // console.error("Get current story error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/** MongoDB: Apply a choice and update user's state */
export const makeChoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, choiceIndex } = req.body; // take storyId from frontend

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch story using storyId from frontend instead of user.currentStoryId
    const story = await Story.findOne({ storyID: storyId });
    if (!story) return res.status(404).json({ message: "Current story node not found" });

    if (choiceIndex === undefined || choiceIndex < 0 || choiceIndex >= story.nextID.length) {
      return res.status(400).json({ message: "Invalid choice index" });
    }

    // Update user state
    user.choiceTime = Date.now();
    user.currentStoryId = story.nextID[choiceIndex];
    await user.save();

    if (user.currentStoryId.startsWith("M")) {
      return res.json({
        message: "Choice applied - minigame triggered",
        newState: {
          points: user.points,
          money: user.money,
          health: user.health,
          rf: user.rf,
          inventory: user.inventory,
          currentStoryId: user.currentStoryId,
        },
        minigame: {
          id: user.currentStoryId,
          config: {
            M1: 3,
            M2: 3,
            M3: 3,
            M4: 3,
            M5: 3,
            M6: 3,
            M7: 3,
          },
        },
      });
    }

    const nextStory = await Story.findOne({ storyID: user.currentStoryId });
    if (!nextStory) {
      return res.status(404).json({ message: "Next story not found" });
    }

    return res.json({
      message: "Choice applied",
      newState: {
        points: user.points,
        money: user.money,
        health: user.health,
        rf: user.rf,
        inventory: user.inventory,
        currentStoryId: user.currentStoryId,
      },
      nextStory,
    });
  } catch (err) {
    // console.error("Make choice error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const updateUserStoryOnLevelEnd = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId, success } = req.body; // <- story ID from frontend, success for minigames

    if (!storyId) return res.status(400).json({ message: "storyId is required" });

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the story passed from frontend
    const levelStory = await Story.findOne({ storyID: storyId });
    if (!levelStory) return res.status(404).json({ message: "Story not found" });

    // Check if level ended
    if (!levelStory.levelEnd) {
      return res.status(400).json({ message: "This story is not marked as levelEnd" });
    }

    let nextStoryId;
    if (storyId.startsWith("M")) {
      // Minigame completion: choose next based on success if array, else use nextID
      if (Array.isArray(levelStory.nextID) && levelStory.nextID.length > (success ? 0 : 1)) {
        const successIndex = success ? 0 : 1;
        nextStoryId = levelStory.nextID[successIndex];
      } else {
        // If not array or insufficient length, use nextID directly
        nextStoryId = levelStory.nextID;  
      }
    } else {
      // Regular levelEnd: set to this story, then find next
      user.currentStoryId = levelStory.storyID;
      if (levelStory.nextID && levelStory.nextID.length > 0) {
        nextStoryId = Array.isArray(levelStory.nextID) ? levelStory.nextID[0] : levelStory.nextID;
      }
    }

    // Set currentStoryId to the determined next
    if (nextStoryId) {
      user.currentStoryId = nextStoryId;
    }
    await user.save();

    // Determine next story to return
    let nextStory = null;
    if (nextStoryId) {
      nextStory = await Story.findOne({ storyID: nextStoryId });
    }

    return res.json({
      message: "User story updated on level end",
      nextStory,
      userState: {
        points: user.points,
        money: user.money,
        health: user.health,
        rf: user.rf,
        inventory: user.inventory,
        currentStoryId: user.currentStoryId,
      },
    });

  } catch (err) {
    console.error("Update user story error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

