#!/bin/bash
# deploy/deploy.sh — Runs on VPS, called by GitHub Actions

set -e

# --- Load nvm (REQUIRED for non-interactive SSH sessions) ---
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"

# --- Config ---
APP_ROOT="/var/www/grasp.techviewai.com"
REPO_DIR="$APP_ROOT/grasp"
DEPLOY_DIR="$APP_ROOT/deploy"
FRONTEND_DEPLOY="$DEPLOY_DIR/frontend/dist"
LOG_FILE="$DEPLOY_DIR/deploy.log"
BRANCH="production"
SERVICE_NAME="grasp"
BACKEND_DIR="grasp-backend"
FRONTEND_DIR="grasp-react"
APP_PORT="4010"

# --- Logging ---
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

exec > >(tee -a "$LOG_FILE") 2>&1

log "=========================================="
log "DEPLOY STARTED"

# --- Step 1: Pull latest code ---
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
log "Git pull complete. Commit: $(git log -1 --oneline)"

# --- Step 2: Install backend dependencies ---
cd "$REPO_DIR/$BACKEND_DIR"
npm install --omit=dev
log "Backend npm install complete"

# --- Step 3: Run Prisma generate + push ---
npx prisma generate
npx prisma db push --skip-generate
log "Prisma generate + db push complete"

# --- Step 4: Restart backend service ---
sudo systemctl restart "$SERVICE_NAME"

sleep 5
if systemctl is-active --quiet "$SERVICE_NAME"; then
    log "Backend service is running"
else
    log "ERROR: Backend service failed to start"
    log "Check: sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi

# Verify API responds
if curl -sf "http://localhost:${APP_PORT}/api/v1/health" > /dev/null 2>&1; then
    log "API health check passed"
else
    log "WARNING: API health check failed (may still be starting up)"
fi

# --- Step 5: Build frontend ---
cd "$REPO_DIR/$FRONTEND_DIR"
npm install
npm run build

if [ ! -d "dist" ]; then
    log "ERROR: dist/ not found — frontend build failed"
    exit 1
fi
log "Frontend build successful"

# --- Step 6: Deploy frontend ---
rm -rf "$FRONTEND_DEPLOY"/*
cp -r dist/* "$FRONTEND_DEPLOY/"
sudo systemctl reload nginx
log "Frontend deployed, Nginx reloaded"

# --- Step 7: Status ---
log "DEPLOY COMPLETE"
log "Commit: $(git log -1 --oneline)"
log "=========================================="
