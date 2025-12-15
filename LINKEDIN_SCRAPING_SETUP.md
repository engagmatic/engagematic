# LinkedIn Profile Scraping Setup Guide

## 🎯 Best Options for LinkedIn Profile Scraping (Free/Trial Plans)

### 1. **Proxycurl** (RECOMMENDED - BEST FOR LINKEDIN) ⭐
- **Website**: https://nubela.co/proxycurl/
- **Free Tier**: 100 requests/month
- **Why it's best**: Specifically designed for LinkedIn, most reliable
- **Setup**:
  1. Sign up at https://nubela.co/proxycurl/
  2. Get your free API key
  3. Add to `backend/.env`:
     ```
     PROXYCURL_API_KEY=your_api_key_here
     ```

### 2. **RapidAPI LinkedIn Scraper** (Good Fallback)
- **Website**: https://rapidapi.com
- **Free Tier**: Varies by API (usually 100-500 requests/month)
- **Setup**:
  1. Sign up at https://rapidapi.com
  2. Search for "LinkedIn Profile Scraper" or "LinkedIn API"
  3. Subscribe to a free plan
  4. Get your API key
  5. Add to `backend/.env`:
     ```
     RAPIDAPI_KEY=your_api_key_here
     RAPIDAPI_HOST=linkedin-profile-scraper-api.p.rapidapi.com
  

## 🔄 Automatic Fallback System

The system automatically tries APIs in this order:
1. **Proxycurl** (if configured) - Best for LinkedIn
2. **RapidAPI** (if configured) - Good fallback
3. **SerpApi** (already configured) - Last resort

If one fails, it automatically tries the next one!

## ✅ Testing

After setup, test with a LinkedIn profile URL:
```
https://www.linkedin.com/in/username
```

The system will automatically use the best available API.

## 📝 Environment Variables

Add to `backend/.env`:
```env
# Proxycurl (Recommended)
PROXYCURL_API_KEY=your_proxycurl_key_here

# RapidAPI (Optional fallback)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=linkedin-profile-scraper-api.p.rapidapi.com

# SerpApi (Already configured)
SERPAPI_KEY=your_serpapi_key_here
```

## 🎁 Free Tier Limits

- **Proxycurl**: 100 requests/month (FREE)
- **RapidAPI**: Varies (usually 100-500/month FREE)
- **SerpApi**: 100 searches/month (FREE)

Total: ~300-700 free profile analyses per month!

