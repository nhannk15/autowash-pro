#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-.env}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${SERVICE:-mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
MAX_BACKUP_FILES="${MAX_BACKUP_FILES:-20}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

get_env() {
  (grep -E "^$1=" "$ENV_FILE" || true) | tail -n 1 | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//"
}

MYSQL_USER="$(get_env MYSQL_USER)"
MYSQL_PASSWORD="$(get_env MYSQL_PASSWORD)"
SPRING_DATASOURCE_URL="$(get_env SPRING_DATASOURCE_URL)"
DATABASE="$(get_env MYSQL_DATABASE)"
if [ -z "$DATABASE" ] && [ "$SPRING_DATASOURCE_URL" != "" ]; then
  DATABASE="$(printf '%s' "$SPRING_DATASOURCE_URL" | sed -n 's#.*3306/\([^?]*\).*#\1#p')"
fi

if [ -z "$DATABASE" ]; then
  echo "MYSQL_DATABASE is required, or provide a database name in SPRING_DATASOURCE_URL." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/autowash-$DATABASE-$TIMESTAMP.sql"

echo "Creating backup for database '$DATABASE'..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T "$SERVICE" mariadb-dump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  -u "$MYSQL_USER" \
  "-p$MYSQL_PASSWORD" \
  "$DATABASE" > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
  echo "Backup file is empty: $BACKUP_FILE" >&2
  exit 1
fi

echo "Backup saved: $BACKUP_FILE"

if [ "$RETENTION_DAYS" -gt 0 ]; then
  find "$BACKUP_DIR" -type f -name 'autowash-*.sql' -mtime +"$RETENTION_DAYS" -delete
  echo "Retention cleanup: removed backups older than $RETENTION_DAYS days."
fi

if [ "$MAX_BACKUP_FILES" -gt 0 ]; then
  BACKUP_COUNT="$(find "$BACKUP_DIR" -type f -name 'autowash-*.sql' | wc -l | tr -d ' ')"
  if [ "$BACKUP_COUNT" -gt "$MAX_BACKUP_FILES" ]; then
    find "$BACKUP_DIR" -type f -name 'autowash-*.sql' -printf '%T@ %p\n' |
      sort -rn |
      awk -v keep="$MAX_BACKUP_FILES" 'NR > keep { sub(/^[^ ]+ /, ""); print }' |
      xargs -r rm -f
  fi
  echo "Retention cleanup: keeping latest $MAX_BACKUP_FILES backup files."
fi
