import express from "express";
import Persona from "../models/Persona.js";
import { authenticateToken, checkPlanAccess } from "../middleware/auth.js";
import {
  validatePersonaCreation,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// Get user's personas
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const samplePersonas = [
      {
        name: "Tech Professional",
        description:
          "A technology professional with expertise in software development and digital transformation",
        tone: "professional",
        industry: "Technology",
        experience: "senior",
        writingStyle:
          "Clear, technical, and solution-oriented. Uses data and examples to support points.",
      },
      {
        name: "Marketing Expert",
        description:
          "A marketing professional focused on growth strategies and brand building",
        tone: "authentic",
        industry: "Marketing",
        experience: "mid",
        writingStyle:
          "Engaging, story-driven, and results-focused. Uses personal experiences and case studies.",
      },
      {
        name: "Entrepreneur",
        description:
          "A startup founder sharing lessons learned and business insights",
        tone: "casual",
        industry: "Entrepreneurship",
        experience: "executive",
        writingStyle:
          "Conversational, honest, and inspiring. Shares failures and successes openly.",
      },
      {
        name: "Sales Leader",
        description:
          "A sales professional sharing strategies and relationship-building tips",
        tone: "authoritative",
        industry: "Sales",
        experience: "senior",
        writingStyle:
          "Direct, persuasive, and value-focused. Uses frameworks and actionable advice.",
      },
    ];
    const personas =
      (await Persona.find({ userId, isActive: true }).sort({
        createdAt: -1,
      })) ?? samplePersonas;
    res.json({
      success: true,
      data: { personas },
    });
  } catch (error) {
    console.error("Get personas error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get personas",
    });
  }
});

// Get sample personas
router.get("/samples", async (req, res) => {
  try {
    const samplePersonas = [
      {
        name: "Tech Professional",
        description:
          "A technology professional with expertise in software development and digital transformation",
        tone: "professional",
        industry: "Technology",
        experience: "senior",
        writingStyle:
          "Clear, technical, and solution-oriented. Uses data and examples to support points.",
      },
      {
        name: "Marketing Expert",
        description:
          "A marketing professional focused on growth strategies and brand building",
        tone: "authentic",
        industry: "Marketing",
        experience: "mid",
        writingStyle:
          "Engaging, story-driven, and results-focused. Uses personal experiences and case studies.",
      },
      {
        name: "Entrepreneur",
        description:
          "A startup founder sharing lessons learned and business insights",
        tone: "casual",
        industry: "Entrepreneurship",
        experience: "executive",
        writingStyle:
          "Conversational, honest, and inspiring. Shares failures and successes openly.",
      },
      {
        name: "Sales Leader",
        description:
          "A sales professional sharing strategies and relationship-building tips",
        tone: "authoritative",
        industry: "Sales",
        experience: "senior",
        writingStyle:
          "Direct, persuasive, and value-focused. Uses frameworks and actionable advice.",
      },
    ];

    res.json({
      success: true,
      data: { personas: samplePersonas },
    });
  } catch (error) {
    console.error("Get sample personas error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sample personas",
    });
  }
});

// Create new persona
router.post(
  "/",
  authenticateToken,
  validatePersonaCreation,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, description, tone, industry, experience, writingStyle } =
        req.body;

      // Check persona limit based on plan
      const existingPersonas = await Persona.countDocuments({
        userId,
        isActive: true,
      });
      const personaLimit = req.user.plan === "pro" ? 10 : 3;

      if (existingPersonas >= personaLimit) {
        return res.status(403).json({
          success: false,
          message: `Persona limit reached. ${
            req.user.plan === "starter"
              ? "Upgrade to Pro for more personas."
              : "Contact support for assistance."
          }`,
        });
      }

      // If this is the first persona, make it default
      const isFirstPersona = existingPersonas === 0;

      const persona = new Persona({
        userId,
        name,
        description,
        tone,
        industry,
        experience,
        writingStyle,
        isDefault: isFirstPersona,
      });

      await persona.save();

      res.status(201).json({
        success: true,
        message: "Persona created successfully",
        data: { persona },
      });
    } catch (error) {
      console.error("Create persona error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create persona",
      });
    }
  }
);

// Update persona
router.put("/:id", authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, tone, industry, experience, writingStyle } =
      req.body;

    const persona = await Persona.findOneAndUpdate(
      { _id: id, userId },
      { name, description, tone, industry, experience, writingStyle },
      { new: true, runValidators: true }
    );

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona not found",
      });
    }

    res.json({
      success: true,
      message: "Persona updated successfully",
      data: { persona },
    });
  } catch (error) {
    console.error("Update persona error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update persona",
    });
  }
});

// Set default persona
router.post(
  "/:id/set-default",
  authenticateToken,
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // First, unset all default personas for this user
      await Persona.updateMany({ userId }, { isDefault: false });

      // Then set the selected persona as default
      const persona = await Persona.findOneAndUpdate(
        { _id: id, userId },
        { isDefault: true },
        { new: true }
      );

      if (!persona) {
        return res.status(404).json({
          success: false,
          message: "Persona not found",
        });
      }

      res.json({
        success: true,
        message: "Default persona updated successfully",
        data: { persona },
      });
    } catch (error) {
      console.error("Set default persona error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set default persona",
      });
    }
  }
);

// Delete persona
router.delete("/:id", authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const persona = await Persona.findOne({ _id: id, userId });
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona not found",
      });
    }

    // Don't allow deletion of the only persona
    const personaCount = await Persona.countDocuments({
      userId,
      isActive: true,
    });
    if (personaCount <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete the only persona. Create another persona first.",
      });
    }

    // Soft delete
    await Persona.findByIdAndUpdate(id, { isActive: false });

    // If deleted persona was default, set another as default
    if (persona.isDefault) {
      const newDefault = await Persona.findOne({ userId, isActive: true });
      if (newDefault) {
        await Persona.findByIdAndUpdate(newDefault._id, { isDefault: true });
      }
    }

    res.json({
      success: true,
      message: "Persona deleted successfully",
    });
  } catch (error) {
    console.error("Delete persona error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete persona",
    });
  }
});

// Get persona by ID
router.get("/:id", authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const persona = await Persona.findOne({ _id: id, userId, isActive: true });

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: "Persona not found",
      });
    }

    res.json({
      success: true,
      data: { persona },
    });
  } catch (error) {
    console.error("Get persona error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get persona",
    });
  }
});

export default router;
