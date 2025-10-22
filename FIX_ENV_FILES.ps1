# PowerShell script to fix environment files for LinkedInPulse

Write-Host "🔧 Fixing Environment Files for LinkedInPulse..." -ForegroundColor Cyan
Write-Host ""

# Fix Frontend .env
Write-Host "1️⃣ Fixing Frontend .env file..." -ForegroundColor Yellow
$frontendEnv = @"
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LinkedInPulse
VITE_APP_VERSION=1.0.0
"@

Set-Content -Path ".\spark-linkedin-ai-main\.env" -Value $frontendEnv
Write-Host "   ✅ Frontend .env updated to use localhost:5000" -ForegroundColor Green

# Create Backend .env
Write-Host ""
Write-Host "2️⃣ Creating Backend .env file..." -ForegroundColor Yellow
$backendEnv = @"
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://markitzenagency_db_user:Slb9AZ9M4CvW4xlB@cluster0.wabbygn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=linkedinpulse

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google AI
GOOGLE_AI_API_KEY=AIzaSyB_x5suyfwTsNkJcRy0qmEoEp9viuawxec

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Frontend URL - Must match Vite port
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
"@

Set-Content -Path ".\backend\.env" -Value $backendEnv
Write-Host "   ✅ Backend .env created with MongoDB and API keys" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Environment files fixed successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Terminal 1 - Start Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 - Start Frontend:" -ForegroundColor White
Write-Host "   cd spark-linkedin-ai-main" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Then open: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Login and Signup should now work!" -ForegroundColor Green
Write-Host ""

