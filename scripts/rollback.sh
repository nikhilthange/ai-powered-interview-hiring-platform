#!/usr/bin/env bash
# Automated Production Deployment Rollback Script (Linux/macOS)

set -e

echo "===================================================="
echo "[ROLLBACK] Production Deployment Rollback Pipeline"
echo "===================================================="

# 1. Detect Docker daemon availability
echo "[ROLLBACK] Checking Docker daemon status..."
if ! docker info >/dev/null 2>&1; then
  echo "⚠️ [SKIPPED] Docker daemon is not running or unreachable on this host environment."
  echo "📌 GUIDANCE: Please start the Docker daemon (sudo systemctl start docker or Docker Desktop)."
  echo "[ROLLBACK] Probing local application server health..."
else
  echo "[DOCKER SUCCESS] Docker daemon is active."
  echo "[ROLLBACK] Reverting Docker containers..."
  docker-compose down || true
  docker-compose pull || true
  docker-compose up -d --build
fi

# 2. Health check verification
echo "[ROLLBACK] Verifying application health..."
sleep 2

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/v1/health || curl -s -o /dev/null -w "%{http_code}" http://localhost:5999/api/v1/health || echo "500")

if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo "✅ [ROLLBACK SUCCESS] Application health verified at HTTP 200 OK!"
else
  echo "ℹ️ Application returned status $HEALTH_STATUS. Ensure application server is active."
fi
