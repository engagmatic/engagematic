# Free LinkedIn Profile Scraping Setup

## Overview

The Profile Coach now supports multiple free/freemium LinkedIn scraping APIs with automatic fallback.

## Free API Options

### 1. SerpApi (Recommended - FREE Tier)
- **Free Tier**: 100 searches/month
- **Sign Up**: https://serpapi.com
- **Get API Key**: Dashboard → API Key
- **Add to .env**: `SERPAPI_KEY=your_api_key_here`

### 2. RapidAPI (If you have a key)
- **Free Tier**: Limited (varies by API)
- **Add to .env**: `RAPIDAPI_KEY=your_api_key_here`

### 3. Simple Web Scraping (Fallback)
- **Free**: No API key needed
- **Limitation**: Limited data (LinkedIn blocks direct scraping)
- **Automatic**: Works if other APIs fail

## Setup Instructions

1. **Get SerpApi Key (Recommended)**:
   ```bash
   # Visit https://serpapi.com
   # Sign up for free account
   # Get your API key from dashboard
   ```

2. **Add to .env file**:
   ```env
   SERPAPI_KEY=your_serpapi_key_here
   RAPIDAPI_KEY=your_rapidapi_key_here  # Optional
   ```

3. **Restart your server**:
   ```bash
   npm start
   ```

## How It Works

The service tries APIs in this order:
1. **SerpApi** (if key is configured) - Best free option
2. **RapidAPI** (if key is configured) - Fallback
3. **Simple Web Scraping** - Last resort (limited data)

## Testing

Test the scraping:
```bash
curl -X POST http://localhost:5000/api/profile-coach/test \
  -H "Content-Type: application/json" \
  -d '{
    "profileUrl": "https://www.linkedin.com/in/username"
  }'
```

## Notes

- SerpApi free tier: 100 searches/month
- For production, consider upgrading to paid tier
- Web scraping fallback is limited but works for basic data

