import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id).select("-password");
  req.userId = decoded.id;
      if (!req.user) return res.status(401).json({ message: "User not found" });

      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

// Role-based guard
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 1001) {   // 1001 = Admin
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};
