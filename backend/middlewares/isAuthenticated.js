import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated. No token provided.",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token.",
        success: false,
      });
    }

    req.id = decoded.userId;
    
    // SECURITY FIX: Verify user still exists in the database
    const userExists = await User.findById(req.id).select("_id");
    if (!userExists) {
      return res.status(401).json({
        message: "User account no longer exists or has been removed.",
        success: false,
      });
    }

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      message: "Authentication failed. Token is invalid or expired.",
      success: false,
    });
  }
};

export default isAuthenticated;
