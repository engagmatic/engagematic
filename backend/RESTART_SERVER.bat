@echo off
echo ====================================
echo  RESTARTING BACKEND SERVER
echo ====================================
echo.
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting server...
cd /d "%~dp0"
npm start

