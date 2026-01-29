#!/bin/bash

# Configuration
APP_DIR="/home/wudizhe001/Documents/GitHub/ai-era-human-thoughts/apps/web"
PM2_NAME="ai-thoughts"

echo "🚀 Starting restart process for $PM2_NAME..."

# Navigate to app directory
cd "$APP_DIR" || { echo "❌ Failed to navigate to $APP_DIR"; exit 1; }

# Pull latest changes (optional, but recommended for production)
echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building production bundle..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart "$PM2_NAME" || pm2 start npm --name "$PM2_NAME" -- start -- -p 3000

echo "✅ Restart complete. Check status with 'pm2 status'"
