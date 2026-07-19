#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

check_url() {
  NAME="$1"
  URL="$2"
  if curl -fsS --max-time 10 "$URL" >/dev/null; then
    echo "OK $NAME $URL"
  else
    echo "Health check failed for $NAME ($URL)" >&2
    exit 1
  fi
}

check_url "frontend" "$BASE_URL"
check_url "backend-actuator" "$BACKEND_URL/actuator/health"
check_url "swagger" "$BACKEND_URL/swagger-ui/index.html"

docker compose ps
