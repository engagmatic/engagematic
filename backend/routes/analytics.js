import express from 'express';
import usageService from '../services/usageService.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get usage statistics
    const usageStats = await usageService.getUsageStats(userId);
    
    // Get recent activity
    const recentContent = await Content.find({ userId })
      .populate('personaId', 'name')
      .populate('hookId', 'text')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate engagement metrics
    const totalContent = await Content.countDocuments({ userId });
    const avgEngagementScore = await Content.aggregate([
      { $match: { userId: userId, type: 'post' } },
      { $group: { _id: null, avgScore: { $avg: '$engagementScore' } } }
    ]);

    const engagementRate = avgEngagementScore.length > 0 ? Math.round(avgEngagementScore[0].avgScore) : 0;

    // Calculate pulse score (combination of usage and engagement)
    const pulseScore = Math.min(100, Math.round(
      (usageStats.current.postsGenerated + usageStats.current.commentsGenerated) * 2 + 
      engagementRate * 0.5
    ));

    res.json({
      success: true,
      data: {
        stats: {
          postsCreated: usageStats.current.postsGenerated,
          commentsGenerated: usageStats.current.commentsGenerated,
          engagementRate: `${engagementRate}%`,
          pulseScore: pulseScore,
          postsGrowth: `+${usageStats.growth.posts}%`,
          commentsGrowth: `+${usageStats.growth.comments}%`
        },
        usage: usageStats,
        recentActivity: recentContent
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const usageStats = await usageService.getUsageStats(userId);

    res.json({
      success: true,
      data: usageStats
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics'
    });
  }
});

// Get usage history
router.get('/usage/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 12 } = req.query;
    
    const usageHistory = await usageService.getUsageHistory(userId, parseInt(months));

    res.json({
      success: true,
      data: { usageHistory }
    });
  } catch (error) {
    console.error('Get usage history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage history'
    });
  }
});

// Get engagement analytics
router.get('/engagement', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get content with engagement scores
    const contentAnalytics = await Content.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate },
          type: 'post'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          avgEngagement: { $avg: '$engagementScore' },
          count: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate overall metrics
    const overallStats = await Content.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: { $cond: [{ $eq: ['$type', 'post'] }, 1, 0] } },
          totalComments: { $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] } },
          avgEngagement: { $avg: '$engagementScore' },
          totalTokens: { $sum: '$tokensUsed' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailyAnalytics: contentAnalytics,
        overallStats: overallStats[0] || {
          totalPosts: 0,
          totalComments: 0,
          avgEngagement: 0,
          totalTokens: 0
        }
      }
    });
  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get engagement analytics'
    });
  }
});

// Get content performance
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 10 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const topContent = await Content.find(query)
      .populate('personaId', 'name')
      .populate('hookId', 'text')
      .sort({ engagementScore: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { topContent }
    });
  } catch (error) {
    console.error('Get content performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content performance'
    });
  }
});

// Track content engagement (for future LinkedIn API integration)
router.post('/track/:contentId', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { engagement } = req.body; // likes, comments, shares, etc.
    const userId = req.user._id;

    const content = await Content.findOneAndUpdate(
      { _id: contentId, userId },
      { 
        $inc: { 
          'metrics.likes': engagement.likes || 0,
          'metrics.comments': engagement.comments || 0,
          'metrics.shares': engagement.shares || 0
        }
      },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Engagement tracked successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Track engagement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track engagement'
    });
  }
});

export default router;
