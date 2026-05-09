#!/usr/bin/env bash
# 将静态站点同步到 ECS（Nginx 根目录）。不会在远端删除已有文件（保留服务器上的 images/ 等大资源）。
# 前置：把坚果云备忘中的 PEM 存为 ~/.ssh/china-seg.pem 且 chmod 600。
# 用法：
#   ./scripts/deploy-cn-segxm.sh
# 可选环境变量：SIYI_SSH_KEY、SIYI_ECS_HOST、SIYI_SSH_USER、SIYI_REMOTE_WEB

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEY="${SIYI_SSH_KEY:-$HOME/.ssh/china-seg.pem}"
HOST="${SIYI_ECS_HOST:-121.196.174.145}"
USER="${SIYI_SSH_USER:-root}"
REMOTE="${SIYI_REMOTE_WEB:-/var/www/cn.segxm.com/web}"

if [[ ! -f "$KEY" ]]; then
  echo "错误：找不到 SSH 私钥: $KEY" >&2
  echo "请将 china-seg.pem 放到上述路径，或设置环境变量 SIYI_SSH_KEY。" >&2
  exit 1
fi

chmod 600 "$KEY" 2>/dev/null || true

SSH_OPTS=(-i "$KEY" -o StrictHostKeyChecking=accept-new)
TARGET="${USER}@${HOST}:${REMOTE}/"

echo "==> rsync -> ${TARGET}"
rsync -avz \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude '.git/' \
  --exclude 'public/' \
  --exclude 'scripts/' \
  --exclude '__manus__/' \
  --exclude '.gitignore' \
  --exclude '*.bak*' \
  ./ "$TARGET"

echo "==> 清理远端 assets 中除最新外的旧 hash 文件（仅 .js / .css）"
REMOTE_Q=$(printf '%q' "$REMOTE")
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" bash -lc "cd ${REMOTE_Q}/assets 2>/dev/null || exit 0
for ext in js css; do
  ls -1 \"\${PWD}\"/*.\$ext 2>/dev/null | sort | head -n -1 | xargs -r rm -f || true
done"

echo "==> 完成。可执行: curl -I https://cn.segxm.com"
