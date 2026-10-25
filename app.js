// 網站運作的程式。一般情況下不需要修改這個檔案，改 videos.js 就好。

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// 「[第5集]會自己變化的量」→ 集數 5、標題「會自己變化的量」
function parseTitle(title) {
  const m = String(title).match(/^\s*\[?\s*第\s*(\d+)\s*集\s*\]?\s*(.*)$/);
  return m ? { ep: Number(m[1]), name: m[2] || title } : { ep: null, name: title };
}

const videos = VIDEOS
  .map((v) => ({ ...v, category: v.category || "其他", id: youtubeId(v.youtube), ...parseTitle(v.title) }))
  .filter((v) => v.id);
const byId = new Map(videos.map((v) => [v.id, v]));

// 播放清單：依 videos.js 裡第一次出現的順序排列
const playlists = new Map();
for (const v of videos) {
  if (!playlists.has(v.category)) playlists.set(v.category, []);
  playlists.get(v.category).push(v);
}

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const epLabel = (v) => (v.ep != null ? `EP ${pad(v.ep)}` : "EP");
const thumb = (v, size = "hqdefault") => `https://i.ytimg.com/vi/${v.id}/${size}.jpg`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHECK = `<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>`;
const COLORS = ["#ff5c8a", "#ffb84d", "#6bcbff", "#7bd389", "#b388ff", "#ff9a62"];

// ---------- 吉祥物（像素畫） ----------

function mascot(cls = "") {
  const px = (x, y, w = 1, h = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  return `<svg class="mascot ${cls}" viewBox="0 -1 16 11" shape-rendering="crispEdges" aria-hidden="true">
    <g fill="#d9805f">
      <g class="m-legs-a">${px(3, 7, 1, 3)}${px(10, 7, 1, 3)}</g>
      <g class="m-legs-b">${px(5, 7, 1, 3)}${px(12, 7, 1, 3)}</g>
      <g class="m-body">
        <g class="m-arm-l">${px(0, 4, 2, 2)}</g>
        <g class="m-arm-r">${px(14, 4, 2, 2)}</g>
        ${px(2, 0, 12, 7)}
        <g class="m-look"><g class="m-eyes" fill="#1c0f0a">${px(3, 2, 1, 2)}${px(10, 2, 1, 2)}</g></g>
      </g>
    </g>
  </svg>`;
}

// ---------- 學習進度（存在這台裝置的瀏覽器裡） ----------

const STORE = "dachuan-progress-v1";
let progress = { videos: {}, last: null, autoNext: true };
try { progress = { ...progress, ...JSON.parse(localStorage.getItem(STORE)) }; } catch (e) {}

function saveProgress() {
  try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) {}
}
const rec = (v) => progress.videos[v.id] || {};
const isDone = (v) => !!rec(v).done;
const ratio = (v) => (isDone(v) ? 1 : rec(v).d ? Math.min(1, rec(v).t / rec(v).d) : 0);
const doneCount = (list) => list.filter(isDone).length;

// 從上次看到的地方繼續（快看完或剛開始就從頭）
function resumeAt(v) {
  const r = rec(v);
  return !r.done && r.d && r.t > 10 && r.t < r.d - 15 ? Math.floor(r.t) : 0;
}

// 首頁要推薦的下一集：上次看到一半的那集 → 否則第一部還沒看完的
function nextUp() {
  const last = byId.get(progress.last);
  if (last && !isDone(last)) return { v: last, resume: resumeAt(last) > 0 };
  if (last) {
    const list = playlists.get(last.category);
    const after = list.slice(list.indexOf(last) + 1).find((v) => !isDone(v));
    if (after) return { v: after, resume: false };
  }
  return { v: videos.find((v) => !isDone(v)) || videos[0], resume: false };
}

// ---------- 首頁 ----------

let currentCategory = "全部";
const search = $("search");
const content = $("content");
const empty = $("empty");

function renderHero() {
  document.title = SITE.name;
  $("site-name").textContent = SITE.name;
  $("site-tagline").textContent = SITE.tagline;
  $("footer-text").textContent = `© ${new Date().getFullYear()} ${SITE.name}`;
  // 標題前三個字用橘色漸層，長標題分成兩行
  const name = SITE.name;
  $("hero-title").innerHTML = name.length > 6
    ? `<span class="accent">${esc(name.slice(0, 3))}</span><br>${esc(name.slice(3))}`
    : esc(name);

  const done = doneCount(videos);
  $("stat-eps").textContent = videos.length;
  $("stat-units").textContent = playlists.size;
  $("stat-done").innerHTML = `${done}<small> / ${videos.length}</small>`;

  const { v, resume } = nextUp();
  if (!v) return;
  const list = playlists.get(v.category);
  const cta = $("cta");
  const started = done > 0 || progress.last;
  cta.classList.toggle("two-line", !!started);
  cta.innerHTML = started
    ? `<span class="play-ico"></span><span class="cta-text">${resume ? "繼續觀看" : "下一集"}<small>${esc(epLabel(v))} · ${esc(v.name)}</small></span>`
    : `<span class="play-ico"></span>開始學習`;
  cta.onclick = () => launch(v, $("hero-sign"));

  $("sign-kicker").textContent = started ? (resume ? "繼續觀看" : "下一集") : "從這裡開始";
  $("sign-title").textContent = v.name;
  $("sign-sub").textContent = `${v.category} · 第 ${list.indexOf(v) + 1} / ${list.length} 集`;
  $("hero-sign").onclick = () => launch(v, $("hero-sign"));
}

function renderTabs() {
  const tabs = $("categories");
  tabs.innerHTML = "";
  for (const c of ["全部", ...playlists.keys()]) {
    const b = document.createElement("button");
    const n = c === "全部" ? videos.length : playlists.get(c).length;
    b.innerHTML = `${esc(c)}<span class="n">${n}</span>`;
    b.className = c === currentCategory ? "active" : "";
    b.onclick = () => {
      currentCategory = c;
      renderTabs();
      render();
      const top = $("units").getBoundingClientRect().top + scrollY - 70;
      if (scrollY > top) scrollTo({ top, behavior: "smooth" });
    };
    tabs.appendChild(b);
  }
}

// ---------- 單元的顏色、圖示 ----------

const unitNames = [...playlists.keys()];
const UNIT_COLORS = ["#ff9a62", "#ff5c8a", "#a78bfa", "#4cc9f0", "#7bd389", "#ffd166"];

// 每個單元一個像素小圖示：# 主色、o 淡色、+ 白色
const ICONS = [
  // 衝刺中的小球（速度）
  ["............", "............", "......####..", ".....######.", "oo..##+#####", "....#++#####",
   "ooo.########", "....########", "oo...######.", "......####..", "............", "............"],
  // 蘋果
  [".....o......", "......o##...", "...######...", "..########..", ".##+#######.", ".#++#######.",
   ".#+########.", ".##########.", ".##########.", "..########..", "...###.###..", "............"],
  // 行星與軌道
  ["............", "....oooo....", "..oo....oo..", ".o........o.", ".o...##...o+", "o...####...o",
   "o...####...o", ".o...##...o.", "+o........o.", "..oo....oo..", "....oooo....", "............"],
  // 火焰
  [".....#......", ".....##.....", "....###.....", "....####.#..", "...#####.#..", "..#########.",
   "..####+####.", ".####+++###.", ".###+++++##.", ".###+++++##.", "..###+++##..", "...######..."],
  // 閃電
  [".......####.", "......####..", ".....####...", "....####....", "...########.", "........##..",
   ".......##...", "......##....", ".....##.....", "....##......", "...#........", "............"],
  // 波
  ["............", "............", "............", ".##......##.", "#..#....#..#", "....#..#....",
   ".....##.....", "............", ".oo......oo.", "o..o....o..o", "....o..o....", ".....oo....."],
];

