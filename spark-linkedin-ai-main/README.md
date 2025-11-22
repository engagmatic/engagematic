# Engagematic - Complete SaaS Application

A full-stack LinkedIn content generation platform powered by AI, featuring subscription management, usage tracking, and analytics.

## 🚀 Features

### Frontend (React + Vite + TypeScript)
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: JWT-based login/register with protected routes
- **Content Generation**: AI-powered LinkedIn post and comment generation
- **Persona Management**: Create and manage custom AI personas
- **Analytics Dashboard**: Real-time usage statistics and engagement metrics
- **Responsive Design**: Mobile-first design with beautiful gradients and animations

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete API with authentication, content generation, and analytics
- **AI Integration**: Google Gemini API for intelligent content generation
- **Payment Processing**: Razorpay integration for subscription management
- **Usage Tracking**: Quota management and analytics
- **Security**: JWT authentication, rate limiting, input validation

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google AI API key
- Razorpay account (for payments)

## 🛠 Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
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

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd spark-linkedin-ai-main
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

## 🎯 Usage

1. **Register**: Create a new account with 7-day free trial
2. **Create Persona**: Set up your AI persona for authentic content
3. **Generate Content**: Create LinkedIn posts and comments using AI
4. **Track Usage**: Monitor your monthly quota and engagement
5. **Upgrade**: Subscribe to Pro plan for more features

## 💳 Pricing Plans

### Starter Plan
- **Price**: ₹299/$9 monthly, ₹2499/$89 yearly
- **Features**: 300 posts + 300 comments/month, 3 personas
- **Perfect for**: Individual creators and professionals

### Pro Plan
- **Price**: ₹799/$18 monthly, ₹6499/$159 yearly
- **Features**: 2000 posts + 2000 comments/month, 10 personas
- **Perfect for**: Power users and agencies

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Content Generation
- `POST /api/content/posts/generate` - Generate LinkedIn posts
- `POST /api/content/comments/generate` - Generate comments
- `GET /api/content/history` - Get content history

### Persona Management
- `GET /api/personas` - Get user personas
- `POST /api/personas` - Create persona
- `PUT /api/personas/:id` - Update persona

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/usage` - Usage statistics

### Subscription
- `GET /api/subscription/current` - Current subscription
- `POST /api/subscription/create` - Create subscription
- `POST /api/subscription/upgrade` - Upgrade plan

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

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas production database
2. Configure environment variables for production
3. Deploy to your preferred platform (Vercel, Railway, etc.)
4. Set up Razorpay webhooks

### Frontend Deployment
1. Update API URL in environment variables
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## 🔒 Security Features

- JWT authentication with secure token management
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet security headers

## 📊 Monitoring & Analytics

- Real-time usage tracking
- Engagement score calculation
- Monthly quota management
- Growth metrics and trends
- Content performance analytics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd spark-linkedin-ai-main
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@engagematic.com
- Documentation: [docs.linkedinpulse.com](https://docs.linkedinpulse.com)
- Issues: GitHub Issues

---

**Built with ❤️ for LinkedIn creators and professionals**
