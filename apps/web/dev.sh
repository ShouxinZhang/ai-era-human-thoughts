#!/bin/bash

# Configuration
APP_DIR="/home/wudizhe001/Documents/GitHub/ai-era-human-thoughts/apps/web"
PORT=3000
export NEXT_PUBLIC_DATA_SOURCE=${NEXT_PUBLIC_DATA_SOURCE:-local}

echo "🛠️  Preparing local development environment..."

# Navigate to app directory
cd "$APP_DIR" || { echo "❌ Failed to navigate to $APP_DIR"; exit 1; }

# Check for process on port 3000 and kill it if exists
echo "🔍 Checking for existing service on port $PORT..."
find_pid() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -t -i:$PORT
  elif command -v ss >/dev/null 2>&1; then
    ss -lptn "sport = :$PORT" 2>/dev/null | awk -F'pid=|,' 'NR>1 {print $2}'
  elif command -v fuser >/dev/null 2>&1; then
    fuser $PORT/tcp 2>/dev/null
  else
    echo ""
  fi
}

PID=$(find_pid)
if [ -n "$PID" ]; then
  echo "⚠️  Port $PORT is occupied by PID $PID. Killing it..."
  kill -9 $PID
fi

# Double-check and force kill if still occupied
sleep 1
PID=$(find_pid)
if [ -n "$PID" ]; then
  echo "⚠️  Port $PORT is still occupied. Forcing release..."
  if command -v fuser >/dev/null 2>&1; then
    fuser -k -9 $PORT/tcp 2>/dev/null
  else
    kill -9 $PID
  fi
fi

# Kill any stale Next.js dev processes
echo "🧹 Checking for stale Next.js dev processes..."
PIDS=$(pgrep -f "next dev" || true)
if [ -n "$PIDS" ]; then
  echo "⚠️  Found Next.js dev processes: $PIDS. Killing them..."
  kill -9 $PIDS
fi

# Clean turbopack cache and dev lock to avoid lock issues
if [ -d ".next" ]; then
  echo "🧼 Cleaning Turbopack cache and dev locks..."
  rm -rf .next/cache/turbopack .next/turbopack .next/dev/lock
fi

# Install dependencies (fast check)
echo "📦 Checking dependencies..."
npm install

# Initialize local database for development
if [ "$NEXT_PUBLIC_DATA_SOURCE" = "local" ]; then
  echo "🗄️  Initializing local database..."
  node scripts/local-init.mjs
fi

# Start Next.js in dev mode (fallback to 3001 if 3000 is still busy)
sleep 1
PID=$(find_pid)
if [ -n "$PID" ]; then
  echo "⚠️  Port $PORT is still in use. Falling back to 3001."
  PORT=3001
fi

echo "🚀 Launching Next.js development server (with hot-reload) on port $PORT..."
PORT=$PORT npm run dev
