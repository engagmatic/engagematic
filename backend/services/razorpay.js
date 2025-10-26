import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/index.js";

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }

  // Create a credit-based subscription order
  async createCreditSubscription(
    userId,
    credits,
    currency = "INR",
    billingPeriod = "monthly"
  ) {
    try {
      // Import pricing service to get correct pricing
      const pricingService = (await import("./pricingService.js")).default;
      const pricing = pricingService.getPricingConfig(currency);

      // Check if this matches preset plans
      const presets = {
        starter: { posts: 15, comments: 30, ideas: 30 },
        pro: { posts: 60, comments: 80, ideas: 80 },
      };

      let amount;
      let planType = "custom";

      if (
        credits.posts === presets.starter.posts &&
        credits.comments === presets.starter.comments &&
        credits.ideas === presets.starter.ideas
      ) {
        amount =
          billingPeriod === "yearly"
            ? pricing.starterPrice * 10
            : pricing.starterPrice; // 10 months for yearly
        planType = "starter";
      } else if (
        credits.posts === presets.pro.posts &&
        credits.comments === presets.pro.comments &&
        credits.ideas === presets.pro.ideas
      ) {
        amount =
          billingPeriod === "yearly" ? pricing.proPrice * 10 : pricing.proPrice; // 10 months for yearly
        planType = "pro";
      } else {
        // Calculate custom price using pricing service
        amount = pricingService.calculateCustomPrice(credits, currency);
        if (billingPeriod === "yearly") {
          amount = amount * 10; // 10 months for yearly
        }
      }

      // Convert to paise/cents
      const amountInSmallestUnit =
        currency === "INR"
          ? Math.round(amount * 100)
          : Math.round(amount * 100);

      const order = await this.razorpay.orders.create({
        amount: amountInSmallestUnit,
        currency: currency,
        receipt: `credit_sub_${userId}_${Date.now()}`,
        payment_capture: 1,
        notes: {
          userId: userId.toString(),
          planType: planType,
          credits: JSON.stringify(credits),
          billingPeriod: billingPeriod,
          isCustomPlan: planType === "custom",
        },
      });

      return {
        orderId: order.id,
        amount: amount,
        currency: currency,
        planType: planType,
        credits: credits,
        billingPeriod: billingPeriod,
      };
    } catch (error) {
      console.error("Razorpay credit subscription creation error:", error);
      throw new Error("Failed to create credit subscription order");
    }
  }

  // Create a subscription order (original method for preset plans)
  async createSubscription(
    userId,
    plan,
    currency = "INR",
    billingPeriod = "monthly"
  ) {
    try {
      const planDetails = this.getPlanDetails(plan, currency, billingPeriod);

      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planDetails.planId,
        customer_notify: 1,
        quantity: 1,
        total_count: billingPeriod === "yearly" ? 1 : 12, // 1 year or 12 months
        notes: {
          userId: userId.toString(),
          plan: plan,
          billingPeriod: billingPeriod,
        },
      });

      return {
        subscriptionId: subscription.id,
        planId: planDetails.planId,
        amount: planDetails.amount,
        currency: currency,
        status: subscription.status,
      };
    } catch (error) {
      console.error("Razorpay subscription creation error:", error);
      throw new Error("Failed to create subscription");
    }
  }

  // Create a one-time payment order
  async createOrder(amount, currency = "INR", receipt) {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: receipt,
        payment_capture: 1,
      });

      return {
        orderId: order.id,
        amount: amount,
        currency: currency,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new Error("Failed to create payment order");
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Payment verification error:", error);
      return false;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Webhook verification error:", error);
      return false;
    }
  }

  // Get order details
  async getOrder(orderId) {
    try {
      return await this.razorpay.orders.fetch(orderId);
    } catch (error) {
      console.error("Razorpay order fetch error:", error);
      throw new Error("Failed to fetch order details");
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      return await this.razorpay.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error("Razorpay subscription cancellation error:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  // Get plan details based on plan type and currency
  getPlanDetails(plan, currency, billingPeriod) {
    const plans = {
      starter: {
        INR: {
          monthly: { planId: "plan_starter_inr_monthly", amount: 299 },
          yearly: { planId: "plan_starter_inr_yearly", amount: 2499 },
        },
        USD: {
          monthly: { planId: "plan_starter_usd_monthly", amount: 9 },
          yearly: { planId: "plan_starter_usd_yearly", amount: 89 },
        },
      },
      pro: {
        INR: {
          monthly: { planId: "plan_pro_inr_monthly", amount: 799 },
          yearly: { planId: "plan_pro_inr_yearly", amount: 6499 },
        },
        USD: {
          monthly: { planId: "plan_pro_usd_monthly", amount: 18 },
          yearly: { planId: "plan_pro_usd_yearly", amount: 159 },
        },
      },
    };

    return plans[plan][currency][billingPeriod];
  }

  // Get usage limits based on plan
  getUsageLimits(plan) {
    const limits = {
      starter: {
        postsPerMonth: 300,
        commentsPerMonth: 300,
        personas: 3,
      },
      pro: {
        postsPerMonth: 2000,
        commentsPerMonth: 2000,
        personas: 10,
      },
    };

    return limits[plan] || limits.starter;
  }
}

export default new RazorpayService();
