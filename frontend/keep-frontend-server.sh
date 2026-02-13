#!/bin/bash
# keep-frontend-server.sh
# This script will keep the Vite dev server running unless explicitly killed.

FRONTEND_DIR="/home/sos10/Documents/EOEX/eternelles/res/frontend"
LOGFILE="$FRONTEND_DIR/server-keepalive.log"

while true; do
  echo "Starting Vite dev server at $(date)" >> "$LOGFILE"
  cd "$FRONTEND_DIR"
  npm run dev >> "$LOGFILE" 2>&1
  echo "Vite dev server stopped at $(date), restarting in 3s..." >> "$LOGFILE"
  sleep 3
  # If a file named .stop-keepalive exists, break the loop
  if [ -f "$FRONTEND_DIR/.stop-keepalive" ]; then
    echo "Stop file detected, exiting keepalive loop." >> "$LOGFILE"
    break
  fi
  # Otherwise, restart
done
