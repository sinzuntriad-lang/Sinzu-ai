#!/usr/bin/env bash

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN="$APP_DIR/main.js"
LOG="$APP_DIR/watchdog.log"

RESTART_DELAY=5
MAX_RESTARTS=20
RESTART_COUNT=0

cd "$APP_DIR" || exit 1

echo "[$(date)] Watchdog started." >> "$LOG"

while true; do
    if [ ! -f "$MAIN" ]; then
        echo "[$(date)] ERROR: main.js not found." >> "$LOG"
        exit 1
    fi

    echo "[$(date)] Starting main.js..." >> "$LOG"

    node "$MAIN" >> "$LOG" 2>&1
    EXIT_CODE=$?

    echo "[$(date)] main.js exited with code $EXIT_CODE." >> "$LOG"

    RESTART_COUNT=$((RESTART_COUNT + 1))

    if [ "$RESTART_COUNT" -ge "$MAX_RESTARTS" ]; then
        echo "[$(date)] Restart limit reached. Waiting 60 seconds." >> "$LOG"
        sleep 60
        RESTART_COUNT=0
    else
        echo "[$(date)] Restarting in ${RESTART_DELAY}s..." >> "$LOG"
        sleep "$RESTART_DELAY"
    fi
done
