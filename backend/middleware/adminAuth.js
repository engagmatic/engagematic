import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { config } from "../config/index.js";

/**
 * Admin Authentication Middleware
 * Verifies JWT token and checks if user is an admin
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(
      token,
      config.ADMIN_JWT_SECRET || config.JWT_SECRET
    );

    // Check if token is for admin
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Attach admin info to request
    req.admin = {
      adminId: admin._id,
      username: admin.username,
      role: admin.role,
      email: admin.email,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

/**
 * Super Admin Only Middleware
 * Must be used after adminAuth middleware
 */
const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin privileges required.",
    });
  }
  next();
};

export { adminAuth, superAdminOnly };
