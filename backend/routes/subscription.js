import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import razorpayService from '../services/razorpay.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Get current subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subscription = await Subscription.findOne({ userId, status: 'active' });
    const user = await User.findById(userId).select('plan subscriptionStatus trialEndsAt');

    res.json({
      success: true,
      data: {
        subscription,
        user: {
          plan: user.plan,
          status: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt
        }
      }
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription details'
    });
  }
});

// Create subscription
router.post('/create', authenticateToken, [
  body('plan').isIn(['starter', 'pro']).withMessage('Invalid plan'),
  body('currency').isIn(['INR', 'USD']).withMessage('Invalid currency'),
  body('billingPeriod').isIn(['monthly', 'yearly']).withMessage('Invalid billing period')
], async (req, res) => {
  try {
    const { plan, currency, billingPeriod } = req.body;
    const userId = req.user._id;

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({ userId, status: 'active' });
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }

    // Create Razorpay subscription
    const razorpaySubscription = await razorpayService.createSubscription(
      userId, 
      plan, 
      currency, 
      billingPeriod
    );

    // Save subscription to database
    const subscription = new Subscription({
      userId,
      razorpaySubscriptionId: razorpaySubscription.subscriptionId,
      razorpayPlanId: razorpaySubscription.planId,
      plan,
      status: 'active',
      currency,
      amount: razorpaySubscription.amount,
      billingPeriod,
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    });

    await subscription.save();

    // Update user plan
    await User.findByIdAndUpdate(userId, {
      plan,
      subscriptionStatus: 'active',
      subscriptionId: razorpaySubscription.subscriptionId
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// Upgrade subscription
router.post('/upgrade', authenticateToken, [
  body('plan').isIn(['pro']).withMessage('Can only upgrade to Pro plan'),
  body('currency').isIn(['INR', 'USD']).withMessage('Invalid currency'),
  body('billingPeriod').isIn(['monthly', 'yearly']).withMessage('Invalid billing period')
], async (req, res) => {
  try {
    const { plan, currency, billingPeriod } = req.body;
    const userId = req.user._id;

    // Cancel existing subscription
    const existingSubscription = await Subscription.findOne({ userId, status: 'active' });
    if (existingSubscription) {
      await razorpayService.cancelSubscription(existingSubscription.razorpaySubscriptionId);
      await Subscription.findByIdAndUpdate(existingSubscription._id, { status: 'cancelled' });
    }

    // Create new subscription
    const razorpaySubscription = await razorpayService.createSubscription(
      userId, 
      plan, 
      currency, 
      billingPeriod
    );

    const subscription = new Subscription({
      userId,
      razorpaySubscriptionId: razorpaySubscription.subscriptionId,
      razorpayPlanId: razorpaySubscription.planId,
      plan,
      status: 'active',
      currency,
      amount: razorpaySubscription.amount,
      billingPeriod,
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    });

    await subscription.save();

    // Update user plan
    await User.findByIdAndUpdate(userId, {
      plan,
      subscriptionStatus: 'active',
      subscriptionId: razorpaySubscription.subscriptionId
    });

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ userId, status: 'active' });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel with Razorpay
    await razorpayService.cancelSubscription(subscription.razorpaySubscriptionId);

    // Update subscription status
    await Subscription.findByIdAndUpdate(subscription._id, { status: 'cancelled' });

    // Update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'cancelled',
      plan: 'starter' // Downgrade to starter
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Get billing history
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.json({
        success: true,
        data: { invoices: [] }
      });
    }

    res.json({
      success: true,
      data: { invoices: subscription.invoices }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing history'
    });
  }
});

// Razorpay webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!razorpayService.verifyWebhookSignature(body, signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const subscriptionData = req.body.payload.subscription.entity;

    switch (event) {
      case 'subscription.charged':
        // Handle successful payment
        await handleSubscriptionCharged(subscriptionData);
        break;
      
      case 'subscription.cancelled':
        // Handle subscription cancellation
        await handleSubscriptionCancelled(subscriptionData);
        break;
      
      case 'subscription.paused':
        // Handle subscription pause
        await handleSubscriptionPaused(subscriptionData);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Helper functions for webhook handling
async function handleSubscriptionCharged(subscriptionData) {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      // Add invoice to subscription
      subscription.invoices.push({
        razorpayInvoiceId: subscriptionData.id,
        amount: subscriptionData.plan_item.amount,
        status: 'paid',
        paidAt: new Date(),
        createdAt: new Date()
      });

      // Update next billing date
      subscription.nextBillingDate = new Date(subscriptionData.current_end);
      subscription.status = 'active';

      await subscription.save();

      // Update user status
      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: 'active'
      });
    }
  } catch (error) {
    console.error('Handle subscription charged error:', error);
  }
}

async function handleSubscriptionCancelled(subscriptionData) {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = 'cancelled';
      await subscription.save();

      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: 'cancelled',
        plan: 'starter'
      });
    }
  } catch (error) {
    console.error('Handle subscription cancelled error:', error);
  }
}

async function handleSubscriptionPaused(subscriptionData) {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = 'paused';
      await subscription.save();

      await User.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: 'inactive'
      });
    }
  } catch (error) {
    console.error('Handle subscription paused error:', error);
  }
}

export default router;
