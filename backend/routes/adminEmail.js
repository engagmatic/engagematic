import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import emailService from "../services/emailService.js";

const router = express.Router();

// Get email analytics
router.get(
  "/email-analytics",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      // Get email statistics
      const totalSent = await EmailLog.countDocuments({ status: "sent" });
      const totalOpened = await EmailLog.countDocuments({
        openedAt: { $exists: true },
      });
      const totalClicked = await EmailLog.countDocuments({
        clickedAt: { $exists: true },
      });
      const totalBounced = await EmailLog.countDocuments({ status: "bounced" });
      const totalFailed = await EmailLog.countDocuments({ status: "failed" });

      const stats = {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        bounceRate:
          totalSent > 0 ? ((totalBounced + totalFailed) / totalSent) * 100 : 0,
        deliveryRate:
          totalSent > 0
            ? ((totalSent - totalBounced - totalFailed) / totalSent) * 100
            : 0,
      };

      // Get recent email logs
      const logs = await EmailLog.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("userId", "name email")
        .lean();

      // Get email campaigns (placeholder - you can implement campaign tracking)
      const campaigns = [];

      res.json({
        success: true,
        stats,
        logs,
        campaigns,
      });
    } catch (error) {
      console.error("Error fetching email analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch email analytics",
      });
    }
  }
);

// Send bulk email to specific audience
router.post(
  "/send-bulk-email",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const { subject, content, targetAudience, scheduledAt } = req.body;

      if (!subject || !content) {
        return res.status(400).json({
          success: false,
          message: "Subject and content are required",
        });
      }

      let users = [];
      const now = new Date();

      switch (targetAudience) {
        case "inactive_users":
          // Users who haven't generated content in 7+ days
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          users = await User.find({
            lastActiveAt: { $lt: sevenDaysAgo },
            emailPreferences: { $ne: "none" },
          }).limit(100);
          break;

        case "trial_expiring":
          // Users whose trial expires in 3 days
          const threeDaysFromNow = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          users = await User.find({
            trialEndsAt: { $lte: threeDaysFromNow },
            subscriptionStatus: "trial",
            emailPreferences: { $ne: "none" },
          }).limit(100);
          break;

        case "high_performers":
          // Users who have generated 10+ posts
          users = await User.find({
            $expr: { $gte: [{ $size: "$generatedContent" }, 10] },
            emailPreferences: { $ne: "none" },
          }).limit(100);
          break;

        case "new_users":
          // Users who signed up in the last 7 days
          const sevenDaysAgoNew = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          users = await User.find({
            createdAt: { $gte: sevenDaysAgoNew },
            emailPreferences: { $ne: "none" },
          }).limit(100);
          break;

        case "all_users":
          // All active users
          users = await User.find({
            emailPreferences: { $ne: "none" },
          }).limit(500);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid target audience",
          });
      }

      if (users.length === 0) {
        return res.json({
          success: true,
          message: "No users found for the selected audience",
          sentCount: 0,
        });
      }

      let sentCount = 0;
      const errors = [];

      // Send emails
      for (const user of users) {
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject: subject,
            templateName: "custom",
            templateData: {
              name: user.name,
              content: content,
            },
            emailType: "custom",
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Bulk email sent successfully`,
        sentCount,
        totalUsers: users.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error sending bulk email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send bulk email",
      });
    }
  }
);

// Send re-engagement email to inactive users
router.post(
  "/send-inactive-user-email",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000
      );

      // Find inactive users (haven't generated content in 7+ days)
      const inactiveUsers = await User.find({
        lastActiveAt: { $lt: sevenDaysAgo },
        emailPreferences: { $ne: "none" },
        // Don't send to users who already received re-engagement emails recently
        $or: [
          { lastReengagementEmail: { $exists: false } },
          { lastReengagementEmail: { $lt: fourteenDaysAgo } },
        ],
      }).limit(200);

      if (inactiveUsers.length === 0) {
        return res.json({
          success: true,
          message: "No inactive users found to email",
          sentCount: 0,
        });
      }

      let sentCount = 0;
      const errors = [];

      // Send re-engagement emails
      for (const user of inactiveUsers) {
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject:
              "We miss you! Let's get back to creating amazing LinkedIn content 🚀",
            templateName: "reengagement",
            templateData: {
              name: user.name,
              daysInactive: Math.floor(
                (now - user.lastActiveAt) / (1000 * 60 * 60 * 24)
              ),
            },
            emailType: "reengagement_7days",
          });

          // Update user's last re-engagement email timestamp
          await User.findByIdAndUpdate(user._id, {
            lastReengagementEmail: now,
          });

          sentCount++;
        } catch (error) {
          console.error(
            `Failed to send re-engagement email to ${user.email}:`,
            error
          );
          errors.push({ email: user.email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Re-engagement emails sent successfully`,
        sentCount,
        totalUsers: inactiveUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error sending inactive user emails:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send inactive user emails",
      });
    }
  }
);

// Get email performance metrics
router.get("/email-metrics", authenticateToken, adminAuth, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get email metrics by type
    const emailMetrics = await EmailLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$emailType",
          totalSent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          totalOpened: {
            $sum: { $cond: [{ $ne: ["$openedAt", null] }, 1, 0] },
          },
          totalClicked: {
            $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalBounced: {
            $sum: { $cond: [{ $eq: ["$status", "bounced"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          openRate: {
            $cond: [
              { $gt: ["$totalSent", 0] },
              { $multiply: [{ $divide: ["$totalOpened", "$totalSent"] }, 100] },
              0,
            ],
          },
          clickRate: {
            $cond: [
              { $gt: ["$totalSent", 0] },
              {
                $multiply: [{ $divide: ["$totalClicked", "$totalSent"] }, 100],
              },
              0,
            ],
          },
          deliveryRate: {
            $cond: [
              { $gt: ["$totalSent", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$totalSent",
                          { $add: ["$totalFailed", "$totalBounced"] },
                        ],
                      },
                      "$totalSent",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { totalSent: -1 },
      },
    ]);

    // Get daily email volume
    const dailyVolume = await EmailLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "sent",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      metrics: emailMetrics,
      dailyVolume,
      period,
    });
  } catch (error) {
    console.error("Error fetching email metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email metrics",
    });
  }
});

export default router;
