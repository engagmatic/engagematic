import mongoose from "mongoose";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import User from "../models/User.js";
import emailService from "./emailService.js";

class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(user) {
    try {
      // Check if user already has a referral code
      if (user.referralCode) {
        return user.referralCode;
      }

      // Generate unique code
      const code = await Referral.generateReferralCode(user._id, user.name);

      // Update user with referral code
      user.referralCode = code;
      await user.save();

      // Create initial referral tracking entry
      await Referral.create({
        referrerId: user._id,
        referrerEmail: user.email,
        referralCode: code,
        status: "pending",
      });

      console.log(`✅ Generated referral code ${code} for user ${user.email}`);
      return code;
    } catch (error) {
      console.error("Error generating referral code:", error);
      throw error;
    }
  }

  /**
   * Track referral click
   */
  async trackReferralClick(
    referralCode,
    ipAddress,
    userAgent,
    source = "direct"
  ) {
    try {
      const referral = await Referral.findOne({
        referralCode: referralCode.toUpperCase(),
      });

      if (!referral) {
        return { success: false, message: "Invalid referral code" };
      }

      await referral.trackClick(ipAddress, userAgent);

      if (source) {
        referral.source = source;
        await referral.save();
      }

      console.log(`✅ Tracked click for referral code: ${referralCode}`);
      return { success: true, referral };
    } catch (error) {
      console.error("Error tracking referral click:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process referral signup - Mark referral, rewards given AFTER first payment
   */
  async processReferralSignup(newUser, referralCode) {
    try {
      // Find the referral entry
      const referral = await Referral.findOne({
        referralCode: referralCode.toUpperCase(),
        status: "pending",
      });

      if (!referral) {
        console.log(`❌ No valid referral found for code: ${referralCode}`);
        return {
          success: false,
          message: "Invalid or already used referral code",
        };
      }

      // Get referrer user
      const referrer = await User.findById(referral.referrerId);
      if (!referrer) {
        console.log(`❌ Referrer not found for code: ${referralCode}`);
        return { success: false, message: "Referrer not found" };
      }

      // Prevent self-referral
      if (referrer.email === newUser.email) {
        console.log(`❌ Self-referral attempt: ${newUser.email}`);
        return { success: false, message: "Cannot refer yourself" };
      }

      // Update new user with referral info
      newUser.referredBy = referrer._id;
      newUser.referredByCode = referralCode.toUpperCase();

      // Give referred user extended trial (14 days instead of 7)
      newUser.referralRewards.extendedTrial = true;
      newUser.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      await newUser.save();

      // Complete the referral (but don't mark as rewarded yet)
      await referral.completeReferral(newUser);

      console.log(
        `✅ Referral tracked: ${referrer.email} → ${newUser.email} (rewards pending first payment)`
      );

      return {
        success: true,
        referrer,
        referredUser: newUser,
        pendingReward: true,
        message: "Rewards will be given after first payment",
      };
    } catch (error) {
      console.error("Error processing referral signup:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply referral rewards AFTER user makes first payment
   */
  async applyReferralRewardsAfterPayment(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.referredBy) {
        return { success: false, message: "No referral to process" };
      }

      // Check if user was referred
      const referral = await Referral.findOne({
        referredUserId: userId,
        status: "completed", // Not yet rewarded
      });

      if (!referral) {
        return {
          success: false,
          message: "Referral already processed or not found",
        };
      }

      // Get referrer
      const referrer = await User.findById(user.referredBy);
      if (!referrer) {
        return { success: false, message: "Referrer not found" };
      }

      // NOW give the rewards (after first payment)
      referrer.referralCount += 1;
      referrer.referralRewards.freeMonthsEarned += 1;
      await referrer.save();

      // Create reward for referrer (1 free month)
      await ReferralReward.create({
        userId: referrer._id,
        referralId: referral._id,
        rewardType: "free_month",
        rewardValue: 30, // 30 days
        status: "active",
        description: `1 month free for referring ${user.email}`,
        appliedDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      });

      // Mark referral as rewarded
      await referral.markAsRewarded();

      // Send thank you email to referrer
      try {
        await emailService.sendEmail({
          userId: referrer._id,
          to: referrer.email,
          subject: "🎉 You earned a free month!",
          templateName: "referral_success",
          templateData: {
            name: referrer.name,
            referredUserName: user.name,
            rewardMonths: 1,
            totalReferrals: referrer.referralCount,
          },
          emailType: "custom",
        });
      } catch (emailError) {
        console.error("Error sending referral success email:", emailError);
      }

      console.log(
        `✅ Referral reward applied: ${referrer.email} earned 1 month for ${user.email}'s payment`
      );

      return {
        success: true,
        referrer,
        rewardApplied: true,
      };
    } catch (error) {
      console.error("Error applying referral rewards:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's referral stats
   */
  async getUserReferralStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Get all referrals by this user
      const referrals = await Referral.find({
        referrerId: userId,
        status: { $in: ["completed", "rewarded"] },
      })
        .populate("referredUserId", "name email createdAt")
        .sort({ createdAt: -1 });

      // Get pending rewards
      const rewards = await ReferralReward.find({
        userId,
        status: "active",
      }).populate("referralId");

      // Calculate total clicks
      const totalClicks = await Referral.aggregate([
        { $match: { referrerId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$clickCount" } } },
      ]);

      return {
        success: true,
        data: {
          referralCode: user.referralCode,
          totalReferrals: user.referralCount || 0,
          freeMonthsEarned: user.referralRewards?.freeMonthsEarned || 0,
          freeMonthsUsed: user.referralRewards?.freeMonthsUsed || 0,
          freeMonthsAvailable:
            (user.referralRewards?.freeMonthsEarned || 0) -
            (user.referralRewards?.freeMonthsUsed || 0),
          totalClicks: totalClicks[0]?.total || 0,
          referrals,
          activeRewards: rewards,
          referralLink: `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/signup?ref=${user.referralCode}`,
        },
      };
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply referral reward to subscription
   */
  async applyReferralReward(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      const availableMonths =
        (user.referralRewards?.freeMonthsEarned || 0) -
        (user.referralRewards?.freeMonthsUsed || 0);

      if (availableMonths <= 0) {
        return { success: false, message: "No free months available" };
      }

      // Extend subscription by available free months
      const currentEndDate = user.subscriptionEndsAt || new Date();
      const newEndDate = new Date(
        currentEndDate.getTime() + availableMonths * 30 * 24 * 60 * 60 * 1000
      );

      user.subscriptionEndsAt = newEndDate;
      user.referralRewards.freeMonthsUsed += availableMonths;
      await user.save();

      console.log(
        `✅ Applied ${availableMonths} free month(s) to ${user.email}`
      );

      return {
        success: true,
        monthsApplied: availableMonths,
        newEndDate,
      };
    } catch (error) {
      console.error("Error applying referral reward:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send referral invitation emails
   */
  async sendReferralInvites(userId, emails) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.referralCode) {
        return { success: false, message: "User or referral code not found" };
      }

      const referralLink = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/signup?ref=${user.referralCode}`;

      const results = {
        sent: [],
        failed: [],
      };

      for (const email of emails) {
        try {
          await emailService.sendEmail({
            userId: user._id,
            to: email,
            subject: `${user.name} invited you to try LinkedInPulse!`,
            templateName: "referral_invite",
            templateData: {
              referrerName: user.name,
              referralLink,
              extendedTrialDays: 14,
            },
            emailType: "custom",
          });
          results.sent.push(email);
        } catch (error) {
          console.error(`Failed to send invite to ${email}:`, error);
          results.failed.push({ email, error: error.message });
        }
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("Error sending referral invites:", error);
      return { success: false, error: error.message };
    }
  }
}

const referralService = new ReferralService();
export default referralService;
