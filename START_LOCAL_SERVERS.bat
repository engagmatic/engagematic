@echo off
echo ========================================
echo Starting Frontend and Backend Servers
echo ========================================
echo.

cd /d %~dp0

echo [1/2] Starting Backend Server on port 5000...
start "Backend Server - Port 5000" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server on port 8080...
start "Frontend Server - Port 8080" cmd /k "cd /d %~dp0spark-linkedin-ai-main && npm run dev"

echo.
echo ========================================
echo Servers are starting!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend:     http://localhost:8080
echo.
echo Admin Dashboard: http://localhost:8080/admin/dashboard
echo Affiliate Dashboard: http://localhost:8080/affiliate/dashboard
echo Profile Analyzer: http://localhost:8080/profile-analyzer
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

