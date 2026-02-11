#!/bin/bash

echo "🏢 Setting up Desk Booking System..."

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo ""
echo "🗄️  Initializing database..."
mkdir -p database
npm run db:init

echo ""
echo "✅ Backend setup complete!"

# Setup frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup finished!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd demo/DeskBooking/backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd demo/DeskBooking/frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
