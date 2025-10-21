import express from "express";
import Content from "../models/Content.js";
import Hook from "../models/Hook.js";
import Persona from "../models/Persona.js";
import googleAIService from "../services/googleAI.js";
import usageService from "../services/usageService.js";
import subscriptionService from "../services/subscriptionService.js";
import { authenticateToken, checkTrialStatus } from "../middleware/auth.js";
import {
  validatePostGeneration,
  validateCommentGeneration,
  validateObjectId,
} from "../middleware/validation.js";
import { body } from "express-validator";
import linkedinProfileService from "../services/linkedinProfileService.js";
import profileInsightsService from "../services/profileInsightsService.js";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

// Generate LinkedIn post - SIMPLIFIED to accept persona data directly
router.post(
  "/posts/generate",
  authenticateToken,
  checkTrialStatus,
  validatePostGeneration,
  async (req, res) => {
    try {
      const { topic, hookId, personaId, persona: personaData } = req.body;
      const userId = req.user._id;

      // Check subscription and quota before generation
      const canGenerate = await subscriptionService.canPerformAction(
        userId,
        "generate_post"
      );
      if (!canGenerate.allowed) {
        return res.status(429).json({
          success: false,
          message: canGenerate.reason,
          code: "SUBSCRIPTION_LIMIT_EXCEEDED",
        });
      }

      // Get hook
      const hook = await Hook.findById(hookId);
      if (!hook) {
        return res.status(404).json({
          success: false,
          message: "Hook not found",
        });
      }

      // Get or use persona - SIMPLIFIED to accept direct persona data
      let persona;
      if (personaId) {
        // Use persona from database
        persona = await Persona.findById(personaId);
        if (!persona || persona.userId.toString() !== userId.toString()) {
          return res.status(404).json({
            success: false,
            message: "Persona not found or access denied",
          });
        }
      } else if (personaData) {
        // Use persona data directly (for sample personas)
        persona = personaData;
        console.log("✅ Using sample persona:", persona.name);
      } else {
        return res.status(400).json({
          success: false,
          message: "Either personaId or persona data is required",
        });
      }

      // Generate content using Google AI
      console.log("📝 Calling Google AI service...");
      console.log("Data:", {
        topic,
        hookText: hook.text,
        personaName: persona.name,
        personaTone: persona.tone,
      });

      // Get profile insights for enhanced personalization
      const profileInsights = await profileInsightsService.buildEnhancedContext(
        userId
      );

      const aiResponse = await googleAIService.generatePost(
        topic,
        hook.text,
        persona,
        req.body.linkedinInsights || null,
        profileInsights
      );

      console.log("✅ AI response received:", {
        contentLength: aiResponse.content?.length,
        engagementScore: aiResponse.engagementScore,
        tokensUsed: aiResponse.tokensUsed,
      });

      // Save generated content
      const content = new Content({
        userId,
        type: "post",
        content: aiResponse.content,
        topic,
        hookId,
        personaId: personaId || null, // May be null for sample personas
        engagementScore: aiResponse.engagementScore,
        tokensUsed: aiResponse.tokensUsed,
      });

      await content.save();

      // Increment usage
      // Record usage in both systems
      await usageService.incrementUsage(userId, "posts", aiResponse.tokensUsed);
      await subscriptionService.recordUsage(userId, "generate_post");

      // Update hook usage count
      await Hook.findByIdAndUpdate(hookId, { $inc: { usageCount: 1 } });

      // Get updated subscription info
      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.json({
        success: true,
        message: "Post generated successfully",
        data: {
          content: content,
          quota: await usageService.checkQuotaExceeded(userId, "posts"),
          subscription: {
            usage: subscription.usage,
            tokens: subscription.tokens,
            limits: subscription.limits,
          },
        },
      });
    } catch (error) {
      console.error("Post generation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate post",
      });
    }
  }
);

