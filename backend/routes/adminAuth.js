import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { config } from "../config/index.js";

const router = express.Router();

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map();

// Rate limiting middleware for login
const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  const attempts = loginAttempts.get(ip);
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      lockUntil: new Date(recentAttempts[0] + windowMs),
    });
  }

  recentAttempts.push(now);
  loginAttempts.set(ip, recentAttempts);

  next();
};

// Admin Login
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      console.log(`❌ Admin login failed: Username "${username}" not found`);
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      console.log(
        `❌ Admin login failed: Account "${username}" is deactivated`
      );
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      const lockTime = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      console.log(
        `❌ Admin login failed: Account "${username}" is locked for ${lockTime} minutes`
      );
      return res.status(423).json({
        success: false,
        message: `Account is locked due to multiple failed login attempts. Try again in ${lockTime} minutes.`,
        lockUntil: admin.lockUntil,
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log(`❌ Admin login failed: Invalid password for "${username}"`);
      await admin.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        attemptsRemaining: 5 - (admin.loginAttempts + 1),
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin._id,
        username: admin.username,
        role: admin.role,
        type: "admin",
      },
      config.ADMIN_JWT_SECRET || config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(`✅ Admin "${username}" logged in successfully`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// Verify admin token
router.get("/verify", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        email: admin.email,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin verify error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
});

// Admin Logout (optional - mainly clears client-side token)
router.post("/logout", adminAuth, async (req, res) => {
  try {
    console.log(`👋 Admin "${req.admin.username}" logged out`);

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

// Change admin password (requires current password)
router.post("/change-password", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const admin = await Admin.findById(req.admin.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    console.log(`🔐 Admin "${admin.username}" changed password`);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Admin change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
});

export default router;
