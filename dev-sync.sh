#!/usr/bin/env bash
# dev-sync.sh — Watches vibe.project & vibe-frontend and syncs changed files
#               into the running Docker containers via `docker cp`.
#
# Usage:
#   ./dev-sync.sh            # run in foreground (Ctrl-C to stop)
#   ./dev-sync.sh stop       # kill background instance

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/vibe.project"
FRONTEND_DIR="$SCRIPT_DIR/vibe-frontend"

BACKEND_CONTAINER="vibe_app"
NGINX_CONTAINER="vibe_nginx"
FRONTEND_CONTAINER="vibe_nextjs"

BACKEND_DEST="/var/www"
FRONTEND_DEST="/app"

PID_FILE="/tmp/dev-sync-vibe.pid"
LOG_FILE="/tmp/dev-sync-vibe.log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; GRAY='\033[0;37m'; NC='\033[0m'

log()  { echo -e "${CYAN}[sync]${NC} $*" | tee -a "$LOG_FILE"; }
ok()   { echo -e "${GREEN}[sync]${NC} $*" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[sync]${NC} $*" | tee -a "$LOG_FILE"; }
err()  { echo -e "${RED}[sync]${NC} $*" | tee -a "$LOG_FILE"; }

if [[ "${1:-}" == "stop" ]]; then
  if [[ -f "$PID_FILE" ]]; then
    PID=$(cat "$PID_FILE")
    kill -- -"$PID" 2>/dev/null || kill "$PID" 2>/dev/null
    ok "Stopped (PID $PID)"
    rm -f "$PID_FILE"
  else
    warn "No PID file found"
  fi
  exit 0
fi

if [[ "${1:-}" == "log" ]]; then
  tail -f "$LOG_FILE"
  exit 0
fi

if ! command -v inotifywait &>/dev/null; then
  err "inotifywait not found. Install with: sudo apt install inotify-tools"
  exit 1
fi

echo $$ > "$PID_FILE"
trap "rm -f $PID_FILE; log 'Stopped.'" EXIT INT TERM

EXCLUDE_PATTERN='(\.git|node_modules|vendor|\.next|storage/logs|storage/framework/cache|storage/framework/sessions|storage/framework/views|bootstrap/cache|\.cache|__pycache__|dist|build)'

sync_backend() {
  local abs_path="$1"
  local event="$2"
  local rel="${abs_path#$BACKEND_DIR/}"
  local dest_path="$BACKEND_DEST/$rel"
  local dest_dir
  dest_dir=$(dirname "$dest_path")

  if [[ "$event" == *"DELETE"* ]]; then
    docker exec "$BACKEND_CONTAINER" rm -f "$dest_path" 2>/dev/null || true
    log "  del backend: $rel"
    return
  fi

  [[ -f "$abs_path" ]] || return 0

  docker exec "$BACKEND_CONTAINER" mkdir -p "$dest_dir" 2>/dev/null || true
  if docker cp "$abs_path" "$BACKEND_CONTAINER:$dest_path" 2>/dev/null; then
    log "  ✓ backend: $rel"
    # Also sync nginx for app/routes dirs
    if [[ "$rel" == app/* || "$rel" == routes/* ]]; then
      docker exec "$NGINX_CONTAINER" mkdir -p "$dest_dir" 2>/dev/null || true
      docker cp "$abs_path" "$NGINX_CONTAINER:$dest_path" 2>/dev/null || true
    fi
  else
    warn "  ✗ backend FAIL: $rel"
  fi
}

sync_frontend() {
  local abs_path="$1"
  local event="$2"
  local rel="${abs_path#$FRONTEND_DIR/}"
  local dest_path="$FRONTEND_DEST/$rel"
  local dest_dir
  dest_dir=$(dirname "$dest_path")

  if [[ "$event" == *"DELETE"* ]]; then
    docker exec "$FRONTEND_CONTAINER" rm -f "$dest_path" 2>/dev/null || true
    log "  del frontend: $rel"
    return
  fi

  [[ -f "$abs_path" ]] || return 0

  docker exec "$FRONTEND_CONTAINER" mkdir -p "$dest_dir" 2>/dev/null || true
  if docker cp "$abs_path" "$FRONTEND_CONTAINER:$dest_path" 2>/dev/null; then
    log "  ✓ frontend: $rel"
  else
    warn "  ✗ frontend FAIL: $rel"
  fi
}

initial_sync() {
  log "Initial sync starting..."

  for dir in app routes database config resources; do
    local src="$BACKEND_DIR/$dir"
    [[ -d "$src" ]] && docker cp "$src" "$BACKEND_CONTAINER:$BACKEND_DEST/" 2>/dev/null && ok "  ✓ backend/$dir/"
  done
  docker cp "$BACKEND_DIR/app"    "$NGINX_CONTAINER:$BACKEND_DEST/" 2>/dev/null || true
  docker cp "$BACKEND_DIR/routes" "$NGINX_CONTAINER:$BACKEND_DEST/" 2>/dev/null || true

  for dir in app components hooks lib public; do
    local src="$FRONTEND_DIR/$dir"
    [[ -d "$src" ]] && docker cp "$src" "$FRONTEND_CONTAINER:$FRONTEND_DEST/" 2>/dev/null && ok "  ✓ frontend/$dir/"
  done
  for f in next.config.ts tsconfig.json package.json postcss.config.mjs; do
    [[ -f "$FRONTEND_DIR/$f" ]] && docker cp "$FRONTEND_DIR/$f" "$FRONTEND_CONTAINER:$FRONTEND_DEST/$f" 2>/dev/null || true
  done

  ok "Initial sync complete."
}

watch_loop() {
  log "Watching for changes (Ctrl-C to stop)..."

  inotifywait \
    --monitor \
    --recursive \
    --event close_write \
    --event moved_to \
    --event create \
    --event delete \
    --format '%w%f|%e' \
    --exclude "$EXCLUDE_PATTERN" \
    "$BACKEND_DIR" \
    "$FRONTEND_DIR" \
    2>/dev/null \
  | while IFS='|' read -r filepath event; do
      if [[ -d "$filepath" ]]; then continue; fi

      local base
      base="$(basename "$filepath")"
      if [[ "$base" == .* || "$base" == *".swp" || "$base" == *~ ]]; then continue; fi

      if [[ "$filepath" == "$BACKEND_DIR"* ]]; then
        sync_backend "$filepath" "$event"
      elif [[ "$filepath" == "$FRONTEND_DIR"* ]]; then
        sync_frontend "$filepath" "$event"
      fi
    done
}

echo "" | tee "$LOG_FILE"
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}" | tee -a "$LOG_FILE"
echo -e "${CYAN}║       VibeCoding Dev Sync                ║${NC}" | tee -a "$LOG_FILE"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

initial_sync
echo "" | tee -a "$LOG_FILE"
watch_loop
