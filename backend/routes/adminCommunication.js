import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import EmailLog from "../models/EmailLog.js";
import EmailTemplate from "../models/EmailTemplate.js";
import EmailCampaign from "../models/EmailCampaign.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import emailService from "../services/emailService.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

// ==================== TEMPLATE MANAGEMENT ====================

// Get all email templates
router.get("/templates", authenticateToken, adminAuth, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const templates = await EmailTemplate.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
});

// Get single template
router.get("/templates/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id).lean();
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
});

// Create email template
router.post("/templates", authenticateToken, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      journeyStage,
      subject,
      htmlContent,
      textContent,
      variables,
      isDefault,
    } = req.body;

    if (!name || !subject || !htmlContent || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, subject, HTML content, and category are required",
      });
    }

    const template = await EmailTemplate.create({
      name,
      description,
      category,
      journeyStage,
      subject,
      htmlContent,
      textContent,
      variables: variables || [],
      isDefault: isDefault || false,
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create template",
    });
  }
});

// Update email template
router.put("/templates/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
});

// Delete email template
router.delete("/templates/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }
    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
});

// ==================== CAMPAIGN MANAGEMENT ====================

// Get all campaigns
router.get("/campaigns", authenticateToken, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const campaigns = await EmailCampaign.find(query)
      .populate("templateId", "name subject")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
});

// Get single campaign with detailed stats
router.get("/campaigns/:id", authenticateToken, adminAuth, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate("templateId")
      .populate("createdBy", "name email")
      .lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Get email logs for this campaign
    const emailLogs = await EmailLog.find({ campaignId: campaign._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Calculate real-time stats
    const stats = {
      totalSent: emailLogs.filter((log) => log.status === "sent").length,
      totalOpened: emailLogs.filter((log) => log.openedAt).length,
      totalClicked: emailLogs.filter((log) => log.clickedAt).length,
      totalReplied: emailLogs.filter((log) => log.repliedAt).length,
      totalFailed: emailLogs.filter((log) => log.status === "failed").length,
      totalBounced: emailLogs.filter((log) => log.status === "bounced").length,
    };

    stats.openRate =
      stats.totalSent > 0 ? (stats.totalOpened / stats.totalSent) * 100 : 0;
    stats.clickRate =
      stats.totalSent > 0 ? (stats.totalClicked / stats.totalSent) * 100 : 0;
    stats.replyRate =
      stats.totalSent > 0 ? (stats.totalReplied / stats.totalSent) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...campaign,
        realTimeStats: stats,
        recentLogs: emailLogs.slice(0, 50),
      },
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
    });
  }
});

// Create campaign
router.post("/campaigns", authenticateToken, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      templateId,
      customSubject,
      customContent,
      targetAudience,
      targetUserIds,
      customFilters,
      scheduledAt,
    } = req.body;

    if (!name || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Name and target audience are required",
      });
    }

    const campaign = await EmailCampaign.create({
      name,
      description,
      templateId,
      customSubject,
      customContent,
      targetAudience,
      targetUserIds: targetUserIds || [],
      customFilters: customFilters || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "scheduled" : "draft",
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create campaign",
    });
  }
});

