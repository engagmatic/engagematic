@echo off
echo Starting LinkedInPulse Backend and Frontend Servers...
echo.

echo Starting Backend Server on port 5000...
start "LinkedInPulse Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 8080...
start "LinkedInPulse Frontend" cmd /k "cd spark-linkedin-ai-main && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul

