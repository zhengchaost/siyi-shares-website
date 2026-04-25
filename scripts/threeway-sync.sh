#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/scripts/threeway-sync.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  echo "Copy scripts/threeway-sync.env.example to scripts/threeway-sync.env and fill values."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

required_vars=(
  SERVER_HOST
  SERVER_USER
  SSH_KEY_PATH
  SERVER_WEB_ROOT
  BACKUP_REPO_PATH
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: $var_name"
    exit 1
  fi
done

if [[ ! -f "$SSH_KEY_PATH" ]]; then
  echo "SSH key not found: $SSH_KEY_PATH"
  exit 1
fi

if [[ ! -d "$BACKUP_REPO_PATH/.git" ]]; then
  echo "Backup repo is not a git repository: $BACKUP_REPO_PATH"
  exit 1
fi

TMP_DIR="$ROOT_DIR/.sync-tmp"
SERVER_SNAPSHOT_DIR="$TMP_DIR/server-web"
MERGE_DIR="$TMP_DIR/merge-web"
DIST_DIR="$ROOT_DIR/dist/public"
ASSET_DIR="$DIST_DIR/assets"
SERVER_TARGET="${SERVER_USER}@${SERVER_HOST}"

mkdir -p "$TMP_DIR"

echo "[1/8] Build latest local site"
cd "$ROOT_DIR"
pnpm run build

echo "[2/8] Pull server web snapshot"
rm -rf "$SERVER_SNAPSHOT_DIR" "$MERGE_DIR"
mkdir -p "$SERVER_SNAPSHOT_DIR" "$MERGE_DIR"
rsync -az \
  -e "ssh -i \"$SSH_KEY_PATH\" -o StrictHostKeyChecking=no -o ConnectTimeout=15" \
  "${SERVER_TARGET}:${SERVER_WEB_ROOT}/" \
  "$SERVER_SNAPSHOT_DIR/"

echo "[3/8] Start merge from local build output"
rsync -a "$DIST_DIR/" "$MERGE_DIR/"

echo "[4/8] Fill missing files from server snapshot"
python3 - "$SERVER_SNAPSHOT_DIR" "$MERGE_DIR" <<'PY'
import os
import shutil
import sys

snapshot, merge = sys.argv[1], sys.argv[2]

for root, _, files in os.walk(snapshot):
    for file_name in files:
        src = os.path.join(root, file_name)
        rel = os.path.relpath(src, snapshot)
        dst = os.path.join(merge, rel)
        if not os.path.exists(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            print(f"  + kept server-only file: {rel}")
PY

echo "[5/8] Overlay backup static html pages"
python3 - "$BACKUP_REPO_PATH" "$MERGE_DIR" <<'PY'
import os
import shutil
import sys

backup_repo, merge = sys.argv[1], sys.argv[2]

for file_name in os.listdir(backup_repo):
    if not file_name.endswith(".html"):
        continue
    if file_name == "index.html":
        continue

    src = os.path.join(backup_repo, file_name)
    if not os.path.isfile(src):
        continue

    dst = os.path.join(merge, file_name)
    shutil.copy2(src, dst)
    print(f"  + synced backup html: {file_name}")
PY

echo "[6/8] Replace dist/public with merged result"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"
rsync -a "$MERGE_DIR/" "$DIST_DIR/"

echo "[7/8] Sync merged files to backup repo"
rsync -a --delete \
  --exclude ".git/" \
  --exclude ".gitignore" \
  --exclude "README.md" \
  "$MERGE_DIR/" \
  "$BACKUP_REPO_PATH/"

echo "[8/8] Deploy merged files to ECS"
rsync -az --delete \
  -e "ssh -i \"$SSH_KEY_PATH\" -o StrictHostKeyChecking=no -o ConnectTimeout=15" \
  "$MERGE_DIR/" \
  "${SERVER_TARGET}:${SERVER_WEB_ROOT}/"

echo "[9/9] Verify key file hash (index.html)"
local_hash="$(shasum -a 256 "$DIST_DIR/index.html" | awk '{print $1}')"
server_hash="$(
  ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=15 \
    "$SERVER_TARGET" \
    "shasum -a 256 \"$SERVER_WEB_ROOT/index.html\" | awk '{print \$1}'"
)"

echo "  local dist/public/index.html : $local_hash"
echo "  server web/index.html        : $server_hash"

if [[ "$local_hash" != "$server_hash" ]]; then
  echo "Hash mismatch after deployment."
  exit 1
fi

echo
echo "Three-way sync finished successfully."
echo "Next: review git changes and push both repositories."
