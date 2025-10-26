import express from "express";
import LinkedInProfileAnalyzer from "../services/linkedinProfileAnalyzer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Initialize analyzer instance
let analyzerInstance = null;

const getAnalyzerInstance = async () => {
  if (!analyzerInstance) {
    analyzerInstance = new LinkedInProfileAnalyzer();
    await analyzerInstance.initialize();
  }
  return analyzerInstance;
};

// Test endpoint to check if analyzer is working
router.get("/test", async (req, res) => {
  try {
    const analyzer = await getAnalyzerInstance();
    res.json({
      success: true,
      message: "LinkedIn Profile Analyzer is ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analyzer test failed:", error);
    res.status(500).json({
      success: false,
      error: "Analyzer initialization failed",
      message: error.message,
    });
  }
});

// Analyze LinkedIn profile
router.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { profileUrl } = req.body;

    if (!profileUrl) {
      return res.status(400).json({
        success: false,
        error: "Profile URL is required",
      });
    }

    // Validate LinkedIn URL
    if (!profileUrl.includes("linkedin.com/in/")) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid LinkedIn profile URL",
      });
    }

    console.log(`🔍 Analyzing LinkedIn profile: ${profileUrl}`);

    const analyzer = await getAnalyzerInstance();
    const result = await analyzer.analyzeProfile(profileUrl);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: "Profile analysis completed successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || "Profile analysis failed",
      });
    }
  } catch (error) {
    console.error("Profile analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Quick profile scrape (without AI analysis)
router.post("/scrape", authenticateToken, async (req, res) => {
  try {
    const { profileUrl } = req.body;

    if (!profileUrl) {
      return res.status(400).json({
        success: false,
        error: "Profile URL is required",
      });
    }

    if (!profileUrl.includes("linkedin.com/in/")) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid LinkedIn profile URL",
      });
    }

    console.log(`🔍 Scanning LinkedIn profile: ${profileUrl}`);

    const analyzer = await getAnalyzerInstance();
    const profileData = await analyzer.scanProfile(profileUrl);

    res.json({
      success: true,
      data: profileData,
      message: "Profile data scraped successfully",
    });
  } catch (error) {
    console.error("Profile scraping error:", error);
    res.status(500).json({
      success: false,
      error: "Profile scraping failed",
      message: error.message,
    });
  }
});

// Generate AI analysis for existing profile data
router.post("/analyze-data", authenticateToken, async (req, res) => {
  try {
    const { profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({
        success: false,
        error: "Profile data is required",
      });
    }

    console.log("🤖 Generating comprehensive AI analysis for profile data");

    const analyzer = await getAnalyzerInstance();
    const analysis = await analyzer.generateComprehensiveAnalysis(profileData);
    const personaContext = await analyzer.generatePersonaContext(
      profileData,
      analysis
    );

    res.json({
      success: true,
      data: {
        analysis,
        personaContext,
        timestamp: new Date().toISOString(),
      },
      message: "AI analysis generated successfully",
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({
      success: false,
      error: "AI analysis failed",
      message: error.message,
    });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const analyzer = await getAnalyzerInstance();
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "LinkedIn Profile Analyzer service is running",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Cleanup endpoint (for testing)
router.post("/cleanup", async (req, res) => {
  try {
    if (analyzerInstance) {
      await analyzerInstance.close();
      analyzerInstance = null;
    }

    res.json({
      success: true,
      message: "Analyzer instance cleaned up",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
