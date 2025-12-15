# CoreSignal API Debugging Guide

## Current Issue
Profile analyzer returns "LinkedIn profile not found" even for public profiles.

## What We've Done

### ✅ Configuration
- CoreSignal API key is configured: `rT5M97UDI3FEbLdDY7LHLtkrUUoOwhf0`
- No fallbacks - only CoreSignal is used
- Multiple endpoint strategies implemented

### ✅ Error Handling Improvements
- CoreSignal-specific error messages
- Detailed logging of all API calls
- Response structure logging

## How to Debug

### 1. Check Backend Console Logs
When you try to analyze a profile, check the backend console for:

```
🔍 Fetching profile from CoreSignal API...
🔍 Trying CoreSignal endpoint 1/4: Search by LinkedIn URL
   Method: GET
   URL: https://api.coresignal.com/cdapi/v1/person/search?linkedin_url=...
📡 CoreSignal response status: 200 OK (or 404, etc.)
📊 CoreSignal response (first 500 chars): ...
```

### 2. Common Issues

#### Issue: Profile Not in CoreSignal Database
**Symptom**: All endpoints return 404 or empty data
**Solution**: 
- CoreSignal may not have indexed this profile yet
- Try with a well-known public LinkedIn profile (e.g., Bill Gates, Elon Musk)
- Some profiles may not be in CoreSignal's database

#### Issue: API Authentication Error
**Symptom**: 401 or 403 status codes
**Solution**:
- Verify API key is correct
- Check if API key has proper permissions
- Ensure API key is in `.env` file

#### Issue: Rate Limit
**Symptom**: 429 status code
**Solution**:
- Wait a few minutes and try again
- Check your CoreSignal API quota

### 3. Test with Known Profile
Try analyzing a well-known public LinkedIn profile to verify the API is working:
- `https://www.linkedin.com/in/williamhgates`
- `https://www.linkedin.com/in/reidhoffman`
- `https://www.linkedin.com/in/satyanadella`

### 4. Check CoreSignal API Response
The backend now logs:
- Full response status
- Response headers
- First 500 characters of response
- Response structure

Look for these in the console logs to understand what CoreSignal is returning.

## Next Steps

1. **Check Backend Logs**: Look at the detailed logs when analyzing a profile
2. **Test with Known Profile**: Try a well-known public profile
3. **Verify API Key**: Ensure the API key has proper permissions
4. **Contact CoreSignal Support**: If the profile is public but not found, CoreSignal may need to index it

## API Endpoints Being Tried

1. `GET /cdapi/v1/person/search?linkedin_url={url}`
2. `GET /cdapi/v1/person/search?linkedin_username={username}`
3. `GET /cdapi/v1/person?linkedin_url={url}`
4. `GET /cdapi/v1/person?linkedin_username={username}`

All endpoints use:
- Header: `apikey: {your_api_key}`
- Header: `Authorization: Bearer {your_api_key}`

## Error Messages

The system now provides specific error messages:
- "Profile not found in CoreSignal database" - Profile not indexed
- "Invalid CoreSignal API key" - Authentication issue
- "Rate limit exceeded" - Too many requests
- "Incomplete profile data" - Partial data returned

