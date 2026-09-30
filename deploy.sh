#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Automated Deployment Script for Sahaay (PM2 & CARF standalone integration)
# ---------------------------------------------------------------------------

echo "=========================================="
echo "Starting Sahaay deployment..."
echo "=========================================="

# Resolve script directory and project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "/opt/sahaay/my-app" ]; then
  PROJECT_DIR="/opt/sahaay"
  APP_DIR="/opt/sahaay/my-app"
elif [ -d "${SCRIPT_DIR}/my-app" ]; then
  PROJECT_DIR="${SCRIPT_DIR}"
  APP_DIR="${SCRIPT_DIR}/my-app"
else
  echo "[ERROR] Could not resolve project directory (my-app not found)." >&2
  exit 1
fi

echo "[1/4] Project directory resolved:"
echo "      - Root: ${PROJECT_DIR}"
echo "      - App:  ${APP_DIR}"

# Navigate to project repository root to update Git branch
cd "${PROJECT_DIR}"

echo "[2/4] Fetching and checking out the latest main branch..."
git fetch origin main
git checkout main
git pull origin main

DEPLOYED_SHA="$(git rev-parse HEAD)"
SHORT_SHA="$(git rev-parse --short HEAD)"
COMMIT_MSG="$(git log -1 --pretty=%B | head -n 1)"

echo "      - Latest commit: ${SHORT_SHA} (${DEPLOYED_SHA})"
echo "      - Commit message: ${COMMIT_MSG}"

# Install dependencies and build the application
cd "${APP_DIR}"

echo "[3/4] Installing dependencies and building application..."
npm install
npm run build

# Reload PM2 application with zero downtime
echo "[4/4] Reloading PM2 process 'sahaay'..."
pm2 reload sahaay

echo "=========================================="
echo "Deployment successful!"
echo "Deployed commit SHA: ${DEPLOYED_SHA}"
echo "PM2 process 'sahaay' reloaded with zero downtime."
echo "=========================================="
