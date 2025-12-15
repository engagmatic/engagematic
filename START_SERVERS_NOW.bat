@echo off
echo ========================================
echo Starting LinkedIn Pulse Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 8080)...
start "Frontend Server" cmd /k "cd /d %~dp0linkedin-pulse && npm run dev"

echo.
echo ========================================
echo Servers are starting!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend:     http://localhost:8080
echo.
echo Profile Analyzer: http://localhost:8080/tools/profile-analyzer
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

