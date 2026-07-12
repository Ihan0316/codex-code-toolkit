#!/usr/bin/env python3
"""Codex `notify` 핸들러 — 턴 완료 시 데스크톱 알림.

등록: ~/.codex/config.toml
    notify = ["python3", "<CODEX_HOME>/notify.py"]

Codex는 지원 이벤트(현재 `agent-turn-complete`만) 발생 시 이 프로그램을 실행하며,
JSON 페이로드를 **마지막 argv 인자(sys.argv[1])** 로 전달합니다. (소스 검증됨)

페이로드 스키마(kebab-case 키):
    {
      "type": "agent-turn-complete",
      "thread-id": "…",
      "turn-id": "…",
      "cwd": "/path/to/project",
      "input-messages": ["…"],
      "last-assistant-message": "…"
    }
"""
import json
import subprocess
import sys


def notify_desktop(title: str, message: str) -> None:
    """macOS(osascript) / Linux(notify-send) 데스크톱 알림. 실패는 조용히 무시."""
    message = (message or "").strip().replace("\n", " ")[:180]
    try:
        if sys.platform == "darwin":
            script = f'display notification {json.dumps(message)} with title {json.dumps(title)}'
            subprocess.run(["osascript", "-e", script], check=False)
        else:  # Linux / WSL2 (notify-send 설치 시)
            subprocess.run(["notify-send", title, message], check=False)
    except Exception:
        pass


def main() -> int:
    if len(sys.argv) < 2:
        return 0
    try:
        payload = json.loads(sys.argv[1])
    except (json.JSONDecodeError, TypeError):
        return 0

    if payload.get("type") != "agent-turn-complete":
        return 0

    inputs = payload.get("input-messages") or []
    first = (inputs[0] if inputs else "").strip()
    last = payload.get("last-assistant-message") or "완료"

    title = "Codex ▸ 턴 완료"
    if first:
        title = f"Codex ▸ {first[:40]}"

    notify_desktop(title, last)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
