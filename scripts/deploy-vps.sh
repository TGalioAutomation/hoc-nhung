#!/usr/bin/env bash
#
# deploy-vps.sh - One-Touch Production Deployment to Tailscale VPS
#
# Workflow:
#   1. Validates local prerequisites (git, ssh, rsync, node, npm, curl) and VPS connectivity.
#   2. Executes local quality gates (TypeScript tsc, Vitest suites, Vite production build).
#   3. Triggers pre-deploy remote database backup on VPS via scripts/backup-sqlite.sh.
#   4. Syncs code and compiled assets to VPS /opt/apps/hoc-nhung/ via rsync (safely excluding data/).
#   5. Rebuilds and restarts container: `docker compose -f docker-compose.vps.yml up -d --build`.
#   6. Runs live health-checks against https://hocnhung.apexdev.website/health and validates boot time.
#
# Environment variables:
#   VPS_HOST       - Tailscale IP / hostname of VPS (default: 100.94.160.6)
#   VPS_USER       - SSH user (default: root)
#   VPS_SSH_KEY    - Path to SSH private key (default: ~/.ssh/id_ed25519)
#   VPS_APP_DIR    - Target app directory on VPS (default: /opt/apps/hoc-nhung)
#   HEALTH_URL     - Public or internal health endpoint (default: https://hocnhung.apexdev.website/health)
#   SKIP_TESTS     - Set to 1 to skip local test suite (default: 0)
#   SKIP_BACKUP    - Set to 1 to skip pre-deploy backup (default: 0)
#   DRY_RUN        - Set to 1 for dry run mode (default: 0)
#
# Usage:
#   scripts/deploy-vps.sh [--skip-tests] [--skip-backup] [--dry-run]
#

set -euo pipefail

# Configuration defaults
VPS_HOST="${VPS_HOST:-100.94.160.6}"
VPS_USER="${VPS_USER:-root}"
VPS_SSH_KEY="${VPS_SSH_KEY:-$HOME/.ssh/id_ed25519}"
VPS_APP_DIR="${VPS_APP_DIR:-/opt/apps/hoc-nhung}"
HEALTH_URL="${HEALTH_URL:-https://hocnhung.apexdev.website/health}"
SESSION_URL="${SESSION_URL:-https://hocnhung.apexdev.website/api/auth/session}"
MAX_HEALTHCHECK_ATTEMPTS="${MAX_HEALTHCHECK_ATTEMPTS:-30}"
HEALTHCHECK_INTERVAL="${HEALTHCHECK_INTERVAL:-1}"

SKIP_TESTS="${SKIP_TESTS:-0}"
SKIP_BACKUP="${SKIP_BACKUP:-0}"
DRY_RUN="${DRY_RUN:-0}"

# Parse command line flags
for arg in "$@"; do
    case "$arg" in
        --skip-tests)
            SKIP_TESTS=1
            ;;
        --skip-backup)
            SKIP_BACKUP=1
            ;;
        --dry-run)
            DRY_RUN=1
            ;;
        --help|-h)
            echo "Usage: scripts/deploy-vps.sh [options]"
            echo "Options:"
            echo "  --skip-tests   Skip local tsc and vitest quality gates"
            echo "  --skip-backup  Skip remote database backup before deployment"
            echo "  --dry-run      Validate environment and display actions without deploying"
            echo "  --help, -h     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            exit 1
            ;;
    esac
done

# Logging helpers
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*"
}

log_step() {
    echo ""
    echo "================================================================================"
    echo "  $*"
    echo "================================================================================"
}

log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $*" >&2
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2
}

# Resolve repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step "HỌC NHÚNG CHO BÉ — PRODUCTION DEPLOYMENT PIPELINE"
log "Repository root: $REPO_ROOT"
log "Target host:     $VPS_USER@$VPS_HOST"
log "Remote directory:$VPS_APP_DIR"
log "Health endpoint: $HEALTH_URL"

# Step 1: Validate Prerequisites
log_step "STEP 1: Validating Prerequisites"

MISSING_DEPS=0
for cmd in git ssh rsync node npm curl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Required tool '$cmd' is not installed or not in PATH."
        MISSING_DEPS=$((MISSING_DEPS + 1))
    else
        log "Tool '$cmd' available: $(command -v "$cmd")"
    fi
done

if [ "$MISSING_DEPS" -gt 0 ]; then
    log_error "Prerequisite check failed. Please install missing dependencies."
    exit 1
fi

if [ ! -f "$VPS_SSH_KEY" ]; then
    log_error "SSH private key not found at: $VPS_SSH_KEY"
    exit 1
fi

log "Testing SSH connectivity to $VPS_USER@$VPS_HOST via Tailscale..."
if ! ssh -i "$VPS_SSH_KEY" -o ConnectTimeout=8 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH_OK'" >/dev/null 2>&1; then
    log_error "Unable to establish SSH connection to $VPS_USER@$VPS_HOST."
    log_error "Verify Tailscale connection is active and key permissions are correct."
    exit 1
fi
log "SSH connection to VPS verified successfully."

if [ "$DRY_RUN" -eq 1 ]; then
    log_warn "DRY RUN MODE ENABLED — no remote changes will be applied."
fi

# Step 2: Local Quality Gates (Build & Test)
log_step "STEP 2: Executing Local Quality Gates"

cd "$REPO_ROOT/frontend"

if [ "$SKIP_TESTS" -eq 0 ]; then
    log "Running TypeScript type check (tsc -p tsconfig.app.json --noEmit)..."
    npx tsc -p tsconfig.app.json --noEmit
    log "TypeScript type check passed (0 errors)."

    log "Running Vitest test suites..."
    npx vitest run \
        src/__tests__/first-visit-ux.test.ts \
        src/__tests__/vietnamese-seo-pwa.test.ts \
        src/__tests__/pro-auth-unlock.test.ts \
        src/__tests__/community-hub.test.ts \
        src/__tests__/classroom-curriculum.test.ts \
        src/__tests__/classroom-stores.test.ts
    log "All Vitest test suites passed 100%."
