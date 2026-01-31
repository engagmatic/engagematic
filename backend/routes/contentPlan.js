import express from "express";
import ContentPlan from "../models/ContentPlan.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// List all content plans for the authenticated user (dashboard)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const plans = await ContentPlan.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error("Content plans list error:", error);
    res.status(500).json({ success: false, message: "Failed to load content plans" });
  }
});

// Get a single content plan by id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const plan = await ContentPlan.findOne({ _id: id, userId }).lean();
    if (!plan) {
      return res.status(404).json({ success: false, message: "Content plan not found" });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("Content plan get error:", error);
    res.status(500).json({ success: false, message: "Failed to load content plan" });
  }
});

// Create (finalize) a content plan - called when user clicks "Send to Engagematic"
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, goal, context, config, posts } = req.body;

    if (!goal || !context || !posts || !Array.isArray(posts)) {
      return res.status(400).json({
        success: false,
        message: "goal, context, and posts (array) are required",
      });
    }

    const plan = new ContentPlan({
      userId,
      title: title || `Content Plan ${new Date().toLocaleDateString()}`,
      goal,
      context: {
        audience: context.audience || "",
        helpWith: context.helpWith || "",
        platforms: context.platforms || [],
        promotion: context.promotion || "",
      },
      config: {
        postsPerWeek: config?.postsPerWeek ?? 5,
        spiceLevel: config?.spiceLevel || "balanced",
        contentMix: config?.contentMix || [],
      },
      posts: posts.map((p) => ({
        slot: p.slot,
        hook: p.hook || "",
        angle: p.angle || "",
        cta: p.cta || "",
        commentPrompt: p.commentPrompt || "",
        templateId: p.templateId || "",
        edited: p.edited || false,
        notes: p.notes || "",
        column: p.column || "ideas",
      })),
      status: "finalized",
      generatedAt: new Date(),
    });

    await plan.save();
    res.status(201).json({ success: true, data: plan, message: "Content plan saved" });
  } catch (error) {
    console.error("Content plan create error:", error);
    res.status(500).json({ success: false, message: "Failed to save content plan" });
  }
});

// Update a content plan (e.g. post edits, column moves)
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const plan = await ContentPlan.findOne({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Content plan not found" });
    }
    const { title, posts } = req.body;
    if (title !== undefined) plan.title = title;
    if (posts && Array.isArray(posts)) {
      plan.posts = posts.map((p) => ({
        slot: p.slot,
        hook: p.hook || "",
        angle: p.angle || "",
        cta: p.cta || "",
        commentPrompt: p.commentPrompt || "",
        templateId: p.templateId || "",
        edited: p.edited || false,
        notes: p.notes || "",
        column: p.column || "ideas",
      }));
    }
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("Content plan update error:", error);
    res.status(500).json({ success: false, message: "Failed to update content plan" });
  }
});

// Delete a content plan
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const plan = await ContentPlan.findOneAndDelete({ _id: id, userId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Content plan not found" });
    }
    res.json({ success: true, message: "Content plan deleted" });
  } catch (error) {
    console.error("Content plan delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete content plan" });
  }
});

export default router;
