# Profile Analyzer Prompt Implementation Guide

## What Was Created

A world-class LinkedIn profile analyzer prompt system that provides:
1. **Profile Analysis & Scoring** (0-100 score with 3-5 insights)
2. **Concrete Optimization Suggestions** (headline, about section, quick wins)
3. **LinkedIn Post Generation** (one tailored post per analysis)

## Files Created

1. **`profileAnalyzerPrompt.js`** - Main prompt template with helper function
2. **`README.md`** - Comprehensive documentation
3. **`example-usage.js`** - Example implementation code
4. **`IMPLEMENTATION_GUIDE.md`** - This file

## Quick Start

### Step 1: Import the Prompt

```javascript
import { buildProfileAnalyzerPrompt } from './prompts/profileAnalyzerPrompt.js';
```

### Step 2: Prepare Profile Data

```javascript
const profileData = {
  userType: "Early Professional", // Required: "Student", "Early Professional", "Senior Leader / Thought Leader", or "Other"
  headline: "Software Engineer at Tech Corp",
  about: "I build scalable applications...",
  roleIndustry: "Software Engineer | Technology",
  location: "San Francisco, CA",
  targetAudience: "Tech recruiters",
  mainGoal: "get interviews",
  additionalText: "" // Optional
};
```

### Step 3: Build and Use the Prompt

```javascript
const prompt = buildProfileAnalyzerPrompt(profileData);
const response = await googleAI.generatePost("Profile Analysis", prompt, {...});
const analysis = JSON.parse(extractJSON(response));
```

## Integration Options

### Option 1: Replace Existing Prompt

Replace the prompt in `backend/services/profileAnalyzer.js`:

```javascript
// In generateRecommendations method
import { buildProfileAnalyzerPrompt } from '../prompts/profileAnalyzerPrompt.js';

async generateRecommendations(profileData, scores) {
  const prompt = buildProfileAnalyzerPrompt({
    userType: this.detectUserType(profileData),
    headline: profileData.headline || "",
    about: profileData.about || profileData.summary || "",
    roleIndustry: `${profileData.role || ""} | ${profileData.industry || ""}`.trim(),
    location: profileData.location || "",
    targetAudience: profileData.targetAudience || "",
    mainGoal: profileData.mainGoal || "build credibility",
  });
  
  // ... rest of implementation
}
```

### Option 2: Add as New Method

Add a new method alongside the existing one:

```javascript
async generateRecommendationsV2(profileData, scores) {
  // Use the new prompt
  return await analyzeProfileWithNewPrompt(profileData);
}
```

### Option 3: Create New Service

Create a new service file that uses the prompt:

```javascript
// backend/services/profileAnalyzerV2.js
import { buildProfileAnalyzerPrompt } from '../prompts/profileAnalyzerPrompt.js';
import googleAI from './googleAI.js';

class ProfileAnalyzerV2 {
  async analyze(profileData) {
    // Implementation using new prompt
  }
}
```

## Output Structure

The prompt returns a strict JSON structure:

```json
{
  "profile_score": 75,
  "summary_points": ["...", "..."],
  "headline_suggestions": ["...", "..."],
  "about_outline": "...",
  "quick_wins": ["...", "..."],
  "generated_post_intro": "...",
  "generated_post": "..."
}
```

## Key Features

### 1. Persona-Aware Analysis
- **Students**: Focus on potential and enthusiasm
- **Early Professionals**: Emphasize outcomes and domain expertise
- **Senior Leaders**: Highlight vision and thought leadership

### 2. Five-Dimensional Analysis
- Clarity
- Positioning
- Credibility
- Relevance & Keywords
- Tone & Personal Brand

### 3. Actionable Output
- Ready-to-use headline suggestions
- Structured about section outline
- Quick wins checklist
- Generated LinkedIn post

## Error Handling

Always implement fallback logic:

```javascript
try {
  const analysis = await analyzeProfileWithNewPrompt(profileData);
  return analysis;
} catch (error) {
  console.error("Analysis failed:", error);
  return getFallbackAnalysis(profileData);
}
```

## Testing

Test with different user types and profile completeness levels:

```javascript
// Test cases
const testProfiles = [
  {
    userType: "Student",
    headline: "Computer Science Student",
    about: "",
    // ... minimal data
  },
  {
    userType: "Early Professional",
    headline: "Software Engineer",
    about: "Full profile with achievements...",
    // ... complete data
  },
  {
    userType: "Senior Leader / Thought Leader",
    headline: "CTO at Tech Corp",
    about: "20+ years experience...",
    // ... senior profile
  },
];
```

## Next Steps

1. **Integrate** the prompt into your existing service
2. **Test** with real profile data
3. **Iterate** based on user feedback
4. **Monitor** the quality of generated analyses
5. **Optimize** the prompt based on results

## Support

For questions or issues:
- Review `README.md` for detailed documentation
- Check `example-usage.js` for implementation examples
- Test with the provided fallback functions

