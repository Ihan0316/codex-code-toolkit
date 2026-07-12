#!/usr/bin/env bash
# SessionStart 훅(예시) — 세션 시작 시 현재 상태를 2~4줄로 요약해 출력.
#
# 등록: examples/hooks/hooks.json 의 SessionStart, 또는 config.toml 의 [[hooks.SessionStart]].
#
# 표시 항목: ① 마지막 일일보고 ② 글로벌 AGENTS.md 최근 수정 ③ 마지막 백업 상태
# 경로는 <...> placeholder — 본인 컨벤션으로. 네트워크·무거운 스캔 금지(세션 시작이 느려짐).
#
# 주의: command 훅 stdout이 컨텍스트로 주입되는지는 Codex 버전에 따라 다릅니다.
#       최소한 화면/로그로 유용하며, `/hooks` 로 동작을 확인하세요. 실패는 조용히 통과.

set -o pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
WORKSPACE="$HOME/Documents/<WORKSPACE>"          # 본인 워크스페이스 루트로
DAILY_DIR="$WORKSPACE/<DAILY_LOG_DIR>"           # 일일보고 폴더
BACKUP_DIR="$HOME/Documents/<CODEX_BACKUP_DIR>"  # 백업 폴더

# 파일 mtime(epoch) — macOS(stat -f)/Linux(stat -c) 모두 대응
mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null; }

age() { # epoch → "N분/시간/일 전"
  local now diff; now=$(date +%s); diff=$(( now - $1 ))
  if   [ "$diff" -lt 3600 ];  then echo "$(( diff/60 ))분 전"
  elif [ "$diff" -lt 86400 ]; then echo "$(( diff/3600 ))시간 전"
  else echo "$(( diff/86400 ))일 전"; fi
}

echo "[세션 컨텍스트]"

# ① 마지막 일일보고
if [ -d "$DAILY_DIR" ]; then
  latest=$(find "$DAILY_DIR" -name '*.md' -type f 2>/dev/null \
           | while read -r f; do echo "$(mtime "$f") $f"; done \
           | sort -rn | head -1)
  if [ -n "$latest" ]; then
    ts=${latest%% *}; f=${latest#* }
    echo "- 일일보고: $(basename "$f" .md) ($(age "$ts"))"
  fi
fi

# ② 글로벌 AGENTS.md 최근 수정
if [ -f "$CODEX_HOME/AGENTS.md" ]; then
  echo "- AGENTS.md 수정: $(age "$(mtime "$CODEX_HOME/AGENTS.md")")"
fi

# ③ 마지막 백업 (8일 넘으면 ⚠️)
if [ -d "$BACKUP_DIR" ]; then
  last=$(find "$BACKUP_DIR" -name 'codex-backup-*.tar.gz' -type f 2>/dev/null \
         | while read -r f; do echo "$(mtime "$f") $f"; done \
         | sort -rn | head -1)
  if [ -n "$last" ]; then
    ts=${last%% *}; warn=""
    [ $(( ($(date +%s) - ts) / 86400 )) -gt 8 ] && warn=" ⚠️"
    echo "- 백업: $(age "$ts")$warn"
  fi
fi

exit 0
