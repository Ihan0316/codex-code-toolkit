#!/usr/bin/env python3
"""PreToolUse 훅(예시) — 비가역·위험 셸 명령 정책 차단.

등록: examples/hooks/hooks.json 의 PreToolUse, 또는 config.toml 의 [[hooks.PreToolUse]].

왜 필요한가:
  Codex의 1차 방어선은 샌드박스(read-only/workspace-write)입니다. 하지만
  danger-full-access 로 운영하거나, 샌드박스가 막지 못하는 "정책상 금지"(예: force push)
  까지 막고 싶을 때, 훅으로 패턴을 한 겹 더 겁니다.

주의(중요):
  Codex lifecycle hooks는 신흥 기능이라 command 훅의 입력 페이로드/종료코드 계약이
  버전에 따라 다를 수 있습니다. 본인 Codex 버전에서 `codex --help` · `/hooks` 로 확인하세요.
  이 스크립트는 방어적으로 (1) stdin JSON, (2) argv[1] JSON 을 모두 시도하고,
  여러 후보 필드에서 명령 문자열을 추출합니다. 위험 시 stderr에 사유를 출력하고 exit 2.
"""
import json
import re
import sys

RULES = [
    (r'(^|[\s;&|])rm\s+-[a-zA-Z]*r[a-zA-Z]*f', 'rm -rf 차단: 재귀·강제 삭제는 사용자 확인 필요'),
    (r'(^|[\s;&|])git\s+push\b.*(\s-f\b|--force\b)', 'git push --force 차단: 원격 히스토리 덮어쓰기'),
    (r'(^|[\s;&|])git\s+reset\b.*--hard\b', 'git reset --hard 차단: 작업물 손실 가능'),
    (r'(^|[\s;&|])git\s+clean\b.*-[a-zA-Z]*f', 'git clean -f 차단: 미추적 파일 손실 가능'),
    (r'(^|[\s;&|])git\s+branch\b.*-D\b', 'git branch -D 차단: 머지 안 된 브랜치 강제 삭제'),
    (r'(^|[\s;&|])(npm|yarn|pnpm)\s+uninstall\b', '패키지 uninstall 차단: 의존성 제거는 확인 필요'),
    (r'(^|[\s;&|])pip\s+uninstall\b', 'pip uninstall 차단: 의존성 제거는 확인 필요'),
    (r'(^|[\s;&|])shutdown\b', 'shutdown 차단: 시스템 종료는 사용자가 직접'),
]


def load_payload():
    raw = ""
    try:
        raw = sys.stdin.read()
    except Exception:
        raw = ""
    if not raw and len(sys.argv) > 1:
        raw = sys.argv[1]
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {}


def extract_command(payload) -> str:
    """여러 버전/스키마 후보에서 셸 명령 문자열을 추출."""
    if not isinstance(payload, dict):
        return ""
    candidates = [
        payload.get("command"),
        (payload.get("tool_input") or {}).get("command") if isinstance(payload.get("tool_input"), dict) else None,
        (payload.get("input") or {}).get("command") if isinstance(payload.get("input"), dict) else None,
        (payload.get("hook_event") or {}).get("command") if isinstance(payload.get("hook_event"), dict) else None,
    ]
    for c in candidates:
        if isinstance(c, str) and c.strip():
            return c
    return ""


def main() -> int:
    cmd = extract_command(load_payload())
    if not cmd:
        return 0  # 명령을 못 찾으면 통과(방어적)
    normalized = re.sub(r'\s+', ' ', cmd)
    for pattern, reason in RULES:
        if re.search(pattern, normalized):
            sys.stderr.write(f"[guard-bash] {reason}\n")
            sys.stderr.write(f"[guard-bash] 차단된 명령: {cmd}\n")
            sys.stderr.write("[guard-bash] 사용자 확인 후 직접 실행하세요.\n")
            return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
