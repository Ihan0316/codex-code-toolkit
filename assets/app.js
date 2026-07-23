/* ===== Codex CLI 셋업 툴킷 · 문서 사이트 ===== */
(function () {
  "use strict";

  var REPO = "Ihan0316/codex-code-toolkit";
  var BLOB = "https://github.com/" + REPO + "/blob/main";

  var NAV = [
    { g: "시작하기" },
    { id: "home", landing: true, title: "홈", num: "◎" },
    { id: "overview", file: "README.md", title: "전체 개요", num: "~" },
    { id: "00-quickstart", file: "docs/00-quickstart.md", title: "빠른 시작", num: "00" },
    { g: "핵심" },
    { id: "01-sandbox-approvals", file: "docs/01-sandbox-approvals.md", title: "샌드박스·승인·훅", num: "01" },
    { id: "02-skills", file: "docs/02-skills.md", title: "스킬", num: "02" },
    { id: "03-memory", file: "docs/03-memory.md", title: "메모리 & AGENTS.md", num: "03" },
    { id: "04-automation", file: "docs/04-automation.md", title: "자동 루틴", num: "04" },
    { g: "확장" },
    { id: "05-mcp", file: "docs/05-mcp.md", title: "MCP 서버", num: "05" },
    { id: "06-reasoning-context", file: "docs/06-reasoning-context.md", title: "추론 강도·컨텍스트", num: "06" },
    { id: "07-config-backup", file: "docs/07-config-backup.md", title: "config · 백업", num: "07" },
    { id: "08-sync-infra", file: "docs/08-sync-infra.md", title: "양 머신 동기화", num: "08" },
    { id: "09-subagents", file: "docs/09-subagents.md", title: "서브에이전트", num: "09" },
    { g: "레퍼런스" },
    { id: "10-ecosystem", file: "docs/10-ecosystem.md", title: "확장 생태계", num: "10" },
    { id: "11-inventory", file: "docs/11-inventory.md", title: "전체 인벤토리", num: "11" }
  ];

  var PAGES = NAV.filter(function (n) { return n.id; });

  var CALLOUT = {
    NOTE:      { icon: "🛈", label: "참고" },
    TIP:       { icon: "✦", label: "팁" },
    IMPORTANT: { icon: "★", label: "중요" },
    WARNING:   { icon: "▲", label: "주의" },
    CAUTION:   { icon: "⛔", label: "경고" }
  };

  /* ================= 랜딩 페이지 데이터 ================= */
  var L = {
    kicker: "~/.codex · dev setup toolkit",
    titleWords: ['Codex', 'CLI를', '<span class="hl">손에 맞게</span>', '길들이기'],
    sub: '실무에서 매일 쓰며 다듬은 AGENTS.md · 샌드박스 · 훅 · MCP · 자동화. ' +
         '단순 "이렇게 하세요"가 아니라 <b>무엇을 / 왜 썼고 / 무엇이 좋아졌는지</b>까지 적었습니다.',
    stats: [
      { n: 12, s: "docs" }, { n: 3, s: "sandbox" }, { n: 10, s: "hooks" }, { n: 0, s: "secrets" }
    ],
    termTitle: "codex — 세션 데모",
    term: [
      { t: "cmd",   s: 'codex "의존성 정리하고 커밋해줘"' },
      { t: "run",   s: "Bash(curl https://get.tool.sh | sh)" },
      { t: "block", s: "sandbox — 네트워크 차단 (workspace-write)" },
      { t: "ok",    s: "승인 후 재시도 → 완료" },
      { t: "cmd",   s: 'codex "일일 보고 만들어줘"' },
      { t: "run",   s: "Skill(daily-report) 로드" },
      { t: "ok",    s: "보고서 생성 완료 · 2.1s" }
    ],
    marquee: ["sandbox", "approvals", "AGENTS.md", "/memories", "Skills", "MCP", "codex exec", "cron", "notify", "/compact", "profiles", "Sync"],
    flow: [
      { g: "$", t: "지시한다", d: "평소처럼 자연어로 시킵니다. 셋업은 뒤에서 조용히 동작합니다." },
      { g: "⚡", t: "샌드박스가 감싼다", d: "워크스페이스 밖 쓰기·네트워크는 커널이 막고, 훅이 그 위를 보강합니다." },
      { g: "✓", t: "안전하게 끝난다", d: "결과만 받습니다. 실수는 시스템이 이미 걸러냈습니다." }
    ],
    bento: [
      { k: "Sandbox", t: "위험은 커널이 먼저 막는다", id: "01-sandbox-approvals", w2: true,
        d: "샌드박스 + 승인 정책 + lifecycle 훅의 3중 방어. 프롬프트는 설득이고 샌드박스는 물리 법칙입니다.",
        mini: '<span class="tk-k">sandbox_mode</span> <span class="tk-p">=</span> <span class="tk-s">"workspace-write"</span>  <span class="tk-c"># 네트워크 기본 차단</span>' },
      { k: "Memory", t: "세션을 넘는 기억", id: "03-memory",
        d: "AGENTS.md 계층 + /memories 영속 기억.",
        tree: '~/.codex/\n├─ <b>AGENTS.md</b>       <i>← 글로벌</i>\n└─ 프로젝트/AGENTS.md' },
      { k: "Skills", t: "검증된 절차를 한마디로", id: "02-skills",
        d: 'SKILL.md 모듈로 절차를 캡슐화. "일일 보고 만들어줘" 한마디면 충분합니다.' },
      { k: "MCP", t: "외부 시스템 직접 조작", id: "05-mcp",
        d: "노션·피그마·문서검색을 Codex가 직접 다룹니다. 복붙 왕복이 사라집니다." },
      { k: "Automation", t: "헤드리스로 알아서 돈다", id: "04-automation",
        d: "codex exec·cron·notify로 보고와 백업을 자동화합니다." },
      { k: "Reasoning", t: "난제엔 깊게, 반복엔 얕게", id: "06-reasoning-context", strip: true,
        d: "model_reasoning_effort와 /compact로 토큰과 정확도를 상황에 맞게 조절합니다." }
    ],
    steps: [
      { n: 1, t: "AGENTS.md 글로벌 지침", e: 3, lv: "쉬움", id: "00-quickstart" },
      { n: 2, t: "샌드박스·승인 프리셋", e: 3, lv: "쉬움", id: "01-sandbox-approvals" },
      { n: 3, t: "메모리 & AGENTS.md 계층", e: 3, lv: "중간", id: "03-memory" },
      { n: 4, t: "PreToolUse 위험명령 훅", e: 2, lv: "중간", id: "01-sandbox-approvals" },
      { n: 5, t: "SessionStart 컨텍스트 훅", e: 2, lv: "중간", id: "01-sandbox-approvals" },
      { n: 6, t: "스킬 설치", e: 2, lv: "쉬움", id: "02-skills" }
    ],
    dots: [
      { id: "lp-a-hero", label: "시작" },
      { id: "lp-a-flow", label: "동작 방식" },
      { id: "lp-a-bento", label: "구성" },
      { id: "lp-a-steps", label: "도입 순서" },
      { id: "lp-a-cta", label: "시작하기" }
    ],
    bandTitle: "10분이면 핵심 3개가 켜집니다",
    bandSub: "설치 순서, 각 항목이 무엇을 막아 주는지, 실패했을 때 무엇을 보면 되는지까지 문서에 있습니다."
  };

  function esc(s) { return escapeHtml(s); }

  function landingHTML() {
    var h = "";

    /* hero — 좌: 카피 / 우: 라이브 터미널 */
    h += '<section class="lp-hero" id="lp-a-hero">' +
      '<div class="lp-hero-copy">' +
        '<div class="lp-kicker"><span class="pulse"></span>' + esc(L.kicker) + '</div>' +
        '<h1 class="lp-title">' +
          L.titleWords.map(function (w, i) {
            return '<span class="w" style="animation-delay:' + (.12 + i * .09).toFixed(2) + 's">' + w + '</span>';
          }).join(" ") +
        '</h1>' +
        '<p class="lp-sub">' + L.sub + '</p>' +
        '<div class="lp-cta">' +
          '<a class="btn btn-primary magnet" href="#/00-quickstart">10분 만에 시작</a>' +
          '<a class="btn btn-ghost magnet" href="https://github.com/' + REPO + '" target="_blank" rel="noopener">GitHub</a>' +
        '</div>' +
        '<div class="lp-stats">' +
          L.stats.map(function (s) {
            return '<div class="lp-stat"><b data-count="' + s.n + '">0</b><span>' + esc(s.s) + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="lp-term" aria-label="터미널 데모">' +
        '<div class="lp-term-head"><span class="dots"><i></i><i></i><i></i></span><span>' + esc(L.termTitle) + '</span></div>' +
        '<div class="lp-term-body" id="lpTerm"></div>' +
      '</div>' +
    '</section>';

    /* marquee */
    var mq = L.marquee.map(function (w) { return esc(w) + ' <i>▸</i>'; }).join(" ");
    h += '<div class="lp-marquee" aria-hidden="true"><div class="track"><span>' + mq + '</span><span>' + mq + '</span></div></div>';

    /* how it works */
    h += '<section class="lp-sec reveal lp-flow-wrap" id="lp-a-flow">' +
      '<span class="ghost" aria-hidden="true">01</span>' +
      '<div class="lp-eyebrow">How it works</div>' +
      '<h2 class="lp-h2">쓰던 대로 쓰면, <span class="hl">나머지는 시스템이</span></h2>' +
      '<p class="lp-lead">명령을 바꿀 필요가 없습니다. 훅과 메모리가 매 턴 사이에서 조용히 일합니다.</p>' +
      '<div class="lp-flow">' +
        L.flow.map(function (n) {
          return '<div class="lp-node"><span class="bead">' + n.g + '</span>' +
                 '<h3>' + esc(n.t) + '</h3><p>' + esc(n.d) + '</p></div>';
        }).join("") +
      '</div>' +
    '</section>';

    /* bento */
    h += '<section class="lp-sec reveal" id="lp-a-bento">' +
      '<span class="ghost" aria-hidden="true">02</span>' +
      '<div class="lp-eyebrow">The system</div>' +
      '<h2 class="lp-h2">여섯 개의 <span class="hl">축</span></h2>' +
      '<p class="lp-lead">훅이 안전을, 스킬·메모리·MCP가 능력과 기억을, 루틴·동기화가 반복과 보존을 맡습니다.</p>' +
      '<div class="lp-bento">' +
        L.bento.map(function (c) {
          var cls = "lp-cell" + (c.w2 ? " w2" : "") + (c.strip ? " strip" : "");
          var body = '<div class="lp-cell-k">' + esc(c.k) + '</div>' +
            '<h3>' + esc(c.t) + '</h3><p>' + esc(c.d) + '</p>';
          if (c.mini) body += '<div class="lp-mini">' + c.mini + '</div>';
          if (c.tree) body += '<div class="lp-tree">' + c.tree + '</div>';
          body += '<span class="go" aria-hidden="true">자세히 →</span>';
          return '<a class="' + cls + '" href="#/' + c.id + '">' + body + '</a>';
        }).join("") +
      '</div>' +
    '</section>';

    /* steps */
    h += '<section class="lp-sec reveal lp-steps-wrap" id="lp-a-steps">' +
      '<span class="ghost" aria-hidden="true">03</span>' +
      '<div class="lp-eyebrow">Adoption path</div>' +
      '<h2 class="lp-h2">위에서부터 <span class="hl">차례로</span></h2>' +
      '<p class="lp-lead">앞 3개만 켜도 매일의 체감이 바뀝니다. 오른쪽 막대는 체감 효과, 그 옆은 난이도입니다.</p>' +
      '<ol class="lp-steps">' +
        L.steps.map(function (s) {
          var bars = "";
          for (var i = 0; i < 3; i++) bars += '<i class="' + (i < s.e ? "on" : "") + '"></i>';
          return '<li><a href="#/' + s.id + '">' +
            '<span class="lp-step-n">' + s.n + '</span>' +
            '<span class="lp-step-t">' + esc(s.t) + '</span>' +
            '<span class="lp-step-e" title="체감 효과">' + bars + '</span>' +
            '<span class="lp-step-lv">' + esc(s.lv) + '</span>' +
          '</a></li>';
        }).join("") +
      '</ol>' +
      '<p class="lp-more"><a href="#/overview">전체 10단계와 커버리지 맵 보기 →</a></p>' +
    '</section>';

    /* final band */
    h += '<section class="lp-band reveal" id="lp-a-cta">' +
      '<h2>' + esc(L.bandTitle) + '</h2>' +
      '<p>' + esc(L.bandSub) + '</p>' +
      '<div class="lp-cta">' +
        '<a class="btn btn-primary magnet" href="#/00-quickstart">빠른 시작 열기</a>' +
        '<a class="btn btn-ghost magnet" href="#/overview">전체 개요</a>' +
      '</div>' +
    '</section>';

    /* section dot nav */
    h += '<nav class="lp-dots" aria-label="랜딩 섹션">' +
      L.dots.map(function (d) {
        return '<a href="#" data-sec="' + d.id + '" aria-label="' + esc(d.label) + '"><span>' + esc(d.label) + '</span></a>';
      }).join("") +
    '</nav>';

    return h;
  }

  /* ---- 랜딩 상호작용 ---- */
  var revealObs = null, dotsObs = null;
  var termGen = 0;                       // 라우팅 시 이전 터미널 루프 무효화
  var FINE = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function setupLanding() {
    var items = contentEl.querySelectorAll(".reveal");
    if (REDUCE || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      countUp(true);
    } else {
      if (revealObs) revealObs.disconnect();
      revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          revealObs.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
      items.forEach(function (el) { revealObs.observe(el); });
      countUp(false);
    }
    startTerminal();
    setupDots();
    if (FINE && !REDUCE) setupMagnet();
  }

  /* 라이브 터미널 — cmd는 타이핑, 출력은 순차 등장. 끝나면 잠시 쉬고 재생 반복 */
  function startTerminal() {
    var el = document.getElementById("lpTerm");
    if (!el) return;
    var gen = ++termGen;
    if (REDUCE) {                         // 모션 최소화: 완성 상태 고정
      el.innerHTML = L.term.map(function (ln) { return '<span class="tl tl-' + ln.t + '">' + esc(ln.s) + "</span>"; }).join("");
      return;
    }
    function alive() { return gen === termGen && document.getElementById("lpTerm") === el; }
    function playFrom(idx) {
      if (!alive()) return;
      if (idx >= L.term.length) {         // 한 사이클 종료 → 쉬었다가 리셋
        setTimeout(function () {
          if (!alive()) return;
          el.style.opacity = "0";
          setTimeout(function () {
            if (!alive()) return;
            el.innerHTML = ""; el.style.opacity = "1"; playFrom(0);
          }, 420);
        }, 3200);
        return;
      }
      var ln = L.term[idx];
      var span = document.createElement("span");
      span.className = "tl tl-" + ln.t;
      el.appendChild(span);
      if (ln.t === "cmd") {               // 타이핑
        var caret = document.createElement("span");
        caret.className = "tl-caret"; span.appendChild(caret);
        var i = 0;
        (function type() {
          if (!alive()) return;
          if (i < ln.s.length) {
            caret.insertAdjacentText("beforebegin", ln.s.charAt(i)); i++;
            setTimeout(type, 26 + Math.random() * 34);
          } else {
            caret.remove();
            setTimeout(function () { playFrom(idx + 1); }, 340);
          }
        })();
      } else {                            // 즉시 출력 라인
        span.textContent = ln.s;
        setTimeout(function () { playFrom(idx + 1); }, ln.t === "block" ? 720 : 430);
      }
    }
    el.innerHTML = ""; el.style.transition = "opacity .4s"; el.style.opacity = "1";
    playFrom(0);
  }

  /* 섹션 도트 내비 — 현재 섹션 하이라이트 + 클릭 스크롤 */
  function setupDots() {
    var nav = contentEl.querySelector(".lp-dots");
    if (!nav) return;
    var links = nav.querySelectorAll("a[data-sec]");
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var sec = document.getElementById(a.getAttribute("data-sec"));
        if (sec) sec.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
      });
    });
    if (dotsObs) dotsObs.disconnect();
    if (!("IntersectionObserver" in window)) return;
    dotsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-sec") === en.target.id); });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    L.dots.forEach(function (d) { var s = document.getElementById(d.id); if (s) dotsObs.observe(s); });
  }

  function setupMagnet() {
    contentEl.querySelectorAll(".magnet").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        btn.style.transform = "translate(" + (px * 8).toFixed(1) + "px," + (py * 6 - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  function countUp(instant) {
    contentEl.querySelectorAll(".lp-stat b[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (instant || target === 0) { el.textContent = String(target); return; }
      var dur = 1100, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var contentEl = document.getElementById("content");
  var heroEl = document.getElementById("hero");
  var navEl = document.getElementById("nav");
  var tocEl = document.getElementById("toc");
  var pagerEl = document.getElementById("pager");
  var progressEl = document.getElementById("progress");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("overlay");
  var cache = {};
  var mermaidReady = null;
  // 한글 완비 폰트 우선 — SVG <text> 라벨이 한글 글리프를 바로 그린다
  var MERMAID_FONT = '"Pretendard Variable", Pretendard, system-ui, -apple-system, "Malgun Gothic", sans-serif';

  function slugify(text) {
    // GitHub 호환: 공백을 개별 하이픈으로(붕괴 금지) — '—'·'&'·'/' 제거 후 남는 이중 공백이 이중 하이픈이 됨
    return String(text).trim().toLowerCase()
      .replace(/[‍️]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s/g, "-");
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "dark"; }

  function getMermaid() {
    if (mermaidReady) return mermaidReady;
    mermaidReady = new Promise(function (resolve) {
      var tries = 0;
      (function poll() {
        if (window.__mermaid) {
          var dark = currentTheme() === "dark";
          window.__mermaid.initialize({
            startOnLoad: false, securityLevel: "loose",
            theme: "base",
            // 한글 라벨 렌더 핵심:
            // (1) htmlLabels:false → 라벨을 foreignObject(HTML) 대신 SVG <text>로 렌더.
            //     mermaid의 foreignObject HTML 라벨은 Chromium에서 한글 자모가 깨진다
            //     (단일행 라벨: "경계 위반"→"겨게 이바"). SVG <text>는 정상 렌더됨.
            // (2) fontFamily는 한글 완비 폰트(Pretendard) — SVG <text>가 한글 글리프를 바로 그림.
            fontFamily: MERMAID_FONT,
            htmlLabels: false,
            flowchart: { htmlLabels: false },
            themeVariables: {
              background: "transparent",
              fontFamily: MERMAID_FONT,
              primaryColor: dark ? "#181816" : "#f1f1e9",
              primaryBorderColor: dark ? "#45453f" : "#d2d2c4",
              primaryTextColor: dark ? "#f2f2ee" : "#17170f",
              lineColor: dark ? "#7c7c73" : "#a0a094",
              secondaryColor: dark ? "#111110" : "#f6f6ef",
              tertiaryColor: dark ? "#0a0a09" : "#fcfcf9",
              fontSize: "14px",
              // 시퀀스 다이어그램은 classDef를 쓰지 않아 기본 테마(흰 박스·노란 노트)가 그대로 나온다
              actorBkg: dark ? "#181816" : "#f1f1e9",
              actorBorder: dark ? "#45453f" : "#d2d2c4",
              actorTextColor: dark ? "#f2f2ee" : "#17170f",
              actorLineColor: dark ? "#45453f" : "#c6c6b8",
              signalColor: dark ? "#7c7c73" : "#a0a094",
              signalTextColor: dark ? "#a9a9a1" : "#62625a",
              labelBoxBkgColor: dark ? "#181816" : "#f1f1e9",
              labelBoxBorderColor: dark ? "#45453f" : "#d2d2c4",
              labelTextColor: dark ? "#f2f2ee" : "#17170f",
              loopTextColor: dark ? "#a9a9a1" : "#62625a",
              noteBkgColor: dark ? "#1e1f16" : "#f4f6e6",
              noteBorderColor: dark ? "#494c36" : "#d8dcbc",
              noteTextColor: dark ? "#f2f2ee" : "#17170f",
              activationBkgColor: dark ? "#232322" : "#e9e9de",
              activationBorderColor: dark ? "#45453f" : "#c6c6b8",
              sequenceNumberColor: dark ? "#0a0a09" : "#ffffff"
            }
          });
          resolve(window.__mermaid);
        } else if (tries++ < 150) { setTimeout(poll, 40); }
        else { resolve(null); }
      })();
    });
    return mermaidReady;
  }

  /* 다이어그램 색 톤다운 ------------------------------------------------
     문서의 classDef는 원색에 가까운 파스텔(#fff3cd, #e7d6ff …)이라 본문 옆에서 튄다.
     계열(경고=노랑, 확장=초록 …)은 정보이므로 색상(hue)은 두고 채도·명도만 눌러
     사이트 톤에 맞춘다. md는 그대로 두므로 GitHub에서는 원래 색으로 보인다. */
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return null;
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    var h = 0, s = 0, l = (mx + mn) / 2;
    if (d) {
      s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s, l: l };
  }
  function hslToHex(o) {
    var h = o.h / 360, s = o.s, l = o.l;
    function f(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var r, g, b;
    if (!s) { r = g = b = l; }
    else {
      var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3);
    }
    function hx(v) { var t = Math.round(v * 255).toString(16); return t.length < 2 ? "0" + t : t; }
    return "#" + hx(r) + hx(g) + hx(b);
  }
  function calmDiagramColors(src) {
    var dark = currentTheme() === "dark";
    return String(src).replace(/\b(fill|stroke|color)\s*:\s*(#[0-9a-fA-F]{3,6})/g, function (m, prop, hex) {
      var rgb = hexToRgb(hex); if (!rgb) return m;
      var c = rgbToHsl(rgb);
      if (c.s < .05) return m;                       // 이미 무채색이면 둔다
      if (prop === "color") {                        // 라벨 글자는 대비가 최우선
        return prop + ":" + (dark ? "#f2f2ee" : "#17170f");
      }
      if (prop === "fill") { c.s = Math.min(c.s, .22); c.l = dark ? .15 : .94; }
      else                 { c.s = Math.min(c.s, .18); c.l = dark ? .36 : .78; }
      return prop + ":" + hslToHex(c);
    });
  }

  // mermaid 11 + htmlLabels:false는 라벨을 HTML-escape한 뒤 SVG <text>에 넣는다.
  // 그래서 "A & B"가 화면에 "A &amp; B"로 보인다 (입력을 #38;/#amp;/&amp; 어느 표기로 줘도 동일).
  // 렌더가 끝난 뒤 텍스트 노드에서 엔티티를 되돌린다 — 텍스트 노드라 마크업으로 해석될 여지가 없다.
  var ENTITY = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#38;": "&" };
  function unescapeMermaidLabels() {
    contentEl.querySelectorAll(".mermaid svg text, .mermaid svg tspan").forEach(function (t) {
      if (t.childElementCount) return;             // 자식 tspan이 있으면 그쪽에서 처리
      var s = t.textContent;
      if (s.indexOf("&") < 0) return;
      var next = s.replace(/&(amp|lt|gt|quot|#39|#38);/g, function (m) { return ENTITY[m]; });
      if (next !== s) t.textContent = next;
    });
  }

  // On narrow screens mermaid fits diagrams to container width, shrinking text to ~30% (illegible).
  // Force each svg to its natural width (mermaid stores it as inline max-width) so .mermaid scrolls horizontally instead.
  function fitMermaidMobile() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 900px)").matches) return;
    contentEl.querySelectorAll(".mermaid svg").forEach(function (svg) {
      var natural = parseFloat(svg.style.maxWidth) || svg.getBBox && svg.getBBox().width;
      if (natural) { svg.style.width = Math.ceil(natural) + "px"; svg.style.maxWidth = "none"; }
    });
  }

  /* ---- sidebar ---- */
  function buildNav() {
    var html = "";
    NAV.forEach(function (n) {
      if (n.g) { html += '<div class="nav-group"><div class="nav-group-title">' + n.g + "</div>"; return; }
      html += '<a data-id="' + n.id + '" href="#/' + n.id + '"><span class="num">' + n.num + '</span>' + escapeHtml(n.title) + "</a>";
    });
    navEl.innerHTML = html;
  }
  function setActiveNav(id) {
    navEl.querySelectorAll("a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-id") === id); });
  }

  /* ---- render pipeline ---- */
  function decorate(root) {
    // 1) heading ids + anchors + TOC
    var toc = [];
    root.querySelectorAll("h1, h2, h3").forEach(function (h) {
      if (!h.id) h.id = slugify(h.textContent);
      if (h.tagName === "H2" || h.tagName === "H3") {
        toc.push({ id: h.id, text: h.textContent, lvl: h.tagName === "H3" ? 3 : 2 });
        var a = document.createElement("a");
        a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#"; a.setAttribute("aria-hidden", "true");
        h.insertBefore(a, h.firstChild);
      }
    });

    // 1b) layout tables (README 3-card blocks) — class instead of :has() for old browsers
    root.querySelectorAll("table").forEach(function (t) {
      if (t.querySelector("td[width]")) t.classList.add("layout-cards");
    });

    // 1c) wrap data tables in a horizontal-scroll container. Border/radius live on the
    //     wrapper so the table stays a real `display:table` (fills width, no empty gap).
    //     Most text tables compress to fit; only genuinely wide ones overflow and scroll.
    //     When a table does overflow, the wrapper gets tabindex=0 so keyboard-only users
    //     can scroll to the clipped columns (WCAG 2.1.1). Skip layout-cards.
    root.querySelectorAll("table").forEach(function (t) {
      if (t.classList.contains("layout-cards")) return;
      if (t.parentElement && t.parentElement.classList.contains("table-wrap")) return;
      var wrap = document.createElement("div");
      wrap.className = "table-wrap";
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
      if (t.scrollWidth > wrap.clientWidth + 1) wrap.tabIndex = 0;
    });

    // 2) mermaid blocks → div.mermaid (before code-window wrapping)
    root.querySelectorAll("pre code.language-mermaid").forEach(function (code) {
      var div = document.createElement("div");
      div.className = "mermaid"; div.textContent = calmDiagramColors(code.textContent);
      var pre = code.closest("pre"); if (pre) pre.replaceWith(div);
    });

    // 3) highlight + wrap remaining code blocks in a window chrome
    root.querySelectorAll("pre > code").forEach(function (code) {
      if (window.hljs) { try { window.hljs.highlightElement(code); } catch (e) {} }
      var pre = code.parentElement;
      var lang = (String(code.className).match(/language-([\w-]+)/) || [])[1] || "code";
      var wrap = document.createElement("div"); wrap.className = "code-block";
      var head = document.createElement("div"); head.className = "code-head";
      head.innerHTML = '<span class="code-lang">' + escapeHtml(lang) + '</span><button class="code-copy" type="button">복사</button>';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(head); wrap.appendChild(pre);
      var btn = head.querySelector(".code-copy");
      btn.addEventListener("click", function () {
        var txt = code.textContent;
        function ok() {
          btn.textContent = "복사됨 ✓"; btn.classList.add("done");
          setTimeout(function () { btn.textContent = "복사"; btn.classList.remove("done"); }, 1300);
        }
        function fail() {
          btn.textContent = "복사 실패";
          setTimeout(function () { btn.textContent = "복사"; }, 1300);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(ok).catch(fail);
        } else {
          // 비보안(http)·구형 브라우저 폴백
          var ta = document.createElement("textarea");
          ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(); }
          document.body.removeChild(ta);
        }
      });
    });

    // 4) GitHub alerts
    root.querySelectorAll("blockquote").forEach(function (bq) {
      var m = bq.textContent.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      if (!m) return;
      var type = m[1].toUpperCase();
      var firstP = bq.querySelector("p");
      if (firstP) {
        firstP.innerHTML = firstP.innerHTML.replace(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?\s*\n?/i, "");
        if (!firstP.textContent.trim() && !firstP.querySelector("img,code")) firstP.remove();
      }
      bq.classList.add("callout", "callout-" + type.toLowerCase());
      var head = document.createElement("div"); head.className = "callout-title";
      head.innerHTML = '<span class="ico">' + CALLOUT[type].icon + "</span><span>" + CALLOUT[type].label + "</span>";
      bq.prepend(head);
    });

    // 5) link rewrite
    root.querySelectorAll("a[href]").forEach(function (a) {
      if (a.classList.contains("anchor")) return;
      var href = a.getAttribute("href"); if (!href) return;
      if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener"; return; }
      if (href.charAt(0) === "#") return;
      // README는 랜딩(#/home)이 아니라 '전체 개요' 페이지다 — 문서 하단의 "목차" 링크가 여기로 온다
      if (/README\.md(#.*)?$/i.test(href)) {
        var frag = (href.match(/#(.*)$/) || [])[1];
        a.setAttribute("href", "#/overview" + (frag ? "#" + frag : ""));
        return;
      }
      var md = href.match(/(?:^|\/)(\d\d-[a-z0-9-]+)\.md(#[^)]*)?$/i);
      if (md) { a.setAttribute("href", "#/" + md[1] + (md[2] || "")); return; }
      var clean = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
      a.setAttribute("href", BLOB + "/" + clean); a.target = "_blank"; a.rel = "noopener";
    });

    return toc;
  }

  /* 문서 페이지를 랜딩과 같은 리듬으로 — 콘텐츠(md)는 그대로 두고 렌더 단계에서만 손본다 */
  var LEAD_EMOJI = /^\s*[\p{Extended_Pictographic}️‍0-9⃣]+\s*/u;
  function stripLeadEmoji(s) { return String(s).replace(LEAD_EMOJI, "").trim() || String(s).trim(); }

  function polishDoc(root, item) {
    // (1) h1 위에 소속 그룹 라벨 — 사이드바에서 어디 있는 문서인지 바로 보인다
    var h1 = root.querySelector("h1");
    if (h1 && item) {
      var group = "", seen = "";
      for (var i = 0; i < NAV.length; i++) {
        if (NAV[i].g) seen = NAV[i].g;
        if (NAV[i].id === item.id) { group = seen; break; }
      }
      if (group) {
        var eb = document.createElement("div");
        eb.className = "doc-eyebrow";
        eb.innerHTML = escapeHtml(group) + (item.num && item.num !== "~" ? ' <span>' + escapeHtml(item.num) + "</span>" : "");
        h1.parentNode.insertBefore(eb, h1);
      }
    }

    // (2) 제목 바로 뒤 인용문은 이 문서의 리드 — 본문보다 크게
    if (h1) {
      var next = h1.nextElementSibling;
      if (next && next.tagName === "BLOCKQUOTE" && !next.classList.contains("callout")) {
        next.classList.add("doc-lead");
      }
    }

    // (3) md 하단의 이전/목차/다음 줄은 GitHub용 — 사이트에는 사이드바와 페이저가 이미 있다
    root.querySelectorAll('div[align="center"]').forEach(function (d) {
      var links = d.querySelectorAll("a");
      if (!links.length) return;
      var txt = d.textContent.replace(/\s+/g, "");
      if (links.length <= 3 && /(이전|다음|목차)/.test(txt) && txt.length < 90) d.classList.add("doc-nav");
    });

    // (4) README에는 GitHub에서만 쓸모 있는 것들이 있다 — 사이트에서는 감춘다.
    //     배지 줄, "웹으로 보기"(지금 보고 있는 그 사이트), 문서 목차(오른쪽 TOC와 중복).
    if (item && item.id === "overview") {
      root.querySelectorAll('img[src*="shields.io"]').forEach(function (img) {
        var p = img.closest("p"); if (p) p.classList.add("doc-hide");
      });
      root.querySelectorAll("h3").forEach(function (h) {
        var a = h.querySelector('a[href*="ihan0316.github.io"], a[href*="github.io"]');
        if (!a) return;
        h.classList.add("doc-hide");
        var n = h.nextElementSibling;
        if (n && n.tagName === "P") n.classList.add("doc-hide");
      });
      root.querySelectorAll("h2").forEach(function (h) {
        if (!/목차/.test(h.textContent)) return;
        h.classList.add("doc-hide");
        var n = h.nextElementSibling;
        while (n && (n.tagName === "UL" || n.tagName === "OL")) { n.classList.add("doc-hide"); n = n.nextElementSibling; }
        if (n && n.tagName === "HR") n.classList.add("doc-hide");
      });
    }
  }

  function buildTOC(toc) {
    var items = toc.filter(function (t) {
      var el = document.getElementById(t.id);          // 화면에서 감춘 제목은 목차에도 넣지 않는다
      return el && !el.classList.contains("doc-hide") && !el.closest(".doc-hide, .doc-nav");
    });
    if (!items.length) { tocEl.innerHTML = ""; return; }
    var html = '<div class="toc-title">이 페이지</div>';
    items.forEach(function (t) {
      // 목차에서는 제목 앞 이모지를 뗀다 — 좁은 폭에서 글머리가 들쭉날쭉해 보인다
      html += '<a href="#' + t.id + '" class="' + (t.lvl === 3 ? "lvl3" : "") + '" data-tid="' + t.id + '">' + escapeHtml(stripLeadEmoji(t.text)) + "</a>";
    });
    tocEl.innerHTML = html;
  }

  function buildPager(idx) {
    var prev = PAGES[idx - 1], next = PAGES[idx + 1], html = "";
    html += prev ? '<a class="prev" href="#/' + prev.id + '"><span class="lbl">← 이전</span>' + escapeHtml(prev.title) + "</a>" : '<span style="flex:1"></span>';
    html += next ? '<a class="next" href="#/' + next.id + '"><span class="lbl">다음 →</span>' + escapeHtml(next.title) + "</a>" : '<span style="flex:1"></span>';
    pagerEl.innerHTML = html;
  }

  /* ---- load + route ---- */
  // 항상 최신 문서를 받는다: 세션 내에서만 메모리 캐시를 쓰고, 네트워크는 no-store + 캐시버스터.
  function fetchDoc(file) {
    if (cache[file]) return Promise.resolve(cache[file]);
    var url = file + (file.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now();
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(r.status + " " + file);
      return r.text();
    }).then(function (t) { cache[file] = t; return t; });
  }

  function renderLanding(item, idx) {
    heroEl.hidden = true; heroEl.innerHTML = "";
    contentEl.innerHTML = landingHTML();
    contentEl.classList.add("landing");
    tocEl.innerHTML = "";
    pagerEl.innerHTML = "";   // 랜딩 끝에 이미 CTA가 있다 — 한쪽만 찬 페이저는 비대칭

    document.title = "Codex CLI 실전 셋업 툴킷";
    updateMeta(item, true);
    contentEl.classList.remove("enter"); void contentEl.offsetWidth; contentEl.classList.add("enter");
    window.scrollTo(0, 0);
    setupLanding();
    updateProgress();
    return Promise.resolve();
  }

  function renderDoc(item, idx, anchor) {
    if (item.landing) return renderLanding(item, idx);
    termGen++;                                   // 랜딩 터미널 루프 중단
    if (dotsObs) dotsObs.disconnect();
    contentEl.classList.remove("landing");
    contentEl.innerHTML = '<div class="loading"><span class="spin"></span> 불러오는 중…</div>';
    return fetchDoc(item.file).then(function (md) {
      heroEl.hidden = true; heroEl.innerHTML = "";
      contentEl.innerHTML = window.marked.parse(md);
      var toc = decorate(contentEl);
      polishDoc(contentEl, item);
      buildTOC(toc);
      buildPager(idx);
      document.title = item.title + " · Codex CLI 셋업 툴킷";
      updateMeta(item, false);
      // re-trigger enter animation
      contentEl.classList.remove("enter"); void contentEl.offsetWidth; contentEl.classList.add("enter");
      function scrollToAnchor() { var el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
      getMermaid().then(function (mm) {
        if (!mm) return;
        var nodes = contentEl.querySelectorAll(".mermaid");
        if (!nodes.length) return;
        // 다이어그램 렌더 후 문서 높이가 바뀌므로 앵커로 재스크롤 (70ms 초기 스크롤이 어긋남 보정)
        // mermaid는 run() resolve 이후에도 라벨 tspan을 다시 만지므로 한 프레임 뒤 한 번 더 훑는다
        function afterRender() {
          unescapeMermaidLabels(); fitMermaidMobile();
          requestAnimationFrame(unescapeMermaidLabels);
          setTimeout(unescapeMermaidLabels, 200);
        }
        try { Promise.resolve(mm.run({ nodes: nodes })).then(afterRender, afterRender).then(function () { if (anchor) scrollToAnchor(); }); }
        catch (e) { afterRender(); if (anchor) scrollToAnchor(); }
      });
      if (anchor) { setTimeout(scrollToAnchor, 70); }
      else { window.scrollTo(0, 0); }
      setupScrollSpy(toc);
      updateProgress();
    }).catch(function (err) {
      heroEl.hidden = true;
      contentEl.innerHTML = '<div class="callout callout-caution"><div class="callout-title"><span class="ico">⛔</span><span>불러오기 실패</span></div><p>' +
        escapeHtml(String(err.message || err)) + "</p><p>로컬에서 보려면 정적 서버가 필요합니다 (예: <code>python -m http.server</code>).</p></div>";
    });
  }

  function parseRoute() {
    var h = location.hash || "";
    if (h.indexOf("#/") !== 0) return null;
    var parts = h.slice(2).split("#");
    return { id: parts[0] || "home", anchor: parts[1] || "" };
  }
  function route() {
    var r = parseRoute() || { id: "home", anchor: "" };
    var idx = PAGES.findIndex(function (p) { return p.id === r.id; });
    if (idx < 0) { idx = 0; r.id = PAGES[0].id; }
    setActiveNav(r.id); closeMenu();
    renderDoc(PAGES[idx], idx, r.anchor);
  }

  /* ---- scrollspy + progress ---- */
  var spyObserver = null;
  function setupScrollSpy(toc) {
    if (spyObserver) spyObserver.disconnect();
    if (!toc.length) return;
    var links = {};
    tocEl.querySelectorAll("a[data-tid]").forEach(function (a) { links[a.getAttribute("data-tid")] = a; });
    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          if (links[en.target.id]) links[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-72px 0px -75% 0px", threshold: 0 });
    toc.forEach(function (t) { var el = document.getElementById(t.id); if (el) spyObserver.observe(el); });
  }
  function updateProgress() {
    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    var pct = max > 0 ? (d.scrollTop / max) * 100 : 0;
    progressEl.style.width = pct + "%";
    var tb = document.querySelector(".topbar");
    if (tb) tb.classList.toggle("scrolled", d.scrollTop > 6);
  }

  /* ---- search ---- */
  function setupSearch() {
    var input = document.getElementById("search");
    function apply() {
      var q = input.value.trim().toLowerCase();
      navEl.querySelectorAll("a").forEach(function (a) {
        a.classList.toggle("hidden", !!q && a.textContent.toLowerCase().indexOf(q) < 0);
      });
    }
    input.addEventListener("input", apply);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; apply(); input.blur(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input && !/^(input|textarea)$/i.test((document.activeElement || {}).tagName || "")) {
        e.preventDefault(); input.focus();
      }
      if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
    });
  }

  /* ---- theme ---- */
  function setupTheme() {
    var saved = null; try { saved = localStorage.getItem("cdx-theme"); } catch (e) {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) document.documentElement.setAttribute("data-theme", "light");
    syncThemeUI();
    document.getElementById("themeBtn").addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("cdx-theme", next); } catch (e) {}
      syncThemeUI();
      mermaidReady = null;
      var r = parseRoute() || { id: "home" };
      var idx = Math.max(0, PAGES.findIndex(function (p) { return p.id === r.id; }));
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      renderDoc(PAGES[idx], idx, "").then(function () { window.scrollTo(0, y); });   // 테마 전환 시 스크롤 위치 유지
    });
  }
  function syncThemeUI() {
    var dark = currentTheme() === "dark";
    // theme-color starts media-scoped (no-JS fallback); once JS owns the theme, pin it to the chosen one
    document.head.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.removeAttribute("media");
      m.setAttribute("content", dark ? "#0a0a09" : "#fbfbf8");
    });
    document.getElementById("hljs-theme").href =
      "https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/" + (dark ? "github-dark" : "xcode") + ".min.css";
  }

  /* ---- per-route meta (SEO; helps JS-rendering crawlers) ---- */
  function setMeta(sel, attr, key, val) {
    var el = document.head.querySelector(sel);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute("content", val);
  }
  function updateMeta(item, isHome) {
    var title = (isHome ? "Codex CLI 실전 셋업 툴킷" : item.title + " · Codex CLI 셋업 툴킷");
    var desc;
    if (isHome) {
      desc = "실무에서 매일 쓰며 다듬은 OpenAI Codex CLI 설정·AGENTS.md·샌드박스·훅·MCP·자동화 모음 — 무엇을/왜 썼고/무엇이 좋아졌는지.";
    } else {
      var p = contentEl.querySelector("p");
      desc = (p ? p.textContent : item.title).replace(/\s+/g, " ").trim().slice(0, 155);
    }
    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:url"]', "property", "og:url", location.href);
    var canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement("link"); canon.setAttribute("rel", "canonical"); document.head.appendChild(canon); }
    canon.setAttribute("href", location.origin + location.pathname + (isHome ? "" : location.hash));
  }

  /* ---- mobile menu ---- */
  function openMenu() { sidebar.classList.add("open"); overlay.hidden = false; }
  function closeMenu() { sidebar.classList.remove("open"); overlay.hidden = true; }
  function setupMenu() {
    document.getElementById("menuBtn").addEventListener("click", function () {
      sidebar.classList.contains("open") ? closeMenu() : openMenu();
    });
    overlay.addEventListener("click", closeMenu);
  }

  /* ---- responsive search: 좁은 화면(<=560px)에선 검색을 드로어(사이드바)로 이동해 접근 가능하게 ---- */
  function setupResponsiveSearch() {
    var wrap = document.querySelector(".search-wrap");
    var topbar = document.querySelector(".topbar");
    var themeBtn = document.getElementById("themeBtn");
    if (!wrap || !topbar || !sidebar || !window.matchMedia) return;
    var mq = window.matchMedia("(max-width: 560px)");
    function place() {
      if (mq.matches) { if (wrap.parentElement !== sidebar) sidebar.insertBefore(wrap, sidebar.firstChild); }
      else { if (wrap.parentElement !== topbar) topbar.insertBefore(wrap, themeBtn); }
    }
    place();
    if (mq.addEventListener) mq.addEventListener("change", place);
    else if (mq.addListener) mq.addListener(place);
  }

  /* ---- boot ---- */
  function boot() {
    window.marked.setOptions({ gfm: true, breaks: false });
    buildNav(); setupSearch(); setupTheme(); setupMenu(); setupResponsiveSearch();
    window.addEventListener("hashchange", function () { if ((location.hash || "").indexOf("#/") === 0) route(); });
    window.addEventListener("scroll", updateProgress, { passive: true });
    route();
  }
  if (window.marked) boot();
  else window.addEventListener("load", boot);
})();
