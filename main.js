#!/usr/bin/env bash

# ==========================================
# TARENTADONG HALIMAW
# KEEPALIVE + AUTO-RECONNECT WATCHDOG
# ==========================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN="$APP_DIR/main.js"
LOG="$APP_DIR/watchdog.log"

RESTART_DELAY=5
MAX_CRASHES=10
CRASH_COUNT=0

cd "$APP_DIR" || exit 1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG"
}

log "Watchdog started."

while true; do

    # Check main file
    if [ ! -f "$MAIN" ]; then
        log "ERROR: main.js not found."
        exit 1
    fi

    # Check Node
    if ! command -v node >/dev/null 2>&1; then
        log "ERROR: Node.js is not installed."
        exit 1
    fi

    log "Starting main.js..."

    node "$MAIN" >> "$LOG" 2>&1
    EXIT_CODE=$?

    log "main.js stopped. Exit code: $EXIT_CODE"

    CRASH_COUNT=$((CRASH_COUNT + 1))

    # Too many immediate crashes
    if [ "$CRASH_COUNT" -ge "$MAX_CRASHES" ]; then
        log "Too many crashes. Waiting 60 seconds..."
        sleep 60
        CRASH_COUNT=0
    else
        log "Connection/process lost. Auto-reconnecting in ${RESTART_DELAY}s..."
        sleep "$RESTART_DELAY"
    fi
done
