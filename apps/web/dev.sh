#!/bin/bash

# Configuration
APP_DIR="/home/wudizhe001/Documents/GitHub/ai-era-human-thoughts/apps/web"
PORT=3000
export NEXT_PUBLIC_DATA_SOURCE=${NEXT_PUBLIC_DATA_SOURCE:-local}

echo "🛠️  Preparing local development environment..."

# Navigate to app directory
cd "$APP_DIR" || { echo "❌ Failed to navigate to $APP_DIR"; exit 1; }

# Check for process on port and only restart if it's our Next.js dev
echo "🔍 Checking for existing service on port $PORT..."
find_pid() {
  local port="$1"
  local pid=""

  if command -v lsof >/dev/null 2>&1; then
    pid=$(lsof -nP -t -iTCP:$port -sTCP:LISTEN | head -n 1)
  fi

  if [ -z "$pid" ] && command -v ss >/dev/null 2>&1; then
    pid=$(ss -lptn "sport = :$port" 2>/dev/null | awk -F'pid=|,fd=' 'NR>1 {print $2}' | head -n 1)
  fi

  if [ -z "$pid" ] && command -v fuser >/dev/null 2>&1; then
    pid=$(fuser $port/tcp 2>/dev/null | head -n 1)
  fi

  echo "$pid"
}

is_our_next_dev() {
  local pid="$1"
  if [ -z "$pid" ] || [ ! -d "/proc/$pid" ]; then
    return 1
  fi

  local cmdline
  cmdline=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null)
  local cwd
  cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null)

  if [[ "$cmdline" == *"next dev"* ]] && [[ "$cwd" == "$APP_DIR"* ]]; then
    return 0
  fi

  return 1
}

release_port_if_ours() {
  local port="$1"
  local pid
  pid=$(find_pid "$port")

  if [ -z "$pid" ]; then
    return 0
  fi

  if is_our_next_dev "$pid"; then
    echo "⚠️  Port $port is occupied by our dev process (PID $pid). Restarting..."
    kill -9 "$pid"
    sleep 1
    pid=$(find_pid "$port")
    if [ -n "$pid" ]; then
      echo "⚠️  Port $port is still occupied. Forcing release..."
      if command -v fuser >/dev/null 2>&1; then
        fuser -k -9 "$port"/tcp 2>/dev/null
      else
        kill -9 "$pid"
      fi
    fi
    return 0
  fi

  echo "⚠️  Port $port is occupied by another process (PID $pid)."
  return 1
}

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

# Start Next.js in dev mode with smart port reuse
sleep 1
if ! release_port_if_ours "$PORT"; then
  PORT=3001
  echo "↪️  Trying port $PORT..."
  if ! release_port_if_ours "$PORT"; then
    PORT=3002
    echo "↪️  Port 3001 is in use by another process. Falling back to $PORT."
  fi
fi

echo "🚀 Launching Next.js development server (with hot-reload) on port $PORT..."
PORT=$PORT npm run dev
