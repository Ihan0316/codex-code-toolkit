#!/usr/bin/env bash
# 일일보고 자동 생성 — codex exec(헤드리스) 래퍼. cron/launchd에서 호출.
#
# 안전: --sandbox read-only 로 실행 → 코드/파일을 수정하지 않고 읽기·분석만.
#       codex exec 는 승인이 항상 never 이므로 read-only 로 사고를 원천 차단.
# 출력: 진행상황은 stderr, 최종 메시지는 stdout → 로그 파일로 리다이렉트.
set -euo pipefail

WORKSPACE="${WORKSPACE:-$HOME/Documents/<WORKSPACE>}"
LOG_DIR="${LOG_DIR:-$HOME/Documents/<CODEX_LOG_DIR>}"
mkdir -p "$LOG_DIR"
TODAY="$(date +%F)"

cd "$WORKSPACE"

# 'daily-report' 스킬이 있으면 그 절차를 따르고, 없으면 프롬프트만으로 동작.
codex exec --sandbox read-only \
  "daily-report: 오늘($TODAY) 워크스페이스의 각 프로젝트(AGENTS.md 있는 폴더) git 변경을 사실 기반으로 요약해 일일보고 md를 작성/갱신해줘. 코드는 수정하지 말고 분석만." \
  > "$LOG_DIR/daily-$TODAY.log" 2>&1

echo "done: $LOG_DIR/daily-$TODAY.log"
