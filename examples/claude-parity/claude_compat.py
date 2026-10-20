"""Claude 사용자 훅을 Codex 이벤트에 연결한다. 원본 설정은 수정하지 않는다."""
import copy
import json
import os
from pathlib import Path
import re
import subprocess
import sys

CLAUDE = Path(os.environ.get('CLAUDE_HOME', Path.home() / '.claude'))
SCRIPTS = Path(os.environ.get('CLAUDE_SCRIPTS_DIR', Path.home() / 'Scripts'))
MANAGER_CWD = os.environ.get('CLAUDE_MANAGER_CWD', 'C:\\')


def session_cwd(data):
    """셸의 cd 대신 Codex 세션의 최초 작업 폴더를 소유권 기준으로 사용."""
    transcript = data.get('transcript_path')
    if transcript:
        try:
            with open(transcript, encoding='utf-8-sig') as stream:
                for index, line in enumerate(stream):
                    if index >= 32:
                        break
                    record = json.loads(line)
                    if record.get('type') == 'session_meta':
                        return record.get('payload', {}).get('cwd') or data.get('cwd')
        except (OSError, ValueError):
            pass
    return data.get('cwd') or os.getcwd()


def patch_paths(data, include_deleted=True):
    value = data.get('tool_input') or {}
    patch = value if isinstance(value, str) else (
        value.get('command') or value.get('patch') or value.get('input') or '')
    kinds = 'Add File|Update File|Move to' + ('|Delete File' if include_deleted else '')
    return re.findall(r'^\*\*\* (?:' + kinds + r'): (.+)\r?$', patch, re.M)


def normalized(data):
    result = copy.deepcopy(data)
    value = result.get('tool_input') or {}
    if not isinstance(value, dict):
        value = {'command': value}
    if 'command' not in value and 'cmd' in value:
        value['command'] = value['cmd']
    result['tool_input'] = value
    if result.get('tool_name', '').split('.')[-1] in ('exec_command', 'shell', 'shell_command'):
        result['tool_name'] = 'Bash'
    return result


def invoke(command, data, timeout=12, context_event=None):
    result = subprocess.run(command, input=json.dumps(data, ensure_ascii=False),
                            encoding='utf-8', errors='replace', capture_output=True,
                            timeout=timeout,
                            env={**os.environ, 'PYTHONIOENCODING': 'utf-8', 'PYTHONUTF8': '1'})
    if result.stdout:
        if context_event:
            emit_context(context_event, result.stdout.strip())
        else:
            sys.stdout.write(result.stdout)
    if result.stderr:
        sys.stderr.write(result.stderr)
    return result.returncode


def python_hook(name, data):
    return invoke([sys.executable, str(CLAUDE / 'hooks' / name)], data)


def powershell_hook(name, data, context_event=None):
    return invoke(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass',
                   '-File', str(SCRIPTS / name)], data, timeout=18,
                  context_event=context_event)


def emit_context(event, message):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': event,
                                             'additionalContext': message}}, ensure_ascii=False))


def codex_context_tokens(path):
    if not path:
        return None
    try:
        with open(path, 'rb') as stream:
            stream.seek(0, os.SEEK_END)
            stream.seek(max(0, stream.tell() - 400_000))
            lines = stream.read().decode('utf-8', 'ignore').splitlines()
        for line in reversed(lines):
            try:
                record = json.loads(line)
            except ValueError:
                continue
            payload = record.get('payload') or {}
            if record.get('type') == 'event_msg' and payload.get('type') == 'token_count':
                usage = (payload.get('info') or {}).get('last_token_usage') or {}
                tokens = usage.get('input_tokens')
                if isinstance(tokens, int):
                    return tokens
    except OSError:
        pass
    return None


def main(action, data):
    data = normalized(data)
    operation_cwd = data.get('cwd') or os.getcwd()
    if action in ('ownership', 'board', 'bootstrap', 'context-cap'):
        data['cwd'] = session_cwd(data)
        # Claude 프로젝트 슬러그 판정은 Codex transcript 경로에 적용할 수 없다.
        if action in ('ownership', 'board'):
            data['transcript_path'] = None
    if action == 'session-context':
        return powershell_hook('session-context.ps1', data, context_event='SessionStart')
    if action == 'dangerous-command':
        return powershell_hook('guard-dangerous-bash.ps1', data)
    if action == 'ownership':
        if data.get('tool_name', '').split('.')[-1] == 'apply_patch':
            # 이동의 원본/목적지와 삭제 경로도 각각 검사한다.
            for filename in patch_paths(data):
                item = copy.deepcopy(data)
                item['tool_name'] = 'Edit'
                item['tool_input'] = {'file_path': os.path.abspath(
                    os.path.join(operation_cwd, filename.strip()))}
                result = python_hook('ownership_guard.py', item)
                if result:
                    return result
            return 0
        return python_hook('ownership_guard.py', data)
    if action == 'bom':
        if data.get('tool_name', '').split('.')[-1] == 'apply_patch':
            for filename in patch_paths(data, include_deleted=False):
                item = copy.deepcopy(data)
                item['tool_name'] = 'Edit'
                item['tool_input'] = {'file_path': os.path.abspath(
                    os.path.join(operation_cwd, filename.strip()))}
                result = powershell_hook('ensure-utf8-bom.ps1', item)
                if result:
                    return result
            return 0
        return powershell_hook('ensure-utf8-bom.ps1', data)
    if action == 'board':
        return python_hook('board_check.py', data)
    if action == 'bootstrap':
        return python_hook('tower_bootstrap.py', data)
    if action == 'plan':
        return python_hook('plan-guidance.py', data)
    if action == 'context-cap':
        if os.path.normcase(os.path.normpath(data['cwd'])) != os.path.normcase(os.path.normpath(MANAGER_CWD)):
            return 0
        tokens = codex_context_tokens(data.get('transcript_path'))
        if tokens is not None and tokens >= 200_000:
            guidance = ('새 관리자 채팅 교대를 권할 것. 인수 자료는 _manager.md와 보드.'
                        if tokens >= 300_000 else '/compact를 권할 것.')
            emit_context('UserPromptSubmit', f'[컨텍스트 상한] 관리자 입력 {tokens // 1000}K. {guidance}')
        return 0
    if action == 'caveman-mode':
        try:
            mode = (CLAUDE / '.caveman-active').read_text(encoding='utf-8-sig').strip().lower()
        except OSError:
            return 0
        if mode in ('full', 'lite', 'ultra', 'caveman', 'ultracave'):
            emit_context(data.get('hook_event_name') or 'SessionStart',
                         f'[Claude와 동일 응답 모드: caveman {mode}] 한국어로 짧고 명확하게. '
                         '군더더기·자평·반복을 생략하고, 기술 사실·검증 결과·필요한 확인은 보존한다. '
                         '코드 식별자·명령·오류 문자열은 줄이지 않는다. 사용자 확인 규칙이 우선한다.')
        return 0
    raise ValueError(f'지원하지 않는 훅: {action}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    try:
        sys.exit(main(sys.argv[1], json.load(sys.stdin)))
    except (ValueError, OSError, subprocess.TimeoutExpired) as error:
        # 예외를 조용히 성공으로 처리하지 않는다. Codex가 훅 실패를 보고한다.
        sys.stderr.write(f'[Claude 호환 훅 오류] {type(error).__name__}\n')
        sys.exit(1)