function pixelIcon(i, color) {
  const rows = ICONS[i % ICONS.length];
  const fill = { "#": color, o: color, "+": "#fff" };
  let rects = "";
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (fill[c]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill[c]}"${c === "o" ? ' opacity=".45"' : ""}/>`;
  }));
  return `<svg class="picon" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

function unitInfo(name) {
  const i = unitNames.indexOf(name);
  const cfg = (typeof UNITS !== "undefined" && UNITS[name]) || {};
  const color = cfg.color || UNIT_COLORS[i % UNIT_COLORS.length];
  return { no: i + 1, color, desc: cfg.desc || "", icon: pixelIcon(i, color) };
}

// ---------- 學習地圖 ----------

function goToUnit(name) {
  if (search.value) search.value = "";
  currentCategory = "全部";
  renderTabs();
  render();
  const el = $(`unit-${unitInfo(name).no}`);
  if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

function renderMap() {
  const track = $("map-track");
  const next = nextUp().v;
  const cur = next ? next.category : unitNames[0];
  track.innerHTML = "";
  for (const name of unitNames) {
    const list = playlists.get(name);
    const u = unitInfo(name);
    const done = doneCount(list);
    const complete = done === list.length;
    const li = document.createElement("li");
    li.className = "stop" + (name === cur ? " current" : "") + (complete ? " complete" : "");
    li.style.setProperty("--u", u.color);
    li.style.setProperty("--p", Math.round((done / list.length) * 100));
    li.innerHTML = `
      <button class="stop-btn" aria-label="${esc(name)}，已完成 ${done} / ${list.length} 集">
        <span class="ring"><span class="tile">${u.icon}</span>${complete ? `<span class="stop-check">${CHECK}</span>` : ""}</span>
        <span class="stop-no">UNIT ${pad(u.no)}</span>
        <strong>${esc(name)}</strong>
        <span class="stop-meta">${complete ? "全部完成" : `${done} / ${list.length} 集`}</span>
      </button>
      ${name === cur ? `<span class="stop-mascot">${mascot("bob")}<em>你在這裡</em></span>` : ""}`;
    li.querySelector("button").onclick = () => goToUnit(name);
    track.appendChild(li);
  }
  const all = doneCount(videos);
  $("map-where").innerHTML = all === videos.length
    ? `全部 <strong>${videos.length}</strong> 集都看完了，太強了！🏆`
    : `已完成 <strong>${all}</strong> / ${videos.length} 集 · 下一站：<strong>${esc(cur)}</strong>`;
}

// ---------- 影片卡片與單元 ----------

function cardStatus(v) {
  if (v.description) return esc(v.description);
  if (isDone(v)) return `<span class="st-done">${CHECK}已看完</span>`;
  const r = ratio(v);
  if (r > 0) return `<span class="st-prog">看到 ${Math.round(r * 100)}%</span>`;
  return `第 ${playlists.get(v.category).indexOf(v) + 1} 集`;
}

function card(v, i) {
  const b = document.createElement("button");
  const r = ratio(v);
  b.className = "card" + (isDone(v) ? " is-done" : "");
  b.style.setProperty("--u", unitInfo(v.category).color);
  b.setAttribute("aria-label", `${epLabel(v)} ${v.name}${isDone(v) ? "（看完了）" : ""}`);
  b.style.animationDelay = `${Math.min(i, 12) * 45}ms`;
  b.innerHTML = `
    <div class="thumb">
      <img loading="lazy" decoding="async" width="480" height="360" alt="" src="${thumb(v)}" onload="this.parentNode.classList.add('loaded')">
      <span class="ep">${esc(epLabel(v))}</span>
      ${isDone(v) ? `<span class="done-badge">${CHECK}看完了</span>` : ""}
      <span class="play-btn"><span class="play-ico"></span></span>
      ${r > 0 && r < 1 ? `<div class="bar"><i style="width:${r * 100}%"></i></div>` : ""}
    </div>
    <div class="card-body">
      <h3>${esc(v.name)}</h3>
      <p>${cardStatus(v)}</p>
    </div>`;
  b.onclick = () => launch(v, b.querySelector(".thumb"));
  return b;
}

function unitSection(name, list) {
  const s = document.createElement("section");
  const u = unitInfo(name);
  const done = doneCount(list);
  const pct = Math.round((done / list.length) * 100);
  s.className = "unit reveal";
  s.id = `unit-${u.no}`;
  s.style.setProperty("--u", u.color);
  s.innerHTML = `
    <div class="unit-banner">
      <div class="unit-icon">${u.icon}</div>
      <div class="unit-text">
        <p class="unit-no">UNIT ${pad(u.no)} · ${list.length} 集</p>
        <h2>${esc(name)}</h2>
        ${u.desc ? `<p class="unit-desc">${esc(u.desc)}</p>` : ""}
      </div>
      <div class="unit-side">
        <div class="ring-sm" style="--p:${pct}" title="已完成 ${done} / ${list.length} 集"><span>${pct}<small>%</small></span></div>
        <button class="btn btn-ghost btn-sm play-unit"><span class="play-ico"></span>${done === list.length ? "重看單元" : done ? "繼續單元" : "播放單元"}</button>
      </div>
    </div>
    <div class="grid"></div>`;
  const grid = s.querySelector(".grid");
  list.forEach((v, i) => grid.appendChild(card(v, i)));
  s.querySelector(".play-unit").onclick = () => {
    const v = list.find((x) => !isDone(x)) || list[0];
    launch(v, grid.children[list.indexOf(v)].querySelector(".thumb"));
  };
  return s;
}

function render() {
  const q = search.value.trim().toLowerCase();
  content.innerHTML = "";
  empty.hidden = true;
  if (q) {
    const list = videos.filter((v) =>
      (currentCategory === "全部" || v.category === currentCategory) &&
      `${v.title} ${v.description || ""} ${v.category}`.toLowerCase().includes(q));
    if (!list.length) {
      empty.hidden = false;
      empty.innerHTML = `<div class="em">${mascot("bob")}</div><strong>找不到「${esc(search.value.trim())}」</strong>換個關鍵字試試看吧`;
      return;
    }
    const head = document.createElement("p");
    head.className = "results-head";
    head.innerHTML = `找到 <strong>${list.length}</strong> 部影片`;
    const grid = document.createElement("div");
    grid.className = "grid";
    list.forEach((v, i) => grid.appendChild(card(v, i)));
    content.append(head, grid);
    return;
  }
  for (const [name, list] of playlists) {
    if (currentCategory === "全部" || currentCategory === name) content.appendChild(unitSection(name, list));
  }
  observeReveal();
}

// 捲到畫面裡才淡入
const revealer = "IntersectionObserver" in window && !reduceMotion
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealer.unobserve(e.target);
    }
  }), { rootMargin: "0px 0px -8% 0px" })
  : null;

function observeReveal() {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => (revealer ? revealer.observe(el) : el.classList.add("in")));
}

// 滑鼠在卡片上移動時，光暈跟著走
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest && e.target.closest(".card");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", `${e.clientX - r.left}px`);
  c.style.setProperty("--my", `${e.clientY - r.top}px`);
}, { passive: true });

function refreshAll() {
  renderHero();
  renderMap();
  render();
}

// ---------- 點影片時：吉祥物跳下來衝進影片裡 ----------

const heroMascot = $("hero-mascot");
let flying = false;
let away = null; // 跳進影片的那隻吉祥物，關掉播放器時要回來

function onScreen(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.top > 60 && r.bottom < innerHeight;
}

async function launch(v, target) {
  if (flying || player.open) return;
  if (reduceMotion) return openPlayer(v);
  flying = true;
  const from = onScreen(heroMascot) ? heroMascot : $("brand-mascot");
  const a = from.getBoundingClientRect();
  const t = target && target.getBoundingClientRect();
  const tx = t ? t.left + t.width / 2 : innerWidth / 2;
  const ty = t ? t.top + t.height / 2 : innerHeight / 2;
  const dx = tx - (a.left + a.width / 2);
  const dy = ty - (a.top + a.height / 2);
  const peak = Math.min(0, dy) - 110;
  const spin = dx >= 0 ? 360 : -360;

  const fly = document.createElement("div");
  fly.className = "flyer";
  const size = Math.max(a.width, 64); // 從左上角小圖示起跳時放大一點，比較看得清楚
  fly.style.cssText = `left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - (size * 11) / 32}px;width:${size}px`;
  fly.innerHTML = mascot("walking");
  if (dx > 0) fly.firstElementChild.style.transform = "scaleX(-1)";
  document.body.appendChild(fly);
  from.classList.add("away");
  away = from;

  // 先蹲一下，再沿著拋物線跳過去，最後轉圈縮小鑽進影片
  const frames = [
    { transform: "translate(0,0)", offset: 0 },
    { transform: "translate(0,4px) scale(1.18,.78)", offset: 0.14 },
  ];
  for (let i = 1; i <= 12; i++) {
    const p = i / 12;
    const x = dx * p;
    const y = 2 * (1 - p) * p * peak + p * p * dy;
    const s = p < 0.72 ? 1 : 1 - ((p - 0.72) / 0.28) * 0.88;
    const rot = p < 0.6 ? 0 : ((p - 0.6) / 0.4) * spin;
    frames.push({ transform: `translate(${x}px,${y}px) rotate(${rot}deg) scale(${s})`, offset: 0.14 + 0.86 * p });
  }
  await fly.animate(frames, { duration: 1000, easing: "cubic-bezier(.4,0,.7,1)" }).finished.catch(() => {});
  fly.remove();

  if (target) {
    target.classList.remove("splash");
    void target.offsetWidth;
    target.classList.add("splash");
    setTimeout(() => target.classList.remove("splash"), 700);
  }
  confetti(tx, ty, 22, 0.4);
  await wait(200);
  flying = false;
  openPlayer(v);
}

// 關掉播放器時，吉祥物從上面掉回原本的位置
function comeBack() {
  if (!away) return;
  const el = away;
  away = null;
  el.classList.remove("away");
  if (reduceMotion) return;
  el.animate([
    { transform: el === heroMascot ? "translateY(-260%)" : "translateY(-120%)", opacity: 0 },
    { transform: el === heroMascot ? "translateY(-100%)" : "none", opacity: 1, offset: 0.55 },
    { transform: el === heroMascot ? "translateY(-100%) scale(1.2,.75)" : "scale(1.2,.75)", offset: 0.72 },
    { transform: el === heroMascot ? "translateY(-100%)" : "none" },
  ], { duration: 700, easing: "ease-in", delay: 250, fill: "backwards" });
}

// ---------- 播放器 ----------

const player = $("player");
const listEl = $("playlist-items");
const autoNext = $("auto-next");
autoNext.checked = progress.autoNext !== false;
autoNext.onchange = () => { progress.autoNext = autoNext.checked; saveProgress(); };

let yt = null;
let ytReady = false;
let current = null;
let timer = null;
// YouTube 播放器程式不在一開始就載入，讓首頁開得比較快；
// 首頁閒下來、或有人把滑鼠移到影片上時才偷偷先載好
let ytLoading = null;
const ytWaiters = [];
window.onYouTubeIframeAPIReady = () => {
  ytReady = true;
  ytWaiters.splice(0).forEach((f) => f());
};

function loadYouTubeApi() {
  if (ytLoading) return;
  ytLoading = document.createElement("script");
  ytLoading.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(ytLoading);
}

function ensureYouTube(timeout = 3000) {
  loadYouTubeApi();
  if (ytReady) return Promise.resolve();
  return new Promise((resolve) => {
    ytWaiters.push(resolve);
    setTimeout(resolve, timeout);
  });
}

(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(loadYouTubeApi, { timeout: 4000 });
document.addEventListener("pointerover", (e) => { if (e.target.closest(".card, .sign, .btn")) loadYouTubeApi(); }, { passive: true });

// 影片播完時：記為看完，並自動接著播放清單的下一集；整個單元看完就接下一個單元
function onStateChange(e) {
  buddyOnState(e.data);
  if (e.data !== YT.PlayerState.ENDED || !current) return;
  markDone(current);
  const list = playlists.get(current.category);
  if (current !== list[list.length - 1]) {
    if (autoNext.checked) step(1);
    return;
  }
  celebrate(current.category);
  const units = [...playlists.values()];
  const nextUnit = units[units.indexOf(list) + 1];
  if (!nextUnit || !autoNext.checked) return;
  const finished = current;
  setTimeout(() => say(`下一個單元「${nextUnit[0].category}」出發！🚀`, 2600), 2000);
  setTimeout(() => {
    if (player.open && current === finished && autoNext.checked) openPlayer(nextUnit[0]);
  }, 6000);
}

async function load(v) {
  if (!ytReady) await ensureYouTube();
  if (current !== v) return; // 等待的時候已經換到別集了
  const start = resumeAt(v);
  if (ytReady) {
    if (!yt) {
      yt = new YT.Player("yt", {
        videoId: v.id,
        host: "https://www.youtube-nocookie.com",
        // 能用網站自己的「放大」時，關掉 YouTube 內建的全螢幕，吉祥物才能一起放大
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, start, fs: canFullscreen ? 0 : 1 },
        events: { onStateChange },
      });
    } else {
      yt.loadVideoById({ videoId: v.id, startSeconds: start });
    }
  } else {
    // YouTube 播放器程式還沒載入時，用一般的嵌入方式（無法自動接下一集）
    $("yt").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1&start=${start}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  }
  if (start > 0) toast(`從上次看到的 ${Math.floor(start / 60)}:${pad(start % 60)} 繼續播放`);
}

// 每幾秒記錄一次看到哪裡，看超過 90% 就算看完
function track() {
  if (!current || !yt || !yt.getCurrentTime || !yt.getVideoData) return;
  if (yt.getVideoData().video_id !== current.id || yt.getPlayerState() !== YT.PlayerState.PLAYING) return;
  const t = yt.getCurrentTime();
  const d = yt.getDuration();
  if (!d) return;
  progress.videos[current.id] = { ...rec(current), t, d };
  buddyOnProgress(current, t, d);
  if (t / d >= 0.9) markDone(current);
  else saveProgress();
  updateListProgress();
}

function markDone(v) {
  if (isDone(v)) return;
  progress.videos[v.id] = { ...rec(v), done: true };
  saveProgress();
  renderList();
}

function renderList() {
  const v = current;
  const list = playlists.get(v.category);
  const done = doneCount(list);
  $("playlist-name").textContent = v.category;
  $("playlist-pos").textContent = `已完成 ${done} / ${list.length}`;
  $("playlist-bar").style.width = `${(done / list.length) * 100}%`;
  listEl.innerHTML = "";
  list.forEach((item, n) => {
    const row = document.createElement("button");
    const r = ratio(item);
    row.className = "pl-row" + (item === v ? " now" : "");
    row.dataset.id = item.id;
    row.innerHTML = `
      <span class="pl-num">${item === v ? `<span class="eq"><i></i><i></i><i></i></span>` : n + 1}</span>
      <span class="pl-thumb"><img alt="" loading="lazy" src="${thumb(item, "mqdefault")}">${r > 0 && r < 1 ? `<span class="bar"><i style="width:${r * 100}%"></i></span>` : ""}</span>
      <span class="pl-title">${esc(item.name)}</span>
      ${isDone(item) ? `<span class="pl-check">${CHECK}</span>` : ""}`;
    row.onclick = () => openPlayer(item);
    listEl.appendChild(row);
  });
}

function updateListProgress() {
  const row = listEl.querySelector(".now .pl-thumb");
  if (!row) return;
  let bar = row.querySelector(".bar i");
  if (!bar) {
    row.insertAdjacentHTML("beforeend", `<span class="bar"><i></i></span>`);
    bar = row.querySelector(".bar i");
  }
  bar.style.width = `${ratio(current) * 100}%`;
}

function openPlayer(v) {
  current = v;
  progress.last = v.id;
  saveProgress();
  const list = playlists.get(v.category);
  const i = list.indexOf(v);
  $("crumb-unit").textContent = v.category;
  $("crumb-ep").textContent = `${epLabel(v)} · ${i + 1}/${list.length}`;
  $("player-title").textContent = v.name;
  $("player-desc").textContent = v.description || "";
  // 播放器背後透出這集縮圖的顏色（像 YouTube 的劇院氛圍光），強調色跟著單元走
  $("ambient").style.backgroundImage = `url("${thumb(v)}")`;
  player.style.setProperty("--u", unitInfo(v.category).color);
  $("prev").disabled = i === 0;
  $("next").disabled = i === list.length - 1;
  renderList();
  if (!player.open) {
    // 多記一筆瀏覽紀錄：在手機上按「返回」只會關掉影片，不會離開網站
    history.replaceState(null, "", location.pathname + location.search);
    history.pushState({ player: true }, "", `#v=${v.id}`);
    pushedHistory = true;
    document.documentElement.classList.add("lock");
    player.showModal();
    clearInterval(timer);
    timer = setInterval(track, 3000);
    buddyEnter();
  } else {
    history.replaceState({ player: true }, "", `#v=${v.id}`);
    buddyNewEpisode();
  }
  load(v);
  countPlay();
  hideAsk();
  updateSocialUI();
  refreshSocial(v);
  listEl.querySelector(".now").scrollIntoView({ block: "nearest" });
}

