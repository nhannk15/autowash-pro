#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <backup-file>" >&2
  exit 1
fi

BACKUP_FILE="$1"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${SERVICE:-mysql}"
TEST_DATABASE="${TEST_DATABASE:-autowash_restore_test}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

get_env() {
  (grep -E "^$1=" "$ENV_FILE" || true) | tail -n 1 | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//"
}

MYSQL_ROOT_PASSWORD="$(get_env MYSQL_ROOT_PASSWORD)"

echo "Creating isolated restore test database '$TEST_DATABASE'..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T "$SERVICE" mariadb \
  -u root \
  "-p$MYSQL_ROOT_PASSWORD" \
  -e "DROP DATABASE IF EXISTS \`$TEST_DATABASE\`; CREATE DATABASE \`$TEST_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T "$SERVICE" mariadb \
  -u root \
  "-p$MYSQL_ROOT_PASSWORD" \
  "$TEST_DATABASE" < "$BACKUP_FILE"

TABLE_COUNT="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T "$SERVICE" mariadb \
  -N \
  -u root \
  "-p$MYSQL_ROOT_PASSWORD" \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TEST_DATABASE';")"

echo "Restore test passed. Table count: $TABLE_COUNT"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T "$SERVICE" mariadb \
  -u root \
  "-p$MYSQL_ROOT_PASSWORD" \
  -e "DROP DATABASE IF EXISTS \`$TEST_DATABASE\`;"
