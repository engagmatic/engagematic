import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Set both the user object and userId for compatibility
    req.user = user;
    req.user.userId = user._id; // Add userId property for routes that expect it
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
        message: "Token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export const checkPlanAccess = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user.plan;
    const planHierarchy = { starter: 1, pro: 2 };

    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        success: false,
        message: `${requiredPlan} plan required for this feature`,
      });
    }

    next();
  };
};

export const checkTrialStatus = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user is on trial and trial has expired
    if (user.subscriptionStatus === "trial" && new Date() > user.trialEndsAt) {
      return res.status(402).json({
        success: false,
        message: "Trial period expired. Please subscribe to continue.",
        code: "TRIAL_EXPIRED",
      });
    }

    // Check if subscription is active
    if (
      user.subscriptionStatus === "inactive" ||
      user.subscriptionStatus === "cancelled"
    ) {
      return res.status(402).json({
        success: false,
        message: "Subscription required to access this feature",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking subscription status",
    });
  }
};
