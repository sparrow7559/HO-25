// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const UserSchema = new Schema({
  teamId: {
    type: String,
    required: true,
  },
  teamLeader: {
    delegateId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    institute: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  player2: {
    delegateId: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    name: { type: String },
    registrationNumber: { type: String },
    phone: { type: String },
    institute: { type: String },
    email: { type: String, unique: true, sparse: true }, // sparse to avoid conflicts if null
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user", 
  },
  currentStoryId: {
    type: String,
    default: "0001",
  },
  points: {
    type: Number,
    default: 100,
  },
  money: {
    type: Number,
    default: 100,
  },
  health: {
    type: Number,
    default: 100,
  },
  rf: {
    type: Number,
    default: 100,
  },
  sessionId: {
    type: String,
    default: "",
  },
  inventory: {
    script: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    journal: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    kumbh: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    sword: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    pickaxe: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
    axe: {
      value: { type: Boolean, default: false },
      description: { type: String, default: "" },
    },
  },
  minicounter: {
    type: [Number],
    default: () => Array(18).fill(3),
  },
  choiceTime: {
    type: Date,
    default: Date.now,
  },
  otp: {
  type: String,
},
otpExpiry: {
  type: Date,
},
});

// ---------------- Password Hashing ----------------
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ---------------- Password Comparison ----------------
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ---------------- Export ----------------
const User = mongoose.model("User", UserSchema);
export default User;
