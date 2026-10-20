"""실제 셸의 종료 코드 전달 검증용. 외부 작업은 수행하지 않는다."""
import json
import sys

assert sys.argv[1] == 'plan'
assert json.load(sys.stdin) == {'fixture': True}
sys.exit(2)
