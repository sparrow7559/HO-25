import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import storyRoutes from "./routes/storyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import forgotpwdRoutes from "./routes/forgotpwdRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import minigameRoutes from "./routes/minigameRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000",                // for local dev
  "https://hopelessopus.istemanipal.com"  // your production domain
];

// ✅ CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    } // if using cookies or Authorization headers
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/story", storyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/forgotpwd", forgotpwdRoutes);
app.use("/api/contactus", contactRoutes);
app.use("/api/minigame", minigameRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Server running");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