function step(d) {
  const list = playlists.get(current.category);
  const next = list[list.indexOf(current) + d];
  if (next) openPlayer(next);
}

let pushedHistory = false;
let closingFromBack = false;

player.addEventListener("close", () => {
  track();
  clearInterval(timer);
  buddyLeave();
  if (yt && yt.stopVideo) yt.stopVideo();
  else $("yt").innerHTML = "";
  document.documentElement.classList.remove("lock");
  if (pushedHistory) {
    pushedHistory = false;
    if (!closingFromBack) history.back();
  }
  closingFromBack = false;
  refreshAll();
  comeBack();
});

// 按瀏覽器／手機的「返回」：關掉影片
addEventListener("popstate", (e) => {
  if (player.open && !(e.state && e.state.player)) {
    closingFromBack = true;
    player.close();
  }
});
$("close").onclick = () => player.close();
$("prev").onclick = () => step(-1);
$("next").onclick = () => step(1);
player.addEventListener("click", (e) => { if (e.target === player) player.close(); });
$("share").onclick = async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    toast("已複製這一集的連結，可以直接貼給同學");
  } catch (e) {
    prompt("複製這個連結：", location.href);
  }
};

// ---------- 播放時陪你看影片的吉祥物 ----------
// 牠只會在影片上方的小平台活動，不會擋到影片

