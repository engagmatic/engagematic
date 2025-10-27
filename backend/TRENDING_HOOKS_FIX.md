# Trending Hooks Generation Fix

## Problem
When users click "Generate Trending Hooks", the same hooks were being generated repeatedly, even after upgrading to pro. No new or different hooks were being created.

## Root Cause
The AI prompt for generating trending hooks didn't include enough variation or context to ensure different results. It lacked:
1. Current date/time context
2. Random seed for variety
3. Instructions to avoid repetition
4. Emphasis on generating unique content

## Solution
Updated the trending hooks generation endpoint in `backend/routes/hooks.js` to include:

### 1. Current Date Context
- Added current date with full context (day, month, year, weekday)
- Helps AI understand temporal context

### 2. Timestamp and Random Seed
- Added `timestamp` (Date.now()) to each request
- Added random seed (0-1000) for additional variety
- Both embedded in the prompt to force AI to generate different content

### 3. Enhanced Prompt Instructions
- Added explicit instruction: "Make each hook UNIQUE and different from previous generations"
- Added: "Avoid repeating the same hooks"
- Added: "Use creative variations and different angles"
- Added: "Consider different industries and perspectives"

## Changes Made

**File:** `backend/routes/hooks.js` (lines 252-283)

**Before:**
```javascript
const prompt = `Generate 10 trending LinkedIn post hooks...
```

**After:**
```javascript
const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const timestamp = Date.now();
const randomSeed = Math.floor(Math.random() * 1000);

const prompt = `Generate 10 fresh, unique, and trending LinkedIn post hooks...
Today is ${currentDate}. Current timestamp: ${timestamp}, seed: ${randomSeed}

Requirements:
- Make each hook UNIQUE and different from previous generations
- Avoid repeating the same hooks
- Use creative variations and different angles
- Consider different industries and perspectives
...`;
```

## How It Works Now

1. **Each Request is Unique**: Timestamp + random seed ensures different generation context
2. **Time-Aware**: Current date helps AI understand temporal trends
3. **Explicit Uniqueness**: Clear instructions to avoid repetition
4. **Variety Focus**: Emphasis on creative variations and different perspectives

## Testing
1. Click "Generate Trending Hooks" button
2. Hooks should be different from previous generations
3. Repeat multiple times - each should return unique hooks
4. Hooks should be relevant to current topics/trends

## Expected Behavior
- ✅ Different hooks generated each time
- ✅ Hooks relevant to current trends
- ✅ Mix of categories (story, question, statement, challenge, insight)
- ✅ Fresh and unique content
- ✅ Professional but engaging tone

## Additional Fix - Function Name Correction
**Issue:** Error: `googleAIService.generateContent is not a function`

**Problem:** The code was calling a non-existent method `generateContent()`.

**Solution:** Changed to use the correct method `generateText()` which returns an object with a `text` property.

**Code Change:**
```javascript
// Before (broken)
const aiResponse = await googleAIService.generateContent(prompt);
const cleanedResponse = aiResponse.replace(/```json\n?/g, "").trim();

// After (working)
const aiResponse = await googleAIService.generateText(prompt);
const aiText = aiResponse.text;
const cleanedResponse = aiText.replace(/```json\n?/g, "").trim();
```

## Additional Fix - Hook Validation for Trending Hooks
**Issue:** Error: `Validation failed: hookId: Invalid hook ID format`

**Problem:** Trending hooks have dynamic IDs like `trending_1761588346261_0` which don't match the MongoDB ObjectId format required by validation.

**Solution:** 
1. Updated validation middleware to accept both MongoDB ObjectIds and trending hook IDs
2. Updated post generation route to handle trending hooks without database lookup
3. Modified frontend and extension to send hook text for trending hooks

**Code Changes:**

**File:** `backend/middleware/validation.js`
```javascript
// Before
body("hookId")
  .notEmpty()
  .withMessage("Hook ID is required")
  .isMongoId()
  .withMessage("Invalid hook ID format"),

// After
body("hookId")
  .notEmpty()
  .withMessage("Hook ID is required")
  .custom((value) => {
    // Accept both MongoDB ObjectIds and trending hook IDs
    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
    const trendingHookPattern = /^trending_\d+_\d+$/;
    return mongoIdPattern.test(value) || trendingHookPattern.test(value);
  })
  .withMessage("Invalid hook ID format"),
```

**File:** `backend/routes/content.js`
```javascript
// Handle both database hooks and trending hooks
let hook;
if (hookId.startsWith('trending_')) {
  // This is a trending hook (AI-generated)
  hook = {
    text: req.body.hookText || "Here's what changed everything:",
    category: "trending",
    isDefault: false
  };
  console.log("✅ Using trending hook:", hook.text);
} else {
  // Regular database hook
  hook = await Hook.findById(hookId);
  if (!hook) {
    return res.status(404).json({
      success: false,
      message: "Hook not found",
    });
  }
}
```

**File:** `spark-linkedin-ai-main/src/pages/PostGenerator.tsx`
```javascript
// Prepare post data - include hook text for trending hooks
const postData: any = {
  topic,
  hookId: selectedHook._id,
  ...personaData
};

// If it's a trending hook, include the hook text
if (selectedHook._id && selectedHook._id.startsWith('trending_')) {
  postData.hookText = selectedHook.text;
}

const result = await generatePost(postData);
```

**File:** `chrome-extension/content.js`
```javascript
body = {
  topic: topic.value,
  hookId: this.selectedHook._id,
  ...personaData,
};

// If it's a trending hook, include the hook text
if (this.selectedHook._id && this.selectedHook._id.startsWith('trending_')) {
  body.hookText = this.selectedHook.text;
}
```
