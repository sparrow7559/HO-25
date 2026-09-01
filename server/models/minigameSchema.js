// models/minigameSchema.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const MinigameSchema = new Schema({
  minigameId: {
    type: String,
    required: true,
    unique: true,
    enum: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9A", "M9B", "M10", "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19", "M20"],
  },
  timer: {
    type: Number, // store timer in seconds
    default: 300, // 5 minutes
    required: true,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  tries: {
    type: Number,
    default: function() {
      if (["M1", "M5", "M6", "M9B","M20"].includes(this.minigameId)) return 3;
      return null;
    },
    min: 0,
    max: 3,
    required: function() {
      return ["M1", "M5", "M6", "M9B","M20"].includes(this.minigameId);
    },
  },
});

export default mongoose.model("Minigame", MinigameSchema);