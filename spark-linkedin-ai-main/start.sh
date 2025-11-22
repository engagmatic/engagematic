#!/bin/bash

# Engagematic - Complete SaaS Application Startup Script

echo "🚀 Starting Engagematic SaaS Application..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Function to start backend
start_backend() {
    echo "📦 Starting Backend Server..."
    cd backend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        npm install
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found. Please create one with your configuration."
        echo "📝 Example .env file:"
        echo "NODE_ENV=development"
        echo "PORT=5000"
        echo "MONGODB_URI=your-mongodb-connection-string"
        echo "GOOGLE_AI_API_KEY=your-google-ai-api-key"
        echo "JWT_SECRET=your-jwt-secret"
        echo "RAZORPAY_KEY_ID=your-razorpay-key-id"
        echo "RAZORPAY_KEY_SECRET=your-razorpay-key-secret"
        echo "FRONTEND_URL=http://localhost:5173"
        exit 1
    fi
    
    echo "🔄 Starting backend server on port 5000..."
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd spark-linkedin-ai-main
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        npm install
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "📝 Creating frontend .env file..."
        echo "VITE_API_URL=http://localhost:5000/api" > .env
    fi
    
    echo "🔄 Starting frontend server on port 5173..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    cd ..
}

# Function to check if ports are available
check_ports() {
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 5000 is already in use. Please stop the process using this port."
        exit 1
    fi
    
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 5173 is already in use. Please stop the process using this port."
        exit 1
    fi
}

# Function to wait for servers to start
wait_for_servers() {
    echo "⏳ Waiting for servers to start..."
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend server is running at http://localhost:5000"
    else
        echo "❌ Backend server failed to start"
        exit 1
    fi
    
    # Check if frontend is running
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Frontend server is running at http://localhost:5173"
    else
        echo "❌ Frontend server failed to start"
        exit 1
    fi
}

# Function to show application info
show_info() {
    echo ""
    echo "🎉 Engagematic is now running!"
    echo "================================"
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📊 Health Check: http://localhost:5000/health"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open http://localhost:5173 in your browser"
    echo "2. Register a new account or login"
    echo "3. Create your first AI persona"
    echo "4. Generate LinkedIn content!"
    echo ""
    echo "🛑 To stop the servers, press Ctrl+C"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_ports
    start_backend
    start_frontend
    wait_for_servers
    show_info
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main