else
    log_warn "Skipping local test gates (--skip-tests active)."
fi

log "Building production frontend bundle with Vite..."
npx vite build
if [ ! -d "$REPO_ROOT/frontend/dist" ] || [ ! -f "$REPO_ROOT/frontend/dist/index.html" ]; then
    log_error "Vite build failed to produce frontend/dist/index.html"
    exit 1
fi
log "Frontend bundle built successfully in frontend/dist/."

# Step 3: Trigger Pre-Deploy Remote Database Backup
log_step "STEP 3: Triggering Pre-Deploy Remote SQLite Backup"

if [ "$SKIP_BACKUP" -eq 0 ] && [ "$DRY_RUN" -eq 0 ]; then
    log "Ensuring remote backup script is staged on VPS..."
    ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_APP_DIR/scripts $VPS_APP_DIR/data/backups"
    scp -i "$VPS_SSH_KEY" "$REPO_ROOT/scripts/backup-sqlite.sh" "$VPS_USER@$VPS_HOST:$VPS_APP_DIR/scripts/backup-sqlite.sh"
    ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" "chmod +x $VPS_APP_DIR/scripts/backup-sqlite.sh"

    log "Executing online atomic database backup on VPS..."
    ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" "$VPS_APP_DIR/scripts/backup-sqlite.sh"
    log "Pre-deploy database backup completed successfully."
else
    log_warn "Skipping pre-deploy database backup (SKIP_BACKUP=$SKIP_BACKUP, DRY_RUN=$DRY_RUN)."
fi

# Step 4: Sync Code & Dist Assets to VPS
log_step "STEP 4: Syncing Code & Assets to VPS"

RSYNC_DRY_FLAG=""
if [ "$DRY_RUN" -eq 1 ]; then
    RSYNC_DRY_FLAG="--dry-run"
fi

log "Syncing repository files to $VPS_USER@$VPS_HOST:$VPS_APP_DIR/ (preserving /data)..."
rsync -avz --delete $RSYNC_DRY_FLAG \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.agents' \
    --exclude='data' \
    --exclude='data/***' \
    --exclude='*.tmp' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='clean-room/mutants' \
    "$REPO_ROOT/" "$VPS_USER@$VPS_HOST:$VPS_APP_DIR/"

log "Rsync file synchronization complete."

if [ "$DRY_RUN" -eq 1 ]; then
    log_step "DRY RUN COMPLETE — All checks passed, exiting before container restart."
    exit 0
fi

# Step 5: Container Rebuild & Restart on VPS
log_step "STEP 5: Rebuilding and Restarting Container hoc-nhung-velxio"

BOOT_START_TIME=$(date +%s)
log "Triggering Docker Compose build & up on VPS..."

ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" "
    cd $VPS_APP_DIR
    docker compose -f docker-compose.vps.yml up -d --build
"

log "Docker container restart command submitted."

# Step 6: Healthcheck Verification & Boot Time Measurement
log_step "STEP 6: Verifying Production Health & Latency"

HEALTHY=false
ATTEMPT=1
TEMP_RESPONSE=$(mktemp)
trap 'rm -f "$TEMP_RESPONSE"' EXIT

while [ "$ATTEMPT" -le "$MAX_HEALTHCHECK_ATTEMPTS" ]; do
    HTTP_CODE=$(curl -sS -o "$TEMP_RESPONSE" -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        if grep -q '"status":"healthy"' "$TEMP_RESPONSE" 2>/dev/null; then
            HEALTHY=true
            break
        fi
    fi
    log "Attempt $ATTEMPT/$MAX_HEALTHCHECK_ATTEMPTS: Healthcheck returned HTTP $HTTP_CODE, retrying in ${HEALTHCHECK_INTERVAL}s..."
    ATTEMPT=$((ATTEMPT + 1))
    sleep "$HEALTHCHECK_INTERVAL"
done

BOOT_END_TIME=$(date +%s)
BOOT_DURATION=$((BOOT_END_TIME - BOOT_START_TIME))

if [ "$HEALTHY" != "true" ]; then
    log_error "Healthcheck failed after $MAX_HEALTHCHECK_ATTEMPTS attempts."
    log_error "Last response content: $(cat "$TEMP_RESPONSE" 2>/dev/null || echo 'empty')"
    exit 1
fi

log "✅ Production healthcheck PASSED with HTTP 200: $(cat "$TEMP_RESPONSE")"
log "Container boot/health verification completed in ${BOOT_DURATION}s."

if [ "$BOOT_DURATION" -le 5 ]; then
    log "✅ Fast-boot target achieved: boot time <= 5 seconds."
else
    log_warn "Boot took ${BOOT_DURATION}s (exceeded 5s threshold, but container is healthy)."
fi

# Step 7: Verification of Auth & Session Endpoint
log "Verifying session endpoint ($SESSION_URL)..."
SESSION_CODE=$(curl -sS -o "$TEMP_RESPONSE" -w "%{http_code}" "$SESSION_URL" 2>/dev/null || echo "000")
if [ "$SESSION_CODE" = "200" ]; then
    log "✅ Auth session endpoint verified: $(cat "$TEMP_RESPONSE")"
else
    log_warn "Session endpoint returned HTTP $SESSION_CODE."
fi

log_step "DEPLOYMENT COMPLETED SUCCESSFULLY 🚀"
log "Application is live at: https://hocnhung.apexdev.website"
exit 0
