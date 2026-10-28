#!/usr/bin/env bash
#
# backup-sqlite.sh - Safe, online atomic SQLite backup with 14-run retention pruning
#
# Designed for production databases running in WAL mode under live traffic.
# Uses SQLite's online backup API via `sqlite3 "$db" ".backup '$dest'"`.
#
# Environment variables:
#   DATA_DIR   - Base directory containing SQLite databases (default: /opt/apps/hoc-nhung/data or ./data)
#   BACKUP_DIR - Target backup directory (default: $DATA_DIR/backups)
#   RETENTION  - Number of backups to retain per database (default: 14)
#
# Usage:
#   scripts/backup-sqlite.sh [optional_db_path ...]
#

set -euo pipefail

# Configuration defaults
RETENTION="${RETENTION:-14}"

# Determine base data directory
if [ -n "${DATA_DIR:-}" ]; then
    RESOLVED_DATA_DIR="$DATA_DIR"
elif [ -d "/opt/apps/hoc-nhung/data" ]; then
    RESOLVED_DATA_DIR="/opt/apps/hoc-nhung/data"
elif [ -d "./data" ]; then
    RESOLVED_DATA_DIR="./data"
else
    RESOLVED_DATA_DIR="."
fi

# Determine target backup directory
if [ -n "${BACKUP_DIR:-}" ]; then
    RESOLVED_BACKUP_DIR="$BACKUP_DIR"
else
    RESOLVED_BACKUP_DIR="${RESOLVED_DATA_DIR}/backups"
fi

# Logging helpers
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*"
}

log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $*" >&2
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2
}

# Verify sqlite3 binary availability
if ! command -v sqlite3 >/dev/null 2>&1; then
    log_error "sqlite3 CLI utility is required but not found in PATH."
    exit 1
fi

# Ensure backup destination directory exists
mkdir -p "$RESOLVED_BACKUP_DIR"

log "Starting SQLite database backup pipeline"
log "Data directory:   $RESOLVED_DATA_DIR"
log "Backup directory: $RESOLVED_BACKUP_DIR"
log "Retention limit:  $RETENTION copies per database"

# Resolve list of databases to process
DATABASES=()
if [ "$#" -gt 0 ]; then
    for arg in "$@"; do
        DATABASES+=("$arg")
    done
else
    DATABASES=(
        "${RESOLVED_DATA_DIR}/velxio_accounts.db"
        "${RESOLVED_DATA_DIR}/velxio.db"
    )
fi

BACKED_UP_COUNT=0
FAILED_COUNT=0

for db_path in "${DATABASES[@]}"; do
    db_filename=$(basename "$db_path")
    db_base="${db_filename%.db}"

    if [ ! -f "$db_path" ]; then
        log "Database '$db_filename' not found at '$db_path' — skipping."
        continue
    fi

    timestamp=$(date '+%Y%m%d_%H%M%S')
    dest_filename="${db_base}_${timestamp}.db"
    dest_path="${RESOLVED_BACKUP_DIR}/${dest_filename}"
    temp_dest="${RESOLVED_BACKUP_DIR}/.${dest_filename}.tmp"

    log "Backing up '$db_filename' -> '$dest_filename' (online atomic snapshot)..."

    # Perform online atomic backup using SQLite API (WAL mode safe)
    if sqlite3 "$db_path" ".backup '${temp_dest}'"; then
        mv "${temp_dest}" "${dest_path}"

        # Quick integrity validation
        integrity=$(sqlite3 "${dest_path}" "PRAGMA quick_check;" 2>/dev/null || echo "check_failed")
        if [ "$integrity" != "ok" ]; then
            log_warn "Integrity check for '${dest_filename}' returned: $integrity"
        fi

        size_bytes=$(wc -c < "${dest_path}" | tr -d ' ')
        log "Backup completed: '${dest_filename}' (${size_bytes} bytes, integrity: ${integrity})"
        BACKED_UP_COUNT=$((BACKED_UP_COUNT + 1))
    else
        log_error "Failed to create backup for '$db_path'"
        rm -f "${temp_dest}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi

    # Retention policy: Maintain exactly the latest $RETENTION backups
    # ls -1t sorts newest first. tail -n +$((RETENTION + 1)) captures everything older than the $RETENTION latest.
    tail_offset=$((RETENTION + 1))
    old_backups=$(ls -1t "${RESOLVED_BACKUP_DIR}/${db_base}_"[0-9]*.db 2>/dev/null | tail -n "+${tail_offset}" || true)

    if [ -n "$old_backups" ]; then
        log "Pruning old backups for '${db_base}' exceeding retention threshold ($RETENTION):"
        echo "$old_backups" | while IFS= read -r old_file; do
            if [ -n "$old_file" ] && [ -f "$old_file" ]; then
                log "  - Removed expired backup: $(basename "$old_file")"
                rm -f "$old_file"
            fi
        done
    else
        log "Retention check for '${db_base}': active backup count within retention limit ($RETENTION)."
    fi

    total_current=$(ls -1 "${RESOLVED_BACKUP_DIR}/${db_base}_"[0-9]*.db 2>/dev/null | wc -l | tr -d ' ')
    log "Active backups retained for '${db_base}': $total_current"
done

log "Backup pipeline finished. Processed: $BACKED_UP_COUNT successful, $FAILED_COUNT failed."

if [ "$FAILED_COUNT" -gt 0 ]; then
    log_error "One or more database backups encountered errors."
    exit 1
fi

exit 0
