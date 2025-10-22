@echo off
echo.
echo ================================================
echo    Fixing Environment Files for LinkedInPulse
echo ================================================
echo.

echo [1/2] Fixing Frontend .env file...
(
echo VITE_API_URL=http://localhost:5000/api
echo VITE_APP_NAME=LinkedInPulse
echo VITE_APP_VERSION=1.0.0
) > "spark-linkedin-ai-main\.env"
echo       Done! Frontend now points to localhost:5000
echo.

echo [2/2] Creating Backend .env file...
(
echo NODE_ENV=development
echo PORT=5000
echo.
echo # Database
echo MONGODB_URI=mongodb+srv://markitzenagency_db_user:Slb9AZ9M4CvW4xlB@cluster0.wabbygn.mongodb.net/?retryWrites=true^&w=majority^&appName=Cluster0
echo DB_NAME=linkedinpulse
echo.
echo # JWT
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRE=7d
echo.
echo # Google AI
echo GOOGLE_AI_API_KEY=AIzaSyB_x5suyfwTsNkJcRy0qmEoEp9viuawxec
echo.
echo # Razorpay
echo RAZORPAY_KEY_ID=your-razorpay-key-id
echo RAZORPAY_KEY_SECRET=your-razorpay-key-secret
echo RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
echo.
echo # Frontend URL - Must match Vite port
echo FRONTEND_URL=http://localhost:8080
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=1000
) > "backend\.env"
echo       Done! Backend .env created
echo.

echo ================================================
echo    Environment Files Fixed Successfully!
echo ================================================
echo.
echo Next Steps:
echo.
echo   Terminal 1 - Start Backend:
echo   cd backend
echo   npm install
echo   npm run dev
echo.
echo   Terminal 2 - Start Frontend:
echo   cd spark-linkedin-ai-main
echo   npm install  
echo   npm run dev
echo.
echo   Then open: http://localhost:8080
echo.
echo Login and Signup should now work!
echo.
pause

