// controllers/userController.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { validateRequestBody } from "../utils/validators.js";
import AllowedParticipant from "../models/allowedParticipants.js";


// ---------------- Helper: Generate JWT ----------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------- Register User ----------------
export const registerUser = async (req, res) => {
  try {
    let { teamId, teamLeader, player2, password, role } = req.body || {};

    // Support clients that send TitleCase keys (coming from AllowedParticipant fields)
    teamId = teamId || req.body?.TeamID || req.body?.teamId;
    // teamLeader may come as an object with different key casing
    teamLeader = teamLeader || req.body?.teamLeader || req.body?.TeamLeader;

    if (!teamId || !teamLeader || !password) {
      return res.status(400).json({
        message: "Team ID, leader, and password are required",
      });
    }

    // Normalize leader fields and guard before using .trim()
    const leaderDelegateId =
      teamLeader?.DelegateID || teamLeader?.delegateId || teamLeader?.DelegateId || teamLeader?.Delegateid || teamLeader?.delegateID;
    const leaderEmail = teamLeader?.EmailID || teamLeader?.email || teamLeader?.Email || teamLeader?.emailId;

    // ✅ 1️⃣ Validate that leader exists in allowed list
    const allowedLeader = await AllowedParticipant.findOne({
      TeamID: (teamId && typeof teamId === "string") ? teamId.trim() : teamId,
      DelegateID: leaderDelegateId ? String(leaderDelegateId).trim() : leaderDelegateId,
      EmailID: leaderEmail ? String(leaderEmail).trim() : leaderEmail,
    });

    if (!allowedLeader) {
      return res.status(403).json({
        message: "Team Leader not found in authorized list (Team ID, Delegate ID, or Email mismatch)",
      });
    }

    // ✅ 2️⃣ (Optional) Validate player2 if provided
    let finalPlayer2 = undefined;
    if (player2 && Object.values(player2).some((v) => v && v !== "")) {
      // normalize player2 keys similar to leader
      const player2Normalized = {
        name: player2.name || player2.Name,
        email: player2.email || player2.Email || player2.EmailID,
        DelegateID: player2.DelegateID || player2.delegateId || player2.DelegateId,
      };

      const player2Check = validateRequestBody(player2Normalized, ["name", "email", "DelegateID"]);
      if (!player2Check.isValid) {
        return res.status(400).json({
          message: `Player2: ${player2Check.message}`,
        });
      }

      const allowedPlayer2 = await AllowedParticipant.findOne({
        TeamID: (teamId && typeof teamId === "string") ? teamId.trim() : teamId,
        DelegateID: player2Normalized.DelegateID ? String(player2Normalized.DelegateID).trim() : player2Normalized.DelegateID,
        EmailID: player2Normalized.email ? String(player2Normalized.email).trim() : player2Normalized.email,
      });

      if (!allowedPlayer2) {
        return res.status(403).json({
          message: "Player 2 not found in authorized list (Team ID, Delegate ID, or Email mismatch)",
        });
      }

      finalPlayer2 = player2Normalized;
    }

    // ✅ 3️⃣ Prevent duplicate registrations by email
    const existingUser = await User.findOne({
      $or: [
        { "teamLeader.email": teamLeader.email },
        finalPlayer2?.email ? { "player2.email": finalPlayer2.email } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ 4️⃣ Proceed to create new user
    const newUserData = {
      teamId,
      teamLeader,
      password,
      role: role || "user",
    };

    if (finalPlayer2) {
      newUserData.player2 = finalPlayer2;
    }

    const newUser = new User(newUserData);
    const token = generateToken(newUser);

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ---------------- Login User ----------------http:localhost:5000/api/users/login
export const loginUser = async (req, res) => {
  try {
    const check = validateRequestBody(req.body, ["email", "password"]);
    if (!check.isValid) return res.status(400).json({ message: check.message });

    const { email, password } = req.body;
    // console.log(email, password);
    const user = await User.findOne({
      $or: [{ "teamLeader.email": email }, { "player2.email": email }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get All Users ----------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0)
      return res.status(404).json({ message: "No users found" });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get Single User ----------------
export const getUserById = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    // If player2 is being updated, validate fields
    if (req.body.player2) {
      const player2Check = validateRequestBody(req.body.player2, ["name", "email"]);
      if (!player2Check.isValid)
        return res.status(400).json({ message: `Player2: ${player2Check.message}` });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Delete User ----------------
export const deleteUser = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ---------------- Guest / Demo Login ----------------
// ponytail: creates a throwaway user so the game flow works without registration.
// Set ALLOW_GUEST=false in env to disable. Guests get role "guest" and are hidden
// from the leaderboard. POST body { demo: true } reuses one fixed demo account.
const DEMO_EMAIL = "demo@hopelessopus.test";
const DEMO_PASSWORD = "demo1234";

export const guestLogin = async (req, res) => {
  try {
    if (process.env.ALLOW_GUEST === "false")
      return res.status(403).json({ message: "Guest access disabled" });

    const demo = req.body?.demo === true;
    const email = demo ? DEMO_EMAIL : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@guest.local`;

    let user = await User.findOne({ "teamLeader.email": email });

    if (!user) {
      const id = email.split("@")[0];
      user = await User.create({
        teamId: demo ? "DEMO" : `GUEST-${id}`,
        teamLeader: {
          delegateId: id,
          name: demo ? "Demo Team" : "Guest Player",
          registrationNumber: id,
          phone: "0000000000",
          institute: "Guest",
          email,
        },
        password: DEMO_PASSWORD,
        role: "guest",
      });
    }

    res.status(200).json({
      message: "Guest login successful",
      user,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
