import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import profileInsightsService from "../services/profileInsightsService.js";

const router = express.Router();

// Get insights summary for UI banner
router.get("/insights-summary", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await profileInsightsService.getInsightsSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Insights summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch insights summary",
    });
  }
});

export default router;
