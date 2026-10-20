import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import mock_open, patch


ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / 'examples' / 'claude-parity'


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, EXAMPLES / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


adapter = load('claude_compat', 'claude_compat.py')
renderer = load('render_hooks', 'render_hooks.py')


class AdapterTests(unittest.TestCase):
    def test_exec_command_normalization(self):
        source = {'tool_name': 'functions.exec_command', 'tool_input': {'cmd': 'echo ok'}}
        result = adapter.normalized(source)
        self.assertEqual(result['tool_name'], 'Bash')
        self.assertEqual(result['tool_input']['command'], 'echo ok')
        self.assertNotIn('command', source['tool_input'])

    def test_patch_checks_every_path_and_stops_on_block(self):
        data = {'cwd': str(ROOT), 'tool_name': 'apply_patch', 'tool_input':
                '*** Update File: a.py\n*** Move to: ../other/b.py\n*** Delete File: old.py\n'}
        with patch.object(adapter, 'python_hook', side_effect=[0, 2]) as hook:
            self.assertEqual(adapter.main('ownership', data), 2)
        self.assertEqual(hook.call_count, 2)
        self.assertTrue(hook.call_args.args[1]['tool_input']['file_path'].endswith('b.py'))

    def test_bom_does_not_write_deleted_path(self):
        data = {'cwd': str(ROOT), 'tool_name': 'apply_patch', 'tool_input':
                '*** Delete File: old.py\n*** Add File: new.py\n'}
        with patch.object(adapter, 'powershell_hook', return_value=0) as hook:
            self.assertEqual(adapter.main('bom', data), 0)
        self.assertEqual(hook.call_count, 1)
        self.assertTrue(hook.call_args.args[1]['tool_input']['file_path'].endswith('new.py'))

    def test_session_origin_overrides_shell_directory(self):
        record = json.dumps({'type': 'session_meta', 'payload': {'cwd': 'original'}})
        data = {'cwd': 'changed', 'transcript_path': 'fixture.jsonl', 'tool_name': 'Edit'}
        with patch('builtins.open', mock_open(read_data=record)), \
                patch.object(adapter, 'python_hook', return_value=0) as hook:
            adapter.main('ownership', data)
        self.assertEqual(hook.call_args.args[1]['cwd'], 'original')
        self.assertIsNone(hook.call_args.args[1]['transcript_path'])

    def test_session_context_is_valid_codex_json(self):
        result = subprocess.CompletedProcess([], 0, '[세션 컨텍스트]\n한글', '')
        out = io.StringIO()
        with patch.object(adapter.subprocess, 'run', return_value=result), \
                contextlib.redirect_stdout(out):
            self.assertEqual(adapter.main('session-context', {}), 0)
        body = json.loads(out.getvalue())['hookSpecificOutput']
        self.assertEqual(body['hookEventName'], 'SessionStart')
        self.assertIn('한글', body['additionalContext'])

    def test_block_return_code_preserved(self):
        result = subprocess.CompletedProcess([], 2, '', 'blocked')
        with patch.object(adapter.subprocess, 'run', return_value=result), \
                contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(adapter.main('dangerous-command', {}), 2)

    def test_context_uses_last_input_only(self):
        records = [json.dumps({'type': 'event_msg', 'payload': {'type': 'token_count', 'info': {
            'last_token_usage': {'input_tokens': n, 'cached_input_tokens': n - 1},
            'total_token_usage': {'input_tokens': n * 10}}}}).encode() for n in (100, 230000)]
        stream = io.BytesIO(b'\n'.join(records))
        with patch('builtins.open', return_value=stream):
            self.assertEqual(adapter.codex_context_tokens('fixture'), 230000)

    def test_missing_context_is_unknown(self):
        self.assertIsNone(adapter.codex_context_tokens(None))
        with patch('builtins.open', side_effect=OSError):
            self.assertIsNone(adapter.codex_context_tokens('missing'))

    def test_unknown_action_fails(self):
        with self.assertRaises(ValueError):
            adapter.main('unknown', {})


class DefinitionTests(unittest.TestCase):
    @unittest.skipUnless(os.name == 'nt', 'Windows PowerShell 검증')
    def test_real_powershell_preserves_block_code(self):
        template = json.loads((EXAMPLES / 'hooks.template.json').read_text(encoding='utf-8'))
        generated = renderer.render(template, sys.executable, 'node',
                                    ROOT / 'tests/fixtures/exit_two.py', Path('unused'))
        command = generated['hooks']['PreToolUse'][0]['hooks'][0]['command']
        result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive',
                                 '-Command', command], input='{"fixture": true}',
                                capture_output=True, encoding='utf-8', timeout=20)
        self.assertEqual(result.returncode, 2, result.stderr)

    def test_template_has_twelve_handlers(self):
        template = json.loads((EXAMPLES / 'hooks.template.json').read_text(encoding='utf-8'))
        counts = {event: sum(len(g['hooks']) for g in groups)
                  for event, groups in template['hooks'].items()}
        self.assertEqual(counts, {'PreToolUse': 3, 'UserPromptSubmit': 4,
                                 'Stop': 1, 'SessionStart': 3, 'PostToolUse': 1})
        generated = renderer.render(template, "C:/O'Brien/python.exe", 'node',
                                    'C:/with space/adapter.py', Path('C:/user/.claude'))
        for groups in generated['hooks'].values():
            for group in groups:
                for hook in group['hooks']:
                    self.assertTrue(hook['command'].startswith("& '"))
                    if not hook['command'].startswith("& 'node'"):
                        self.assertIn("O''Brien", hook['command'])
                    self.assertTrue(hook['command'].endswith('exit $LASTEXITCODE'))
                    self.assertNotIn('<ADAPTER>', hook['command'])

    def test_shell_quote_rejects_linebreaks(self):
        self.assertEqual(renderer.ps_quote("O'Brien"), "'O''Brien'")
        for value in ('a\nb', 'a\rb', 'a\x00b'):
            with self.assertRaises(ValueError):
                renderer.ps_quote(value)

    def test_schedules_all_paused_and_correct(self):
        catalog = json.loads((EXAMPLES / 'schedules.json').read_text(encoding='utf-8'))
        self.assertEqual(catalog['timezone'], 'Asia/Seoul')
        tasks = {t['workflow']: t for t in catalog['tasks']}
        self.assertEqual(len(tasks), 6)
        self.assertTrue(all(t['status'] == 'PAUSED' for t in tasks.values()))
        self.assertEqual(tasks['daily-report']['rrule'],
                         'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=17;BYMINUTE=40;BYSECOND=0')
        self.assertEqual(tasks['monthly-memory-consolidation']['rrule'],
                         'RRULE:FREQ=MONTHLY;BYDAY=FR;BYSETPOS=1;BYHOUR=14;BYMINUTE=0;BYSECOND=0')

    def test_skill_inventory(self):
        catalog = json.loads((EXAMPLES / 'skills.json').read_text(encoding='utf-8'))
        self.assertEqual(len(catalog['skills']), 26)
        self.assertEqual(len(set(catalog['skills'])), 26)
        self.assertEqual(set(catalog['enabled_overrides']), {'codex-image', 'pptx-aim'})


if __name__ == '__main__':
    unittest.main()
