#!/usr/bin/env bash
# ~/.codex 설정 백업 — 재현 가능한 '정의'만, 비밀·상태는 제외.
#
# 담김:  config.toml, AGENTS.md, hooks.json, prompts/, ~/.agents/skills(있으면)
# 제외:  auth.json(자격증명), history.jsonl, sessions/, 캐시(.system 등)
# 산출:  <BACKUP_DIR>/codex-backup-YYYYMMDD-HHMM.tar.gz  (30일 지난 백업 자동 정리)
set -euo pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
BACKUP_DIR="${CODEX_BACKUP_DIR:-$HOME/Documents/<CODEX_BACKUP_DIR>}"
STAMP="$(date +%Y%m%d-%H%M)"
OUT="$BACKUP_DIR/codex-backup-$STAMP.tar.gz"
mkdir -p "$BACKUP_DIR"

# 존재하는 항목만 포함
items=()
for rel in config.toml AGENTS.md AGENTS.override.md hooks.json prompts; do
  [ -e "$CODEX_HOME/$rel" ] && items+=("-C" "$CODEX_HOME" "$rel")
done
[ -d "$HOME/.agents/skills" ] && items+=("-C" "$HOME/.agents" "skills")

if [ ${#items[@]} -eq 0 ]; then
  echo "백업할 항목이 없습니다: $CODEX_HOME" >&2
  exit 1
fi

# --exclude 로 자격증명·상태 이중 안전장치
tar czf "$OUT" \
  --exclude='auth.json' --exclude='history.jsonl' \
  --exclude='sessions' --exclude='.system' \
  "${items[@]}"

echo "백업 완료: $OUT"

# 30일 초과 백업 정리
find "$BACKUP_DIR" -name 'codex-backup-*.tar.gz' -type f -mtime +30 -delete 2>/dev/null || true
