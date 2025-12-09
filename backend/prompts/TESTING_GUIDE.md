# Testing Guide: LinkedInPulse Profile Coach

## Overview

The LinkedInPulse Profile Coach is a new standalone tool for testing the world-class profile analyzer prompt. It's available at `/api/profile-coach` and can be tested independently before integration.

## Endpoints

### 1. Test Endpoint (No Authentication Required)

**POST** `/api/profile-coach/test`

Perfect for quick testing without needing authentication.

#### Example Request

```bash
curl -X POST http://localhost:5000/api/profile-coach/test \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "Early Professional",
    "headline": "Software Engineer at Tech Corp",
    "about": "I build scalable web applications using React and Node.js. Passionate about clean code and user experience.",
    "roleIndustry": "Software Engineer | Technology",
    "location": "San Francisco, CA",
    "targetAudience": "Tech recruiters and hiring managers",
    "mainGoal": "get interviews",
    "additionalText": ""
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
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
  },
  "tokensUsed": 450,
  "error": null,
  "message": "Test analysis completed successfully"
}
```

### 2. Authenticated Endpoint

**POST** `/api/profile-coach/analyze`

Requires authentication token. Use this for production testing.

#### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

#### Request Body

Same as test endpoint above.

## Test Cases

### Test Case 1: Student Profile

```json
{
  "userType": "Student",
  "headline": "Computer Science Student at MIT",
  "about": "Currently studying computer science. Interested in software development and AI.",
  "roleIndustry": "Student | Computer Science",
  "location": "Cambridge, MA",
  "targetAudience": "Tech companies and recruiters",
  "mainGoal": "get internships",
  "additionalText": ""
}
```

### Test Case 2: Early Professional

```json
{
  "userType": "Early Professional",
  "headline": "Marketing Manager | Growing Brands Through Digital Strategy",
  "about": "I help B2B SaaS companies scale their marketing efforts. Specialized in content marketing and growth hacking.",
  "roleIndustry": "Marketing Manager | Technology",
  "location": "New York, NY",
  "targetAudience": "B2B SaaS companies",
  "mainGoal": "attract clients",
  "additionalText": ""
}
```

### Test Case 3: Senior Leader

```json
{
  "userType": "Senior Leader / Thought Leader",
  "headline": "CTO | Building High-Performance Engineering Teams",
  "about": "20+ years of experience leading engineering teams at scale. Former VP Engineering at Fortune 500 companies. Passionate about building products that matter.",
  "roleIndustry": "CTO | Technology",
  "location": "Silicon Valley, CA",
  "targetAudience": "Tech executives and board members",
  "mainGoal": "build credibility",
  "additionalText": ""
}
```

### Test Case 4: Minimal Data (Testing Graceful Handling)

```json
{
  "userType": "Other",
  "headline": "",
  "about": "",
  "roleIndustry": "",
  "location": "",
  "targetAudience": "",
  "mainGoal": "build credibility",
  "additionalText": ""
}
```

## Testing with Postman

1. **Import Collection**: Create a new request in Postman
2. **Set Method**: POST
3. **Set URL**: `http://localhost:5000/api/profile-coach/test`
4. **Set Headers**: 
   - `Content-Type: application/json`
5. **Set Body**: Select "raw" and "JSON", paste one of the test cases above
6. **Send Request**: Click "Send"

## Testing with JavaScript/Fetch

```javascript
async function testProfileCoach() {
  const response = await fetch('http://localhost:5000/api/profile-coach/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userType: "Early Professional",
      headline: "Software Engineer",
      about: "I build scalable applications",
      roleIndustry: "Software Engineer | Technology",
      location: "San Francisco, CA",
      targetAudience: "Tech recruiters",
      mainGoal: "get interviews",
    }),
  });

  const result = await response.json();
  console.log('Analysis Result:', result);
  
  if (result.success) {
    console.log('Profile Score:', result.data.profile_score);
    console.log('Summary Points:', result.data.summary_points);
    console.log('Generated Post:', result.data.generated_post);
  }
}

testProfileCoach();
```

## Testing with cURL (Command Line)

### Basic Test

```bash
curl -X POST http://localhost:5000/api/profile-coach/test \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "Early Professional",
    "headline": "Software Engineer",
    "about": "I build scalable web applications",
    "mainGoal": "get interviews"
  }'
```

### Pretty Print JSON Response

```bash
curl -X POST http://localhost:5000/api/profile-coach/test \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "Early Professional",
    "headline": "Software Engineer",
    "about": "I build scalable web applications",
    "mainGoal": "get interviews"
  }' | jq '.'
```

## What to Check

### ✅ Success Criteria

1. **Response Structure**: Should return valid JSON with all required fields
2. **Profile Score**: Should be between 0-100
3. **Summary Points**: Should have 3-5 actionable insights
4. **Headline Suggestions**: Should have 1-2 options, persona-appropriate
5. **About Outline**: Should be concise (3-5 sentences max)
6. **Quick Wins**: Should have 3-5 actionable items
7. **Generated Post**: Should be 80-160 words, persona-appropriate
8. **No Errors**: Should handle missing fields gracefully

### 🔍 Validation Checks

```javascript
// Validate response structure
const requiredFields = [
  'profile_score',
  'summary_points',
  'headline_suggestions',
  'about_outline',
  'quick_wins',
  'generated_post_intro',
  'generated_post'
];

requiredFields.forEach(field => {
  if (!result.data[field]) {
    console.error(`Missing field: ${field}`);
  }
});

// Validate score range
if (result.data.profile_score < 0 || result.data.profile_score > 100) {
  console.error('Invalid profile score:', result.data.profile_score);
}

// Validate arrays
if (!Array.isArray(result.data.summary_points)) {
  console.error('summary_points should be an array');
}

// Validate post length
const postLength = result.data.generated_post.split(' ').length;
if (postLength < 80 || postLength > 160) {
  console.warn(`Post length: ${postLength} words (expected 80-160)`);
}
```

## Performance Testing

### Response Time

Expected response time: 2-5 seconds (depends on AI API)

```javascript
const startTime = Date.now();
const response = await fetch('http://localhost:5000/api/profile-coach/test', {...});
const endTime = Date.now();
console.log(`Response time: ${endTime - startTime}ms`);
```

### Token Usage

Check `tokensUsed` in response to monitor API costs.

## Error Handling

### Test Error Scenarios

1. **Missing userType**: Should return 400 error
2. **Invalid userType**: Should return 400 error
3. **AI API Failure**: Should return fallback analysis
4. **Malformed JSON**: Should return 400 error

## Next Steps After Testing

1. **Review Results**: Check if the analysis quality meets expectations
2. **Compare with Old System**: Compare outputs with existing profile analyzer
3. **Gather Feedback**: Test with real user profiles
4. **Iterate Prompt**: Adjust prompt based on results
5. **Integrate**: Once satisfied, integrate into main profile analyzer service

## Troubleshooting

### Issue: "GOOGLE_AI_API_KEY not configured"

**Solution**: Make sure your `.env` file has `GOOGLE_AI_API_KEY` set.

### Issue: "Could not extract valid JSON from AI response"

**Solution**: The AI might be returning text instead of JSON. Check the raw response in logs. The service will fall back to a default analysis.

### Issue: CORS Error

**Solution**: Make sure your frontend URL is in the allowed origins in `server.js`.

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review the prompt in `backend/prompts/profileAnalyzerPrompt.js`
- Check the service implementation in `backend/services/linkedinProfileCoach.js`

