// userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  guestLogin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ---------- Public Routes ----------
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/guest", guestLogin);   // play without registering

// ---------- Protected Routes ----------
router.get("/", protect, adminOnly, getAllUsers);   // Only admins can see all users
router.get("/:id", protect, getUserById);           // Any logged-in user can view
router.put("/:id", protect, updateUser);            // Logged-in user
router.delete("/:id", protect, adminOnly, deleteUser); // Only admins can delete

export default router;
