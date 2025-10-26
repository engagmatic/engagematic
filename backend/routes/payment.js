import express from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { requireProfileCompletion } from "../middleware/profileCompletion.js";
import razorpayService from "../services/razorpay.js";
import pricingService from "../services/pricingService.js";
import UserSubscription from "../models/UserSubscription.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Create credit-based payment order
router.post(
  "/create-credit-order",
  authenticateToken,
  requireProfileCompletion,
  [
    body("credits.posts")
      .isInt({ min: 10, max: 100 })
      .withMessage("Posts must be between 10 and 100"),
    body("credits.comments")
      .isInt({ min: 10, max: 100 })
      .withMessage("Comments must be between 10 and 100"),
    body("credits.ideas")
      .isInt({ min: 10, max: 100 })
      .withMessage("Ideas must be between 10 and 100"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
    body("billingInterval")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Billing interval must be monthly or yearly"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const {
        credits,
        currency = "USD",
        billingInterval = "monthly",
      } = req.body;

      // Validate credits
      const validation = pricingService.validateCredits(credits);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid credit selection",
          errors: validation.errors,
        });
      }

      // Create Razorpay order
      const order = await razorpayService.createCreditSubscription(
        userId,
        credits,
        currency,
        billingInterval
      );

      res.json({
        success: true,
        message: "Payment order created successfully",
        data: {
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency,
          planType: order.planType,
          credits: order.credits,
          billingPeriod: order.billingPeriod,
          key: process.env.RAZORPAY_KEY_ID, // Frontend needs this for Razorpay integration
        },
      });
    } catch (error) {
      console.error("Credit order creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment order",
        error: error.message,
      });
    }
  }
);

// Verify payment and create subscription
router.post(
  "/verify-payment",
  authenticateToken,
  requireProfileCompletion,
  [
    body("orderId").notEmpty().withMessage("Order ID is required"),
    body("paymentId").notEmpty().withMessage("Payment ID is required"),
    body("signature").notEmpty().withMessage("Signature is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { orderId, paymentId, signature } = req.body;

      // Verify payment signature
      const isVerified = razorpayService.verifyPaymentSignature(
        orderId,
        paymentId,
        signature
      );

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }

      // Get order details from Razorpay to extract credits
      const orderDetails = await razorpayService.getOrder(orderId);
      const credits = JSON.parse(orderDetails.notes.credits);
      const currency = orderDetails.currency;
      const billingInterval = orderDetails.notes.billingPeriod;

      // Create subscription in our system
      const subscription = await pricingService.createCreditSubscription(
        userId,
        credits,
        currency,
        billingInterval
      );

      res.json({
        success: true,
        message: "Payment verified and subscription created successfully",
        data: {
          subscription: subscription.subscription,
          pricing: subscription.pricing,
          planName: subscription.planName,
          paymentId: paymentId,
          orderId: orderId,
        },
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error: error.message,
      });
    }
  }
);

// Create preset plan payment order
router.post(
  "/create-plan-order",
  authenticateToken,
  requireProfileCompletion,
  [
    body("plan").isIn(["starter", "pro"]).withMessage("Valid plan is required"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
    body("billingInterval")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Billing interval must be monthly or yearly"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.userId;
      const { plan, currency = "USD", billingInterval = "monthly" } = req.body;

      // Create Razorpay subscription
      const subscription = await razorpayService.createSubscription(
        userId,
        plan,
        currency,
        billingInterval
      );

      res.json({
        success: true,
        message: "Payment subscription created successfully",
        data: {
          subscriptionId: subscription.subscriptionId,
          planId: subscription.planId,
          amount: subscription.amount,
          currency: subscription.currency,
          status: subscription.status,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error("Plan order creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create plan subscription",
        error: error.message,
      });
    }
  }
);

// Get Razorpay key for frontend
router.get("/key", (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Razorpay key fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Razorpay key",
      error: error.message,
    });
  }
});

