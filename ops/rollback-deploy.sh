#!/usr/bin/env sh
set -eu

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <backend-tag> <frontend-tag> [--skip-backup]" >&2
  exit 1
fi

BACKEND_TAG="$1"
FRONTEND_TAG="$2"
SKIP_BACKUP="${3:-}"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-761990338651.dkr.ecr.ap-northeast-2.amazonaws.com/autowash-pro}"

if [ "$SKIP_BACKUP" != "--skip-backup" ]; then
  ./ops/backup-db.sh
fi

echo "Rolling back images to backend-$BACKEND_TAG and frontend-$FRONTEND_TAG..."
BACKEND_IMAGE="$IMAGE_REPOSITORY:backend-$BACKEND_TAG" FRONTEND_IMAGE="$IMAGE_REPOSITORY:frontend-$FRONTEND_TAG" \
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull backend frontend
BACKEND_IMAGE="$IMAGE_REPOSITORY:backend-$BACKEND_TAG" FRONTEND_IMAGE="$IMAGE_REPOSITORY:frontend-$FRONTEND_TAG" \
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d backend frontend
./ops/health-check.sh
