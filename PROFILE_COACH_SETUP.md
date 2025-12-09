# LinkedInPulse Profile Coach - New Tool Setup

## ✅ What Was Created

A new standalone tool for testing the world-class LinkedIn profile analyzer prompt. This is completely separate from your existing profile analyzer, so you can test it safely.

## 📁 Files Created

1. **`backend/prompts/profileAnalyzerPrompt.js`** - The world-class prompt template
2. **`backend/services/linkedinProfileCoach.js`** - New service that uses the prompt
3. **`backend/routes/profileCoach.js`** - API routes for testing
4. **`backend/test-profile-coach.js`** - Quick test script
5. **`backend/prompts/TESTING_GUIDE.md`** - Comprehensive testing guide
6. **`backend/prompts/README.md`** - Documentation
7. **`backend/prompts/example-usage.js`** - Example implementation

## 🚀 How to Test

### Option 1: Quick Test Script (Easiest)

```bash
cd backend
node test-profile-coach.js
```

This will run 4 test cases automatically and show you the results.

### Option 2: API Endpoint (No Auth Required)

Start your server, then test with:

```bash
curl -X POST http://localhost:5000/api/profile-coach/test \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "Early Professional",
    "headline": "Software Engineer at Tech Corp",
    "about": "I build scalable web applications using React and Node.js",
    "roleIndustry": "Software Engineer | Technology",
    "location": "San Francisco, CA",
    "targetAudience": "Tech recruiters",
    "mainGoal": "get interviews"
  }'
```

### Option 3: Postman/Thunder Client

1. Create a POST request to: `http://localhost:5000/api/profile-coach/test`
2. Set body to JSON with the test data above
3. Send request

## 📊 What You'll Get

The API returns a JSON response with:

```json
{
  "success": true,
  "data": {
    "profile_score": 75,
    "summary_points": ["...", "..."],
    "headline_suggestions": ["...", "..."],
    "about_outline": "...",
    "quick_wins": ["...", "..."],
    "generated_post_intro": "...",
    "generated_post": "..."
  },
  "tokensUsed": 450
}
```

## 🎯 Test Cases Included

The test script includes:
1. **Student Profile** - Tests student persona handling
2. **Early Professional** - Tests early career professional
3. **Senior Leader** - Tests thought leader persona
4. **Minimal Data** - Tests graceful handling of missing fields

## 🔧 Configuration

Make sure your `.env` file has:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

## 📝 API Endpoints

### Test Endpoint (No Auth)
- **POST** `/api/profile-coach/test`
- No authentication required
- Perfect for quick testing

### Production Endpoint (Auth Required)
- **POST** `/api/profile-coach/analyze`
- Requires JWT token
- Use for production testing

## ✅ Next Steps

1. **Start your server**: `npm start` or `npm run dev`
2. **Run the test script**: `node backend/test-profile-coach.js`
3. **Review the results**: Check if the analysis quality meets your expectations
4. **Test with real data**: Try with actual LinkedIn profiles
5. **Compare with old system**: See how it compares to your existing analyzer
6. **Iterate**: Adjust the prompt if needed based on results

## 🐛 Troubleshooting

### "GOOGLE_AI_API_KEY not configured"
- Check your `.env` file has the key set
- Restart your server after adding it

### "Could not extract valid JSON"
- The AI might be returning text instead of JSON
- Check server logs for the raw response
- The service will automatically use fallback analysis

### CORS Errors
- Make sure your frontend URL is in allowed origins in `server.js`
- For local testing, localhost is automatically allowed

## 📚 Documentation

- **Full Testing Guide**: `backend/prompts/TESTING_GUIDE.md`
- **Implementation Guide**: `backend/prompts/IMPLEMENTATION_GUIDE.md`
- **Prompt Documentation**: `backend/prompts/README.md`

## 🎉 Ready to Test!

The tool is ready to use. Start your server and run the test script to see it in action!

