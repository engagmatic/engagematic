@echo off
echo ========================================
echo  Starting LinkedInPulse Application
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd spark-linkedin-ai-main && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  SERVERS STARTED!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo.
echo Press any key to open the app in your browser...
pause >nul

start http://localhost:5173

echo.
echo Done! Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