// Send campaign (immediately or scheduled)
router.post(
  "/campaigns/:id/send",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const campaign = await EmailCampaign.findById(req.params.id).populate(
        "templateId"
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      // Get target users
      let users = [];
      const now = new Date();

      switch (campaign.targetAudience) {
        case "all_users":
          users = await User.find({ isActive: true }).limit(1000);
          break;
        case "new_users":
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          users = await User.find({ createdAt: { $gte: sevenDaysAgo } }).limit(
            500
          );
          break;
        case "inactive_users":
          const inactiveDate = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          users = await User.find({
            lastLoginAt: { $lt: inactiveDate },
            isActive: true,
          }).limit(500);
          break;
        case "trial_expiring":
          const threeDaysFromNow = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          );
          users = await User.find({
            trialEndsAt: { $lte: threeDaysFromNow },
            subscriptionStatus: "trial",
          }).limit(500);
          break;
        case "high_performers":
          const highPerformers = await Content.aggregate([
            {
              $group: {
                _id: "$userId",
                postCount: { $sum: 1 },
              },
            },
            {
              $match: {
                postCount: { $gte: 10 },
              },
            },
            { $limit: 500 },
          ]);
          const userIds = highPerformers.map((p) => p._id);
          users = await User.find({ _id: { $in: userIds } });
          break;
        case "specific_users":
          if (campaign.targetUserIds.length > 0) {
            users = await User.find({
              _id: { $in: campaign.targetUserIds },
            });
          }
          break;
        default:
          users = await User.find({ isActive: true }).limit(100);
      }

      if (users.length === 0) {
        return res.json({
          success: true,
          message: "No users found for this campaign",
          sentCount: 0,
        });
      }

      // Update campaign status
      campaign.status = "sending";
      campaign.stats.totalRecipients = users.length;
      await campaign.save();

      // Send emails asynchronously
      const emailLogIds = [];
      let sentCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          const trackingPixelId = uuidv4();
          const subject = campaign.customSubject || campaign.templateId?.subject || "Message from LinkedInPulse";
          
          let htmlContent = campaign.customContent;
          if (campaign.templateId) {
            // Render template with variables
            htmlContent = campaign.templateId.htmlContent
              .replace(/\{\{name\}\}/g, user.name || "there")
              .replace(/\{\{email\}\}/g, user.email);
          }

          // Add tracking pixel
          const trackingPixel = `<img src="${process.env.BACKEND_URL || "http://localhost:5000"}/api/admin/track-open/${trackingPixelId}" width="1" height="1" style="display:none;" />`;
          htmlContent = htmlContent + trackingPixel;

          // Send email
          const result = await emailService.sendEmail({
            userId: user._id,
            to: user.email,
            subject,
            templateName: "custom",
            templateData: {
              name: user.name || "there",
              content: htmlContent,
            },
            emailType: "custom",
            metadata: {
              campaignId: campaign._id.toString(),
              templateId: campaign.templateId?._id.toString(),
            },
          });

          if (result.success) {
            // Update email log with campaign info
            const emailLog = await EmailLog.findOne({
              userId: user._id,
              email: user.email,
            })
              .sort({ createdAt: -1 })
              .limit(1);

            if (emailLog) {
              emailLog.campaignId = campaign._id;
              emailLog.templateId = campaign.templateId?._id;
              emailLog.trackingPixelId = trackingPixelId;
              await emailLog.save();
              emailLogIds.push(emailLog._id);
            }

            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          failedCount++;
        }
      }

      // Update campaign with final stats
      campaign.status = "sent";
      campaign.sentAt = new Date();
      campaign.stats.totalSent = sentCount;
      campaign.stats.totalFailed = failedCount;
      campaign.emailLogIds = emailLogIds;
      await campaign.save();

      res.json({
        success: true,
        message: `Campaign sent successfully`,
        data: {
          sentCount,
          failedCount,
          totalRecipients: users.length,
        },
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send campaign",
      });
    }
  }
);

// Cancel scheduled campaign
router.post(
  "/campaigns/:id/cancel",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const campaign = await EmailCampaign.findByIdAndUpdate(
        req.params.id,
        { status: "cancelled" },
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      res.json({
        success: true,
        message: "Campaign cancelled successfully",
        data: campaign,
      });
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel campaign",
      });
    }
  }
);

// ==================== USER COMMUNICATION ====================

// Get user communication history
router.get(
  "/users/:userId/communications",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const communications = await EmailLog.find({ userId })
        .populate("campaignId", "name")
        .populate("templateId", "name")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean();

      const total = await EmailLog.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          communications,
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      console.error("Error fetching user communications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user communications",
      });
    }
  }
);

