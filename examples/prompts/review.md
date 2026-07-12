<!-- 커스텀 프롬프트 예시 → ~/.codex/prompts/review.md 로 두면 /prompts:review 로 호출.
     호출: /prompts:review FILE=src/auth.js FOCUS="에러 처리"
     참고: 커스텀 프롬프트는 현재 docs에서 deprecated(스킬 권장). 재사용 절차는 examples/skills/ 참고. -->
---
description: 지정 파일을 간결하게 코드 리뷰
argument-hint: FILE=<경로> [FOCUS=<초점>]
---

`$FILE` 의 코드를 리뷰해줘. 특히 **$FOCUS** 관점에 집중하되, 없으면 정확성·보안·경계 조건을 우선으로:

1. 버그·경계 조건·에러 처리 누락
2. 보안 이슈(인젝션·비밀 노출·권한)
3. 단순화·중복 제거 여지

발견은 심각도 높은 순으로, 각 항목에 `파일:라인`을 앵커로 달아줘. 수정은 제안만 하고 자동 적용하지 마.
