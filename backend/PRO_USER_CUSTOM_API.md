# Pro User Custom API Implementation

## Overview
This document describes the implementation of a new custom API endpoint for Pro users that allows them to generate posts without relying on the hooks collection.

## Problem
Previously, when Pro users clicked "Generate Trending Hooks" and selected a trending hook, the system would send the trending hook ID to the regular `/posts/generate` endpoint. The regular endpoint validates `hookId` as a MongoDB ObjectId, which doesn't work for trending hooks with IDs like `trending_1761588509367_0`.

## Solution
Create a separate endpoint `/posts/generate-custom` that accepts `title` and `category` instead of `hookId`, allowing Pro users to generate posts with custom trending hooks without relying on the hooks collection.

## Changes Made

### 1. Backend - New API Endpoint
**File:** `backend/routes/content.js`

Added new endpoint `/posts/generate-custom`:
- Accepts `title` (string) and `category` (enum) instead of `hookId`
- Creates a custom hook object from the title and category
- Does not update hook usage count (hooks are not in the database)
- Same functionality as regular post generation otherwise

### 2. Backend - Validation Middleware
**File:** `backend/middleware/validation.js`

Added `validatePostGenerationWithoutHook` validation:
- Validates `topic` (10-500 characters)
- Validates `title` (5-100 characters)
- Validates `category` (must be: story, question, statement, challenge, insight)
- Optional `personaId` or `persona` object

### 3. Frontend - API Client
**File:** `spark-linkedin-ai-main/src/services/api.js`

Added `generatePostCustom()` method:
```javascript
async generatePostCustom(postData) {
  return this.request("/content/posts/generate-custom", {
    method: "POST",
    body: JSON.stringify(postData),
  });
}
```

### 4. Frontend - Hook
**File:** `spark-linkedin-ai-main/src/hooks/useContentGeneration.js`

Added `generatePostCustom` function that:
- Calls the custom API endpoint
- Handles success/error responses
- Returns the same structure as `generatePost`

### 5. Frontend - PostGenerator Component
**File:** `spark-linkedin-ai-main/src/pages/PostGenerator.tsx`

Updated `handleGeneratePost` function to:
- Check if user is a Pro user (`subscription?.plan === 'pro'`)
- Check if selected hook is a trending hook (`_id.startsWith('trending_')`)
- Use `/posts/generate-custom` API for Pro users with trending hooks
- Use `/posts/generate` API for all other cases

## API Usage

### For Pro Users with Trending Hooks
```json
POST /api/content/posts/generate-custom
{
  "topic": "my journey in coding",
  "title": "\"No-code\" is dead. Long live prompt engineering.",
  "category": "insight",
  "persona": {
    "name": "Startup Founder",
    "tone": "confident",
    ...
  }
}
```

### For All Other Users (Regular API)
```json
POST /api/content/posts/generate
{
  "topic": "my journey in coding",
  "hookId": "trending_1761588509367_0",
  "hookText": "\"No-code\" is dead. Long live prompt engineering.",
  "persona": {
    "name": "Startup Founder",
    "tone": "confident",
    ...
  }
}
```

## Benefits

1. **Cleaner Architecture:** Pro users don't need to use the hooks collection for custom trending hooks
2. **Better Validation:** Separate validation rules for custom posts
3. **Flexibility:** Pro users can use any title/category combination
4. **No Database Dependencies:** Trending hooks don't need to be stored in the database

## Testing

To test the new functionality:

1. Upgrade a user to Pro plan:
   ```bash
   node scripts/upgradeUserToPro.js user@example.com
   ```

2. In the frontend:
   - Login as Pro user
   - Go to Post Generator
   - Click "Generate Trending Hooks"
   - Select a trending hook
   - Click "Generate Post"

3. Check console logs for:
   - `🔥 Using custom API for pro user with trending hook`

4. Verify the post is generated successfully

## Notes

- The regular `/posts/generate` endpoint still supports trending hooks for non-Pro users by accepting `hookText` in the request body
- Pro users can still use regular hooks from the database if they want
- The custom API only affects post generation, comment generation remains unchanged