// Send email to specific user
router.post(
  "/users/:userId/send-email",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        templateId,
        subject,
        htmlContent,
        textContent,
        emailType = "custom",
      } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      let finalSubject = subject;
      let finalHtmlContent = htmlContent;

      if (templateId) {
        const template = await EmailTemplate.findById(templateId);
        if (template) {
          finalSubject = template.subject;
          finalHtmlContent = template.htmlContent
            .replace(/\{\{name\}\}/g, user.name || "there")
            .replace(/\{\{email\}\}/g, user.email);

          // Update template usage
          template.usageCount = (template.usageCount || 0) + 1;
          template.lastUsedAt = new Date();
          await template.save();
        }
      }

      const result = await emailService.sendEmail({
        userId: user._id,
        to: user.email,
        subject: finalSubject,
        templateName: "custom",
        templateData: {
          name: user.name || "there",
          content: finalHtmlContent,
        },
        emailType,
      });

      if (result.success) {
        // Update email log with template info
        const emailLog = await EmailLog.findOne({
          userId: user._id,
          email: user.email,
        })
          .sort({ createdAt: -1 })
          .limit(1);

        if (emailLog && templateId) {
          emailLog.templateId = templateId;
          await emailLog.save();
        }

        res.json({
          success: true,
          message: "Email sent successfully",
          data: result,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.reason || "Failed to send email",
        });
      }
    } catch (error) {
      console.error("Error sending email to user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  }
);

// ==================== TRACKING ENDPOINTS ====================

// Track email open (tracking pixel)
router.get("/track-open/:trackingPixelId", async (req, res) => {
  try {
    const { trackingPixelId } = req.params;
    const emailLog = await EmailLog.findOne({ trackingPixelId });

    if (emailLog && !emailLog.openedAt) {
      emailLog.openedAt = new Date();
      emailLog.engagement.opens = (emailLog.engagement?.opens || 0) + 1;
      emailLog.engagement.lastOpenedAt = new Date();
      await emailLog.save();
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pixel);
  } catch (error) {
    console.error("Error tracking email open:", error);
    res.status(500).send();
  }
});

// Track email click
router.get("/track-click/:emailLogId", async (req, res) => {
  try {
    const { emailLogId } = req.params;
    const { url } = req.query;

    const emailLog = await EmailLog.findById(emailLogId);
    if (emailLog) {
      if (!emailLog.clickedAt) {
        emailLog.clickedAt = new Date();
      }
      emailLog.engagement.clicks = (emailLog.engagement?.clicks || 0) + 1;
      emailLog.engagement.lastClickedAt = new Date();

      // Track individual URL clicks
      const existingClick = emailLog.clicks?.find((c) => c.url === url);
      if (existingClick) {
        existingClick.count += 1;
      } else {
        emailLog.clicks = emailLog.clicks || [];
        emailLog.clicks.push({
          url,
          clickedAt: new Date(),
          count: 1,
        });
      }

      await emailLog.save();
    }

    // Redirect to actual URL
    if (url) {
      res.redirect(url);
    } else {
      res.redirect(process.env.FRONTEND_URL || "http://localhost:8080");
    }
  } catch (error) {
    console.error("Error tracking email click:", error);
    res.redirect(process.env.FRONTEND_URL || "http://localhost:8080");
  }
});

// ==================== ENHANCED ANALYTICS ====================

// Get comprehensive email analytics with filtering
router.get(
  "/analytics/enhanced",
  authenticateToken,
  adminAuth,
  async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        emailType,
        status,
        campaignId,
        userId,
        period = "30d",
      } = req.query;

      // Build query
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      if (!startDate && !endDate) {
        const daysAgo = period === "7d" ? 7 : period === "90d" ? 90 : 30;
        query.createdAt = {
          $gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        };
      }
      if (emailType) query.emailType = emailType;
      if (status) query.status = status;
      if (campaignId) query.campaignId = campaignId;
      if (userId) query.userId = userId;

      // Get email logs
      const emailLogs = await EmailLog.find(query)
        .populate("userId", "name email")
        .populate("campaignId", "name")
        .populate("templateId", "name")
        .sort({ createdAt: -1 })
        .lean();

      // Calculate comprehensive stats
      const stats = {
        totalSent: emailLogs.filter((log) => log.status === "sent").length,
        totalOpened: emailLogs.filter((log) => log.openedAt).length,
        totalClicked: emailLogs.filter((log) => log.clickedAt).length,
        totalReplied: emailLogs.filter((log) => log.repliedAt).length,
        totalFailed: emailLogs.filter((log) => log.status === "failed").length,
        totalBounced: emailLogs.filter((log) => log.status === "bounced").length,
        totalPending: emailLogs.filter((log) => log.status === "pending").length,
      };

      stats.openRate =
        stats.totalSent > 0
          ? (stats.totalOpened / stats.totalSent) * 100
          : 0;
      stats.clickRate =
        stats.totalSent > 0
          ? (stats.totalClicked / stats.totalSent) * 100
          : 0;
      stats.replyRate =
        stats.totalSent > 0
          ? (stats.totalReplied / stats.totalSent) * 100
          : 0;
      stats.deliveryRate =
        stats.totalSent > 0
          ? ((stats.totalSent - stats.totalFailed - stats.totalBounced) /
              stats.totalSent) *
            100
          : 0;

      // Group by email type
      const byType = {};
      emailLogs.forEach((log) => {
        if (!byType[log.emailType]) {
          byType[log.emailType] = {
            totalSent: 0,
            totalOpened: 0,
            totalClicked: 0,
            totalReplied: 0,
          };
        }
        if (log.status === "sent") byType[log.emailType].totalSent++;
        if (log.openedAt) byType[log.emailType].totalOpened++;
        if (log.clickedAt) byType[log.emailType].totalClicked++;
        if (log.repliedAt) byType[log.emailType].totalReplied++;
      });

      // Calculate rates for each type
      Object.keys(byType).forEach((type) => {
        const typeStats = byType[type];
        typeStats.openRate =
          typeStats.totalSent > 0
            ? (typeStats.totalOpened / typeStats.totalSent) * 100
            : 0;
        typeStats.clickRate =
          typeStats.totalSent > 0
            ? (typeStats.totalClicked / typeStats.totalSent) * 100
            : 0;
        typeStats.replyRate =
          typeStats.totalSent > 0
            ? (typeStats.totalReplied / typeStats.totalSent) * 100
            : 0;
      });

      res.json({
        success: true,
        data: {
          overall: stats,
          byType,
          totalLogs: emailLogs.length,
          recentLogs: emailLogs.slice(0, 100),
        },
      });
    } catch (error) {
      console.error("Error fetching enhanced analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
      });
    }
  }
);

