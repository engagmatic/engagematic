#!/bin/bash

# LinkedInPulse Payment System Setup Script
# This script helps set up the payment system for production

echo "🚀 LinkedInPulse Payment System Setup"
echo "====================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "✅ .env file created!"
    echo "⚠️  Please update backend/.env with your actual values"
else
    echo "✅ .env file already exists"
fi

# Check if required environment variables are set
echo ""
echo "🔍 Checking environment configuration..."

# Function to check env var
check_env_var() {
    if grep -q "^$1=your-" backend/.env; then
        echo "❌ $1 needs to be updated"
        return 1
    else
        echo "✅ $1 is configured"
        return 0
    fi
}

# Check critical variables
check_env_var "RAZORPAY_KEY_ID"
check_env_var "RAZORPAY_KEY_SECRET"
check_env_var "RAZORPAY_WEBHOOK_SECRET"
check_env_var "MONGODB_URI"
check_env_var "JWT_SECRET"

echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your actual Razorpay keys"
echo "2. Set up webhook URL in Razorpay dashboard"
echo "3. Test payment flow with test cards"
echo "4. Deploy to production"
echo ""
echo "📖 For detailed instructions, see PAYMENT_SYSTEM_SETUP.md"
echo ""
echo "🎉 Payment system is ready to go!"
