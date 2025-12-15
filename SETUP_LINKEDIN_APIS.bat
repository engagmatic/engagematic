@echo off
echo ========================================
echo LinkedIn Profile Scraping API Setup
echo ========================================
echo.
echo This script will help you set up LinkedIn profile scraping APIs.
echo.
echo RECOMMENDED: Proxycurl (Best for LinkedIn)
echo - Website: https://nubela.co/proxycurl/
echo - Free Tier: 100 requests/month
echo - Sign up and get your API key
echo.
echo ALTERNATIVE: RapidAPI
echo - Website: https://rapidapi.com
echo - Search for "LinkedIn Profile Scraper"
echo - Free tier varies by API
echo.
echo ========================================
echo.
echo After getting your API keys, add them to backend/.env:
echo.
echo PROXYCURL_API_KEY=your_proxycurl_key_here
echo RAPIDAPI_KEY=your_rapidapi_key_here
echo RAPIDAPI_HOST=linkedin-profile-scraper-api.p.rapidapi.com
echo.
echo ========================================
echo.
echo Opening setup guide and API websites...
echo.

start https://nubela.co/proxycurl/
timeout /t 2 /nobreak >nul
start https://rapidapi.com
timeout /t 2 /nobreak >nul
start LINKEDIN_SCRAPING_SETUP.md

echo.
echo Setup guide opened! Follow the instructions to get your API keys.
echo.
pause

