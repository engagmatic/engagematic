import mongoose from "mongoose";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import AffiliateCommission from "../models/AffiliateCommission.js";
import Affiliate from "../models/Affiliate.js";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
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

      console.log(`✅ Generated referral code ${code} for user ${user.email}`);
      return code;
    } catch (error) {
      console.error("Error generating referral code:", error);
      throw error;
    }
  }

  /**
   * Track referral click - works for both affiliates and regular users
   */
  async trackReferralClick(
    referralCode,
    ipAddress,
    userAgent,
    source = "direct"
  ) {
    try {
      const code = referralCode.toUpperCase();

      // Check if it's an affiliate code
      const affiliate = await Affiliate.findOne({
        affiliateCode: code,
        status: "active",
      });

      if (affiliate) {
        // Track affiliate click
        let referral = await Referral.findOne({
          referralCode: code,
        });

        if (!referral) {
          // Create referral record if it doesn't exist
          referral = new Referral({
            referrerId: affiliate._id,
            referrerType: "Affiliate",
            referrerEmail: affiliate.email,
            referralCode: code,
            status: "pending",
          });
          await referral.save();
        }

        await referral.trackClick(ipAddress, userAgent);
        if (source) {
          referral.source = source;
          await referral.save();
        }

        // Update affiliate stats
        affiliate.stats.totalClicks += 1;
        await affiliate.save();

        console.log(`✅ Tracked affiliate click for code: ${code}`);
        return { success: true, referral, isAffiliate: true };
      }

      // Check for regular user referral
      const referral = await Referral.findOne({
        referralCode: code,
      });

      if (!referral) {
        return { success: false, message: "Invalid referral code" };
      }

      await referral.trackClick(ipAddress, userAgent);
      if (source) {
        referral.source = source;
        await referral.save();
      }

      console.log(`✅ Tracked click for referral code: ${code}`);
      return { success: true, referral, isAffiliate: false };
    } catch (error) {
      console.error("Error tracking referral click:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process referral signup - Check if affiliate or regular user referral
   */
  async processReferralSignup(newUser, referralCode) {
    try {
      const code = referralCode.toUpperCase();

      // First check if it's an affiliate code
      const affiliate = await Affiliate.findOne({
        affiliateCode: code,
        status: "active",
      });

      if (affiliate) {
        // This is an affiliate referral
        return await this.processAffiliateReferral(newUser, affiliate, code);
      }

      // Check if it's a regular user referral (legacy)
      const userReferral = await Referral.findOne({
        referralCode: code,
        status: "pending",
      });

      if (userReferral && userReferral.referrerType === "User") {
        // Legacy user referral
        const referrer = await User.findById(userReferral.referrerId);
        if (!referrer) {
          return { success: false, message: "Referrer not found" };
        }

        // Prevent self-referral
        if (referrer.email === newUser.email) {
          return { success: false, message: "Cannot refer yourself" };
        }

        // Update new user with referral info
        newUser.referredBy = referrer._id;
        newUser.referredByCode = code;

        // Give referred user extended trial
        newUser.referralRewards.extendedTrial = true;
        newUser.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await newUser.save();

        // Complete the referral
        await userReferral.completeReferral(newUser);

        return {
          success: true,
          referrer,
          referredUser: newUser,
          isAffiliate: false,
          message: "Referral tracked",
        };
      }

      // No referral found
      console.log(`❌ No valid referral found for code: ${code}`);
      return {
        success: false,
        message: "Invalid referral code",
      };
    } catch (error) {
      console.error("Error processing referral signup:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process affiliate referral signup
   */
  async processAffiliateReferral(newUser, affiliate, referralCode) {
    try {
      // Prevent self-referral
      if (affiliate.email === newUser.email) {
        console.log(`❌ Self-referral attempt: ${newUser.email}`);
        return { success: false, message: "Cannot refer yourself" };
      }

      // Check if referral already exists
      let referral = await Referral.findOne({
        referralCode: referralCode,
        referredUserId: null,
      });

      if (!referral) {
        // Create new referral record for affiliate
        referral = new Referral({
          referrerId: affiliate._id,
          referrerType: "Affiliate",
          referrerEmail: affiliate.email,
          referralCode: referralCode,
          status: "pending",
        });
        await referral.save();
      }

      // Update new user with referral info
      newUser.referredByCode = referralCode;
      // Note: referredBy is for User model, we'll track via referralCode for affiliates

      // Give referred user extended trial (14 days instead of 7)
      newUser.referralRewards.extendedTrial = true;
      newUser.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await newUser.save();

      // Complete the referral
      await referral.completeReferral(newUser);

      // Update affiliate stats
      affiliate.stats.totalSignups += 1;
      await affiliate.save();

      console.log(
        `✅ Affiliate referral tracked: ${affiliate.email} → ${newUser.email}`
      );

      return {
        success: true,
        affiliate,
        referredUser: newUser,
        isAffiliate: true,
        message: "Affiliate referral tracked successfully",
      };
    } catch (error) {
      console.error("Error processing affiliate referral:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create recurring commission for affiliate (10% of monthly subscription)
   * Called when referred user makes their first payment
   */
  async createRecurringCommission(userId, subscriptionId, paymentId, plan, monthlyAmount) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.referredBy) {
        return { success: false, message: "No referral to process" };
      }

      // Find the referral
      const userReferral = await Referral.findOne({
        referredUserId: userId,
        status: { $in: ["completed", "rewarded"] },
      });

      if (!userReferral) {
        return {
          success: false,
          message: "Referral not found",
        };
      }

      // Check if user was referred by an affiliate (via referral code)
      const userRefCode = user.referredByCode;
      if (!userRefCode) {
        return { success: false, message: "No referral code found for user" };
      }

      // Find affiliate by referral code
      const affiliate = await Affiliate.findOne({
        affiliateCode: userRefCode.toUpperCase(),
        status: "active",
      });

      if (!affiliate) {
        // Not an affiliate referral - skip commission creation
        return { success: false, message: "Not an affiliate referral" };
      }

      // Find the affiliate referral record
      const affiliateReferral = await Referral.findOne({
        referralCode: userRefCode.toUpperCase(),
        referredUserId: userId,
        referrerType: "Affiliate",
        status: { $in: ["completed", "rewarded"] },
      });

      if (!affiliateReferral) {
        return { success: false, message: "Referral record not found" };
      }

      // Check if commission already exists for this subscription
      const existingCommission = await AffiliateCommission.findOne({
        subscriptionId: subscriptionId,
      });

      if (existingCommission) {
        console.log(`ℹ️ Commission already exists for subscription ${subscriptionId}`);
        return {
          success: true,
          commission: existingCommission,
          message: "Commission already created",
        };
      }

      // Calculate 10% commission
      const commissionAmount = AffiliateCommission.calculateCommission(
        monthlyAmount,
        10
      );

      // Get current month for commission period
      const now = new Date();
      const commissionPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Calculate next commission date (next month)
      const nextCommissionDate = new Date(now);
      nextCommissionDate.setMonth(nextCommissionDate.getMonth() + 1);
      nextCommissionDate.setDate(1); // First day of next month

      // Create recurring commission record
      const commission = await AffiliateCommission.create({
        affiliateId: affiliate._id,
        referralId: affiliateReferral._id,
        referredUserId: userId,
        subscriptionId: subscriptionId,
        paymentId: paymentId,
        plan: plan,
        monthlySubscriptionAmount: monthlyAmount,
        monthlyCommissionAmount: commissionAmount,
        commissionRate: 10, // 10% fixed
        isRecurring: true,
        commissionPeriod: commissionPeriod,
        subscriptionActive: true,
        nextCommissionDate: nextCommissionDate,
        status: "pending",
      });

      // Update referral count
      affiliate.referralCount = (affiliate.referralCount || 0) + 1;
      await affiliate.save();

      // Mark referral as rewarded
      await affiliateReferral.markAsRewarded();

      // Send email to affiliate
      try {
        await emailService.sendEmail({
          userId: affiliate._id,
          to: affiliate.email,
          subject: "🎉 You earned a recurring commission!",
          templateName: "affiliate_commission",
          templateData: {
            name: affiliate.name,
            referredUserName: user.name,
            monthlyCommission: commissionAmount,
            monthlySubscription: monthlyAmount,
            plan: plan,
            commissionRate: 10,
          },
          emailType: "custom",
        });
      } catch (emailError) {
        console.error("Error sending affiliate commission email:", emailError);
      }

      console.log(
        `✅ Recurring commission created: ${affiliate.email} earns ₹${commissionAmount}/month (10% of ₹${monthlyAmount}) for ${user.email}'s ${plan} subscription`
      );

      return {
        success: true,
        commission: commission,
        message: "Recurring commission created successfully",
      };
    } catch (error) {
      console.error("Error creating recurring commission:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process monthly commission for active subscriptions
   * Called by scheduled job monthly
   */
  async processMonthlyCommissions() {
    try {
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Find all active commissions where next commission date is due
      const activeCommissions = await AffiliateCommission.find({
        subscriptionActive: true,
        nextCommissionDate: { $lte: now },
        status: { $ne: "expired" },
      }).populate("subscriptionId");

      console.log(`📊 Processing monthly commissions for ${activeCommissions.length} active subscriptions`);

      let processed = 0;
      let errors = 0;

      for (const commission of activeCommissions) {
        try {
          // Check if subscription is still active
          const subscription = await UserSubscription.findById(
            commission.subscriptionId
          );

          if (!subscription || subscription.status !== "active") {
            // Mark commission as expired
            await commission.markSubscriptionCancelled();
            console.log(`⏸️ Subscription ${commission.subscriptionId} is no longer active`);
            continue;
          }

          // Check if commission for this period already exists
          const existingPeriodCommission = await AffiliateCommission.findOne({
            subscriptionId: commission.subscriptionId,
            commissionPeriod: currentPeriod,
          });

          if (existingPeriodCommission) {
            console.log(
              `ℹ️ Commission for period ${currentPeriod} already exists for subscription ${commission.subscriptionId}`
            );
            continue;
          }

          // Create new commission record for this month
          const nextCommissionDate = new Date(now);
          nextCommissionDate.setMonth(nextCommissionDate.getMonth() + 1);
          nextCommissionDate.setDate(1);

          await AffiliateCommission.create({
            affiliateId: commission.affiliateId,
            referralId: commission.referralId,
            referredUserId: commission.referredUserId,
            subscriptionId: commission.subscriptionId,
            plan: commission.plan,
            monthlySubscriptionAmount: commission.monthlySubscriptionAmount,
            monthlyCommissionAmount: commission.monthlyCommissionAmount,
            commissionRate: 10,
            isRecurring: true,
            commissionPeriod: currentPeriod,
            subscriptionActive: true,
            nextCommissionDate: nextCommissionDate,
            status: "pending",
          });

          // Update original commission record
          commission.totalCommissionsEarned += commission.monthlyCommissionAmount;
          commission.monthsPaid += 1;
          commission.lastCommissionDate = now;
          commission.nextCommissionDate = nextCommissionDate;
          await commission.save();

          processed++;
        } catch (error) {
          console.error(
            `❌ Error processing commission for subscription ${commission.subscriptionId}:`,
            error
          );
          errors++;
        }
      }

      console.log(
        `✅ Monthly commission processing complete: ${processed} processed, ${errors} errors`
      );

      return {
        success: true,
        processed,
        errors,
        total: activeCommissions.length,
      };
    } catch (error) {
      console.error("Error processing monthly commissions:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply referral rewards AFTER user makes first payment (DEPRECATED - now using recurring commissions)
   * Kept for backward compatibility
   */
  async applyReferralRewardsAfterPayment(userId) {
    // This method is now handled by createRecurringCommission
    // But we keep it for backward compatibility
    return { success: false, message: "Use createRecurringCommission instead" };
  }

  /**
   * Get user's referral stats with commission data
   */
  async getUserReferralStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Generate referral code if user doesn't have one
      if (!user.referralCode) {
        await this.generateReferralCode(user);
      }

      // Get all referrals by this user
      const referrals = await Referral.find({
        referrerId: userId,
        status: { $in: ["completed", "rewarded"] },
      })
        .populate("referredUserId", "name email createdAt")
        .sort({ createdAt: -1 });

      // Get pending rewards (legacy)
      const rewards = await ReferralReward.find({
        userId,
        status: "active",
      }).populate("referralId");

      // Calculate total clicks
      const totalClicks = await Referral.aggregate([
        { $match: { referrerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$clickCount" } } },
      ]);

      // Get commission stats
      const commissionStats = await AffiliateCommission.aggregate([
        { $match: { affiliateId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalEarned: { $sum: "$monthlyCommissionAmount" },
            totalPending: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, "$monthlyCommissionAmount", 0],
              },
            },
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ["$status", "paid"] }, "$monthlyCommissionAmount", 0],
              },
            },
            activeSubscriptions: {
              $sum: {
                $cond: [{ $eq: ["$subscriptionActive", true] }, 1, 0],
              },
            },
            monthlyRecurring: {
              $sum: {
                $cond: [
                  { $eq: ["$subscriptionActive", true] },
                  "$monthlyCommissionAmount",
                  0,
                ],
              },
            },
          },
        },
      ]);

      const stats = commissionStats[0] || {
        totalEarned: 0,
        totalPending: 0,
        totalPaid: 0,
        activeSubscriptions: 0,
        monthlyRecurring: 0,
      };

      // Get signups (conversions)
      const signups = await Referral.countDocuments({
        referrerId: userId,
        status: { $in: ["completed", "rewarded"] },
      });

      // Get pending payouts (sum of pending commissions above threshold)
      const pendingPayouts = await AffiliateCommission.aggregate([
        {
          $match: {
            affiliateId: new mongoose.Types.ObjectId(userId),
            status: "pending",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$monthlyCommissionAmount" },
          },
        },
      ]);

      return {
        success: true,
        data: {
          referralCode: user.referralCode,
          totalReferrals: user.referralCount || 0,
          totalClicks: totalClicks[0]?.total || 0,
          signups: signups,
          referrals,
          activeRewards: rewards,
          referralLink: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/signup?ref=${user.referralCode}`,
          // Commission stats
          commissions: {
            totalEarned: stats.totalEarned || 0,
            totalPending: stats.totalPending || 0,
            totalPaid: stats.totalPaid || 0,
            activeSubscriptions: stats.activeSubscriptions || 0,
            monthlyRecurring: stats.monthlyRecurring || 0, // Monthly recurring income
            pendingPayout: pendingPayouts[0]?.total || 0,
          },
          // Legacy free months (for backward compatibility)
          freeMonthsEarned: user.referralRewards?.freeMonthsEarned || 0,
          freeMonthsUsed: user.referralRewards?.freeMonthsUsed || 0,
          freeMonthsAvailable:
            (user.referralRewards?.freeMonthsEarned || 0) -
            (user.referralRewards?.freeMonthsUsed || 0),
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
            subject: `${user.name} invited you to try Engagematic!`,
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
