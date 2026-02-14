import express from "express";
import Hook from "../models/Hook.js";
import Persona from "../models/Persona.js";
import { authenticateToken, checkPlanAccess } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validation.js";
import { body } from "express-validator";
import googleAIService from "../services/googleAI.js";
import { config } from "../config/index.js";

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

      // Generate trending hooks using AI with variety
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Add timestamp to ensure different generations
      const timestamp = Date.now();

      // Add random seed for variety
      const randomSeed = Math.floor(Math.random() * 1000);

      const prompt = `Generate 10 fresh, unique, and trending LinkedIn post hooks for ${
        topic || "general professional content"
      } in ${
        industry || "various industries"
      }. Today is ${currentDate}. Current timestamp: ${timestamp}, seed: ${randomSeed}
    
    Requirements:
    - Each hook should be 10-80 characters
    - Mix of categories: story, question, statement, challenge, insight
    - Based on current trends and viral content patterns as of ${currentDate}
    - Professional but engaging
    - Include trending topics, buzzwords, and current events relevant to this week
    - Make each hook UNIQUE and different from previous generations
    - Avoid repeating the same hooks
    - Use creative variations and different angles
    - Consider different industries and perspectives
    
    Return as JSON array with format:
    [
      {
        "text": "hook text here",
        "category": "story|question|statement|challenge|insight",
        "trending": true
      }
    ]`;

      let aiResponse;
      try {
        aiResponse = await googleAIService.generateText(prompt, {
          temperature: 0.9,
          maxOutputTokens: 2000,
        });
      } catch (aiError) {
        console.error("❌ Google AI error during trending hooks generation:", {
          message: aiError.message,
          stack: aiError.stack,
          topic,
          industry,
        });
        // Fall through to fallback
        throw new Error(`AI service error: ${aiError.message}`);
      }

      if (!aiResponse || !aiResponse.text || !aiResponse.text.trim()) {
        throw new Error("AI response is empty");
      }

      const aiText = aiResponse.text;
      console.log("✅ AI response received for trending hooks, length:", aiText.length);

      // Parse AI response
      let trendingHooks;
      try {
        // Clean the response and extract JSON
        let cleanedResponse = aiText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Try to extract JSON array if wrapped in other text
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }

        trendingHooks = JSON.parse(cleanedResponse);

        // Validate parsed hooks structure
        if (!Array.isArray(trendingHooks)) {
          throw new Error("Parsed response is not an array");
        }

        // Validate each hook has required fields
        trendingHooks = trendingHooks
          .filter((hook) => hook && hook.text && hook.text.trim().length > 0)
          .map((hook) => ({
            text: hook.text.trim(),
            category: hook.category || ["story", "question", "statement", "challenge", "insight"][Math.floor(Math.random() * 5)],
            trending: true,
          }))
          .slice(0, 10); // Limit to 10 hooks

      } catch (parseError) {
        console.error("⚠️ Failed to parse AI response as JSON, trying text parsing:", parseError.message);
        // Fallback: create hooks from response text
        const lines = aiText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => {
            const cleaned = line.replace(/^\d+\.\s*/, "").replace(/^[-*•]\s*/, "").replace(/^["']|["']$/g, "");
            return cleaned.length >= 10 && cleaned.length <= 80;
          });

        if (lines.length === 0) {
          throw new Error("Could not extract hooks from AI response");
        }

        trendingHooks = lines.slice(0, 10).map((line, index) => {
          const cleaned = line
            .replace(/^\d+\.\s*/, "")
            .replace(/^[-*•]\s*/, "")
            .replace(/^["']|["']$/g, "")
            .trim();
          return {
            text: cleaned,
            category: ["story", "question", "statement", "challenge", "insight"][index % 5],
            trending: true,
          };
        });
      }

      // Ensure we have valid hooks
      if (!Array.isArray(trendingHooks) || trendingHooks.length === 0) {
        throw new Error("No valid hooks generated");
      }

      // Validate hook text length and filter invalid ones
      trendingHooks = trendingHooks
        .filter((hook) => {
          const text = hook.text || "";
          return text.length >= 10 && text.length <= 80;
        })
        .slice(0, 10);

      if (trendingHooks.length === 0) {
        throw new Error("All generated hooks were invalid");
      }

      // Add metadata
      const hooksTimestamp = Date.now();
      const hooksWithMetadata = trendingHooks.map((hook, index) => ({
        _id: `trending_${hooksTimestamp}_${index}`,
        text: hook.text,
        category: hook.category || "story",
        trending: true,
        generatedAt: new Date(),
        usageCount: 0,
        isDefault: false,
        isActive: true,
      }));

      console.log(`✅ Generated ${hooksWithMetadata.length} trending hooks successfully`);

      res.json({
        success: true,
        data: {
          hooks: hooksWithMetadata,
          generatedAt: new Date(),
          source: "ai-generated",
          count: hooksWithMetadata.length,
        },
      });
    } catch (error) {
      console.error("❌ Generate trending hooks error:", {
        message: error.message,
        stack: error.stack,
        topic,
        industry,
      });

      // Fallback to popular hooks if AI fails
      try {
        console.log("🔄 Attempting fallback to popular hooks...");
        const fallbackHooks = await Hook.find({ isActive: true })
          .sort({ usageCount: -1, createdAt: -1 })
          .limit(10)
          .lean(); // Use lean() for better performance

        if (fallbackHooks && fallbackHooks.length > 0) {
          console.log(`✅ Using ${fallbackHooks.length} fallback hooks`);
          res.json({
            success: true,
            data: {
              hooks: fallbackHooks,
              generatedAt: new Date(),
              source: "fallback-popular",
              count: fallbackHooks.length,
              warning: "AI generation failed, showing popular hooks instead",
            },
          });
          return;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError.message);
      }

      // Last resort: return error with helpful message
      res.status(500).json({
        success: false,
        message: "Failed to generate trending hooks. Please try again in a moment.",
        error: config.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

export default router;
