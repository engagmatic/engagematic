import { Resend } from "resend";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import EmailLog from "../models/EmailLog.js";
import EmailPreference from "../models/EmailPreference.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.resend = null;
    this.initialized = false;
    this.fromEmail = process.env.EMAIL_FROM || "hello@engagematic.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "LinkedInPulse";
  }

  /**
   * Initialize Resend API client
   */
  async initialize() {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️  RESEND_API_KEY not found. Email service disabled.");
        console.warn("💡 Get your free API key at: https://resend.com/api-keys");
        return false;
      }

      // Initialize Resend SDK
      this.resend = new Resend(process.env.RESEND_API_KEY);

      // Test the API key by checking if it's valid (we'll do a simple validation)
      // Resend doesn't have a verify method, so we'll just check if the key format is correct
      if (!process.env.RESEND_API_KEY.startsWith("re_")) {
        console.warn("⚠️  RESEND_API_KEY format appears invalid (should start with 're_')");
        return false;
      }

      this.initialized = true;
      console.log("✅ Email service initialized with Resend API");
      console.log(`📧 From: ${this.fromName} <${this.fromEmail}>`);
      return true;
    } catch (error) {
      console.error("❌ Email service initialization failed:", error.message);
      return false;
    }
  }

  /**
   * Check if user can receive this email type
   */
  async canSendEmail(userId, emailType) {
    try {
      const preference = await EmailPreference.findOne({ userId });

      // If no preference exists, allow (default is opt-in)
      if (!preference) return true;

      // Check global unsubscribe
      if (preference.unsubscribedAll) return false;

      // Map email types to preference categories
      const emailTypeMap = {
        welcome: "onboarding",
        onboarding_day1: "onboarding",
        onboarding_day3: "onboarding",
        onboarding_day5: "onboarding",
        onboarding_day7: "onboarding",
        milestone_10_posts: "milestones",
        milestone_50_posts: "milestones",
        milestone_100_posts: "milestones",
        trial_expiry_7days: "trialReminders",
        trial_expiry_3days: "trialReminders",
        trial_expiry_1day: "trialReminders",
        trial_expired: "trialReminders",
        reengagement_7days: "reengagement",
        reengagement_14days: "reengagement",
        reengagement_30days: "reengagement",
        upgrade_prompt: "upgradePrompts",
        payment_failed: "transactional",
        feature_update: "featureUpdates",
      };

      const category = emailTypeMap[emailType] || "marketing";
      return preference.preferences[category] !== false;
    } catch (error) {
      console.error("Error checking email permission:", error);
      return true; // Default to allowing if check fails
    }
  }

  /**
   * Check if email was already sent recently
   */
  async wasRecentlySent(userId, emailType, hoursAgo = 24) {
    try {
      const recentEmail = await EmailLog.findOne({
        userId,
        emailType,
        status: "sent",
        sentAt: { $gte: new Date(Date.now() - hoursAgo * 60 * 60 * 1000) },
      });
      return !!recentEmail;
    } catch (error) {
      console.error("Error checking recent emails:", error);
      return false;
    }
  }

  /**
   * Render email template
   */
  async renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(
        __dirname,
        "..",
        "templates",
        "emails",
        `${templateName}.ejs`
      );
      return await ejs.renderFile(templatePath, data);
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Send email with logging and preference checking
   */
  async sendEmail({
    userId,
    to,
    subject,
    templateName,
    templateData = {},
    emailType = "custom",
    metadata = {},
  }) {
    // Check if service is initialized
    if (!this.initialized) {
      console.warn("Email service not initialized. Skipping email send.");
      return { success: false, reason: "service_not_initialized" };
    }

    try {
      // Check if user can receive this email
      const canSend = await this.canSendEmail(userId, emailType);
      if (!canSend) {
        console.log(`User ${userId} has opted out of ${emailType} emails`);
        return { success: false, reason: "user_opted_out" };
      }

      // Check if recently sent
      const recentlySent = await this.wasRecentlySent(userId, emailType);
      if (recentlySent) {
        console.log(
          `Email ${emailType} already sent to user ${userId} recently`
        );
        return { success: false, reason: "recently_sent" };
      }

      // Get or create email preference (for unsubscribe token)
      let preference = await EmailPreference.findOne({ userId });
      if (!preference) {
        preference = await EmailPreference.create({
          userId,
          email: to,
        });
      }

      // Add unsubscribe link to template data
      const unsubscribeUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/unsubscribe?token=${preference.unsubscribeToken}`;
      const preferencesUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/email-preferences?token=${preference.unsubscribeToken}`;

      // Render email template
      const html = await this.renderTemplate(templateName, {
        ...templateData,
        unsubscribeUrl,
        preferencesUrl,
        currentYear: new Date().getFullYear(),
      });

      // Create email log entry
      const emailLog = await EmailLog.create({
        userId,
        email: to,
        emailType,
        subject,
        status: "pending",
        metadata,
      });

      // Send email using Resend API
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message || "Failed to send email via Resend");
      }

      // Update log with success
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: "sent",
        providerId: data?.id || "resend",
        sentAt: new Date(),
      });

      console.log(`✅ Email sent: ${emailType} to ${to} (ID: ${data?.id})`);
      return {
        success: true,
        messageId: data?.id,
        emailLogId: emailLog._id,
      };
    } catch (error) {
      console.error(`❌ Error sending email ${emailType} to ${to}:`, error);

      // Log failure
      try {
        await EmailLog.create({
          userId,
          email: to,
          emailType,
          subject,
          status: "failed",
          error: error.message,
          metadata,
        });
      } catch (logError) {
        console.error("Error logging email failure:", logError);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Email flow methods
   */

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: "🎉 Welcome to LinkedInPulse - Let's Get Started!",
      templateName: "welcome",
      templateData: {
        name: user.name || "there",
        trialDays: Math.ceil(
          (new Date(user.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)
        ),
      },
      emailType: "welcome",
    });
  }

  async sendOnboardingEmail(user, day) {
    const emailTypes = {
      1: {
        type: "onboarding_day1",
        subject: "Day 1: Create Your First AI-Powered LinkedIn Post 🚀",
        template: "onboarding_day1",
      },
      3: {
        type: "onboarding_day3",
        subject: "Day 3: Master Your Content Strategy 📊",
        template: "onboarding_day3",
      },
      5: {
        type: "onboarding_day5",
        subject: "Day 5: Unlock Advanced Features ⚡",
        template: "onboarding_day5",
      },
      7: {
        type: "onboarding_day7",
        subject: "Day 7: Your Weekly LinkedIn Success Report 🏆",
        template: "onboarding_day7",
      },
    };

    const config = emailTypes[day];
    if (!config) return { success: false, reason: "invalid_day" };

    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: config.subject,
      templateName: config.template,
      templateData: {
        name: user.name || "there",
      },
      emailType: config.type,
    });
  }

  async sendMilestoneEmail(user, postCount) {
    const milestones = {
      10: {
        type: "milestone_10_posts",
        subject: "🎉 First 10 Posts Created!",
        emoji: "🎉",
      },
      50: {
        type: "milestone_50_posts",
        subject: "🌟 50 Posts Milestone Unlocked!",
        emoji: "🌟",
      },
      100: {
        type: "milestone_100_posts",
        subject: "🏆 100 Posts - You're a Content Machine!",
        emoji: "🏆",
      },
    };

    const milestone = milestones[postCount];
    if (!milestone) return { success: false, reason: "invalid_milestone" };

    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: milestone.subject,
      templateName: "milestone",
      templateData: {
        name: user.name || "there",
        postCount,
        emoji: milestone.emoji,
      },
      emailType: milestone.type,
    });
  }

  async sendTrialExpiryEmail(user, daysLeft) {
    const configs = {
      7: {
        type: "trial_expiry_7days",
        subject: "Your Trial Expires in 7 Days ⏰",
      },
      3: {
        type: "trial_expiry_3days",
        subject: "Only 3 Days Left of Your Trial! 🚨",
      },
      1: {
        type: "trial_expiry_1day",
        subject: "Last Day of Your Trial - Don't Miss Out! ⚡",
      },
      0: {
        type: "trial_expired",
        subject: "Your Trial Has Ended - Continue Your Success 💫",
      },
    };

    const config = configs[daysLeft];
    if (!config) return { success: false, reason: "invalid_days_left" };

    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: config.subject,
      templateName: daysLeft === 0 ? "trial_expired" : "trial_expiry",
      templateData: {
        name: user.name || "there",
        daysLeft,
        trialEndDate: user.trialEndsAt,
      },
      emailType: config.type,
    });
  }

  async sendReengagementEmail(user, daysInactive) {
    const configs = {
      7: {
        type: "reengagement_7days",
        subject: "We Miss You! Here's What's New 👋",
      },
      14: {
        type: "reengagement_14days",
        subject: "Your LinkedIn Content Strategy Is Waiting 🎯",
      },
      30: {
        type: "reengagement_30days",
        subject: "Come Back - Special Offer Inside! 🎁",
      },
    };

    const config = configs[daysInactive];
    if (!config) return { success: false, reason: "invalid_days_inactive" };

    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: config.subject,
      templateName: "reengagement",
      templateData: {
        name: user.name || "there",
        daysInactive,
      },
      emailType: config.type,
    });
  }

  async sendUpgradePromptEmail(user, reason = "value_based") {
    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: "Unlock Your Full LinkedIn Potential 🚀",
      templateName: "upgrade",
      templateData: {
        name: user.name || "there",
        currentPlan: user.plan,
        reason,
      },
      emailType: "upgrade_prompt",
    });
  }

  async sendPaymentFailedEmail(user, subscriptionDetails) {
    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: "⚠️ Payment Failed - Action Required",
      templateName: "payment_failed",
      templateData: {
        name: user.name || "there",
        ...subscriptionDetails,
      },
      emailType: "payment_failed",
    });
  }

  async sendFeatureUpdateEmail(user, featureDetails) {
    return this.sendEmail({
      userId: user._id,
      to: user.email,
      subject: `🎉 New Feature: ${featureDetails.title}`,
      templateName: "feature_update",
      templateData: {
        name: user.name || "there",
        ...featureDetails,
      },
      emailType: "feature_update",
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
