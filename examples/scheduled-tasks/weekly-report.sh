#!/usr/bin/env bash
# 주간보고 자동 생성 — codex exec(헤드리스, read-only) 래퍼. 금요일 저녁 cron 권장.
set -euo pipefail

WORKSPACE="${WORKSPACE:-$HOME/Documents/<WORKSPACE>}"
LOG_DIR="${LOG_DIR:-$HOME/Documents/<CODEX_LOG_DIR>}"
mkdir -p "$LOG_DIR"
WEEK="$(date +%G-W%V)"

cd "$WORKSPACE"

codex exec --sandbox read-only \
  "이번 주($WEEK) 각 프로젝트의 git 로그·머지된 PR·완료 작업을 사실 기반으로 취합해 주간보고 md를 작성해줘. 다음 주 우선순위 제안 포함. 코드 수정 금지, 분석만." \
  > "$LOG_DIR/weekly-$WEEK.log" 2>&1

echo "done: $LOG_DIR/weekly-$WEEK.log"
