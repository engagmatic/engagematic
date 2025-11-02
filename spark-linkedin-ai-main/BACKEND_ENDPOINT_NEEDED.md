# Backend Endpoint Required: Free Post Generation

## Overview
The frontend now includes a premium "Try Before Signup" flow that allows users to generate 1 free post without authentication. A backend endpoint is needed to support this feature.

## Required Endpoint

### POST `/api/content/posts/generate-free`

**Purpose:** Generate a LinkedIn post for unauthenticated users (1 free post per session/IP)

**Request Body:**
```json
{
  "topic": "string (required, 10-500 chars)",
  "hookId": "string (MongoDB ObjectId or 'default_free_hook')",
  "persona": {
    "id": "string",
    "name": "string",
    "industry": "string",
    "tone": "string",
    "writingStyle": "string",
    "description": "string",
    "icon": "string",
    "category": "string"
  },
  "audience": "string (optional)",
  "goal": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post generated successfully",
  "data": {
    "content": {
      "_id": "string",
      "content": "string (the generated post)",
      "engagementScore": number,
      "topic": "string",
      "createdAt": "ISO date string"
    }
  }
}
```

**Error Response (if already used):**
```json
{
  "success": false,
  "message": "You've already used your free post. Sign up to generate more!",
  "code": "FREE_POST_ALREADY_USED"
}
```

## Implementation Requirements

### 1. Rate Limiting
- Track usage via **session cookie** or **IP address**
- Limit to **1 free post per session/IP per 24 hours**
- Use Redis or similar for tracking (recommended) or in-memory cache with TTL

### 2. Authentication
- **NO authentication middleware** required
- Endpoint should be publicly accessible
- However, still validate input data

### 3. Validation
- Validate `topic` (10-500 characters)
- Validate `persona` object structure
- Validate `hookId` (or use default if not found)
- Handle optional `audience` and `goal` fields

### 4. Post Generation
- Use the same AI generation logic as authenticated users
- Use the same Google AI service
- Apply persona, hook, and topic to generate content
- Return engagement score if available

### 5. Usage Tracking
```javascript
// Example implementation
const trackFreePostUsage = async (identifier) => {
  // identifier = session ID or IP address
  const key = `free_post:${identifier}`;
  const exists = await redis.get(key);
  
  if (exists) {
    throw new Error("You've already used your free post. Sign up to generate more!");
  }
  
  // Set expiration to 24 hours
  await redis.setex(key, 86400, '1');
};
```

### 6. Session/IP Identification
```javascript
// Option 1: Session-based (recommended)
const sessionId = req.sessionID || req.headers['x-session-id'];

// Option 2: IP-based (fallback)
const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

// Use IP + User-Agent for better uniqueness
const identifier = `${ip}_${req.headers['user-agent']}`;
```

## Security Considerations

1. **Rate Limiting**: Prevent abuse with IP-based rate limiting (max 5 attempts per hour)
2. **Input Validation**: Sanitize all inputs to prevent injection attacks
3. **Token Limits**: Cap free post generation to reasonable token usage
4. **Monitoring**: Log all free post generations for analytics

## Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();
const redis = require('redis');
const client = redis.createClient();

// POST /api/content/posts/generate-free
router.post('/generate-free', async (req, res) => {
  try {
    // Get identifier (session or IP)
    const identifier = req.sessionID || 
      req.ip || 
      req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress;
    
    // Check if already used
    const key = `free_post:${identifier}`;
    const alreadyUsed = await client.get(key);
    
    if (alreadyUsed) {
      return res.status(429).json({
        success: false,
        message: "You've already used your free post. Sign up to generate more!",
        code: "FREE_POST_ALREADY_USED"
      });
    }
    
    // Validate input
    const { topic, hookId, persona, audience, goal } = req.body;
    
    if (!topic || topic.length < 10 || topic.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Topic must be between 10 and 500 characters"
      });
    }
    
    // Get or create hook
    let hook;
    if (hookId === "default_free_hook") {
      hook = {
        text: "Here's what changed everything:",
        category: "story"
      };
    } else {
      hook = await Hook.findById(hookId);
      if (!hook) {
        hook = {
          text: "Here's what changed everything:",
          category: "story"
        };
      }
    }
    
    // Generate post using Google AI service
    const aiResponse = await googleAIService.generatePost(
      topic,
      hook.text,
      persona,
      null, // linkedinInsights
      null, // profileInsights
      null  // userProfile
    );
    
    // Track usage (24 hour expiration)
    await client.setex(key, 86400, '1');
    
    // Save to database (optional, for analytics)
    const content = new Content({
      type: "post",
      content: aiResponse.content,
      topic,
      hookId: hookId === "default_free_hook" ? null : hookId,
      engagementScore: aiResponse.engagementScore,
      tokensUsed: aiResponse.tokensUsed,
      isFreePost: true,
      identifier // Store for analytics
    });
    await content.save();
    
    res.json({
      success: true,
      message: "Post generated successfully",
      data: {
        content: {
          _id: content._id,
          content: content.content,
          engagementScore: content.engagementScore,
          topic: content.topic,
          createdAt: content.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error("Free post generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate post",
      error: error.message
    });
  }
});

module.exports = router;
```

## Testing

Test the endpoint with:
```bash
curl -X POST http://localhost:5000/api/content/posts/generate-free \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "My journey from developer to tech lead",
    "hookId": "default_free_hook",
    "persona": {
      "name": "Startup Founder",
      "tone": "confident",
      "writingStyle": "storyteller"
    },
    "audience": "tech founders",
    "goal": "grow-followers"
  }'
```

## Notes

- This endpoint should be added to `backend/routes/content.js`
- No authentication middleware should be applied
- Consider adding analytics tracking for conversion metrics
- The frontend will handle displaying the result and prompting signup

