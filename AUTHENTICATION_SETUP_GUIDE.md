# Authentication Setup Guide

## Issues Fixed

1. **CORS Configuration**: Updated backend to accept frontend on port 8080 (matches Vite config)
2. **Token Storage**: Fixed registration to properly store authentication token
3. **Flexible CORS**: Added development-friendly CORS that accepts any localhost port

## Required Setup Steps

### 1. Backend Setup

Create a `.env` file in the `backend` directory with the following content:

```env
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

# Razorpay (optional for development)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Frontend URL - Must match Vite port
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 2. Frontend Setup

Create a `.env` file in the `spark-linkedin-ai-main` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Default hooks initialized
🚀 LinkedInPulse API server running on port 5000
📊 Environment: development
🌐 Frontend URL: http://localhost:8080
```

### 4. Start the Frontend

In a new terminal:

```bash
cd spark-linkedin-ai-main
npm install
npm run dev
```

The frontend will run on port 8080.

### 5. Test Authentication

**For Regular Users:**

1. Open http://localhost:8080
2. Click "Start Free Trial" on the homepage
3. Complete the registration form (4 steps)
4. You should be redirected to the dashboard upon successful registration

OR

1. Click "Sign In" if you already have an account
2. Enter your credentials
3. You should be redirected to the dashboard

**For Admin Access:**

1. Go to http://localhost:8080/auth/login
2. Login with admin credentials:
   - Email: `admin@linkedinpulse.ai`
   - Password: `Admin@2025`
3. After login, navigate to http://localhost:8080/admin
4. You should see the admin dashboard with all metrics

## What Was Fixed

### 1. CORS Configuration (backend/server.js)
- Changed from fixed origin to dynamic origin function
- Allows all localhost URLs in development mode
- Prevents "CORS policy" errors

### 2. Token Storage (spark-linkedin-ai-main/src/services/api.js)
- Registration now saves JWT token to localStorage
- Matches behavior of login endpoint
- Ensures user stays authenticated after signup

### 3. Default Frontend URL (backend/config/index.js)
- Changed from port 5173 to 8080
- Matches actual Vite configuration

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Ensure backend is running on port 5000
- Check backend console for errors
- Verify MongoDB connection string

### "CORS policy" errors
- Restart the backend server after creating .env file
- Verify FRONTEND_URL matches your actual frontend port
- Check browser console for the exact origin being blocked

### "Invalid token" or authentication fails
- Clear browser localStorage: `localStorage.clear()`
- Check that JWT_SECRET is set in backend .env
- Verify MongoDB is accessible

### Registration/Login doesn't redirect
- Open browser DevTools > Network tab
- Check for failed API calls
- Look for error messages in browser console
- Verify the response contains a token

## API Endpoints

All authentication endpoints are properly configured:

**Auth Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (works for both regular users and admins)
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)
- `POST /api/auth/logout` - Logout (requires token)

**Admin Endpoints** (require admin JWT token):
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics/usage` - Usage analytics
- `GET /api/admin/waitlist` - Waitlist management
- `GET /api/admin/health` - System health check

## Notes

- The backend config has fallback values, but creating .env files is recommended
- In development mode, CORS allows any localhost port
- JWT tokens expire after 7 days (configurable via JWT_EXPIRE)
- Passwords are hashed with bcrypt (12 salt rounds)

