# Admin Login Guide - LinkedInPulse

## ✅ Admin Authentication Overview

**Important:** Admin users use the **SAME login system** as regular users. There is NO separate admin login page.

## How It Works

1. **Admin users** have `isAdmin: true` flag in their database record
2. They login through the **regular login page** (`/auth/login`)
3. After login, they receive a JWT token (same as regular users)
4. The admin dashboard checks if the logged-in user has admin privileges
5. Only users with `isAdmin: true` can access `/admin` routes

## Admin Credentials

```
Email:    admin@linkedinpulse.ai
Password: Admin@2025
```

**⚠️ These credentials were created using the backend script and are stored in `ADMIN_CREDENTIALS.md`**

## How to Login as Admin

### Step 1: Start Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd spark-linkedin-ai-main
npm run dev
```

### Step 2: Login

1. Open your browser to: **http://localhost:8080/auth/login**
2. Enter admin email: `admin@linkedinpulse.ai`
3. Enter admin password: `Admin@2025`
4. Click "Sign In"
5. You'll be redirected to `/dashboard`

### Step 3: Access Admin Dashboard

1. Navigate to: **http://localhost:8080/admin**
2. You should see the admin dashboard with:
   - Total users statistics
   - Active users count
   - Content metrics (posts, comments)
   - Revenue data (MRR/ARR)
   - Top creators
   - Waitlist stats
   - System health

## What Admin Can See

### Dashboard Metrics
- **User Stats**: Total, Active, Trial, Paid users
- **Conversion Rates**: Trial to paid conversion
- **Content Activity**: Posts and comments generated
- **Revenue**: Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR)
- **Engagement**: Top content creators
- **Growth**: Signup trends and waitlist

### Admin Features
- ✅ View all users
- ✅ Real-time analytics
- ✅ System health monitoring
- ✅ Auto-refresh every 60 seconds
- ✅ Unlimited content generation (no quotas)
- ✅ Full platform access

## Technical Details

### Authentication Flow

1. **User submits login credentials** → `POST /api/auth/login`
2. **Backend verifies email/password** → Checks User model
3. **JWT token generated** → Contains `userId`
4. **Token stored in localStorage** → Frontend keeps user logged in
5. **User navigates to /admin** → Frontend React route
6. **AdminDashboard component mounts** → Calls `GET /api/admin/dashboard`
7. **Backend middleware checks**:
   - Valid JWT token? ✓
   - User exists? ✓
   - User has `isAdmin: true`? ✓
8. **If all checks pass** → Dashboard data returned
9. **If not admin** → 403 error, redirect to dashboard

### Admin Middleware (`backend/middleware/adminAuth.js`)

```javascript
export const adminOnly = [
  // 1. Verify JWT token
  async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json(...);
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  },
  // 2. Check admin flag
  async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required."
      });
    }
    next();
  }
];
```

## Troubleshooting

### "Access Denied" Error

**Problem:** Getting 403 error when accessing `/admin`

**Solutions:**
1. Verify you're logged in with admin credentials
2. Check localStorage has a token: `localStorage.getItem('token')`
3. Verify admin flag in database:
   ```javascript
   // In MongoDB
   db.users.findOne({ email: 'admin@linkedinpulse.ai' })
   // Should show: isAdmin: true
   ```
4. Clear localStorage and login again: `localStorage.clear()`

### "Invalid Token" Error

**Problem:** Getting 401 error

**Solutions:**
1. Token might be expired (7 days expiry)
2. Logout and login again
3. Check JWT_SECRET matches between sessions
4. Clear cache and localStorage

### Admin Dashboard Not Loading

**Problem:** Blank page or spinner forever

**Solutions:**
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check Network tab for failed API calls
4. Ensure MongoDB is connected
5. Verify CORS settings allow localhost:8080

### Can't Create Admin User

**Problem:** Script fails or admin not working

**Solutions:**
1. Run the admin creation script:
   ```bash
   cd backend
   npm run create-admin
   ```
2. Or manually in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: 'admin@linkedinpulse.ai' },
     { $set: { isAdmin: true } }
   )
   ```

## Security Notes

### Admin Security Features
- ✅ Same robust authentication as regular users
- ✅ JWT tokens with expiration
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Middleware protection on all admin routes
- ✅ No public links to admin panel
- ✅ Admin-only API endpoints

### Best Practices
1. **Change the default admin password** immediately
2. **Don't expose admin credentials** in code or commits
3. **Use environment variables** for production
4. **Enable 2FA** in production (future enhancement)
5. **Monitor admin access logs** (future enhancement)

## API Endpoints (Admin)

All admin endpoints require a valid JWT token with `isAdmin: true`:

```
GET  /api/admin/dashboard       - Get dashboard stats
GET  /api/admin/users           - List all users (paginated)
GET  /api/admin/analytics/usage - Content usage analytics
GET  /api/admin/waitlist        - Waitlist management
GET  /api/admin/health          - System health check
```

## Changing Admin Password

### Method 1: Using Script
```bash
cd backend
node scripts/createAdmin.js
# Enter email: admin@linkedinpulse.ai
# Enter new password
# Confirm new password
```

### Method 2: Direct Database Update
```javascript
// In MongoDB shell or Compass
const bcrypt = require('bcryptjs');
const newPassword = bcrypt.hashSync('NewPassword123', 12);

db.users.updateOne(
  { email: 'admin@linkedinpulse.ai' },
  { $set: { password: newPassword } }
);
```

## Summary

✅ **Admin login uses the regular `/auth/login` page**  
✅ **No separate admin authentication system**  
✅ **Admin access controlled by `isAdmin` database flag**  
✅ **All fixes for regular login also fix admin login**  
✅ **Same JWT tokens, same authentication flow**  
✅ **Dashboard protected by middleware checking admin status**

---

**The authentication fixes made for regular users ALSO fixed admin login! 🎉**

You just need to:
1. Create the `.env` files as instructed
2. Start both servers
3. Login at `/auth/login` with admin credentials
4. Navigate to `/admin` to see the dashboard


