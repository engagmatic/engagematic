import express from "express";
import Hook from "../models/Hook.js";
import Persona from "../models/Persona.js";
import { authenticateToken, checkPlanAccess } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validation.js";
import { body } from "express-validator";
import googleAIService from "../services/googleAI.js";

const router = express.Router();

// Get all available hooks
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;

    const hooks = await Hook.find(query).sort({
      usageCount: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: { hooks },
    });
  } catch (error) {
    console.error("Get hooks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get hooks",
    });
  }
});

// Get hook categories
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        value: "story",
        label: "Personal Story",
        description: "Share personal experiences and lessons",
      },
      {
        value: "question",
        label: "Engaging Question",
        description: "Ask thought-provoking questions",
      },
      {
        value: "statement",
        label: "Bold Statement",
        description: "Make confident declarations",
      },
      {
        value: "challenge",
        label: "Challenge",
        description: "Challenge conventional thinking",
      },
      {
        value: "insight",
        label: "Industry Insight",
        description: "Share professional insights",
      },
    ];

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get hook categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get hook categories",
    });
  }
});

// Create custom hook (Pro users only)
router.post(
  "/",
  authenticateToken,
  checkPlanAccess("pro"),
  [
    body("text")
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage("Hook text must be between 10 and 100 characters"),
    body("category")
      .isIn(["story", "question", "statement", "challenge", "insight"])
      .withMessage("Invalid category"),
  ],
  async (req, res) => {
    try {
      const { text, category } = req.body;
      const userId = req.user._id;

      // Check if hook already exists
      const existingHook = await Hook.findOne({
        text: { $regex: new RegExp(text, "i") },
      });
      if (existingHook) {
        return res.status(400).json({
          success: false,
          message: "A similar hook already exists",
        });
      }

      const hook = new Hook({
        text,
        category,
        isDefault: false,
        createdBy: userId,
      });

      await hook.save();

      res.status(201).json({
        success: true,
        message: "Custom hook created successfully",
        data: { hook },
      });
    } catch (error) {
      console.error("Create hook error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create hook",
      });
    }
  }
);

// Update custom hook (Pro users only)
router.put(
  "/:id",
  authenticateToken,
  checkPlanAccess("pro"),
  validateObjectId,
  [
    body("text")
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage("Hook text must be between 10 and 100 characters"),
    body("category")
      .isIn(["story", "question", "statement", "challenge", "insight"])
      .withMessage("Invalid category"),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { text, category } = req.body;
      const userId = req.user._id;

      const hook = await Hook.findOneAndUpdate(
        { _id: id, createdBy: userId, isDefault: false },
        { text, category },
        { new: true, runValidators: true }
      );

      if (!hook) {
        return res.status(404).json({
          success: false,
          message: "Hook not found or cannot be modified",
        });
      }

      res.json({
        success: true,
        message: "Hook updated successfully",
        data: { hook },
      });
    } catch (error) {
      console.error("Update hook error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update hook",
      });
    }
  }
);

// Delete custom hook (Pro users only)
router.delete(
  "/:id",
  authenticateToken,
  checkPlanAccess("pro"),
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const hook = await Hook.findOneAndUpdate(
        { _id: id, createdBy: userId, isDefault: false },
        { isActive: false },
        { new: true }
      );

      if (!hook) {
        return res.status(404).json({
          success: false,
          message: "Hook not found or cannot be deleted",
        });
      }

      res.json({
        success: true,
        message: "Hook deleted successfully",
      });
    } catch (error) {
      console.error("Delete hook error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete hook",
      });
    }
  }
);

// Get popular hooks
router.get("/popular", async (req, res) => {
  try {
    const hooks = await Hook.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { hooks },
    });
  } catch (error) {
    console.error("Get popular hooks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popular hooks",
    });
  }
});

// Get trending hooks (AI-generated based on current trends) - PAID USERS ONLY
router.get(
  "/trending",
  authenticateToken,
  checkPlanAccess("starter"),
  async (req, res) => {
    try {
      const { topic, industry } = req.query;

      // Generate trending hooks using AI
      const prompt = `Generate 10 trending LinkedIn post hooks for ${
        topic || "general professional content"
      } in ${industry || "various industries"}. 
    
    Requirements:
    - Each hook should be 10-80 characters
    - Mix of categories: story, question, statement, challenge, insight
    - Based on current trends and viral content patterns
    - Professional but engaging
    - Include trending topics, buzzwords, and current events
    
    Return as JSON array with format:
    [
      {
        "text": "hook text here",
        "category": "story|question|statement|challenge|insight",
        "trending": true
      }
    ]`;

      const aiResponse = await googleAIService.generateContent(prompt);

      if (!aiResponse || !aiResponse.trim()) {
        throw new Error("AI response is empty");
      }

      // Parse AI response
      let trendingHooks;
      try {
        // Clean the response and extract JSON
        const cleanedResponse = aiResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        trendingHooks = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        // Fallback: create hooks from response text
        const lines = aiResponse
          .split("\n")
          .filter((line) => line.trim().length > 10 && line.trim().length < 80);
        trendingHooks = lines.slice(0, 10).map((line, index) => ({
          text: line
            .trim()
            .replace(/^\d+\.\s*/, "")
            .replace(/^[-*]\s*/, ""),
          category: ["story", "question", "statement", "challenge", "insight"][
            index % 5
          ],
          trending: true,
        }));
      }

      // Ensure we have valid hooks
      if (!Array.isArray(trendingHooks) || trendingHooks.length === 0) {
        throw new Error("No valid hooks generated");
      }

      // Add metadata
      const hooksWithMetadata = trendingHooks.map((hook, index) => ({
        _id: `trending_${Date.now()}_${index}`,
        text: hook.text,
        category: hook.category,
        trending: true,
        generatedAt: new Date(),
        usageCount: 0,
        isDefault: false,
        isActive: true,
      }));

      res.json({
        success: true,
        data: {
          hooks: hooksWithMetadata,
          generatedAt: new Date(),
          source: "ai-generated",
        },
      });
    } catch (error) {
      console.error("Generate trending hooks error:", error);

      // Fallback to popular hooks if AI fails
      try {
        const fallbackHooks = await Hook.find({ isActive: true })
          .sort({ usageCount: -1, createdAt: -1 })
          .limit(10);

        res.json({
          success: true,
          data: {
            hooks: fallbackHooks,
            generatedAt: new Date(),
            source: "fallback-popular",
          },
        });
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: "Failed to generate trending hooks",
        });
      }
    }
  }
);

export default router;
