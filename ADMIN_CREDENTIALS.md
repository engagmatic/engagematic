# 🔐 Admin Credentials - LinkedInPulse

## ✅ Admin Account Created Successfully!

---

## 🔑 **LOGIN CREDENTIALS**

```
📧 Email:    admin@linkedinpulse.ai
🔑 Password: Admin@2025
```

**⚠️ IMPORTANT: Save these credentials securely!**

---

## 🔗 **Access URLs** (Local Development)

### **1. Login Page**
```
http://localhost:8080/auth/login
```

### **2. Admin Dashboard**
```
http://localhost:8080/admin
```

**Note:** You must login first before accessing the admin dashboard.

---

## 🚀 **How to Access Admin Dashboard:**

### **Step 1: Start Servers**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd spark-linkedin-ai-main
npm run dev
```

### **Step 2: Login**
1. Open: `http://localhost:8080/auth/login`
2. Enter email: `admin@linkedinpulse.ai`
3. Enter password: `Admin@2025`
4. Click "Sign In"

### **Step 3: Access Dashboard**
1. After login, navigate to: `http://localhost:8080/admin`
2. View all real-time metrics
3. Dashboard auto-refreshes every 60 seconds

---

## 📊 **What's Available in Admin Dashboard:**

### **Overview Metrics:**
- Total Users
- Active Users  
- Today's Signups
- Paid Users
- Conversion Rate
- MRR/ARR

### **Content Stats:**
- Total Posts Generated
- Total Comments Generated
- Profile Analyses
- Today's Activity

### **User Management:**
- Trial vs Paid breakdown
- Waitlist count
- Top content creators

### **System Health:**
- Database status
- Server uptime
- Memory usage

---

## 🌐 **Production Deployment URLs** (After Deploy)

### **Vercel/Netlify Frontend:**
```
https://linkedinpulse.vercel.app/auth/login
https://linkedinpulse.vercel.app/admin
```

### **Railway/Render Backend:**
```
https://linkedinpulse-api.railway.app/api/admin/dashboard
```

---

## 🔒 **Security Features:**

✅ **Admin-only access** - `isAdmin: true` in database  
✅ **JWT authentication** - Token required  
✅ **Middleware protection** - All routes secured  
✅ **Hidden from users** - No UI links  
✅ **Password hashed** - Bcrypt (10 rounds)  

---

## ⚙️ **Admin Privileges:**

- ✅ Unlimited posts/comments
- ✅ Unlimited profile analyses
- ✅ Full platform access
- ✅ Enterprise plan features
- ✅ Priority support
- ✅ Analytics access

---

## 🛠 **Troubleshooting:**

### **Can't Login?**
- Check MongoDB is running
- Verify backend server is on port 5000
- Check browser console for errors

### **Admin Dashboard Shows Error?**
- Ensure you're logged in first
- Check JWT token in localStorage
- Verify admin flag in database

### **No Data Showing?**
- Database might be empty
- Create some test users/content
- Check backend logs for errors

---

## 📝 **Change Admin Password:**

```bash
cd backend
node scripts/createAdmin.js
# Enter same email: admin@linkedinpulse.ai
# It will update password
```

---

## 🎉 **You're All Set!**

Your admin dashboard is ready. Access it at:

**http://localhost:8080/admin** (after login)

---

**Created:** 2025-01-21  
**Status:** ✅ Active  
**Access Level:** Full Admin  
**Plan:** Enterprise (Unlimited)

