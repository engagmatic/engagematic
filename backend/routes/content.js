import express from 'express';
import Content from '../models/Content.js';
import Hook from '../models/Hook.js';
import Persona from '../models/Persona.js';
import googleAIService from '../services/googleAI.js';
import usageService from '../services/usageService.js';
import { authenticateToken, checkTrialStatus } from '../middleware/auth.js';
import { validatePostGeneration, validateCommentGeneration, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Generate LinkedIn post
router.post('/posts/generate', authenticateToken, checkTrialStatus, validatePostGeneration, async (req, res) => {
  try {
    const { topic, hookId, personaId } = req.body;
    const userId = req.user._id;

    // Check quota before generation
    const quotaCheck = await usageService.checkQuotaExceeded(userId, 'posts');
    if (quotaCheck.exceeded) {
      return res.status(429).json({
        success: false,
        message: 'Monthly post generation limit reached',
        code: 'QUOTA_EXCEEDED',
        data: quotaCheck
      });
    }

    // Get hook and persona
    const [hook, persona] = await Promise.all([
      Hook.findById(hookId),
      Persona.findById(personaId)
    ]);

    if (!hook) {
      return res.status(404).json({
        success: false,
        message: 'Hook not found'
      });
    }

    if (!persona || persona.userId.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }

    // Generate content using Google AI
    const aiResponse = await googleAIService.generatePost(topic, hook.text, persona);

    // Save generated content
    const content = new Content({
      userId,
      type: 'post',
      content: aiResponse.content,
      topic,
      hookId,
      personaId,
      engagementScore: aiResponse.engagementScore,
      tokensUsed: aiResponse.tokensUsed
    });

    await content.save();

    // Increment usage
    await usageService.incrementUsage(userId, 'posts', aiResponse.tokensUsed);

    // Update hook usage count
    await Hook.findByIdAndUpdate(hookId, { $inc: { usageCount: 1 } });

    res.json({
      success: true,
      message: 'Post generated successfully',
      data: {
        content: content,
        quota: await usageService.checkQuotaExceeded(userId, 'posts')
      }
    });
  } catch (error) {
    console.error('Post generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate post'
    });
  }
});

// Generate LinkedIn comment
router.post('/comments/generate', authenticateToken, checkTrialStatus, validateCommentGeneration, async (req, res) => {
  try {
    const { postContent, personaId } = req.body;
    const userId = req.user._id;

    // Check quota before generation
    const quotaCheck = await usageService.checkQuotaExceeded(userId, 'comments');
    if (quotaCheck.exceeded) {
      return res.status(429).json({
        success: false,
        message: 'Monthly comment generation limit reached',
        code: 'QUOTA_EXCEEDED',
        data: quotaCheck
      });
    }

    // Get persona
    const persona = await Persona.findById(personaId);
    if (!persona || persona.userId.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }

    // Generate content using Google AI
    const aiResponse = await googleAIService.generateComment(postContent, persona);

    // Save generated content
    const content = new Content({
      userId,
      type: 'comment',
      content: aiResponse.content,
      originalPostContent: postContent,
      personaId,
      tokensUsed: aiResponse.tokensUsed
    });

    await content.save();

    // Increment usage
    await usageService.incrementUsage(userId, 'comments', aiResponse.tokensUsed);

    res.json({
      success: true,
      message: 'Comment generated successfully',
      data: {
        content: content,
        quota: await usageService.checkQuotaExceeded(userId, 'comments')
      }
    });
  } catch (error) {
    console.error('Comment generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate comment'
    });
  }
});

// Get content history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      Content.find(query)
        .populate('personaId', 'name tone')
        .populate('hookId', 'text category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get content history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content history'
    });
  }
});

// Save content to favorites
router.post('/save/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const content = await Content.findOneAndUpdate(
      { _id: id, userId },
      { isSaved: true },
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
      message: 'Content saved successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Save content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save content'
    });
  }
});

// Get saved content
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      Content.find({ userId, isSaved: true })
        .populate('personaId', 'name tone')
        .populate('hookId', 'text category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments({ userId, isSaved: true })
    ]);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get saved content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved content'
    });
  }
});

// Delete content
router.delete('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const content = await Content.findOneAndDelete({ _id: id, userId });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content'
    });
  }
});

export default router;
