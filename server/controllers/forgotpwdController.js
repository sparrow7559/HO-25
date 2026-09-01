import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/email.js";

// ---------------- Forgot Password ----------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();

    // find user where email matches teamLeader or player2
    const user = await User.findOne({
      $or: [
        { "teamLeader.email": emailLower },
        { "player2.email": emailLower },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save OTP with 5 min expiry
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    // determine correct email to send OTP
    const targetEmail =
      user.teamLeader.email.toLowerCase() === emailLower
        ? user.teamLeader.email
        : user.player2.email;

    // send email
    await sendEmail(
      targetEmail,
      "Password Reset OTP",
      `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Reset Password ----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const emailLower = email.toLowerCase();

    // find user where email matches teamLeader or player2
    const user = await User.findOne({
      $or: [
        { "teamLeader.email": emailLower },
        { "player2.email": emailLower },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.password = newPassword;

    // clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};