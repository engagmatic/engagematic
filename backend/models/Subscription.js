import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPlanId: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['starter', 'pro']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'cancelled', 'paused', 'expired']
  },
  currency: {
    type: String,
    required: true,
    enum: ['INR', 'USD']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  billingPeriod: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  invoices: [{
    razorpayInvoiceId: String,
    amount: Number,
    status: String,
    paidAt: Date,
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Index for better query performance
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