// Handle Razorpay webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const body = req.body;

      // Verify webhook signature
      const isVerified = razorpayService.verifyWebhookSignature(
        body,
        signature
      );

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: "Webhook verification failed",
        });
      }

      const event = JSON.parse(body);

      // Handle different webhook events
      switch (event.event) {
        case "payment.captured":
          // Handle successful payment
          await handlePaymentCaptured(event.payload.payment.entity);
          break;

        case "subscription.charged":
          // Handle subscription renewal
          await handleSubscriptionCharged(event.payload.subscription.entity);
          break;

        case "subscription.cancelled":
          // Handle subscription cancellation
          await handleSubscriptionCancelled(event.payload.subscription.entity);
          break;

        case "subscription.paused":
          // Handle subscription pause
          await handleSubscriptionPaused(event.payload.subscription.entity);
          break;

        case "subscription.resumed":
          // Handle subscription resume
          await handleSubscriptionResumed(event.payload.subscription.entity);
          break;

        default:
          console.log("Unhandled webhook event:", event.event);
      }

      res.json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process webhook",
        error: error.message,
      });
    }
  }
);

// Webhook handler functions
async function handlePaymentCaptured(payment) {
  try {
    console.log("Payment captured:", payment.id);

    // Find user subscription by payment ID
    const subscription = await UserSubscription.findOne({
      "paymentDetails.razorpayPaymentId": payment.id,
    });

    if (subscription) {
      // Update subscription status
      subscription.status = "active";
      subscription.paymentDetails.status = "captured";
      subscription.paymentDetails.capturedAt = new Date();

      // Reset usage counters
      subscription.usage.postsUsed = 0;
      subscription.usage.commentsUsed = 0;
      subscription.usage.ideasUsed = 0;

      await subscription.save();
      console.log("Subscription activated for user:", subscription.userId);
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handleSubscriptionCharged(subscription) {
  try {
    console.log("Subscription charged:", subscription.id);

    // Find user subscription
    const userSubscription = await UserSubscription.findOne({
      "paymentDetails.razorpaySubscriptionId": subscription.id,
    });

    if (userSubscription) {
      // Reset usage counters for new billing period
      userSubscription.usage.postsUsed = 0;
      userSubscription.usage.commentsUsed = 0;
      userSubscription.usage.ideasUsed = 0;

      // Update last charged date
      userSubscription.lastChargedAt = new Date();

      await userSubscription.save();
      console.log("Subscription renewed for user:", userSubscription.userId);
    }
  } catch (error) {
    console.error("Error handling subscription charged:", error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    console.log("Subscription cancelled:", subscription.id);

    // Find user subscription
    const userSubscription = await UserSubscription.findOne({
      "paymentDetails.razorpaySubscriptionId": subscription.id,
    });

    if (userSubscription) {
      // Update subscription status
      userSubscription.status = "cancelled";
      userSubscription.cancelledAt = new Date();

      await userSubscription.save();
      console.log("Subscription cancelled for user:", userSubscription.userId);
    }
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}

async function handleSubscriptionPaused(subscription) {
  try {
    console.log("Subscription paused:", subscription.id);

    // Find user subscription
    const userSubscription = await UserSubscription.findOne({
      "paymentDetails.razorpaySubscriptionId": subscription.id,
    });

    if (userSubscription) {
      userSubscription.status = "paused";
      userSubscription.pausedAt = new Date();

      await userSubscription.save();
      console.log("Subscription paused for user:", userSubscription.userId);
    }
  } catch (error) {
    console.error("Error handling subscription paused:", error);
  }
}

async function handleSubscriptionResumed(subscription) {
  try {
    console.log("Subscription resumed:", subscription.id);

    // Find user subscription
    const userSubscription = await UserSubscription.findOne({
      "paymentDetails.razorpaySubscriptionId": subscription.id,
    });

    if (userSubscription) {
      userSubscription.status = "active";
      userSubscription.resumedAt = new Date();

      await userSubscription.save();
      console.log("Subscription resumed for user:", userSubscription.userId);
    }
  } catch (error) {
    console.error("Error handling subscription resumed:", error);
  }
}

export default router;
