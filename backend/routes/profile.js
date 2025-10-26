import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { checkProfileCompletion } from "../middleware/profileCompletion.js";
import User from "../models/User.js";
import Persona from "../models/Persona.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Check profile completion status
router.get(
  "/status",
  authenticateToken,
  checkProfileCompletion,
  async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          isComplete: req.profileComplete,
          status: req.profileStatus,
        },
      });
    } catch (error) {
      console.error("Profile status check error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Complete basic profile information
router.post(
  "/complete-basic",
  authenticateToken,
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("linkedinUrl")
      .notEmpty()
      .withMessage("LinkedIn URL is required")
      .isURL()
      .withMessage("Please provide a valid LinkedIn URL"),
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

      const userId = req.user.userId;
      const { name, linkedinUrl } = req.body;

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name: name.trim(),
          linkedinUrl: linkedinUrl.trim(),
        },
        { new: true }
      ).select("name email linkedinUrl");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Profile completion error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get profile completion requirements
router.get(
  "/requirements",
  authenticateToken,
  checkProfileCompletion,
  async (req, res) => {
    try {
      const requirements = {
        basicProfile: {
          name: {
            required: true,
            description: "Your full name",
            completed:
              req.profileStatus.hasBasicProfile &&
              !req.profileStatus.missingFields.includes("name"),
          },
          email: {
            required: true,
            description: "Your email address",
            completed:
              req.profileStatus.hasBasicProfile &&
              !req.profileStatus.missingFields.includes("email"),
          },
          linkedinUrl: {
            required: true,
            description: "Your LinkedIn profile URL",
            completed:
              req.profileStatus.hasBasicProfile &&
              !req.profileStatus.missingFields.includes("linkedinUrl"),
          },
        },
        persona: {
          required: true,
          description: "At least one AI persona for content generation",
          completed: req.profileStatus.hasPersona,
          count: req.profileStatus.personaCount,
        },
      };

      res.json({
        success: true,
        data: {
          requirements,
          isComplete: req.profileComplete,
          nextStep: req.profileComplete
            ? null
            : req.profileStatus.hasBasicProfile
            ? "Create your first AI persona"
            : "Complete your basic profile information",
        },
      });
    } catch (error) {
      console.error("Profile requirements error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default router;
