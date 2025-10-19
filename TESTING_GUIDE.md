# LinkedInPulse - Testing Guide

This guide will help you test all the features of the LinkedInPulse SaaS application to ensure everything is working correctly.

## 🧪 Pre-Testing Checklist

### Backend Setup
- [ ] MongoDB connection is working
- [ ] Google AI API key is valid
- [ ] Razorpay credentials are configured
- [ ] Environment variables are set correctly
- [ ] Backend server starts without errors

### Frontend Setup
- [ ] Frontend server starts without errors
- [ ] API URL is configured correctly
- [ ] All dependencies are installed

## 🔐 Authentication Testing

### 1. User Registration
**Test Steps:**
1. Navigate to `/auth/register`
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Start Free Trial"

**Expected Results:**
- [ ] User is registered successfully
- [ ] JWT token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] Success toast notification appears
- [ ] User data is saved in MongoDB

### 2. User Login
**Test Steps:**
1. Navigate to `/auth/login`
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"

**Expected Results:**
- [ ] User is logged in successfully
- [ ] JWT token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] Success toast notification appears

### 3. Authentication Persistence
**Test Steps:**
1. Login successfully
2. Refresh the page
3. Navigate to different routes

**Expected Results:**
- [ ] User remains logged in after refresh
- [ ] Protected routes are accessible
- [ ] User data is loaded correctly

## 👤 Persona Management Testing

### 1. Create Persona
**Test Steps:**
1. Navigate to dashboard
2. Click on persona management (if available)
3. Create a new persona:
   - Name: Professional Marketer
   - Description: A marketing professional with 5+ years experience
   - Tone: Professional
   - Industry: Marketing
   - Experience: Mid-level
   - Writing Style: Clear, data-driven, engaging

**Expected Results:**
- [ ] Persona is created successfully
- [ ] Persona appears in the list
- [ ] Success toast notification appears
- [ ] Persona is saved in MongoDB

### 2. Set Default Persona
**Test Steps:**
1. Create multiple personas
2. Set one as default

**Expected Results:**
- [ ] Only one persona can be default
- [ ] Default persona is used for content generation
- [ ] UI reflects the current default persona

## 🤖 Content Generation Testing

### 1. Post Generation
**Test Steps:**
1. Navigate to `/post-generator`
2. Fill in the form:
   - Topic: "My journey from junior developer to team lead"
   - Select a viral hook
3. Click "Generate Pulse Post"

**Expected Results:**
- [ ] Loading state is shown during generation
- [ ] AI generates relevant content
- [ ] Content includes the selected hook
- [ ] Engagement score is calculated
- [ ] Content is saved to database
- [ ] Usage counter is incremented
- [ ] Success toast notification appears

### 2. Comment Generation
**Test Steps:**
1. Navigate to `/comment-generator`
2. Paste a LinkedIn post content
3. Click "Make It Human"

**Expected Results:**
- [ ] Loading state is shown during generation
- [ ] AI generates relevant comment
- [ ] Comment is contextually appropriate
- [ ] Comment is saved to database
- [ ] Usage counter is incremented
- [ ] Success toast notification appears

### 3. Quota Management
**Test Steps:**
1. Generate content until quota is reached
2. Try to generate more content

**Expected Results:**
- [ ] Quota exceeded message appears
- [ ] User is prompted to upgrade
- [ ] Content generation is blocked
- [ ] Usage statistics are accurate

## 📊 Analytics Testing

### 1. Dashboard Statistics
**Test Steps:**
1. Generate some content
2. Navigate to dashboard
3. Check the statistics cards

**Expected Results:**
- [ ] Posts Created count is accurate
- [ ] Comments Generated count is accurate
- [ ] Engagement Rate is calculated
- [ ] Pulse Score is calculated
- [ ] Growth percentages are shown

### 2. Usage Statistics
**Test Steps:**
1. Navigate to analytics section
2. Check usage breakdown

**Expected Results:**
- [ ] Current month usage is shown
- [ ] Remaining quota is calculated
- [ ] Usage history is available
- [ ] Charts and graphs are displayed

## 💳 Subscription Testing

### 1. Plan Information
**Test Steps:**
1. Check pricing page
2. Verify plan details

**Expected Results:**
- [ ] Starter plan: 300 posts + 300 comments
- [ ] Pro plan: 2000 posts + 2000 comments
- [ ] Pricing is displayed correctly
- [ ] Currency toggle works (INR/USD)