const lane = $("lane");
const buddyEl = $("buddy");
const hopEl = buddyEl.querySelector(".buddy-hop");
const flipEl = buddyEl.querySelector(".buddy-flip");
const bubble = buddyEl.querySelector(".bubble");
flipEl.innerHTML = mascot();
const bsvg = flipEl.querySelector("svg");
const buddy = { x: 0, facing: -1, busy: false, sleeping: false, timer: null, napTimer: null, waitTimer: null, lastId: null, lastT: null };

const LINES = ["認真看喔 👀", "這段很重要！", "記得做筆記 ✍️", "物理好好玩～", "嗯嗯，原來如此", "我也在學！", "加油加油 💪", "看懂了嗎？", "這個公式好帥"];
const POKES = ["嘿嘿 😆", "好癢！", "專心看影片啦～", "幹嘛戳我 🙈", "我在認真聽課耶"];

const maxX = () => Math.max(0, lane.clientWidth - buddyEl.offsetWidth);

function place(x, ms = 0) {
  buddy.x = Math.max(0, Math.min(maxX(), x));
  buddyEl.style.transition = ms ? `transform ${ms}ms linear` : "none";
  buddyEl.style.transform = `translateX(${buddy.x}px)`;
}

// 吉祥物原本的眼睛偏左，所以預設是面向左邊
function face(dir) {
  buddy.facing = dir;
  flipEl.style.transform = dir > 0 ? "scaleX(-1)" : "";
}

function look(where) {
  bsvg.classList.remove("look-c", "look-r");
  if (where) bsvg.classList.add(where);
}

async function walkTo(x) {
  x = Math.max(0, Math.min(maxX(), x));
  const dist = Math.abs(x - buddy.x);
  if (dist < 4) return;
  face(x > buddy.x ? 1 : -1);
  bsvg.classList.add("walking");
  const ms = dist * 9 + 200;
  place(x, ms);
  await wait(ms);
  bsvg.classList.remove("walking");
}

function hop(h = 18, ms = 440) {
  return hopEl.animate([
    { transform: "none" },
    { transform: "scale(1.12,.86)", offset: 0.15 },
    { transform: `translateY(-${h}px) scale(.94,1.08)`, offset: 0.5 },
    { transform: "scale(1.1,.9)", offset: 0.85 },
    { transform: "none" },
  ], { duration: ms, easing: "ease-out" }).finished.catch(() => {});
}

async function say(text, ms = 2600) {
  bubble.textContent = text;
  bubble.classList.toggle("left", buddy.x > maxX() * 0.6);
  buddyEl.classList.add("talking");
  await wait(ms);
  buddyEl.classList.remove("talking");
}

async function wave(both = false) {
  bsvg.classList.add("waving");
  bsvg.classList.toggle("both", both);
  await wait(1400);
  bsvg.classList.remove("waving", "both");
}

async function lookAround() {
  for (const w of ["look-r", "", "look-r", "look-c"]) {
    look(w);
    await wait(480);
  }
  await wait(800);
  look("");
}

async function sit(ms) {
  bsvg.classList.add("sitting");
  await wait(ms);
  bsvg.classList.remove("sitting");
}

// 走一走不小心跌倒，趴一下再爬起來
async function trip() {
  await walkTo(buddy.x + (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 90));
  const lean = buddy.facing > 0 ? 24 : -24;
  await hopEl.animate([
    { transform: "none" },
    { transform: `translateY(-13px) rotate(${lean}deg)`, offset: 0.18 },
    { transform: "scale(1.3,.5)", offset: 0.3 },
    { transform: "scale(1.3,.5)", offset: 0.75 },
    { transform: "translateY(-8px) scale(.95,1.08)", offset: 0.88 },
    { transform: "none" },
  ], { duration: 1700, easing: "ease-in-out" }).finished.catch(() => {});
  await say("沒事沒事 😅", 1600);
}

// 追一顆飄在空中的彩色像素
async function chasePixel() {
  const p = document.createElement("i");
  const x = Math.random() * maxX();
  p.className = "lane-pixel";
  p.style.left = `${x + buddyEl.offsetWidth / 2}px`;
  p.style.background = pick(COLORS);
  lane.appendChild(p);
  look(x > buddy.x ? (buddy.facing > 0 ? "" : "look-r") : (buddy.facing > 0 ? "look-r" : ""));
  await wait(700);
  look("");
  await walkTo(x);
  await hop(22, 460);
  p.classList.add("pop");
  await wait(300);
  p.remove();
}

// ---- 道具（像素小物件），都放在影片上方的小平台裡 ----

const sprite = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
const BALL = sprite(4, 4, '<path fill="#ffb84d" d="M1 0h2v1h1v2h-1v1h-2v-1h-1v-2h1z"/><rect x="1" y="1" width="1" height="1" fill="#fff3c4"/>');
const APPLE = sprite(5, 6, '<rect x="2" width="1" height="1" fill="#6b3e1f"/><rect x="3" width="1" height="1" fill="#7bd389"/><path fill="#ff4d5e" d="M1 1h3v1h1v3h-1v1h-3v-1h-1v-3h1z"/><rect x="1" y="2" width="1" height="1" fill="#ffb3ba"/>');
const BOOK = sprite(8, 5, '<rect width="8" height="5" fill="#7b4dff"/><rect x="1" width="3" height="4" fill="#fff"/><rect x="4" width="3" height="4" fill="#ece6f7"/><rect x="1" y="1" width="2" height="1" fill="#b9b1cc"/><rect x="5" y="1" width="2" height="1" fill="#b9b1cc"/><rect x="1" y="2" width="2" height="1" fill="#b9b1cc"/><rect x="5" y="2" width="1" height="1" fill="#b9b1cc"/>');

const bw = () => buddyEl.offsetWidth;
const headY = () => (buddyEl.offsetHeight * 10) / 11; // 吉祥物頭頂離平台的高度
const centerX = () => buddy.x + bw() / 2;

