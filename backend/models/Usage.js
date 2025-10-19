import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  postsGenerated: {
    type: Number,
    default: 0,
    min: 0
  },
  commentsGenerated: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTokensUsed: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one usage record per user per month
usageSchema.index({ userId: 1, month: 1 }, { unique: true });

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
