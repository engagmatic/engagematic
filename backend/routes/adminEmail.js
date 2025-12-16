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

// Send reminder email to specific user(s)
router.post(
  "/send-reminder",
  adminAuth,
  async (req, res) => {
    try {
      const { userIds, userId, subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({
          success: false,
          message: "Subject and message are required",
        });
      }

      let users = [];
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        users = await User.find({ _id: { $in: userIds } });
      } else if (userId) {
        const user = await User.findById(userId);
        if (user) users = [user];
      } else {
        return res.status(400).json({
          success: false,
          message: "Either userIds or userId is required",
        });
      }

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }

      let sentCount = 0;
      const errors = [];

      for (const user of users) {
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject: subject,
            templateName: "custom",
            templateData: {
              name: user.name || "there",
              content: message,
            },
            emailType: "reminder",
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Reminder email(s) sent successfully`,
        sentCount,
        totalUsers: users.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error sending reminder email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send reminder email",
      });
    }
  }
);

// Send onboarding email to specific user(s)
router.post(
  "/send-onboarding",
  adminAuth,
  async (req, res) => {
    try {
      const { userIds, userId, day } = req.body;

      if (!day || ![1, 3, 5, 7].includes(day)) {
        return res.status(400).json({
          success: false,
          message: "Day is required and must be 1, 3, 5, or 7",
        });
      }

      let users = [];
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        users = await User.find({ _id: { $in: userIds } });
      } else if (userId) {
        const user = await User.findById(userId);
        if (user) users = [user];
      } else {
        return res.status(400).json({
          success: false,
          message: "Either userIds or userId is required",
        });
      }

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }

      let sentCount = 0;
      const errors = [];

      for (const user of users) {
        try {
          const result = await emailService.sendOnboardingEmail(user, day);
          if (result.success) {
            sentCount++;
          } else {
            errors.push({ email: user.email, error: result.reason || "Failed to send" });
          }
        } catch (error) {
          console.error(`Failed to send onboarding email to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Onboarding email(s) sent successfully`,
        sentCount,
        totalUsers: users.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error sending onboarding email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send onboarding email",
      });
    }
  }
);

// Send custom email to specific user(s)
router.post(
  "/send-custom",
  adminAuth,
  async (req, res) => {
    try {
      const { userIds, userId, subject, content, templateName } = req.body;

      if (!subject || !content) {
        return res.status(400).json({
          success: false,
          message: "Subject and content are required",
        });
      }

      let users = [];
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        users = await User.find({ _id: { $in: userIds } });
      } else if (userId) {
        const user = await User.findById(userId);
        if (user) users = [user];
      } else {
        return res.status(400).json({
          success: false,
          message: "Either userIds or userId is required",
        });
      }

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }

      let sentCount = 0;
      const errors = [];

      for (const user of users) {
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject: subject,
            templateName: templateName || "custom",
            templateData: {
              name: user.name || "there",
              content: content,
            },
            emailType: "custom",
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send custom email to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `Custom email(s) sent successfully`,
        sentCount,
        totalUsers: users.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Error sending custom email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send custom email",
      });
    }
  }
);

// Send early professionals email to all users
router.post(
  "/send-early-professionals",
  adminAuth,
  async (req, res) => {
    try {
      const { limit, skip } = req.body;
      const queryLimit = limit ? parseInt(limit) : null;
      const querySkip = skip ? parseInt(skip) : 0;

      // Find all active users (respect email preferences)
      let usersQuery = User.find({
        emailPreferences: { $ne: "none" },
      }).skip(querySkip);

      if (queryLimit) {
        usersQuery = usersQuery.limit(queryLimit);
      }

      const users = await usersQuery.select("_id email name");

      if (users.length === 0) {
        return res.json({
          success: true,
          message: "No users found to email",
          sentCount: 0,
          totalUsers: 0,
        });
      }

      let sentCount = 0;
      const errors = [];

      console.log(`📧 Starting to send early professionals email to ${users.length} users...`);

      // Send emails with a small delay to avoid rate limiting
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject: "🚀 Perfect for Early Professionals - LinkedInPulse",
            templateName: "early_professionals",
            templateData: {
              name: user.name || "there",
            },
            emailType: "custom",
          });
          sentCount++;
          
          // Log progress every 10 emails
          if ((i + 1) % 10 === 0) {
            console.log(`✅ Sent ${i + 1}/${users.length} emails...`);
          }

          // Small delay to avoid overwhelming the email service
          if (i < users.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          errors.push({ email: user.email, error: error.message });
        }
      }

      console.log(`✅ Completed: Sent ${sentCount}/${users.length} emails`);

      res.json({
        success: true,
        message: `Early professionals email sent successfully`,
        sentCount,
        totalUsers: users.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit error list
        errorCount: errors.length,
      });
    } catch (error) {
      console.error("Error sending early professionals email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send early professionals email",
        error: error.message,
      });
    }
  }
);

// Send payment reminder email
router.post("/send-payment-reminder", adminAuth, async (req, res) => {
  try {
    const { userIds, userId } = req.body;
    const UserSubscription = (await import("../models/UserSubscription.js")).default;

    let users = [];
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) users = [user];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userIds or userId is required",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    let sentCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const subscription = await UserSubscription.findOne({ userId: user._id });
        if (subscription && subscription.billing?.nextBillingDate) {
          await emailService.sendPaymentReminderEmail(user, {
            amount: subscription.billing.amount || "₹649",
            dueDate: subscription.billing.nextBillingDate.toLocaleDateString(),
            billingPeriod: subscription.billing.interval || "month",
          });
          sentCount++;
        }
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({ success: true, sentCount, totalUsers: users.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send payment reminders" });
  }
});

// Send subscription renewal reminder
router.post("/send-renewal-reminder", adminAuth, async (req, res) => {
  try {
    const { userIds, userId } = req.body;
    const UserSubscription = (await import("../models/UserSubscription.js")).default;

    let users = [];
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) users = [user];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userIds or userId is required",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    let sentCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const subscription = await UserSubscription.findOne({ userId: user._id });
        if (subscription && subscription.billing?.nextBillingDate) {
          const daysLeft = Math.ceil(
            (subscription.billing.nextBillingDate - new Date()) / (1000 * 60 * 60 * 24)
          );
          await emailService.sendSubscriptionRenewalReminderEmail(user, {
            plan: subscription.plan,
            daysLeft,
            renewalDate: subscription.billing.nextBillingDate.toLocaleDateString(),
            amount: subscription.billing.amount || "₹649",
          });
          sentCount++;
        }
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({ success: true, sentCount, totalUsers: users.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send renewal reminders" });
  }
});

// Send reactivation offer
router.post("/send-reactivation-offer", adminAuth, async (req, res) => {
  try {
    const { userIds, userId, discount, promoCode, daysValid } = req.body;
    const Content = (await import("../models/Content.js")).default;

    let users = [];
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) users = [user];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userIds or userId is required",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    let sentCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const postsCount = await Content.countDocuments({ userId: user._id, type: "post" });
        const engagementCount = await Content.countDocuments({ userId: user._id });

        await emailService.sendReactivationOfferEmail(user, {
          discount: discount || 30,
          promoCode: promoCode || "WELCOMEBACK30",
          daysValid: daysValid || 7,
          postsCount,
          engagementCount,
        });
        sentCount++;
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({ success: true, sentCount, totalUsers: users.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send reactivation offers" });
  }
});

// Send churn prevention email
router.post("/send-churn-prevention", adminAuth, async (req, res) => {
  try {
    const { userIds, userId } = req.body;
    const UserSubscription = (await import("../models/UserSubscription.js")).default;
    const Content = (await import("../models/Content.js")).default;

    let users = [];
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) users = [user];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userIds or userId is required",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    let sentCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const subscription = await UserSubscription.findOne({ userId: user._id });
        const postsCount = await Content.countDocuments({ userId: user._id, type: "post" });
        const engagementCount = await Content.countDocuments({ userId: user._id });

        await emailService.sendChurnPreventionEmail(user, {
          postsCount,
          engagementCount,
          postsRemaining:
            subscription && subscription.limits
              ? (subscription.limits.postsPerMonth || 0) - (subscription.usage?.postsGenerated || 0)
              : 0,
          commentsRemaining:
            subscription && subscription.limits
              ? (subscription.limits.commentsPerMonth || 0) -
                (subscription.usage?.commentsGenerated || 0)
              : 0,
        });
        sentCount++;
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({ success: true, sentCount, totalUsers: users.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send churn prevention emails" });
  }
});

// Send usage limit warning
router.post("/send-usage-warning", adminAuth, async (req, res) => {
  try {
    const { userIds, userId } = req.body;
    const UserSubscription = (await import("../models/UserSubscription.js")).default;
    const Content = (await import("../models/Content.js")).default;

    let users = [];
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) users = [user];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either userIds or userId is required",
      });
    }

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let sentCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        const subscription = await UserSubscription.findOne({ userId: user._id });
        const postsCount = await Content.countDocuments({
          userId: user._id,
          type: "post",
          createdAt: { $gte: startOfMonth },
        });
        const commentsCount = await Content.countDocuments({
          userId: user._id,
          type: "comment",
          createdAt: { $gte: startOfMonth },
        });

        const postsLimit = subscription?.limits?.postsPerMonth || 7;
        const commentsLimit = subscription?.limits?.commentsPerMonth || 14;
        const postsPercentage = (postsCount / postsLimit) * 100;
        const commentsPercentage = (commentsCount / commentsLimit) * 100;

        await emailService.sendUsageLimitWarningEmail(user, {
          limitType: postsPercentage > commentsPercentage ? "posts" : "comments",
          used: postsPercentage > commentsPercentage ? postsCount : commentsCount,
          limit: postsPercentage > commentsPercentage ? postsLimit : commentsLimit,
          remaining:
            postsPercentage > commentsPercentage ? postsLimit - postsCount : commentsLimit - commentsCount,
          usagePercentage: Math.round(Math.max(postsPercentage, commentsPercentage)),
          postsUsed: postsCount,
          postsLimit,
          postsPercentage: Math.round(postsPercentage),
          commentsUsed: commentsCount,
          commentsLimit,
          commentsPercentage: Math.round(commentsPercentage),
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString(),
          daysUntilReset: Math.ceil(
            (new Date(now.getFullYear(), now.getMonth() + 1, 1) - now) / (1000 * 60 * 60 * 24)
          ),
        });
        sentCount++;
      } catch (error) {
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({ success: true, sentCount, totalUsers: users.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send usage warnings" });
  }
});

export default router;