// x 是道具中心、y 是道具底部離平台的高度
function prop(html, x, y, cls = "") {
  const el = document.createElement("div");
  el.className = `prop ${cls}`;
  el.innerHTML = html;
  el.style.left = `${x}px`;
  el.style.bottom = `${y}px`;
  lane.appendChild(el);
  return el;
}

const anim = (el, frames, opts) => el.animate(frames, opts).finished.catch(() => {});

// 把球往前丟，看它畫出拋物線，再跑過去撿
async function throwBall() {
  const dir = centerX() > lane.clientWidth / 2 ? -1 : 1;
  face(dir);
  const x0 = centerX() + dir * bw() * 0.45;
  const room = dir > 0 ? lane.clientWidth - x0 - 50 : x0 - 50;
  const dist = Math.max(40, Math.min(100 + Math.random() * 70, room));
  const h0 = headY() * 0.45;
  const b = prop(BALL, x0, h0, "ball");
  await hop(5, 240);
  const frames = [];
  for (let i = 0; i <= 14; i++) {
    const p = i / 14;
    frames.push({ transform: `translate(${dir * dist * p}px, ${-4 * 28 * p * (1 - p) + p * h0}px)` });
  }
  say("拋體運動！", 1800);
  await anim(b, frames, { duration: 820, fill: "forwards" });
  await anim(b, [
    { transform: `translate(${dir * dist}px, ${h0}px)` },
    { transform: `translate(${dir * (dist + 16)}px, ${h0 - 10}px)` },
    { transform: `translate(${dir * (dist + 28)}px, ${h0}px)` },
  ], { duration: 360, fill: "forwards" });
  await walkTo(x0 + dir * (dist + 28) - bw() / 2);
  b.remove();
  await hop(10, 300);
}

// 蘋果掉到頭上 → 靈光一閃
async function newtonApple() {
  const cx = centerX();
  const top = lane.clientHeight + 6;
  const a = prop(APPLE, cx, top, "apple");
  const fall = top - headY();
  await anim(a, [{ transform: "none" }, { transform: `translateY(${fall}px)` }], { duration: 480, easing: "cubic-bezier(.55,0,1,.45)", fill: "forwards" });
  anim(hopEl, [{ transform: "none" }, { transform: "scale(1.16,.8)" }, { transform: "none" }], { duration: 260 });
  const mark = prop('<b class="mark">!</b>', cx + bw() * 0.32, headY() + 2);
  const side = buddy.facing > 0 ? -1 : 1;
  await anim(a, [
    { transform: `translateY(${fall}px)` },
    { transform: `translate(${side * 20}px, ${fall - 12}px)` },
    { transform: `translate(${side * 34}px, ${top}px)` },
  ], { duration: 520, easing: "ease-in", fill: "forwards" });
  await wait(350);
  mark.remove();
  const bulb = prop('<span class="emo">💡</span>', cx, headY() + 1, "bulb");
  look("look-c");
  await say("懂了！萬有引力！", 2200);
  bulb.remove();
  a.remove();
  look("");
}

// 坐下來看書、點頭
async function readBook() {
  bsvg.classList.add("sitting");
  const bk = prop(BOOK, centerX() + buddy.facing * bw() * 0.18, 2, "book");
  say(pick(["做筆記中… ✍️", "複習一下 📖", "嗯…原來是這樣"]), 2200);
  await anim(hopEl, [{ transform: "translateY(-2px)" }, { transform: "translateY(-2px) rotate(-3deg)" }, { transform: "translateY(-2px)" }, { transform: "translateY(-2px) rotate(3deg)" }, { transform: "translateY(-2px)" }], { duration: 1500, iterations: 2 });
  bk.remove();
  bsvg.classList.remove("sitting");
}

function floatNote() {
  const n = prop(`<span class="note">${pick(["♪", "♫"])}</span>`, centerX() + (Math.random() * 30 - 15), headY());
  anim(n, [{ transform: "none", opacity: 1 }, { transform: "translate(10px,-22px)", opacity: 0 }], { duration: 1200 }).then(() => n.remove());
}

async function dance() {
  bsvg.classList.add("waving");
  for (let i = 0; i < 8; i++) {
    face(i % 2 ? 1 : -1);
    bsvg.classList.toggle("both", i % 2 === 0);
    if (i % 2 === 0) floatNote();
    await hop(8, 300);
  }
  bsvg.classList.remove("waving", "both");
}

// 跳到半空中轉一圈（在空中轉完才落地，不會碰到影片）
async function spin() {
  hopEl.style.transformOrigin = "50% 50%";
  await anim(hopEl, [
    { transform: "none" },
    { transform: "scale(1.1,.88)", offset: 0.12 },
    { transform: "translateY(-26px)", offset: 0.35 },
    { transform: "translateY(-28px) rotate(360deg)", offset: 0.75 },
    { transform: "translateY(0) rotate(360deg)" },
  ], { duration: 800, easing: "ease-in-out" });
  hopEl.style.transformOrigin = "";
}

// 月球漫步：面向一邊、往反方向滑
async function moonwalk() {
  const target = Math.max(0, Math.min(maxX(), buddy.x + (buddy.x > maxX() / 2 ? -1 : 1) * 130));
  const dir = target > buddy.x ? 1 : -1;
  face(-dir);
  bsvg.classList.add("walking");
  say("月球漫步～", 1800);
  const ms = Math.abs(target - buddy.x) * 14 + 300;
  place(target, ms);
  await wait(ms);
  bsvg.classList.remove("walking");
  face(dir);
  await hop(10, 300);
}

async function stretch() {
  bsvg.classList.add("arms-up");
  say("伸個懶腰～", 1600);
  await anim(hopEl, [{ transform: "none" }, { transform: "scale(.9,1.18)", offset: 0.4 }, { transform: "scale(.9,1.18)", offset: 0.7 }, { transform: "none" }], { duration: 1600, easing: "ease-in-out" });
  bsvg.classList.remove("arms-up");
}

async function sneeze() {
  for (const s of [1.06, 1.12]) {
    await anim(hopEl, [{ transform: "none" }, { transform: `scale(${2 - s},${s})` }, { transform: "none" }], { duration: 420 });
  }
  anim(hopEl, [{ transform: "none" }, { transform: `translateX(${-buddy.facing * 8}px) scale(1.2,.82)`, offset: 0.3 }, { transform: "none" }], { duration: 520 });
  const r = buddyEl.getBoundingClientRect();
  confetti(r.left + r.width / 2 + buddy.facing * r.width * 0.5, r.top + r.height * 0.4, 8, 0.15);
  await say("哈啾！", 1400);
}

// 身體往前傾，偷看下面的影片（以前腳為支點，不會碰到影片）
async function peek() {
  hopEl.style.transformOrigin = buddy.facing > 0 ? "100% 100%" : "0% 100%";
  say("偷看一下 👀", 1800);
  await anim(hopEl, [{ transform: "none" }, { transform: `rotate(${buddy.facing * 20}deg)`, offset: 0.25 }, { transform: `rotate(${buddy.facing * 20}deg)`, offset: 0.8 }, { transform: "none" }], { duration: 2200, easing: "ease-in-out" });
  hopEl.style.transformOrigin = "";
}

async function exercise() {
  say("運動時間！💪", 1800);
  for (let i = 0; i < 4; i++) {
    bsvg.classList.add("arms-up");
    await hop(12, 320);
    bsvg.classList.remove("arms-up");
    await wait(120);
  }
}

const ACTIONS = [
  [() => walkTo(Math.random() * maxX()), 16],
  [() => hop(), 5],
  [() => wave(), 5],
  [lookAround, 7],
  [chasePixel, 6],
  [trip, 4],
  [() => sit(5000 + Math.random() * 5000), 5],
  [() => say(pick(LINES)), 7],
  [throwBall, 7],
  [newtonApple, 5],
  [readBook, 6],
  [dance, 5],
  [spin, 5],
  [moonwalk, 4],
  [stretch, 5],
  [sneeze, 3],
  [peek, 5],
  [exercise, 4],
];
let lastAction = null;