### 2. Trial Management
**Test Steps:**
1. Register new account
2. Check trial status

**Expected Results:**
- [ ] 7-day trial is activated
- [ ] Trial end date is set correctly
- [ ] Trial status is tracked

## 🔧 API Testing

### 1. Health Check
**Test Steps:**
1. Visit `http://localhost:5000/health`

**Expected Results:**
- [ ] API responds with success status
- [ ] Timestamp is included
- [ ] Environment is shown

### 2. Authentication Endpoints
**Test Steps:**
1. Test registration endpoint
2. Test login endpoint
3. Test protected endpoints

**Expected Results:**
- [ ] All endpoints respond correctly
- [ ] Error handling works
- [ ] Validation is enforced

### 3. Content Generation Endpoints
**Test Steps:**
1. Test post generation endpoint
2. Test comment generation endpoint
3. Test quota checking

**Expected Results:**
- [ ] AI integration works
- [ ] Content is generated
- [ ] Quota is enforced
- [ ] Usage is tracked

## 🐛 Error Handling Testing

### 1. Network Errors
**Test Steps:**
1. Disconnect internet
2. Try to generate content

**Expected Results:**
- [ ] Error message is shown
- [ ] User is informed of the issue
- [ ] App doesn't crash

### 2. Invalid Input
**Test Steps:**
1. Submit empty forms
2. Enter invalid data

**Expected Results:**
- [ ] Validation errors are shown
- [ ] Forms prevent submission
- [ ] User feedback is clear

### 3. API Errors
**Test Steps:**
1. Use invalid API keys
2. Test with malformed requests

**Expected Results:**
- [ ] Error messages are user-friendly
- [ ] App handles errors gracefully
- [ ] No sensitive information is exposed

## 📱 Responsive Testing

### 1. Mobile Devices
**Test Steps:**
1. Test on mobile devices
2. Check responsive design

**Expected Results:**
- [ ] UI is mobile-friendly
- [ ] Touch interactions work
- [ ] Content is readable
- [ ] Forms are usable

### 2. Different Screen Sizes
**Test Steps:**
1. Test on tablets
2. Test on different desktop sizes

**Expected Results:**
- [ ] Layout adapts correctly
- [ ] Content is properly sized
- [ ] Navigation works on all sizes

## 🚀 Performance Testing

### 1. Loading Times
**Test Steps:**
1. Measure page load times
2. Test content generation speed

**Expected Results:**
- [ ] Pages load quickly
- [ ] Content generation is reasonable
- [ ] No unnecessary delays

### 2. Memory Usage
**Test Steps:**
1. Monitor memory usage
2. Test for memory leaks

**Expected Results:**
- [ ] Memory usage is reasonable
- [ ] No memory leaks detected
- [ ] Performance is stable

## ✅ Final Checklist

### Core Functionality
- [ ] User registration and login work
- [ ] Content generation works with AI
- [ ] Persona management functions
- [ ] Analytics and dashboard display data
- [ ] Quota management is enforced

### User Experience
- [ ] UI is intuitive and responsive
- [ ] Error messages are helpful
- [ ] Loading states are shown
- [ ] Success feedback is provided
- [ ] Navigation is smooth

### Security
- [ ] Authentication is secure
- [ ] API endpoints are protected
- [ ] Input validation works
- [ ] No sensitive data is exposed

### Performance
- [ ] App loads quickly
- [ ] Content generation is fast
- [ ] No memory leaks
- [ ] Responsive on all devices

## 🐛 Common Issues & Solutions

### Backend Issues
- **MongoDB Connection Error**: Check connection string and network
- **Google AI API Error**: Verify API key and quota
- **Razorpay Error**: Check credentials and webhook setup

### Frontend Issues
- **API Connection Error**: Check API URL and CORS settings
- **Authentication Error**: Verify JWT token handling
- **UI Issues**: Check Tailwind CSS and component imports

### Integration Issues
- **Content Generation Fails**: Check AI service and persona data
- **Analytics Not Loading**: Verify database queries and data flow
- **Subscription Issues**: Check Razorpay integration and webhooks

## 📞 Support

If you encounter issues during testing:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check network connectivity
5. Review the API documentation

---

**Happy Testing! 🎉**
