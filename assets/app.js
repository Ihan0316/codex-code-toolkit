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
    kicker: "~/.codex · DEV SETUP TOOLKIT",
    titleTop: "Codex CLI를",
    titleAccent: "손에 맞게 길들이기",
    sub: '실무에서 매일 쓰며 다듬은 AGENTS.md · 샌드박스 · 훅 · MCP · 자동화 모음. ' +
         '단순 "이렇게 하세요"가 아니라 — <b>무엇을 / 왜 썼고 / 무엇이 좋아졌는지</b>까지.',
    stats: [
      { n: 12, s: "문서" }, { n: 3, s: "샌드박스 모드" }, { n: 10, s: "훅 이벤트" },
      { n: 20, s: "다이어그램" }, { n: 0, s: "비밀 유출" }
    ],
    principles: [
      { n: "01", t: "실수는 시스템이 막는다",
        d: "사람의 주의력에 기대지 않습니다. 워크스페이스 밖 쓰기·네트워크는 샌드박스가 기본 차단하고, 위험한 명령은 PreToolUse 훅이 자동 검사합니다." },
      { n: "02", t: "맥락은 기억하게 만든다",
        d: '매번 "나는 이런 사람이고 이 프로젝트는…"을 다시 설명하지 않도록 AGENTS.md 계층 · /memories · SessionStart 훅으로 자동 주입.' },
      { n: "03", t: "반복은 자동화한다",
        d: "일간/주간 보고와 설정 백업을 codex exec + cron에 위임. 안 하면 서서히 망가지는 일을 시스템에 맡깁니다." }
    ],
    features: [
      { k: "안전", t: "샌드박스 · 승인 · 훅 3중 방어", id: "01-sandbox-approvals",
        d: "워크스페이스 밖 쓰기와 네트워크는 승인을 거치고, 위험 명령은 lifecycle 훅이 실행 전에 막습니다.",
        tags: ["read-only", "workspace-write", "PreToolUse"] },
      { k: "스킬", t: "검증된 절차를 한마디로", id: "02-skills",
        d: '작업별 전문 절차를 캡슐화한 SKILL.md 모듈. "일일 보고 만들어줘" 한마디에 같은 품질의 절차가 적용됩니다.',
        tags: ["SKILL.md", "번들", "자동 트리거"] },
      { k: "메모리", t: "세션이 바뀌어도 잊지 않는다", id: "03-memory",
        d: "계층형 AGENTS.md와 /memories 영속 기억. 글로벌 기본값과 레포별 규약을 분리해 쌓습니다.",
        tags: ["AGENTS.md", "/memories", "계층"] },
      { k: "자동 루틴", t: "헤드리스로 알아서 돈다", id: "04-automation",
        d: "codex exec·cron·notify로 일간·주간 보고를 자동화하고, 턴 완료를 외부로 알립니다.",
        tags: ["codex exec", "cron", "notify"] },
      { k: "MCP", t: "외부 시스템을 직접 조작", id: "05-mcp",
        d: "노션·피그마·문서검색을 Codex가 직접 다룹니다. 복붙 왕복이 사라집니다.",
        tags: ["Notion", "Figma", "Docs"] },
      { k: "추론 강도", t: "난제엔 깊게, 반복엔 얕게", id: "06-reasoning-context",
        d: "model_reasoning_effort와 /compact로 토큰과 정확도를 상황에 맞게 조절합니다.",
        tags: ["effort", "/compact", "context"] }
    ],
    steps: [
      { n: 1, t: "AGENTS.md 글로벌 지침", e: 3, lv: "쉬움", id: "00-quickstart" },
      { n: 2, t: "샌드박스·승인 프리셋", e: 3, lv: "쉬움", id: "01-sandbox-approvals" },
      { n: 3, t: "메모리 & AGENTS.md 계층", e: 3, lv: "중간", id: "03-memory" },
      { n: 4, t: "PreToolUse 위험명령 훅", e: 2, lv: "중간", id: "01-sandbox-approvals" },
      { n: 5, t: "SessionStart 컨텍스트 훅", e: 2, lv: "중간", id: "01-sandbox-approvals" },
      { n: 6, t: "스킬 설치", e: 2, lv: "쉬움", id: "02-skills" }
    ],
    codeTitle: "~/.codex/config.toml",
    codeCap: "두 줄이면 워크스페이스 밖 쓰기와 네트워크가 기본으로 막힙니다.",
    code: [
      "# 안전 — 승인 + 샌드박스",
      'approval_policy = "on-request"',
      'sandbox_mode   = "workspace-write"',
      "",
      "[sandbox_workspace_write]",
      "network_access = false        # 네트워크는 기본 차단",
      "",
      "# 읽기 전용 프로필 — codex --profile readonly",
      "[profiles.readonly]",
      'approval_policy = "untrusted"',
      'sandbox_mode    = "read-only"'
    ].join("\n")
  };

  function esc(s) { return escapeHtml(s); }

  function landingHTML() {
    var h = "";

    h += '<section class="lp-hero">' +
      '<div class="lp-kicker">' + esc(L.kicker) + '</div>' +
      '<h1 class="lp-title">' + esc(L.titleTop) + '<br><span class="grad">' + esc(L.titleAccent) + '</span></h1>' +
      '<p class="lp-sub">' + L.sub + '</p>' +
      '<div class="lp-cta">' +
        '<a class="btn btn-primary" href="#/00-quickstart">10분 만에 시작</a>' +
        '<a class="btn btn-ghost" href="https://github.com/' + REPO + '" target="_blank" rel="noopener">GitHub 저장소</a>' +
      '</div>' +
      '<div class="lp-stats">' +
        L.stats.map(function (s) {
          return '<div class="lp-stat"><b data-count="' + s.n + '">0</b><span>' + esc(s.s) + '</span></div>';
        }).join("") +
      '</div>' +
      '<div class="lp-scroll" aria-hidden="true"><span></span></div>' +
    '</section>';

    h += '<section class="lp-sec reveal">' +
      '<div class="lp-eyebrow">설계 원칙</div>' +
      '<h2 class="lp-h2">왜 이렇게 짰나</h2>' +
      '<p class="lp-lead">Codex는 기본만 써도 강력하지만, 반복 업무 · 실수 방지 · 맥락 유지는 직접 손봐야 합니다.</p>' +
      '<div class="lp-principles">' +
        L.principles.map(function (p) {
          return '<div class="lp-principle"><span class="lp-num">' + p.n + '</span>' +
                 '<h3>' + esc(p.t) + '</h3><p>' + esc(p.d) + '</p></div>';
        }).join("") +
      '</div>' +
    '</section>';

    h += '<section class="lp-sec reveal">' +
      '<div class="lp-eyebrow">구성</div>' +
      '<h2 class="lp-h2">여섯 개의 축</h2>' +
      '<p class="lp-lead">샌드박스와 훅이 안전을 맡고, 스킬·메모리·MCP가 능력과 기억을 확장하고, 루틴·추론 강도 조절이 반복과 비용을 다룹니다.</p>' +
      '<div class="lp-grid">' +
        L.features.map(function (f) {
          return '<a class="lp-card" href="#/' + f.id + '">' +
            '<div class="lp-card-k">' + esc(f.k) + '</div>' +
            '<h3>' + esc(f.t) + '</h3>' +
            '<p>' + esc(f.d) + '</p>' +
            '<div class="lp-tags">' + f.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join("") + '</div>' +
            '<span class="lp-card-go" aria-hidden="true">자세히 →</span>' +
          '</a>';
        }).join("") +
      '</div>' +
    '</section>';

    h += '<section class="lp-sec reveal">' +
      '<div class="lp-eyebrow">두 줄이면 충분</div>' +
      '<h2 class="lp-h2">config.toml 두 줄</h2>' +
      '<p class="lp-lead">' + esc(L.codeCap) + '</p>' +
      '<div class="lp-code">' +
        '<div class="lp-code-head"><span>' + esc(L.codeTitle) + '</span></div>' +
        '<pre><code class="language-toml">' + esc(L.code) + '</code></pre>' +
      '</div>' +
    '</section>';

    h += '<section class="lp-sec reveal">' +
      '<div class="lp-eyebrow">도입 순서</div>' +
      '<h2 class="lp-h2">위에서부터 차례로</h2>' +
      '<p class="lp-lead">앞 3개만 켜도 매일의 체감이 바뀝니다. 전부 켤 필요는 없습니다. ' +
      '오른쪽 막대는 체감 효과, 그 옆은 난이도입니다.</p>' +
      '<ol class="lp-steps">' +
        L.steps.map(function (s) {
          var stars = "";
          for (var i = 0; i < 3; i++) stars += '<i class="' + (i < s.e ? "on" : "") + '"></i>';
          return '<li><a href="#/' + s.id + '">' +
            '<span class="lp-step-n">' + s.n + '</span>' +
            '<span class="lp-step-t">' + esc(s.t) + '</span>' +
            '<span class="lp-step-e" title="체감 효과">' + stars + '</span>' +
            '<span class="lp-step-lv">' + esc(s.lv) + '</span>' +
          '</a></li>';
        }).join("") +
      '</ol>' +
      '<p class="lp-more"><a href="#/overview">전체 10단계와 커버리지 맵 보기 →</a></p>' +
    '</section>';

    h += '<section class="lp-final reveal">' +
      '<h2>10분이면 핵심 3개를 켤 수 있습니다.</h2>' +
      '<p>설치 순서, 각 항목이 무엇을 막아 주는지, 실패했을 때 무엇을 보면 되는지까지 문서에 있습니다.</p>' +
      '<div class="lp-cta">' +
        '<a class="btn btn-primary" href="#/00-quickstart">빠른 시작 열기</a>' +
        '<a class="btn btn-ghost" href="#/overview">전체 개요</a>' +
      '</div>' +
    '</section>';

    return h;
  }

  /* 스크롤 진입 애니메이션 + 숫자 카운트업 */
  var revealObs = null;
  function setupLanding() {
    if (window.hljs) {
      contentEl.querySelectorAll(".lp-code pre code").forEach(function (c) {
        try { window.hljs.highlightElement(c); } catch (e) {}
      });
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = contentEl.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      countUp(true);
      return;
    }
    if (revealObs) revealObs.disconnect();
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        revealObs.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    items.forEach(function (el) { revealObs.observe(el); });
    countUp(false);
  }

  function countUp(instant) {
    contentEl.querySelectorAll(".lp-stat b[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (instant || target === 0) { el.textContent = String(target); return; }
      var dur = 900, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));   // easeOutCubic
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
            //     (단일행 라벨: "경계 위반"→"겨게 이바"). SVG <text>는 정상 렌더됨(확인 완료).
            // (2) fontFamily는 한글 완비 폰트(Pretendard) — SVG <text>가 한글 글리프를 바로 그림.
            fontFamily: MERMAID_FONT,
            htmlLabels: false,
            flowchart: { htmlLabels: false },
            themeVariables: {
              background: "transparent",
              // SVG <text>(엣지 라벨·시퀀스 다이어그램)에 실제 적용되는 폰트 — 한글 완비 폰트 필수.
              // 이걸 안 주면 mermaid 기본값(trebuchet ms)이 적용돼 한글이 깨진다.
              fontFamily: MERMAID_FONT,
              primaryColor: dark ? "#1d1d1f" : "#f5f5f7",
              primaryBorderColor: dark ? "#48484a" : "#d2d2d7",
              primaryTextColor: dark ? "#f5f5f7" : "#1d1d1f",
              lineColor: dark ? "#86868b" : "#a1a1a6",
              secondaryColor: dark ? "#161617" : "#fbfbfd",
              tertiaryColor: dark ? "#0a0a0a" : "#ffffff",
              fontSize: "14px"
            }
          });
          resolve(window.__mermaid);
        } else if (tries++ < 150) { setTimeout(poll, 40); }
        else { resolve(null); }
      })();
    });
    return mermaidReady;
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
      div.className = "mermaid"; div.textContent = code.textContent;
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
      if (/README\.md(#.*)?$/i.test(href)) { a.setAttribute("href", "#/home"); return; }
      var md = href.match(/(?:^|\/)(\d\d-[a-z0-9-]+)\.md(#[^)]*)?$/i);
      if (md) { a.setAttribute("href", "#/" + md[1] + (md[2] || "")); return; }
      var clean = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
      a.setAttribute("href", BLOB + "/" + clean); a.target = "_blank"; a.rel = "noopener";
    });

    return toc;
  }

  function buildTOC(toc) {
    if (!toc.length) { tocEl.innerHTML = ""; return; }
    var html = '<div class="toc-title">이 페이지</div>';
    toc.forEach(function (t) {
      html += '<a href="#' + t.id + '" class="' + (t.lvl === 3 ? "lvl3" : "") + '" data-tid="' + t.id + '">' + escapeHtml(t.text) + "</a>";
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
    contentEl.classList.remove("landing");
    contentEl.innerHTML = '<div class="loading"><span class="spin"></span> 불러오는 중…</div>';
    return fetchDoc(item.file).then(function (md) {
      heroEl.hidden = true; heroEl.innerHTML = "";
      contentEl.innerHTML = window.marked.parse(md);
      var toc = decorate(contentEl);
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
      m.setAttribute("content", dark ? "#000000" : "#fbfbfd");
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
      desc = "실무에서 매일 쓰며 다듬은 Codex CLI 설정·AGENTS.md·샌드박스·훅·MCP·자동화 모음 — 무엇을/왜 썼고/무엇이 좋아졌는지.";
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
