import mongoose from 'mongoose';
const { Schema } = mongoose;

// Per-user per-minigame session persistence
// Stores timer, triesLeft, completion and scoring so refresh does not reset state
const MinigameSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  minigameId: { type: String, required: true, index: true, enum: ['M1','M2','M3','M4','M5','M6','M7','M8','M9A','M9B','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20'] },
  timerSeconds: { type: Number, default: 300 }, // total allocated time (seconds)
  startedAt: { type: Date, default: null },      // when the active attempt started
  triesLeft: { type: Number, default: 0 },       // 0 for games without tries
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  score: { type: Number, default: 0 },
  rewardClaimed: { type: Boolean, default: false },
}, { timestamps: true });

MinigameSessionSchema.index({ user: 1, minigameId: 1 }, { unique: true });

export default mongoose.model('MinigameSession', MinigameSessionSchema);