// Generate LinkedIn comment
router.post(
  "/comments/generate",
  authenticateToken,
  checkTrialStatus,
  validateCommentGeneration,
  async (req, res) => {
    try {
      const { postContent, personaId, persona: personaData } = req.body;
      const userId = req.user._id;

      // Check subscription and quota before generation
      const canGenerate = await subscriptionService.canPerformAction(
        userId,
        "generate_comment"
      );
      if (!canGenerate.allowed) {
        return res.status(429).json({
          success: false,
          message: canGenerate.reason,
          code: "SUBSCRIPTION_LIMIT_EXCEEDED",
        });
      }

      // Get or use persona - SIMPLIFIED to accept direct persona data
      let persona;
      if (personaId) {
        // Use persona from database
        persona = await Persona.findById(personaId);
        if (!persona || persona.userId.toString() !== userId.toString()) {
          return res.status(404).json({
            success: false,
            message: "Persona not found",
          });
        }
      } else if (personaData) {
        // Use persona data directly (for sample personas)
        persona = personaData;
        console.log(
          "✅ Using sample persona for comment generation:",
          persona.name
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "Either personaId or persona data is required",
        });
      }

      // Generate content using Google AI
      console.log("💬 Calling Google AI for comment generation...");
      console.log("Data:", {
        postContent: postContent.substring(0, 100) + "...",
        personaName: persona.name,
        personaTone: persona.tone,
      });

      // Get profile insights for enhanced personalization
      const profileInsights = await profileInsightsService.buildEnhancedContext(
        userId
      );

      const aiResponse = await googleAIService.generateComment(
        postContent,
        persona,
        profileInsights
      );

      console.log("✅ AI comment response received:", {
        contentLength: aiResponse.content?.length,
        tokensUsed: aiResponse.tokensUsed,
      });

      // Save generated content (save the first comment as the main content)
      const firstComment =
        aiResponse.comments && aiResponse.comments[0]
          ? typeof aiResponse.comments[0] === "string"
            ? aiResponse.comments[0]
            : aiResponse.comments[0].text
          : aiResponse.content;

      const content = new Content({
        userId,
        type: "comment",
        content: firstComment,
        originalPostContent: postContent,
        personaId: personaId || null, // May be null for sample personas
        tokensUsed: aiResponse.tokensUsed,
      });

      await content.save();

      // Record usage in both systems
      await usageService.incrementUsage(
        userId,
        "comments",
        aiResponse.tokensUsed
      );
      await subscriptionService.recordUsage(userId, "generate_comment");

      // Get updated subscription info
      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.json({
        success: true,
        message: "Comments generated successfully",
        data: {
          comments: aiResponse.comments,
          content: content,
          quota: await usageService.checkQuotaExceeded(userId, "comments"),
          subscription: {
            usage: subscription.usage,
            tokens: subscription.tokens,
            limits: subscription.limits,
          },
        },
      });
    } catch (error) {
      console.error("Comment generation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate comment",
      });
    }
  }
);

// Get content history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      Content.find(query)
        .populate("personaId", "name tone")
        .populate("hookId", "text category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get content history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get content history",
    });
  }
});

// Save content to favorites
router.post(
  "/save/:id",
  authenticateToken,
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const content = await Content.findOneAndUpdate(
        { _id: id, userId },
        { isSaved: true },
        { new: true }
      );

      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.json({
        success: true,
        message: "Content saved successfully",
        data: { content },
      });
    } catch (error) {
      console.error("Save content error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save content",
      });
    }
  }
);

// Get saved content
router.get("/saved", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      Content.find({ userId, isSaved: true })
        .populate("personaId", "name tone")
        .populate("hookId", "text category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments({ userId, isSaved: true }),
    ]);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get saved content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get saved content",
    });
  }
});

// Delete content
router.delete("/:id", authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const content = await Content.findOneAndDelete({ _id: id, userId });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
    });
  }
});

