# LinkedIn Profile Analyzer Prompts

This directory contains the world-class LinkedIn profile analyzer prompt used by LinkedInPulse Profile Coach.

## Overview

The profile analyzer prompt is designed to:
- Analyze LinkedIn profiles across 5 key dimensions (Clarity, Positioning, Credibility, Relevance & Keywords, Tone & Personal Brand)
- Provide actionable optimization suggestions
- Generate tailored LinkedIn posts
- Return structured JSON output ready for UI rendering

## Files

- `profileAnalyzerPrompt.js` - The main prompt template with helper functions

## Usage

### Basic Usage

```javascript
import { buildProfileAnalyzerPrompt } from './prompts/profileAnalyzerPrompt.js';
import googleAI from './services/googleAI.js';

// Prepare profile data
const profileData = {
  userType: "Early Professional", // or "Student", "Senior Leader / Thought Leader", "Other"
  headline: "Software Engineer at Tech Corp",
  about: "I build scalable web applications...",
  roleIndustry: "Software Engineer | Technology",
  location: "San Francisco, CA",
  targetAudience: "Tech recruiters and hiring managers",
  mainGoal: "get interviews",
  additionalText: "" // Optional
};

// Build the prompt
const prompt = buildProfileAnalyzerPrompt(profileData);

// Generate analysis using your AI service
const response = await googleAI.generatePost("Profile Analysis", prompt, {
  name: "LinkedInPulse Profile Coach",
  tone: "professional",
  writingStyle: "analytical"
});

// Parse JSON response
const analysis = JSON.parse(response.content);
```

### Expected Output Structure

The prompt returns a JSON object with this structure:

```json
{
  "profile_score": 75,
  "summary_points": [
    "Strong headline, but the About section doesn't show your results yet.",
    "Great keywords, but your story feels generic. Add specific wins or examples.",
    "Your profile is 80% complete - add skills and a professional photo to boost visibility."
  ],
  "headline_suggestions": [
    "Software Engineer | Building Scalable Web Apps | Full-Stack Developer",
    "Full-Stack Developer | Transforming Ideas into Code | Open to Opportunities"
  ],
  "about_outline": "Start with a hook about your passion for building products. Include 2-3 sentences about your experience and key achievements. Add bullet points showing specific results (e.g., 'Built app serving 10K+ users'). End with what you're looking for or how to connect.",
  "quick_wins": [
    "Add a professional headshot photo",
    "Include 5-10 relevant skills (React, Node.js, AWS, etc.)",
    "Mention 2-3 concrete projects with metrics",
    "Add a custom LinkedIn profile URL",
    "Include location and industry keywords"
  ],
  "generated_post_intro": "Here's a LinkedIn post tailored to your profile and goal.",
  "generated_post": "Just shipped my first full-stack application that's now serving 10,000+ users. The journey from idea to production taught me more than any course could. Here's what I learned: 1) Start simple, iterate fast 2) User feedback is gold 3) Deployment is just the beginning. What's the biggest lesson you've learned from building something from scratch? #SoftwareEngineering #WebDevelopment"
}
```

## Key Features

### 1. Profile Analysis Dimensions

The prompt analyzes profiles across:
- **Clarity**: Clear communication of who they are and what they do
- **Positioning**: Value-driven messaging beyond job titles
- **Credibility**: Evidence of achievements and expertise
- **Relevance & Keywords**: SEO-friendly keyword usage
- **Tone & Personal Brand**: Human, confident, persona-appropriate tone

### 2. Persona-Specific Tailoring

- **Students**: Focus on potential, enthusiasm, and skills
- **Early Professionals**: Emphasize outcomes, domain expertise, and role
- **Senior Leaders**: Highlight vision, leadership, and thought leadership

### 3. LinkedIn Post Generation

Generates one high-quality post (80-160 words) that:
- Matches the user's persona and goals
- Feels natural and human
- Uses appropriate tone (emojis for students/early pros, professional for leaders)
- Includes 0-3 relevant hashtags max

## Integration Notes

- The prompt is designed to work with Google Generative AI (Gemini) or similar models
- Always parse the JSON response and handle parsing errors gracefully
- The prompt handles missing fields gracefully - never asks follow-up questions
- Output is ready for direct UI rendering in card-based layouts

## Best Practices

1. **Error Handling**: Always wrap JSON parsing in try-catch with fallback recommendations
2. **Validation**: Validate the returned JSON structure before using it
3. **Caching**: Consider caching analysis results for the same profile
4. **User Feedback**: Use the analysis to improve the prompt over time

## Updates

This prompt follows current LinkedIn best practices (2024) including:
- LinkedIn algorithm considerations (keyword density, SSI scoring)
- Mobile-first optimization
- Semantic search optimization
- Engagement signal optimization

