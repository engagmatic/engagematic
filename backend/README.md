# LinkedInPulse Backend API

A comprehensive Node.js/Express backend API for the LinkedInPulse SaaS application, featuring AI-powered content generation, subscription management, and analytics.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with user management
- **AI Content Generation**: Google Gemini integration for posts and comments
- **Subscription Management**: Razorpay integration for payments
- **Usage Tracking**: Quota management and analytics
- **Persona Management**: Custom AI personas for authentic content
- **Analytics Dashboard**: Real-time usage and engagement metrics

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google AI API key
- Razorpay account (for payments)

## 🛠 Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=linkedinpulse
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Google AI
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   
   # Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
   
   # Frontend
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Content Generation
- `POST /api/content/posts/generate` - Generate LinkedIn posts
- `POST /api/content/comments/generate` - Generate comments
- `GET /api/content/history` - Get content history
- `POST /api/content/save/:id` - Save content to favorites

### Persona Management
- `GET /api/personas` - Get user personas
- `POST /api/personas` - Create persona
- `PUT /api/personas/:id` - Update persona
- `DELETE /api/personas/:id` - Delete persona

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/usage` - Usage statistics
- `GET /api/analytics/engagement` - Engagement metrics

### Subscription Management
- `GET /api/subscription/current` - Current subscription
- `POST /api/subscription/create` - Create subscription
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/cancel` - Cancel subscription

## 🗄 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  plan: String (starter/pro),
  subscriptionStatus: String,
  trialEndsAt: Date
}
```

### Usage Model
```javascript
{
  userId: ObjectId,
  month: String (YYYY-MM),
  postsGenerated: Number,
  commentsGenerated: Number,
  totalTokensUsed: Number
}
```

### Content Model
```javascript
{
  userId: ObjectId,
  type: String (post/comment),
  content: String,
  topic: String,
  personaId: ObjectId,
  engagementScore: Number
}
```

## 🔧 Configuration

### Plan Limits
- **Starter**: 300 posts + 300 comments/month, 3 personas
- **Pro**: 2000 posts + 2000 comments/month, 10 personas

### Pricing
- **Starter**: ₹299/$9 monthly, ₹2499/$89 yearly
- **Pro**: ₹799/$18 monthly, ₹6499/$159 yearly

## 🚀 Deployment

1. **Production Environment**:
   ```bash
   NODE_ENV=production npm start
   ```

2. **Environment Variables**: Update all production values in `.env`

3. **Database**: Ensure MongoDB Atlas is properly configured

4. **Webhooks**: Configure Razorpay webhooks to point to your production URL

## 📊 Monitoring

- Health check: `GET /health`
- Error logging: Console and MongoDB
- Rate limiting: 100 requests per 15 minutes per IP

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT License - see LICENSE file for details