function pickAction() {
  const pool = ACTIONS.filter(([f]) => f !== lastAction);
  let r = Math.random() * pool.reduce((s, [, w]) => s + w, 0);
  for (const [f, w] of pool) if ((r -= w) <= 0) return (lastAction = f);
  return pool[0][0];
}

async function act() {
  if (!player.open || document.hidden) return schedule();
  if (buddy.busy || buddy.sleeping) return schedule();
  buddy.busy = true;
  try {
    await pickAction()();
  } finally {
    lane.querySelectorAll(".prop").forEach((p) => p.remove());
    hopEl.style.transformOrigin = "";
    bsvg.classList.remove("sitting", "arms-up", "walking");
    buddy.busy = false;
    schedule();
  }
}

function schedule(ms = 6000 + Math.random() * 9000) {
  clearTimeout(buddy.timer);
  if (player.open && !reduceMotion) buddy.timer = setTimeout(act, ms);
}

function nap(on) {
  buddy.sleeping = on;
  bsvg.classList.toggle("sleeping", on);
  buddyEl.classList.toggle("asleep", on);
}

// 依影片狀態反應：暫停太久會睡著，播放時醒來，播完會歡呼
function buddyOnState(s) {
  clearTimeout(buddy.napTimer);
  clearTimeout(buddy.waitTimer);
  bsvg.classList.remove("tapping");
  if (s === YT.PlayerState.PLAYING && buddy.sleeping) {
    nap(false);
    hop();
    say("我醒了！", 1500);
  } else if (s === YT.PlayerState.PAUSED) {
    buddy.napTimer = setTimeout(() => nap(true), 25000);
    // 暫停一下下就轉頭看你
    buddy.waitTimer = setTimeout(() => {
      if (buddy.busy || buddy.sleeping) return;
      look("look-c");
      if (Math.random() < 0.4) say(pick(["暫停一下～☕", "休息一下也好", "有問題嗎？🤔"]), 2200);
    }, 1200);
  } else if (s === YT.PlayerState.BUFFERING) {
    // 載入很久的話，會不耐煩地踏腳
    buddy.waitTimer = setTimeout(() => {
      if (buddy.busy || buddy.sleeping) return;
      bsvg.classList.add("tapping");
      say("載入中…等一下下 ⏳", 2000);
    }, 1800);
  } else if (s === YT.PlayerState.ENDED) {
    nap(false);
    const ended = current; // 自動播下一集後 current 會變，先記住剛看完的是哪一集
    cheer().then(() => askSupport(ended));
  }
}

async function cheer() {
  bsvg.classList.add("waving", "both");
  for (let i = 0; i < 3; i++) await hop(22, 420);
  bsvg.classList.remove("waving", "both");
}

// 打開播放器：吉祥物從上面掉下來，站在影片上方
async function buddyEnter() {
  nap(false);
  look("");
  buddyEl.classList.add("show");
  place(maxX() * 0.06);
  face(1);
  if (reduceMotion) return;
  await hopEl.animate([
    { transform: "translateY(-180px)", opacity: 0 },
    { transform: "translateY(-180px)", opacity: 1, offset: 0.2 },
    { transform: "none", offset: 0.6 },
    { transform: "scale(1.3,.65)", offset: 0.72 },
    { transform: "translateY(-6px) scale(.94,1.08)", offset: 0.86 },
    { transform: "none" },
  ], { duration: 900, easing: "ease-in", delay: 150 }).finished.catch(() => {});
  if (player.open) say(greeting(), 2400);
  schedule(7000);
}

function greeting() {
  const h = new Date().getHours();
  if (h >= 23 || h < 5) return "這麼晚還在學，好用功！記得早點睡 😴";
  if (h < 11) return "早安！一起學物理 ☀️";
  if (h < 14) return "午安～吃飽了嗎？";
  if (h < 18) return "一起看吧！";
  return "晚安～今天也來學一點 🌙";
}

// 依照播放進度反應：倒回去重看、快轉跳過、看到一半
function buddyOnProgress(v, t, d) {
  const prev = buddy.lastId === v.id ? buddy.lastT : null;
  buddy.lastId = v.id;
  buddy.lastT = t;
  if (buddy.busy || buddy.sleeping || prev == null) return;
  if (t < prev - 5) say(pick(["再看一次！好認真 👍", "倒帶～這段很重要對吧"]), 2400);
  else if (t > prev + 20) {
    say(pick(["欸欸，跳過了喔 👀", "快轉！你很趕嗎？"]), 2400);
    hop(10, 300);
  } else if (prev / d < 0.5 && t / d >= 0.5) {
    say("看一半了，加油！💪", 2400);
    hop(12, 360);
  }
}

function buddyNewEpisode() {
  if (buddy.sleeping) nap(false);
  if (!buddy.busy && !reduceMotion) hop();
}

function buddyLeave() {
  clearTimeout(buddy.timer);
  clearTimeout(buddy.napTimer);
  clearTimeout(buddy.waitTimer);
  nap(false);
  buddyEl.classList.remove("show", "talking");
  bsvg.classList.remove("tapping");
  lane.querySelectorAll(".lane-pixel, .prop").forEach((p) => p.remove());
  hideAsk();
  if (fullscreenEl()) exitFullscreen();
}

buddyEl.onclick = async () => {
  const r = buddyEl.getBoundingClientRect();
  if (buddy.sleeping) {
    nap(false);
    hop(20);
    return say("啊！我沒睡！😳", 1800);
  }
  if (buddy.busy) return;
  buddy.busy = true;
  confetti(r.left + r.width / 2, r.top + r.height / 3, 14, 0.3);
  await Promise.all([hop(20), say(pick(POKES), 1800)]);
  buddy.busy = false;
};

// 沒事的時候，眼睛會跟著滑鼠看
player.addEventListener("mousemove", (e) => {
  if (buddy.busy || buddy.sleeping) return;
  const r = buddyEl.getBoundingClientRect();
  const right = e.clientX > r.left + r.width / 2;
  look(right !== buddy.facing > 0 ? "look-r" : "");
});

addEventListener("resize", () => { if (player.open) place(buddy.x); });

// ---------- 放大（吉祥物會跟著一起放大陪看） ----------

const frameWrap = $("frame-wrap");
const canFullscreen = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const fullscreenEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;

function exitFullscreen() {
  (document.exitFullscreen || document.webkitExitFullscreen).call(document);
}

function toggleFullscreen() {
  if (fullscreenEl()) return exitFullscreen();
  (frameWrap.requestFullscreen || frameWrap.webkitRequestFullscreen).call(frameWrap);
}

let fsExitedAt = 0;

function onFullscreenChange() {
  const on = fullscreenEl() === frameWrap;
  if (!on) fsExitedAt = Date.now();
  frameWrap.classList.toggle("is-fs", on);
  $("fs-btn").querySelector("span").textContent = on ? "縮小" : "放大";
  // 提示訊息跟著搬到看得到的地方
  const box = $("toasts");
  if (box.parentElement !== layer()) layer().appendChild(box);
  requestAnimationFrame(() => place(buddy.x));
  if (on && !buddy.busy && !reduceMotion) hop(22);
}
document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
// 在放大畫面按 Esc 只縮小，不要連播放器一起關掉
player.addEventListener("cancel", (e) => {
  if (fullscreenEl()) {
    e.preventDefault();
    exitFullscreen();
  } else if (Date.now() - fsExitedAt < 600) {
    e.preventDefault();
  }
});
$("fs-btn").onclick = toggleFullscreen;
$("fs-exit").onclick = exitFullscreen;
$("fs-btn").hidden = !canFullscreen;

// ---------- 按讚、訂閱（登入 Google 後直接同步到 YouTube） ----------

const YT_API = "https://www.googleapis.com/youtube/v3";
const canSync = !!SITE.googleClientId;
const social = { token: null, exp: 0, subscribed: null, subId: null, liked: {} };
const askedFor = new Set(); // 這次已經拜託過的影片，不重複吵
let declined = 0;
let askVideo = null;
let tokenClient = null;
let tokenWaiter = null;

try {
  const saved = JSON.parse(sessionStorage.getItem("yt-token"));
  if (saved && saved.exp > Date.now() + 60000) Object.assign(social, saved);
} catch (e) {}

