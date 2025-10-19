import mongoose from 'mongoose';

const hookSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Hook text is required'],
    unique: true,
    maxlength: [100, 'Hook text cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['story', 'question', 'statement', 'challenge', 'insight']
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
hookSchema.index({ category: 1, isActive: 1 });
hookSchema.index({ usageCount: -1 });

const Hook = mongoose.model('Hook', hookSchema);

export default Hook;
