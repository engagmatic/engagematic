import cron from "node-cron";
import emailService from "./emailService.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import EmailLog from "../models/EmailLog.js";

class EmailScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Start all scheduled email jobs
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Email scheduler is already running");
      return;
    }

    console.log("📧 Starting email scheduler...");

    // Initialize email service
    const initialized = await emailService.initialize();
    if (!initialized) {
      console.warn("⚠️  Email scheduler disabled - service not initialized");
      return;
    }

    // Schedule all jobs
    this.scheduleOnboardingEmails();
    this.scheduleTrialExpiryReminders();
    this.scheduleReengagementEmails();
    this.scheduleMilestoneChecks();

    this.isRunning = true;
    console.log("✅ Email scheduler started successfully");
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    this.isRunning = false;
    console.log("📧 Email scheduler stopped");
  }

  /**
   * Schedule onboarding email sequence (Days 1, 3, 5, 7)
   * Runs every 6 hours to catch users at different signup times
   */
  scheduleOnboardingEmails() {
    const job = cron.schedule("0 */6 * * *", async () => {
      console.log("🔄 Running onboarding email check...");

      try {
        const now = new Date();

        // Day 1 - Send 24 hours after signup
        await this.sendOnboardingDay(1, now);

        // Day 3 - Send 72 hours after signup
        await this.sendOnboardingDay(3, now);

        // Day 5 - Send 120 hours after signup
        await this.sendOnboardingDay(5, now);

        // Day 7 - Send 168 hours after signup
        await this.sendOnboardingDay(7, now);
      } catch (error) {
        console.error("Error in onboarding email job:", error);
      }
    });

    this.jobs.push(job);
    console.log("✅ Onboarding emails scheduled (every 6 hours)");
  }

  /**
   * Helper method to send onboarding emails for specific day
   */
  async sendOnboardingDay(day, now) {
    const hoursAgo = day * 24;
    const startTime = new Date(now.getTime() - (hoursAgo + 1) * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() - (hoursAgo - 1) * 60 * 60 * 1000);

    const users = await User.find({
      createdAt: { $gte: startTime, $lte: endTime },
      isActive: true,
    });

    console.log(`Found ${users.length} users for Day ${day} onboarding`);

    for (const user of users) {
      try {
        await emailService.sendOnboardingEmail(user, day);
        console.log(`✅ Sent Day ${day} onboarding to ${user.email}`);
      } catch (error) {
        console.error(`Error sending Day ${day} onboarding to ${user.email}:`, error);
      }
    }
  }

  /**
   * Schedule trial expiry reminders (7, 3, 1 days before, and on expiry)
   * Runs daily at 9 AM
   */
  scheduleTrialExpiryReminders() {
    const job = cron.schedule("0 9 * * *", async () => {
      console.log("🔄 Running trial expiry reminder check...");

      try {
        const now = new Date();

        // 7 days before expiry
        await this.sendTrialExpiryReminder(7, now);

        // 3 days before expiry
        await this.sendTrialExpiryReminder(3, now);

        // 1 day before expiry
        await this.sendTrialExpiryReminder(1, now);

        // Trial expired today
        await this.sendTrialExpiryReminder(0, now);
      } catch (error) {
        console.error("Error in trial expiry reminder job:", error);
      }
    });

    this.jobs.push(job);
    console.log("✅ Trial expiry reminders scheduled (daily at 9 AM)");
  }

  /**
   * Helper method to send trial expiry reminders
   */
  async sendTrialExpiryReminder(daysLeft, now) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysLeft);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const users = await User.find({
      subscriptionStatus: "trial",
      trialEndsAt: { $gte: targetDate, $lt: nextDay },
      isActive: true,
    });

    console.log(`Found ${users.length} users with ${daysLeft} days left in trial`);

    for (const user of users) {
      try {
        await emailService.sendTrialExpiryEmail(user, daysLeft);
        console.log(`✅ Sent trial expiry (${daysLeft} days) reminder to ${user.email}`);
      } catch (error) {
        console.error(`Error sending trial expiry reminder to ${user.email}:`, error);
      }
    }
  }

  /**
   * Schedule re-engagement emails for inactive users (7, 14, 30 days)
   * Runs daily at 10 AM
   */
  scheduleReengagementEmails() {
    const job = cron.schedule("0 10 * * *", async () => {
      console.log("🔄 Running re-engagement email check...");

      try {
        const now = new Date();

        // 7 days inactive
        await this.sendReengagementEmail(7, now);

        // 14 days inactive
        await this.sendReengagementEmail(14, now);

        // 30 days inactive
        await this.sendReengagementEmail(30, now);
      } catch (error) {
        console.error("Error in re-engagement email job:", error);
      }
    });

    this.jobs.push(job);
    console.log("✅ Re-engagement emails scheduled (daily at 10 AM)");
  }

  /**
   * Helper method to send re-engagement emails
   */
  async sendReengagementEmail(daysInactive, now) {
    const lastActiveDate = new Date(now);
    lastActiveDate.setDate(lastActiveDate.getDate() - daysInactive);
    lastActiveDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(lastActiveDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const users = await User.find({
      lastLoginAt: { $gte: lastActiveDate, $lt: nextDay },
      isActive: true,
    });

    console.log(`Found ${users.length} users inactive for ${daysInactive} days`);

    for (const user of users) {
      try {
        // Check if user has created any content recently
        const recentContent = await Content.findOne({
          userId: user._id,
          createdAt: { $gte: lastActiveDate },
        });

        if (!recentContent) {
          await emailService.sendReengagementEmail(user, daysInactive);
          console.log(`✅ Sent ${daysInactive}-day re-engagement to ${user.email}`);
        }
      } catch (error) {
        console.error(`Error sending re-engagement email to ${user.email}:`, error);
      }
    }
  }

  /**
   * Schedule milestone celebration emails
   * Runs every 6 hours
   */
  scheduleMilestoneChecks() {
    const job = cron.schedule("0 */6 * * *", async () => {
      console.log("🔄 Running milestone check...");

      try {
        const milestones = [10, 50, 100];

        for (const milestone of milestones) {
          await this.checkAndSendMilestoneEmails(milestone);
        }
      } catch (error) {
        console.error("Error in milestone check job:", error);
      }
    });

    this.jobs.push(job);
    console.log("✅ Milestone checks scheduled (every 6 hours)");
  }

  /**
   * Helper method to check and send milestone emails
   */
  async checkAndSendMilestoneEmails(milestoneCount) {
    try {
      // Get users with exactly this many posts
      const usersWithMilestone = await Content.aggregate([
        {
          $group: {
            _id: "$userId",
            postCount: { $sum: 1 },
          },
        },
        {
          $match: {
            postCount: milestoneCount,
          },
        },
      ]);

      console.log(`Found ${usersWithMilestone.length} users at ${milestoneCount} posts milestone`);

      for (const userMilestone of usersWithMilestone) {
        try {
          const user = await User.findById(userMilestone._id);
          if (!user || !user.isActive) continue;

          // Check if milestone email already sent
          const milestoneType = `milestone_${milestoneCount}_posts`;
          const alreadySent = await EmailLog.findOne({
            userId: user._id,
            emailType: milestoneType,
            status: "sent",
          });

          if (!alreadySent) {
            await emailService.sendMilestoneEmail(user, milestoneCount);
            console.log(`✅ Sent ${milestoneCount}-post milestone email to ${user.email}`);
          }
        } catch (error) {
          console.error(`Error sending milestone email:`, error);
        }
      }
    } catch (error) {
      console.error(`Error checking ${milestoneCount} milestone:`, error);
    }
  }

  /**
   * Manual trigger methods for testing or manual execution
   */

  async sendWelcomeEmailToUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      await emailService.sendWelcomeEmail(user);
      console.log(`✅ Manually sent welcome email to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending manual welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendUpgradePromptToUser(userId, reason = "value_based") {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      await emailService.sendUpgradePromptEmail(user, reason);
      console.log(`✅ Manually sent upgrade prompt to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending manual upgrade prompt:", error);
      return { success: false, error: error.message };
    }
  }

  async sendFeatureUpdateToAllUsers(featureDetails) {
    try {
      const users = await User.find({ isActive: true });
      let successCount = 0;
      let failCount = 0;

      console.log(`📧 Sending feature update to ${users.length} users...`);

      for (const user of users) {
        try {
          await emailService.sendFeatureUpdateEmail(user, featureDetails);
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${user.email}:`, error.message);
          failCount++;
        }
      }

      console.log(`✅ Feature update sent: ${successCount} success, ${failCount} failed`);
      return { success: true, successCount, failCount };
    } catch (error) {
      console.error("Error sending feature update:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.jobs.length,
      emailServiceInitialized: emailService.initialized,
    };
  }
}

// Export singleton instance
const emailScheduler = new EmailScheduler();
export default emailScheduler;

