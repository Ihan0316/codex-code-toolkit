# 12. Claude 설정과 Windows Codex 맞추기

2026-10-20 로컬 설정 기준. Windows 네이티브 Codex에서 사용하는 **훅 12개, 사용자 스킬 26개 목록, 중지 일정 6개**를 반영했습니다. 기존 bash 예제는 별도 환경용입니다.

## 공개 범위

- [호환 어댑터](../examples/claude-parity/claude_compat.py): 현재 로컬 어댑터에 환경변수 경로 설정만 추가.
- [훅 템플릿](../examples/claude-parity/hooks.template.json)과 [생성기](../examples/claude-parity/render_hooks.py): 현재 이벤트·매처·타임아웃 12개를 재현.
- [스킬 목록](../examples/claude-parity/skills.json): 사용자 스킬 26개와 필수 자산·참조 파일. 플러그인·내장 스킬 수는 별도.
- [일정 정의](../examples/claude-parity/schedules.json): 예약식과 `PAUSED` 상태. 등록·실행 기능 없음.

개인 워크플로 본문, 회사 자료, 제3자 스킬 원본·자산, 사용자 훅 원본은 배포하지 않습니다. 따라서 이 저장소만 복사하면 전체 환경이 설치되는 구성은 아닙니다. 원본은 각 출처의 라이선스와 로컬 정책에 따라 준비하세요.

## 훅 12개

| 이벤트 | 개수 | 동작 |
|---|---:|---|
| `PreToolUse` | 3 | 계획 안내, 프로젝트 소유권 검사, 위험 명령 검사 |
| `UserPromptSubmit` | 4 | 프롬프트 개선, caveman 재주입, 컨텍스트 상한, 응답 모드 |
| `SessionStart` | 3 | 세션 맥락, 관제탑 초기화, 응답 모드 |
| `PostToolUse` | 1 | 변경 파일 UTF-8 BOM 처리 |
| `Stop` | 1 | 보드 기록 점검 |

어댑터는 `exec_command.cmd`를 Claude의 `Bash.command`로 변환합니다. `apply_patch`의 추가·수정·삭제·이동 경로를 각각 검사합니다. 소유권 기준은 셸의 `cd`가 아니라 transcript의 최초 세션 경로입니다. 토큰은 누적 사용량 대신 마지막 `input_tokens`를 읽습니다. `SessionStart`의 일반 문자열은 Codex `additionalContext` JSON으로 감싸 전달합니다.

필요한 로컬 원본:

```text
~/.claude/hooks/
  ownership_guard.py
  board_check.py
  tower_bootstrap.py
  plan-guidance.py
  improve-prompt.py
  caveman-reinforce-ultra.js
~/Scripts/
  session-context.ps1
  guard-dangerous-bash.ps1
  ensure-utf8-bom.ps1
```

Python·Node·Windows PowerShell과 위 파일을 먼저 확인하세요. 생성기는 설치·다운로드를 하지 않습니다. 원본 파일 누락이나 실행 오류는 성공으로 숨기지 않습니다.

`CLAUDE_HOME`, `CLAUDE_SCRIPTS_DIR`, `CLAUDE_MANAGER_CWD` 환경변수로 경로를 바꿀 수 있습니다. 기본값은 각각 `~/.claude`, `~/Scripts`, `C:\`입니다. 관리자 경로에서는 입력 200K부터 `/compact`, 300K부터 교대를 안내합니다. 프로젝트별 기준은 원본 정책 훅에서 정합니다.

PowerShell에서 예제 폴더를 현재 디렉터리로 두고 미리보기:

```powershell
python ./render_hooks.py --python (Get-Command python).Source
```

출력은 **PowerShell용**입니다. 작은따옴표와 공백이 있는 경로를 이스케이프하고 `exit $LASTEXITCODE`로 차단 코드 `2`를 보존합니다. CMD·bash에 그대로 사용하지 마세요. 출력 검토 후 기존 `~/.codex/hooks.json`을 백업하고 병합합니다. `claude_compat.py`는 `~/.codex/hooks/`에 둡니다. 다른 훅을 덮어쓰거나 중복 등록하지 마세요.

Codex의 `/hooks`에서 명령 내용을 검토하고 신뢰 승인합니다. 신뢰 해시·자격증명·세션 상태는 배포하지 않습니다. 명령 정의가 바뀌면 다시 검토해야 합니다. [공식 훅 문서](https://learn.chatgpt.com/docs/hooks).

## 일정 6개

모두 `Asia/Seoul`, **`PAUSED` 유지**.

| 워크플로 | 예약 |
|---|---|
| `daily-report` | 평일 17:40 |
| `weekly-report` | 금요일 17:45 |
| `control-tower-sweep-evening` | 평일 18:03 |
| `control-tower-sweep-night` | 매일 07:03·23:03 |
| `control-tower-sweep` | 평일 09~17시, 매시 03·23·43분; 원본도 비활성 |
| `monthly-memory-consolidation` | 매월 첫 금요일 14:00 |

월간은 `BYDAY=FR;BYSETPOS=1`입니다. 일반 cron의 `0 14 1-7 * 5`는 날짜와 요일의 OR 조건 때문에 같은 일정이 아닙니다. 기존 [cron 예제](../examples/scheduled-tasks/crontab.example)는 수동 참고용이며 등록되지 않습니다.

원본 워크플로를 로컬 `~/.codex/scheduled-tasks/<workflow>/SKILL.md`로 이관한 뒤 앱의 자동화 도구로 예약식을 등록합니다. 사용자 요청 전 활성화하지 않습니다. 외부 쓰기·다른 채팅 메시지·삭제·설치·커밋은 해당 사용자 확인 규칙을 적용합니다. 주간보고의 팀 요약은 프로젝트별 한 행입니다. 메모리 정리는 후보 보고까지만 수행합니다.

## 스킬·MCP

기존 Codex용 `SKILL.md`의 도구 이름 변환을 보존하면서 목록을 대조하세요. `pptx-aim`의 자산, Google Workspace의 `references/docs.md`·`references/sheets.md`도 함께 확인합니다. 원본을 통째로 덮어쓰지 않습니다. 내장·플러그인은 각 런타임의 설치·라이선스를 따릅니다.

HWP MCP는 로컬에서 이미 설치한 Node 서버 파일을 사용합니다. npm 캐시 절대경로나 `npx -y ...@latest` 자동 설치를 복사하지 않습니다. 아래는 기존 설치가 있는 경우의 설정 조각입니다.

```toml
[mcp_servers.hwp-mcp]
command = '<NODE_EXE>'
args = ['<INSTALLED_HWP_MCP>/dist/server.js']
startup_timeout_sec = 30
```

## 검증과 한계

```powershell
python -B -m unittest discover -s tests -p "test_*.py" -v
```

테스트는 외부 쓰기·전역 설치 없이 어댑터의 경로 변환, 차단 코드, 컨텍스트 JSON, 템플릿 인용과 예약식을 확인합니다. 원본 사용자 훅의 정책·실제 Codex 신뢰 상태는 각 머신에서 별도로 확인해야 합니다.

로컬 환경에서는 이전에 네이티브 lifecycle 14회(정상 12·의도한 차단 2)를 확인했습니다. 이는 저장소 테스트의 재실행 결과와 구분합니다. 모델, Claude 상태표시줄, 메모리 자동 병합은 동등하게 재현되지 않습니다. Notion·시트 실제 쓰기 및 정기 작업 실행은 검증 범위에 포함하지 않습니다.
