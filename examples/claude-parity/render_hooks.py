"""Windows PowerShell용 훅 정의 생성. 설치·신뢰 승인·원본 수정은 하지 않는다."""
import argparse
import json
from pathlib import Path
import sys


def ps_quote(value):
    if '\n' in value or '\r' in value or '\x00' in value:
        raise ValueError('경로에 줄바꿈이나 NUL을 사용할 수 없습니다.')
    return "'" + value.replace("'", "''") + "'"


def render(template, python, node, adapter, claude):
    values = {
        '<PYTHON>': ps_quote(str(python)),
        '<NODE>': ps_quote(str(node)),
        '<ADAPTER>': ps_quote(str(adapter)),
        '<IMPROVE_PROMPT>': ps_quote(str(claude / 'hooks' / 'improve-prompt.py')),
        '<CAVEMAN>': ps_quote(str(claude / 'hooks' / 'caveman-reinforce-ultra.js')),
    }
    result = json.loads(json.dumps(template))
    for groups in result['hooks'].values():
        for group in groups:
            for hook in group['hooks']:
                for token, value in values.items():
                    hook['command'] = hook['command'].replace(token, value)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--python', default=sys.executable)
    parser.add_argument('--node', default='node')
    parser.add_argument('--adapter', type=Path,
                        default=Path.home() / '.codex' / 'hooks' / 'claude_compat.py')
    parser.add_argument('--claude-home', type=Path, default=Path.home() / '.claude')
    args = parser.parse_args()
    template = json.loads(Path(__file__).with_name('hooks.template.json').read_text(encoding='utf-8'))
    result = render(template, args.python, args.node, args.adapter, args.claude_home)
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