// Get users with filtering for email targeting
router.get("/users/filter", authenticateToken, adminAuth, async (req, res) => {
  try {
    const {
      status,
      plan,
      subscriptionStatus,
      hasGeneratedContent,
      lastActiveDays,
      trialExpiringDays,
      search,
      limit = 100,
      offset = 0,
    } = req.query;

    const query = {};
    if (status) query.isActive = status === "active";
    if (plan) query.plan = plan;
    if (subscriptionStatus) query.subscriptionStatus = subscriptionStatus;
    if (lastActiveDays) {
      const daysAgo = new Date(
        Date.now() - parseInt(lastActiveDays) * 24 * 60 * 60 * 1000
      );
      query.lastLoginAt = { $lt: daysAgo };
    }
    if (trialExpiringDays) {
      const daysFromNow = new Date(
        Date.now() + parseInt(trialExpiringDays) * 24 * 60 * 60 * 1000
      );
      query.trialEndsAt = { $lte: daysFromNow };
      query.subscriptionStatus = "trial";
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email plan subscriptionStatus trialEndsAt lastLoginAt createdAt")
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 })
      .lean();

    // Get content counts for users if needed
    if (hasGeneratedContent === "true") {
      const userIds = users.map((u) => u._id);
      const contentCounts = await Content.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]);

      const contentMap = {};
      contentCounts.forEach((c) => {
        contentMap[c._id.toString()] = c.count;
      });

      users.forEach((user) => {
        user.contentCount = contentMap[user._id.toString()] || 0;
      });
    }

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Error filtering users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to filter users",
    });
  }
});

export default router;

