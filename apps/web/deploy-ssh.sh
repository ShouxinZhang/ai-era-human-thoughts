#!/bin/bash

set -euo pipefail

# ============== Configuration ==============
HOST="${1:-}" # e.g. root@119.29.70.127
KEY_PATH="${KEY_PATH:-$HOME/.ssh/id_ed25519}"
PM2_NAME="${PM2_NAME:-ai-thoughts}"
PORT="${PORT:-3000}"
USE_RSYNC="${USE_RSYNC:-auto}" # auto | yes | no

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -z "$HOST" ]; then
  echo "Usage: bash apps/web/deploy-ssh.sh <user@host>"
  echo "Example: bash apps/web/deploy-ssh.sh root@119.29.70.127"
  echo ""
  echo "Options (env vars):"
  echo "  KEY_PATH   - SSH private key path (default: ~/.ssh/id_ed25519)"
  echo "  USE_RSYNC  - auto|yes|no (default: auto, uses rsync if git pull fails)"
  exit 1
fi

SSH_OPTS="-i $KEY_PATH -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

if [ ! -f "$KEY_PATH" ]; then
  echo "❌ SSH key not found: $KEY_PATH"
  echo "Set KEY_PATH to your private key path."
  exit 1
fi

echo "🔐 Checking SSH connectivity to $HOST ..."
if ! ssh $SSH_OPTS -o BatchMode=yes "$HOST" "echo ok" >/dev/null 2>&1; then
  echo "⚠️  SSH key auth failed."
  echo "Run one of these to install your public key (will prompt for password):"
  echo "  ssh-copy-id -i ${KEY_PATH}.pub $HOST"
  exit 1
fi
echo "✅ SSH connected."

# ============== Locate remote app directory ==============
echo "🔎 Locating app directory on server..."
REMOTE_APP_DIR=$(ssh $SSH_OPTS "$HOST" 'pm2 jlist 2>/dev/null | grep -oP "\"pm_cwd\":\s*\"\K[^\"]+" | head -1 || true')

if [ -z "$REMOTE_APP_DIR" ]; then
  # Fallback: search common paths
  REMOTE_APP_DIR=$(ssh $SSH_OPTS "$HOST" '
    for d in /root/ai-era-human-thoughts/apps/web /home/*/ai-era-human-thoughts/apps/web; do
      [ -f "$d/restart.sh" ] && echo "$d" && exit 0
    done
  ' || true)
fi

if [ -z "$REMOTE_APP_DIR" ]; then
  echo "❌ Could not locate apps/web on server."
  echo "Tip: clone the repo first, or set remote path manually."
  exit 2
fi

REMOTE_REPO_ROOT="$(dirname "$(dirname "$REMOTE_APP_DIR")")"
echo "✅ Remote app dir: $REMOTE_APP_DIR"

# ============== Sync code ==============
sync_with_git() {
  echo "📥 Pulling latest code via git..."
  ssh $SSH_OPTS "$HOST" "cd '$REMOTE_REPO_ROOT' && git pull" 2>&1
}

sync_with_rsync() {
  echo "📦 Syncing code via rsync (bypassing GitHub access issues)..."
  rsync -avz --delete \
    --exclude='.next' \
    --exclude='node_modules' \
    --exclude='.local' \
    --exclude='.env.local' \
    -e "ssh $SSH_OPTS" \
    "$REPO_ROOT/" "$HOST:$REMOTE_REPO_ROOT/"
}

if [ "$USE_RSYNC" = "yes" ]; then
  sync_with_rsync
elif [ "$USE_RSYNC" = "no" ]; then
  sync_with_git
else
  # auto: try git first, fallback to rsync
  if ! sync_with_git; then
    echo "⚠️  git pull failed (network issue?). Falling back to rsync..."
    sync_with_rsync
  fi
fi

# ============== Build & Restart ==============
echo "🏗️  Building and restarting on server..."
ssh $SSH_OPTS "$HOST" "cd '$REMOTE_APP_DIR' && npm install && npm run build && pm2 restart '$PM2_NAME' || pm2 start npm --name '$PM2_NAME' -- start -- -p $PORT"

# ============== Health check ==============
echo "📊 PM2 status:"
ssh $SSH_OPTS "$HOST" "pm2 status '$PM2_NAME'" || true

echo "🌐 Health check:"
ssh $SSH_OPTS "$HOST" "curl -sI http://localhost:$PORT | head -1" || true

echo "✅ Deploy finished."