const signedIn = () => !!social.token && social.exp > Date.now() + 30000;

function initGoogle() {
  if (!canSync || tokenClient || !(window.google && google.accounts && google.accounts.oauth2)) return;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: SITE.googleClientId,
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    callback: (r) => {
      const w = tokenWaiter;
      tokenWaiter = null;
      if (r.error || !r.access_token) return w && w.reject(r);
      social.token = r.access_token;
      social.exp = Date.now() + Number(r.expires_in || 3600) * 1000;
      try { sessionStorage.setItem("yt-token", JSON.stringify({ token: social.token, exp: social.exp })); } catch (e) {}
      updateAccountUI();
      if (w) w.resolve();
    },
    error_callback: (err) => {
      const w = tokenWaiter;
      tokenWaiter = null;
      if (w) w.reject(err);
    },
  });
}
window.onGoogleLibraryLoad = initGoogle;
if (canSync) {
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.onload = initGoogle;
  document.head.appendChild(s);
}

// 一定要在按鈕被按下的當下呼叫，瀏覽器才會讓 Google 登入視窗跳出來
function signIn() {
  if (signedIn()) return Promise.resolve();
  initGoogle();
  if (!tokenClient) return Promise.reject({ type: "not_ready" });
  return new Promise((resolve, reject) => {
    tokenWaiter = { resolve, reject };
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

function signOut() {
  if (social.token && window.google) google.accounts.oauth2.revoke(social.token, () => {});
  Object.assign(social, { token: null, exp: 0, subscribed: null, subId: null, liked: {} });
  try { sessionStorage.removeItem("yt-token"); } catch (e) {}
  updateAccountUI();
  updateSocialUI();
}

async function ytApi(method, path, body) {
  const r = await fetch(`${YT_API}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${social.token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401) {
    signOut();
    throw { reason: "expired" };
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw { reason: (j.error && j.error.errors && j.error.errors[0] && j.error.errors[0].reason) || String(r.status) };
  }
  return r.status === 204 ? null : r.json();
}

// 讀取這位觀眾目前有沒有按讚、有沒有訂閱
async function refreshSocial(v) {
  if (!canSync || !signedIn() || !v) return;
  try {
    const jobs = [];
    if (social.liked[v.id] === undefined) {
      jobs.push(ytApi("GET", `videos/getRating?id=${v.id}`).then((j) => {
        social.liked[v.id] = !!(j.items && j.items[0] && j.items[0].rating === "like");
      }));
    }
    if (social.subscribed === null) {
      jobs.push(ytApi("GET", `subscriptions?part=id&mine=true&forChannelId=${SITE.channelId}`).then((j) => {
        social.subId = (j.items && j.items[0] && j.items[0].id) || null;
        social.subscribed = !!social.subId;
      }));
    }
    await Promise.all(jobs);
  } catch (e) {}
  updateSocialUI();
}

function socialError(e) {
  const r = (e && (e.reason || e.type || e.error)) || "";
  if (r === "popup_closed" || r === "access_denied") return toast("登入沒有完成，想按讚訂閱時再按一次就好");
  if (r === "popup_failed_to_open") return toast("登入視窗被瀏覽器擋住了，請允許彈出視窗後再試一次");
  if (r === "quotaExceeded") return toast("今天網站的按讚次數用完了 😢 明天再來，或到 YouTube 按也可以");
  if (r === "expired") return toast("登入過期了，請再按一次");
  if (r === "not_ready") return toast("Google 登入還在載入，等一下再按一次");
  toast("YouTube 暫時沒有回應，請稍後再試");
}

async function toggleLike(v = current) {
  if (!canSync) return window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank", "noopener");
  try {
    await signIn();
    if (social.liked[v.id] === undefined) await refreshSocial(v);
    const like = !social.liked[v.id];
    setBusy("like-btn", true);
    await ytApi("POST", `videos/rate?id=${v.id}&rating=${like ? "like" : "none"}`);
    social.liked[v.id] = like;
    if (like) thanks("謝謝你的讚！❤️");
  } catch (e) {
    socialError(e);
  } finally {
    setBusy("like-btn", false);
    updateSocialUI();
  }
}

async function toggleSubscribe() {
  if (!canSync) return window.open(`${SITE.channelUrl}?sub_confirmation=1`, "_blank", "noopener");
  try {
    await signIn();
    if (social.subscribed === null) await refreshSocial(current);
    setBusy("sub-btn", true);
    if (social.subscribed) {
      if (!confirm("確定要取消訂閱嗎？🥺")) return;
      await ytApi("DELETE", `subscriptions?id=${social.subId}`);
      social.subscribed = false;
      social.subId = null;
      say("嗚嗚…有空再回來喔 😢", 2400);
    } else {
      try {
        const j = await ytApi("POST", "subscriptions?part=snippet", {
          snippet: { resourceId: { kind: "youtube#channel", channelId: SITE.channelId } },
        });
        social.subId = j.id;
      } catch (e) {
        if (e.reason !== "subscriptionDuplicate") throw e;
      }
      social.subscribed = true;
      thanks("耶！謝謝你訂閱 🎉");
    }
  } catch (e) {
    socialError(e);
  } finally {
    setBusy("sub-btn", false);
    updateSocialUI();
  }
}

function setBusy(id, on) {
  $(id).classList.toggle("busy", on);
}

function updateSocialUI() {
  const v = current;
  const liked = !!(v && social.liked[v.id]);
  const like = $("like-btn");
  like.classList.toggle("on", liked);
  like.querySelector("span").textContent = liked ? "已按讚" : "按讚";
  const sub = $("sub-btn");
  sub.classList.toggle("on", !!social.subscribed);
  sub.querySelector("span").textContent = social.subscribed ? "已訂閱" : "訂閱頻道";
  $("soc-note").textContent = !canSync ? "會在 YouTube 開新分頁" : signedIn() ? "已連結你的 YouTube" : "第一次按會請你登入 Google";
}

function updateAccountUI() {
  const b = $("account");
  b.hidden = !canSync;
  b.classList.toggle("on", signedIn());
  b.innerHTML = signedIn()
    ? `<span class="dot"></span>已連結 YouTube`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285f4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34a853"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#fbbc04"/><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z" fill="#ea4335"/></svg>用 Google 登入`;
}

$("account").onclick = async () => {
  if (signedIn()) {
    if (confirm("要中斷和 YouTube 的連結嗎？（之後可以再登入）")) signOut();
    return;
  }
  try {
    await signIn();
    toast("已連結你的 YouTube，按讚和訂閱會直接同步 ✨");
    refreshSocial(current);
  } catch (e) {
    socialError(e);
  }
};
$("like-btn").onclick = () => toggleLike();
$("sub-btn").onclick = () => toggleSubscribe();

// 看完一集後，吉祥物賣萌拜託按讚訂閱（每集只問一次，拒絕兩次就不再吵）
const ask = $("ask");

async function askSupport(v) {
  if (!v || !player.open || askedFor.has(v.id) || declined >= 2) return;
  await refreshSocial(v);
  const needSub = !social.subscribed;
  const needLike = !social.liked[v.id];
  if (!needSub && !needLike) return say("謝謝你一直支持 ❤️", 2400);
  askedFor.add(v.id);
  askVideo = v;
  ask.querySelector(".ask-text").textContent = needSub && needLike
    ? "喜歡的話幫我按讚訂閱好不好～🥺"
    : needSub ? "可以訂閱我嗎～🥺" : "這集喜歡嗎？幫我按個讚 🥺";
  ask.querySelector('[data-a="like"]').hidden = !needLike;
  ask.querySelector('[data-a="sub"]').hidden = !needSub;
  buddyEl.classList.remove("talking");
  buddy.busy = true;
  await walkTo(0);
  face(1);
  look("look-c");
  bsvg.classList.add("waving", "both", "begging");
  lane.classList.add("asking");
  lane.scrollIntoView({ block: "nearest", behavior: "smooth" });
  clearTimeout(ask.timer);
  ask.timer = setTimeout(hideAsk, 20000);
}

function hideAsk() {
  clearTimeout(ask.timer);
  if (!lane.classList.contains("asking")) return;
  lane.classList.remove("asking");
  bsvg.classList.remove("waving", "both", "begging");
  look("");
  buddy.busy = false;
}

ask.addEventListener("click", (e) => {
  const a = e.target.closest("button") && e.target.closest("button").dataset.a;
  if (!a) return;
  const v = askVideo;
  hideAsk();
  if (a === "like") toggleLike(v);
  else if (a === "sub") toggleSubscribe();
  else {
    declined++;
    say("好吧…下次再說 🥲", 2000);
  }
});

function thanks(text) {
  const r = buddyEl.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height / 3, 30, 0.5);
  say(text, 2600);
  cheer();
}

updateAccountUI();
updateSocialUI();

// ---------- 提示訊息與慶祝 ----------

// 播放器打開時，提示要放進播放器裡才不會被蓋住
const layer = () => fullscreenEl() || (player.open ? player : document.body);

function toast(html, { big = false, ms = 3200 } = {}) {
  const box = $("toasts");
  if (box.parentElement !== layer()) layer().appendChild(box);
  const t = document.createElement("div");
  t.className = "toast" + (big ? " big" : "");
  t.innerHTML = `<span class="tm">${mascot("bob")}</span><span>${html}</span>`;
  $("toasts").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms);
}

function confetti(x, y, n = 70, spread = 1) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement("i");
    const a = Math.random() * Math.PI * 2;
    const dist = (120 + Math.random() * 260) * spread;
    c.className = "confetti";
    c.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};` +
      `--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist + 160 * spread}px;--r:${Math.random() * 720}deg;` +
      `width:${5 + Math.random() * 6}px;height:${5 + Math.random() * 6}px`;
    layer().appendChild(c);
    setTimeout(() => c.remove(), 1600);
  }
}

function celebrate(unit) {
  confetti(innerWidth / 2, innerHeight / 2.4, 110);
  toast(`恭喜完成「${esc(unit)}」！<small>${doneCount(videos)} / ${videos.length} 集已看完，繼續加油</small>`, { big: true, ms: 5000 });
}

// ---------- 瀏覽次數統計（用免費的 Abacus 計數服務，不需要註冊） ----------

const COUNTER = "https://abacus.jasoncameron.dev";
const COUNTER_NS = "derek1000403-zoo";
const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Taipei" }).format(new Date());

async function counter(action, key) {
  try {
    const r = await fetch(`${COUNTER}/${action}/${COUNTER_NS}/${key}`);
    if (r.status === 404) return 0; // 還沒有人算過
    if (!r.ok) return null;
    return (await r.json()).value;
  } catch (e) {
    return null;
  }
}

function showCount(id, n) {
  const el = $(id);
  if (n == null) return;
  const from = Number(el.dataset.n || 0);
  el.dataset.n = n;
  if (reduceMotion || from === n) return (el.textContent = n.toLocaleString("zh-TW"));
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / 900);
    el.textContent = Math.round(from + (n - from) * (1 - (1 - p) ** 3)).toLocaleString("zh-TW");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// 同一個人這次來只算一次，重新整理不會一直加
async function loadStats() {
  let fresh = true;
  try {
    fresh = sessionStorage.getItem("counted") !== today;
    sessionStorage.setItem("counted", today);
  } catch (e) {}
  const act = fresh ? "hit" : "get";
  const [total, day, plays] = await Promise.all([counter(act, "visits"), counter(act, `day-${today}`), counter("get", "plays")]);
  showCount("sv-total", total);
  showCount("sv-today", day);
  showCount("sv-plays", plays);
}

function countPlay() {
  counter("hit", "plays").then((n) => showCount("sv-plays", n));
}

// ---------- 其他 ----------

$("reset").onclick = () => {
  if (!confirm("確定要清除這台裝置上的觀看紀錄嗎？")) return;
  progress = { videos: {}, last: null, autoNext: autoNext.checked };
  saveProgress();
  refreshAll();
  toast("學習紀錄已清除");
};

document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
  if (player.open) {
    if (e.key === "n" || e.key === "N") step(1);
    if (e.key === "p" || e.key === "P") step(-1);
    if ((e.key === "f" || e.key === "F") && canFullscreen) toggleFullscreen();
  } else if (e.key === "/") {
    e.preventDefault();
    search.focus();
  }
});
search.addEventListener("input", render);

// 首頁的吉祥物：點一下會跳起來
$("brand-mascot").innerHTML = mascot();
$("walker").innerHTML = mascot("walking");
heroMascot.innerHTML = mascot("bob");
heroMascot.onclick = () => {
  const svg = heroMascot.querySelector("svg");
  svg.classList.remove("bob", "jump");
  void svg.offsetWidth;
  svg.classList.add("jump");
  const r = heroMascot.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height / 3, 26);
  setTimeout(() => { svg.classList.remove("jump"); svg.classList.add("bob"); }, 650);
};
// 首頁吉祥物自己會動：揮手、東張西望、伸懶腰、跳一下
function heroIdle() {
  setTimeout(heroIdle, 6000 + Math.random() * 7000);
  if (reduceMotion || document.hidden || player.open || flying || away || !onScreen(heroMascot)) return;
  const svg = heroMascot.querySelector("svg");
  const r = Math.random();
  if (r < 0.3) {
    svg.classList.add("waving", "both");
    setTimeout(() => svg.classList.remove("waving", "both"), 1500);
  } else if (r < 0.55) {
    ["look-r", "", "look-c", ""].forEach((c, i) => setTimeout(() => {
      svg.classList.remove("look-r", "look-c");
      if (c) svg.classList.add(c);
    }, i * 450));
  } else if (r < 0.75) {
    svg.classList.add("arms-up");
    setTimeout(() => svg.classList.remove("arms-up"), 1200);
  } else {
    heroMascot.onclick();
  }
}
setTimeout(heroIdle, 4000);

// 首頁吉祥物的眼睛跟著滑鼠
let eyeFrame = 0;
document.addEventListener("mousemove", (e) => {
  if (player.open || eyeFrame) return;
  eyeFrame = requestAnimationFrame(() => {
    eyeFrame = 0;
    for (const el of [heroMascot, $("brand-mascot")]) {
      const svg = el.querySelector("svg");
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      svg.classList.toggle("look-r", dx > 60);
      svg.classList.toggle("look-c", Math.abs(dx) <= 60);
    }
  });
}, { passive: true });

// 頁尾的吉祥物偶爾停下來揮手
const walker = $("walker");
setInterval(() => {
  if (reduceMotion || document.hidden || Math.random() < 0.5) return;
  const svg = walker.querySelector("svg");
  walker.style.animationPlayState = "paused";
  svg.classList.remove("walking");
  svg.classList.add("waving", "both");
  setTimeout(() => {
    svg.classList.remove("waving", "both");
    svg.classList.add("walking");
    walker.style.animationPlayState = "";
  }, 1600);
}, 9000);

heroMascot.parentElement.querySelector(".pixels").innerHTML = Array.from({ length: 14 }, (_, i) =>
  `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 90}%;background:${COLORS[i % COLORS.length]};animation-delay:${(i * 0.31) % 2.2}s"></i>`).join("");

// 背景星空
function drawStars() {
  const c = $("stars");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  const g = c.getContext("2d");
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = Math.round((innerWidth * innerHeight) / 9000);
  for (let i = 0; i < n; i++) {
    const s = rand() < 0.9 ? 1 : 2;
    g.fillStyle = `rgba(255,255,255,${0.12 + rand() * 0.4})`;
    g.fillRect(Math.floor(rand() * c.width), Math.floor(rand() * c.height), s * dpr, s * dpr);
  }
}
drawStars();
let resizeT;
addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(drawStars, 200); });

renderTabs();
refreshAll();
loadStats();

// 網址帶有 #v=影片代碼 時，直接打開那一集（分享連結用）
function openFromHash() {
  const m = location.hash.match(/v=([\w-]{11})/);
  if (m && byId.has(m[1]) && (!player.open || current.id !== m[1])) openPlayer(byId.get(m[1]));
}
addEventListener("hashchange", openFromHash);
openFromHash();
