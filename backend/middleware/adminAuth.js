import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";

/**
 * Middleware to verify admin access
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authenticateToken middleware)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Fetch user from database
    const user = await User.findById(req.user.userId).select("+isAdmin");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "ADMIN_ONLY",
      });
    }

    // Attach user to request for further use
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({
      success: false,
      message: "Admin authentication failed",
    });
  }
};

/**
 * Combined middleware for admin routes (auth + admin check)
 */
export const adminOnly = [
  // Import authenticateToken here to avoid circular dependency
  async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No authentication token provided",
        });
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  },
  requireAdmin,
];
