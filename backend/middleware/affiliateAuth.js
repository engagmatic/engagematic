import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import Affiliate from "../models/Affiliate.js";

/**
 * Authenticate affiliate by JWT token
 */
export const authenticateAffiliate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const affiliate = await Affiliate.findById(decoded.affiliateId).select(
      "-password"
    );

    if (!affiliate) {
      return res.status(401).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    // Allow pending and approved affiliates to access dashboard
    // Only block suspended or rejected affiliates
    if (!affiliate.isActive) {
      return res.status(403).json({
        success: false,
        message: "Affiliate account is deactivated",
      });
    }
    
    if (affiliate.status === "suspended" || affiliate.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `Affiliate account is ${affiliate.status}. Please contact support.`,
      });
    }

    req.affiliate = affiliate;
    req.affiliateId = affiliate._id;
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
        message: "Token expired. Please log in again.",
      });
    }

    console.error("Affiliate auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAffiliateAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const affiliate = await Affiliate.findById(decoded.affiliateId).select(
        "-password"
      );

      if (affiliate && affiliate.isActive && affiliate.status === "active") {
        req.affiliate = affiliate;
        req.affiliateId = affiliate._id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