// Fetch LinkedIn post content from URL
router.post(
  "/fetch-linkedin-content",
  authenticateToken,
  [body("url").isURL().withMessage("Valid LinkedIn URL is required")],
  async (req, res) => {
    try {
      const { url } = req.body;

      // Validate LinkedIn URL
      if (!url.includes("linkedin.com/posts/")) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid LinkedIn post URL",
        });
      }

      console.log("🔗 Fetching LinkedIn content from:", url);

      try {
        // Fetch the LinkedIn post page
        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // Try to extract post content from various possible selectors
        let postContent = "";
        let author = "";

        // Common LinkedIn post content selectors
        const contentSelectors = [
          ".feed-shared-text",
          ".feed-shared-text__text-view",
          ".attributed-text-segment-list__content",
          ".break-words",
          '[data-test-id="main-feed-activity-card"] .feed-shared-text',
          ".feed-shared-actor__description",
          ".feed-shared-text__text-view--white-space-pre-wrap",
        ];

        for (const selector of contentSelectors) {
          const content = $(selector).first().text().trim();
          if (content && content.length > 20) {
            postContent = content;
            break;
          }
        }

        // Try to extract author name
        const authorSelectors = [
          ".feed-shared-actor__name",
          ".feed-shared-actor__name--link",
          ".feed-shared-actor__description",
          ".feed-shared-actor__title",
        ];

        for (const selector of authorSelectors) {
          const authorText = $(selector).first().text().trim();
          if (authorText && authorText.length > 0) {
            author = authorText;
            break;
          }
        }

        // If we couldn't extract content, try to get any text content
        if (!postContent) {
          postContent = $("body").text().substring(0, 500).trim();
        }

        // Clean up and format the content
        postContent = postContent
          .replace(/\s+/g, " ")
          .replace(/\n+/g, "\n")
          .trim();

        // Format content based on type - add proper spacing and structure
        if (
          postContent.includes("🌍") ||
          postContent.includes("👋") ||
          postContent.includes("🚀")
        ) {
          // Emoji-heavy posts - add line breaks after emojis
          postContent = postContent
            .replace(/([🌍👋🚀💡🎯📈🔥💼🎉])/g, "\n$1")
            .replace(/\n+/g, "\n")
            .trim();
        } else if (postContent.includes("•") || postContent.includes("-")) {
          // List-style posts - add proper spacing
          postContent = postContent
            .replace(/([•-])\s*/g, "\n$1 ")
            .replace(/\n+/g, "\n")
            .trim();
        } else if (postContent.length > 200) {
          // Long posts - add paragraph breaks
          const sentences = postContent.split(/[.!?]+/);
          if (sentences.length > 3) {
            postContent = sentences
              .filter((s) => s.trim().length > 0)
              .map((sentence, index) => {
                const trimmed = sentence.trim();
                if (index > 0 && index % 2 === 0) {
                  return "\n" + trimmed;
                }
                return trimmed;
              })
              .join(". ")
              .replace(/\n+/g, "\n")
              .trim();
          }
        }

        if (postContent.length < 10) {
          throw new Error(
            "Could not extract meaningful content from the LinkedIn post"
          );
        }

        console.log("✅ Successfully extracted LinkedIn content:", {
          contentLength: postContent.length,
          author: author || "Unknown",
          url: url,
        });

        res.json({
          success: true,
          message: "LinkedIn content fetched successfully",
          data: {
            content: postContent,
            author: author || "LinkedIn User",
            title: `Post by ${author || "LinkedIn User"}`,
            url: url,
          },
        });
      } catch (scrapingError) {
        console.error("❌ LinkedIn scraping error:", scrapingError.message);

        // Fallback: Return a helpful message with the URL
        res.json({
          success: true,
          message: "LinkedIn content fetched (simplified)",
          data: {
            content: `LinkedIn Post Content from: ${url}\n\n📝 Note: Due to LinkedIn's restrictions, we couldn't extract the full content automatically.\n\n💡 Please copy and paste the post content manually for the best results.`,
            author: "LinkedIn User",
            title: "LinkedIn Post",
            url: url,
          },
        });
      }
    } catch (error) {
      console.error("LinkedIn content fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch LinkedIn content",
      });
    }
  }
);

// LinkedIn Profile Analysis endpoint
router.post(
  "/analyze-linkedin-profile",
  authenticateToken,
  [
    body("profileUrl")
      .isURL()
      .withMessage("Valid LinkedIn profile URL is required"),
  ],
  async (req, res) => {
    try {
      const { profileUrl } = req.body;
      const userId = req.user.userId;

      console.log("🔍 Analyzing LinkedIn profile for user:", userId);
      console.log("Profile URL:", profileUrl);

      // Subscription check (premium feature)
      const canUse = await subscriptionService.canPerformAction(
        userId,
        "analyze_linkedin"
      );
      if (!canUse.allowed) {
        return res.status(429).json({
          success: false,
          message: canUse.reason || "Not allowed",
          code: "SUBSCRIPTION_LIMIT_EXCEEDED",
        });
      }

      // Extract profile data
      const profileResult = await linkedinProfileService.extractProfileData(
        profileUrl
      );

      if (!profileResult.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to analyze LinkedIn profile",
          error: profileResult.error,
        });
      }

      // Record usage
      await subscriptionService.recordUsage(userId, "analyze_linkedin");

      // Store profile insights in user's data (optional)
      // You could save this to a user profile collection

      res.json({
        success: true,
        message: "LinkedIn profile analyzed successfully",
        data: profileResult.data,
      });
    } catch (error) {
      console.error("LinkedIn profile analysis error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze LinkedIn profile",
        error: error.message,
      });
    }
  }
);

export default router;
