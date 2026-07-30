#!/usr/bin/env sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="backups/backup.log"
S3_BUCKET="${S3_BUCKET:-autowash-pro-db-backups}"

mkdir -p backups

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Starting scheduled backup ==="

# Step 1: Backup database
if ./ops/backup-db.sh; then
  log "Database backup completed."
else
  log "ERROR: Database backup failed!"
  exit 1
fi

# Step 2: Find the latest backup file
LATEST_BACKUP="$(ls -t backups/autowash-*.sql 2>/dev/null | head -n 1)"
if [ -z "$LATEST_BACKUP" ]; then
  log "ERROR: No backup file found!"
  exit 1
fi

# Step 3: Upload to S3
log "Uploading $LATEST_BACKUP to s3://$S3_BUCKET/ ..."
if aws s3 cp "$LATEST_BACKUP" "s3://$S3_BUCKET/"; then
  log "Upload successful: $LATEST_BACKUP -> s3://$S3_BUCKET/"
else
  log "ERROR: S3 upload failed!"
  exit 1
fi

log "=== Scheduled backup completed successfully ==="
