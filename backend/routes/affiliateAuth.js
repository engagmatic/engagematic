import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import Affiliate from "../models/Affiliate.js";
import { config } from "../config/index.js";
import { authenticateAffiliate } from "../middleware/affiliateAuth.js";

const router = express.Router();

/**
 * @route   POST /api/affiliate/register
 * @desc    Register new affiliate (application)
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("profile.jobTitle").optional().trim(),
    body("profile.company").optional().trim(),
    body("profile.linkedinUrl").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password, profile } = req.body;

      // Check if affiliate already exists
      const existingAffiliate = await Affiliate.findOne({ email });
      if (existingAffiliate) {
        return res.status(400).json({
          success: false,
          message: "Affiliate account already exists with this email",
        });
      }

      // Generate affiliate code
      const affiliateCode = await Affiliate.generateAffiliateCode(name);

      // Create affiliate (pending approval)
      const affiliate = new Affiliate({
        name,
        email,
        password,
        affiliateCode,
        status: "pending", // Requires approval
        profile: profile || {},
        applicationDate: new Date(),
      });

      // Generate referral link
      affiliate.referralLink = affiliate.generateReferralLink();

      await affiliate.save();

      // Generate JWT token
      const token = jwt.sign(
        { affiliateId: affiliate._id },
        config.JWT_SECRET,
        {
          expiresIn: config.JWT_EXPIRE,
        }
      );

      res.status(201).json({
        success: true,
        message: "Affiliate application submitted successfully. Awaiting approval.",
        data: {
          affiliate: {
            id: affiliate._id,
            name: affiliate.name,
            email: affiliate.email,
            affiliateCode: affiliate.affiliateCode,
            status: affiliate.status,
            referralLink: affiliate.referralLink,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Affiliate registration error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register affiliate",
        error: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/affiliate/login
 * @desc    Login affiliate
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find affiliate
      const affiliate = await Affiliate.findOne({ email }).select("+password");
      if (!affiliate) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if account is active (allow pending affiliates to login)
      if (!affiliate.isActive) {
        return res.status(403).json({
          success: false,
          message: "Affiliate account is deactivated",
        });
      }
      
      // Allow login for pending, approved, and active affiliates
      // Only block suspended or rejected
      if (affiliate.status === "suspended" || affiliate.status === "rejected") {
        return res.status(403).json({
          success: false,
          message: `Affiliate account is ${affiliate.status}. Please contact support.`,
        });
      }

      // Verify password
      const isPasswordValid = await affiliate.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      affiliate.lastLoginAt = new Date();
      await affiliate.save();

      // Generate JWT token
      const token = jwt.sign(
        { affiliateId: affiliate._id },
        config.JWT_SECRET,
        {
          expiresIn: config.JWT_EXPIRE,
        }
      );

      // Remove password from response
      const affiliateResponse = affiliate.toObject();
      delete affiliateResponse.password;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          affiliate: affiliateResponse,
          token,
        },
      });
    } catch (error) {
      console.error("Affiliate login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/affiliate/me
 * @desc    Get current affiliate profile
 * @access  Private
 */
router.get("/me", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    res.json({
      success: true,
      data: affiliate,
    });
  } catch (error) {
    console.error("Get affiliate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get affiliate profile",
    });
  }
});

/**
 * @route   PUT /api/affiliate/profile
 * @desc    Update affiliate profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticateAffiliate,
  [
    body("name").optional().trim(),
    body("profile").optional(),
    body("payoutInfo").optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const affiliate = await Affiliate.findById(req.affiliateId);
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: "Affiliate not found",
        });
      }

      // Update fields
      if (req.body.name) affiliate.name = req.body.name;
      if (req.body.profile) {
        affiliate.profile = { ...affiliate.profile, ...req.body.profile };
      }
      if (req.body.payoutInfo) {
        affiliate.payoutInfo = { ...affiliate.payoutInfo, ...req.body.payoutInfo };
      }

      await affiliate.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: affiliate,
      });
    } catch (error) {
      console.error("Update affiliate profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }
);

export default router;

