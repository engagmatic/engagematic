@echo off
echo.
echo ============================================
echo   UPDATING .ENV FOR LINKEDIN ANALYZER
echo ============================================
echo.

cd backend

echo # LinkedIn Scraping API Keys (Optional - enhances profile analysis) >> .env
echo # Without these, the system uses AI-powered inference which still works great! >> .env
echo # Get Proxycurl API key from: https://nubela.co/proxycurl/ >> .env
echo PROXYCURL_API_KEY= >> .env
echo # Get RapidAPI key from: https://rapidapi.com/hub >> .env
echo RAPIDAPI_KEY= >> .env

echo.
echo ✅ Added LinkedIn API key configurations to backend/.env
echo.
echo 📝 Note: These API keys are OPTIONAL
echo    The LinkedIn Analyzer works perfectly without them using AI-powered inference!
echo.
echo 🚀 To enhance with real scraping:
echo    1. Get Proxycurl API key: https://nubela.co/proxycurl/
echo    2. Or get RapidAPI key: https://rapidapi.com/hub
echo    3. Add keys to backend/.env file
echo.
echo ============================================
pause

