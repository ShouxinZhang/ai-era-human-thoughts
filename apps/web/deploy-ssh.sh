#!/bin/bash

set -euo pipefail

HOST="${1:-}" # e.g. root@119.29.70.127
KEY_PATH="${KEY_PATH:-$HOME/.ssh/id_ed25519}"
PM2_NAME="${PM2_NAME:-ai-thoughts}"
PORT="${PORT:-3000}"

if [ -z "$HOST" ]; then
  echo "Usage: bash apps/web/deploy-ssh.sh <user@host>"
  echo "Example: bash apps/web/deploy-ssh.sh root@119.29.70.127"
  exit 1
fi

SSH_BASE=(ssh -i "$KEY_PATH" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=8)

if [ ! -f "$KEY_PATH" ]; then
  echo "❌ SSH key not found: $KEY_PATH"
  echo "Set KEY_PATH to your private key path."
  exit 1
fi

echo "🔐 Checking SSH connectivity to $HOST ..."
if ! "${SSH_BASE[@]}" -o BatchMode=yes "$HOST" "echo ok" >/dev/null 2>&1; then
  echo "⚠️  SSH key auth failed."
  echo "Run one of these to install your public key (will prompt for password):"
  echo "  ssh-copy-id -i ${KEY_PATH}.pub $HOST"
  echo "  cat ${KEY_PATH}.pub | ssh $HOST 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'"
  exit 1
fi

echo "🔎 Locating app directory on server (via PM2 or common paths)..."
REMOTE_FIND='set -euo pipefail
PM2_NAME="'"$PM2_NAME"'"
PORT="'"$PORT"'"

find_by_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    return 1
  fi
  local cwd
  cwd=$(pm2 jlist 2>/dev/null | node -e "const fs=require('fs');const input=fs.readFileSync(0,'utf8');let j=[];try{j=JSON.parse(input)}catch(e){};const p=j.find(x=>x&&x.name===process.env.PM2_NAME);process.stdout.write((p&&p.pm2_env&&p.pm2_env.pm_cwd)||'')" PM2_NAME="$PM2_NAME")
  if [ -n "$cwd" ] && [ -d "$cwd" ]; then
    echo "$cwd"
    return 0
  fi
  return 1
}

find_by_paths() {
  for d in \
    /root/ai-era-human-thoughts/apps/web \
    /root/Documents/GitHub/ai-era-human-thoughts/apps/web \
    /home/*/ai-era-human-thoughts/apps/web \
    /home/*/Documents/GitHub/ai-era-human-thoughts/apps/web
  do
    if [ -d "$d" ] && [ -f "$d/restart.sh" ]; then
      echo "$d"
      return 0
    fi
  done
  return 1
}

APP_DIR=""
APP_DIR=$(find_by_pm2 || true)
if [ -z "$APP_DIR" ]; then
  APP_DIR=$(find_by_paths || true)
fi

if [ -z "$APP_DIR" ]; then
  echo "❌ Could not locate apps/web on server."
  echo "Tip: ensure the repo is cloned and PM2 process exists ($PM2_NAME)."
  exit 2
fi

echo "✅ APP_DIR=$APP_DIR"
cd "$APP_DIR"

echo "🚀 Running restart.sh ..."
PM2_NAME="$PM2_NAME" PORT="$PORT" bash ./restart.sh

echo "📊 PM2 status:" 
pm2 status "$PM2_NAME" || true

echo "🌐 Health check:" 
if command -v curl >/dev/null 2>&1; then
  curl -sSI "http://localhost:$PORT" | head -n 1 || true
fi
'

"${SSH_BASE[@]}" "$HOST" "$REMOTE_FIND"

echo "✅ Deploy finished."