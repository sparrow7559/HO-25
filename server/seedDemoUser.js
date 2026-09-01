// ponytail: one-off script to guarantee the demo login exists, run with `node seedDemoUser.js`
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.js";

dotenv.config();

const DEMO_EMAIL = "demo@hopelessopus.test";
const DEMO_PASSWORD = "demo1234";

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ "teamLeader.email": DEMO_EMAIL });
if (existing) {
  console.log("Demo user already exists:", DEMO_EMAIL);
} else {
  await User.create({
    teamId: "DEMO",
    teamLeader: {
      delegateId: "demo",
      name: "Demo Team",
      registrationNumber: "demo",
      phone: "0000000000",
      institute: "Guest",
      email: DEMO_EMAIL,
    },
    password: DEMO_PASSWORD,
    role: "guest",
  });
  console.log("Created demo user:", DEMO_EMAIL, "/", DEMO_PASSWORD);
}

await mongoose.disconnect();
