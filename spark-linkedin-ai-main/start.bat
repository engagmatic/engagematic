@echo off
REM LinkedInPulse - Complete SaaS Application Startup Script for Windows

echo 🚀 Starting LinkedInPulse SaaS Application...
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Function to start backend
echo 📦 Starting Backend Server...
cd backend

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    npm install
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Please create one with your configuration.
    echo 📝 Example .env file:
    echo NODE_ENV=development
    echo PORT=5000
    echo MONGODB_URI=your-mongodb-connection-string
    echo GOOGLE_AI_API_KEY=your-google-ai-api-key
    echo JWT_SECRET=your-jwt-secret
    echo RAZORPAY_KEY_ID=your-razorpay-key-id
    echo RAZORPAY_KEY_SECRET=your-razorpay-key-secret
    echo FRONTEND_URL=http://localhost:5173
    pause
    exit /b 1
)

echo 🔄 Starting backend server on port 5000...
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Function to start frontend
echo 🎨 Starting Frontend Server...
cd spark-linkedin-ai-main

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    npm install
)

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating frontend .env file...
    echo VITE_API_URL=http://localhost:5000/api > .env
)

echo 🔄 Starting frontend server on port 5173...
start "Frontend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for servers to start
echo ⏳ Waiting for servers to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 LinkedInPulse is now running!
echo ================================
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/health
echo.
echo 📋 Next Steps:
echo 1. Open http://localhost:5173 in your browser
echo 2. Register a new account or login
echo 3. Create your first AI persona
echo 4. Generate LinkedIn content!
echo.
echo 🛑 To stop the servers, close the command windows
echo.
pause
