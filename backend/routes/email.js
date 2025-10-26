import express from "express";
import EmailPreference from "../models/EmailPreference.js";
import User from "../models/User.js";
import emailScheduler from "../services/emailScheduler.js";
import { authenticateToken as auth } from "../middleware/auth.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

/**
 * @route   GET /api/email/preferences/:token
 * @desc    Get email preferences by unsubscribe token
 * @access  Public (token-based)
 */
router.get("/preferences/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const preference = await EmailPreference.findOne({
      unsubscribeToken: token,
    }).populate("userId", "name email");

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: "Preferences not found",
      });
    }

    res.json({
      success: true,
      data: {
        email: preference.email,
        name: preference.userId?.name,
        unsubscribedAll: preference.unsubscribedAll,
        preferences: preference.preferences,
      },
    });
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @route   POST /api/email/preferences/:token
 * @desc    Update email preferences
 * @access  Public (token-based)
 */
router.post(
  "/preferences/:token",
  [
    body("preferences")
      .optional()
      .isObject()
      .withMessage("Preferences must be an object"),
    body("unsubscribedAll")
      .optional()
      .isBoolean()
      .withMessage("unsubscribedAll must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { token } = req.params;
      const { preferences, unsubscribedAll } = req.body;

      const emailPref = await EmailPreference.findOne({
        unsubscribeToken: token,
      });

      if (!emailPref) {
        return res.status(404).json({
          success: false,
          message: "Preferences not found",
        });
      }

      // Update preferences
      if (preferences) {
        emailPref.preferences = {
          ...emailPref.preferences,
          ...preferences,
        };
      }

      if (typeof unsubscribedAll === "boolean") {
        emailPref.unsubscribedAll = unsubscribedAll;
        if (unsubscribedAll) {
          emailPref.unsubscribedAllAt = new Date();
        }
      }

      await emailPref.save();

      res.json({
        success: true,
        message: "Email preferences updated successfully",
        data: {
          unsubscribedAll: emailPref.unsubscribedAll,
          preferences: emailPref.preferences,
        },
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/**
 * @route   POST /api/email/unsubscribe/:token
 * @desc    Unsubscribe from all emails
 * @access  Public (token-based)
 */
router.post("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const emailPref = await EmailPreference.findOne({
      unsubscribeToken: token,
    });

    if (!emailPref) {
      return res.status(404).json({
        success: false,
        message: "Preferences not found",
      });
    }

    emailPref.unsubscribedAll = true;
    emailPref.unsubscribedAllAt = new Date();
    await emailPref.save();

    res.json({
      success: true,
      message: "You have been unsubscribed from all emails",
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @route   POST /api/email/resubscribe/:token
 * @desc    Resubscribe to emails
 * @access  Public (token-based)
 */
router.post("/resubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const emailPref = await EmailPreference.findOne({
      unsubscribeToken: token,
    });

    if (!emailPref) {
      return res.status(404).json({
        success: false,
        message: "Preferences not found",
      });
    }

    emailPref.unsubscribedAll = false;
    emailPref.unsubscribedAllAt = null;
    await emailPref.save();

    res.json({
      success: true,
      message: "You have been resubscribed to emails",
    });
  } catch (error) {
    console.error("Error resubscribing:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @route   GET /api/email/my-preferences
 * @desc    Get current user's email preferences
 * @access  Private
 */
router.get("/my-preferences", auth, async (req, res) => {
  try {
    let preference = await EmailPreference.findOne({ userId: req.user._id });

    if (!preference) {
      // Create default preference
      preference = await EmailPreference.create({
        userId: req.user._id,
        email: req.user.email,
      });
    }

    res.json({
      success: true,
      data: {
        unsubscribedAll: preference.unsubscribedAll,
        preferences: preference.preferences,
        unsubscribeUrl: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/unsubscribe?token=${preference.unsubscribeToken}`,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @route   POST /api/email/my-preferences
 * @desc    Update current user's email preferences
 * @access  Private
 */
router.post(
  "/my-preferences",
  [
    auth,
    body("preferences")
      .optional()
      .isObject()
      .withMessage("Preferences must be an object"),
    body("unsubscribedAll")
      .optional()
      .isBoolean()
      .withMessage("unsubscribedAll must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { preferences, unsubscribedAll } = req.body;

      let emailPref = await EmailPreference.findOne({ userId: req.user._id });

      if (!emailPref) {
        emailPref = await EmailPreference.create({
          userId: req.user._id,
          email: req.user.email,
        });
      }

      // Update preferences
      if (preferences) {
        emailPref.preferences = {
          ...emailPref.preferences,
          ...preferences,
        };
      }

      if (typeof unsubscribedAll === "boolean") {
        emailPref.unsubscribedAll = unsubscribedAll;
        if (unsubscribedAll) {
          emailPref.unsubscribedAllAt = new Date();
        }
      }

      await emailPref.save();

      res.json({
        success: true,
        message: "Email preferences updated successfully",
        data: {
          unsubscribedAll: emailPref.unsubscribedAll,
          preferences: emailPref.preferences,
        },
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/**
 * @route   GET /api/email/scheduler/status
 * @desc    Get email scheduler status (admin only)
 * @access  Private
 */
router.get("/scheduler/status", auth, async (req, res) => {
  try {
    // Simple auth check - you can enhance this with admin middleware
    const status = emailScheduler.getStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting scheduler status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @route   POST /api/email/test/welcome
 * @desc    Send test welcome email to current user
 * @access  Private
 */
router.post("/test/welcome", auth, async (req, res) => {
  try {
    const result = await emailScheduler.sendWelcomeEmailToUser(req.user._id);

    if (result.success) {
      res.json({
        success: true,
        message: "Test welcome email sent",
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("Error sending test welcome email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
