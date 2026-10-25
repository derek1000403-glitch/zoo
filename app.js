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

function card(v, i) {
  const b = document.createElement("button");
  const r = ratio(v);
  b.className = "card" + (isDone(v) ? " is-done" : "");
  b.style.animationDelay = `${Math.min(i, 12) * 40}ms`;
  b.innerHTML = `
    <div class="thumb">
      <img loading="lazy" alt="" src="${thumb(v)}">
      <span class="ep">${esc(epLabel(v))}</span>
      ${isDone(v) ? `<span class="done-badge">${CHECK}看完了</span>` : ""}
      <span class="play-btn"><span class="play-ico"></span></span>
      ${r > 0 && r < 1 ? `<div class="bar"><i style="width:${r * 100}%"></i></div>` : ""}
    </div>
    <div class="card-body">
      <h3>${esc(v.name)}</h3>
      <p>${esc(v.description || `${v.category} · 第 ${playlists.get(v.category).indexOf(v) + 1} 集`)}</p>
    </div>`;
  b.onclick = () => launch(v, b.querySelector(".thumb"));
  return b;
}

function unitSection(name, list, n) {
  const s = document.createElement("section");
  const done = doneCount(list);
  s.className = "unit";
  s.innerHTML = `
    <div class="unit-head">
      <div class="unit-no"><span><small>UNIT</small><br>${pad(n)}</span></div>
      <h2>${esc(name)}</h2>
      <button class="btn btn-ghost btn-sm play-unit"><span class="play-ico"></span>${done === list.length ? "重看這個單元" : done ? "繼續這個單元" : "播放這個單元"}</button>
      <div class="unit-meta">
        <span>${list.length} 集</span>
        <div class="bar"><i style="width:${(done / list.length) * 100}%"></i></div>
        <span>${done === list.length ? "全部完成 🎉" : `已完成 ${done}/${list.length}`}</span>
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
  let n = 0;
  for (const [name, list] of playlists) {
    n++;
    if (currentCategory === "全部" || currentCategory === name) content.appendChild(unitSection(name, list, n));
  }
}

function refreshAll() {
  renderHero();
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
window.onYouTubeIframeAPIReady = () => { ytReady = true; };

// 影片播完時：記為看完，並自動接著播放清單的下一集
function onStateChange(e) {
  buddyOnState(e.data);
  if (e.data !== YT.PlayerState.ENDED || !current) return;
  markDone(current);
  const list = playlists.get(current.category);
  if (current === list[list.length - 1]) celebrate(current.category);
  else if (autoNext.checked) step(1);
}

function load(v) {
  const start = resumeAt(v);
  if (ytReady) {
    if (!yt) {
      yt = new YT.Player("yt", {
        videoId: v.id,
        host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, start },
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
  $("prev").disabled = i === 0;
  $("next").disabled = i === list.length - 1;
  renderList();
  history.replaceState(null, "", `#v=${v.id}`);
  if (!player.open) {
    player.showModal();
    clearInterval(timer);
    timer = setInterval(track, 3000);
    buddyEnter();
  } else {
    buddyNewEpisode();
  }
  load(v);
  listEl.querySelector(".now").scrollIntoView({ block: "nearest" });
}

function step(d) {
  const list = playlists.get(current.category);
  const next = list[list.indexOf(current) + d];
  if (next) openPlayer(next);
}

player.addEventListener("close", () => {
  track();
  clearInterval(timer);
  buddyLeave();
  if (yt && yt.stopVideo) yt.stopVideo();
  else $("yt").innerHTML = "";
  history.replaceState(null, "", location.pathname + location.search);
  refreshAll();
  comeBack();
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
const buddy = { x: 0, facing: -1, busy: false, sleeping: false, timer: null, napTimer: null };

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
    { transform: `translateY(-11px) rotate(${lean}deg)`, offset: 0.18 },
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

async function act() {
  if (!player.open) return;
  if (buddy.busy || buddy.sleeping) return schedule();
  buddy.busy = true;
  const r = Math.random();
  try {
    if (r < 0.3) await walkTo(Math.random() * maxX());
    else if (r < 0.42) await hop();
    else if (r < 0.52) await wave();
    else if (r < 0.64) await lookAround();
    else if (r < 0.73) await chasePixel();
    else if (r < 0.8) await trip();
    else if (r < 0.9) await sit(5000 + Math.random() * 5000);
    else await say(pick(LINES));
  } finally {
    buddy.busy = false;
    schedule();
  }
}

function schedule(ms = 9000 + Math.random() * 12000) {
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
  if (s === YT.PlayerState.PLAYING && buddy.sleeping) {
    nap(false);
    hop();
    say("我醒了！", 1500);
  } else if (s === YT.PlayerState.PAUSED) {
    buddy.napTimer = setTimeout(() => nap(true), 25000);
  } else if (s === YT.PlayerState.ENDED) {
    nap(false);
    cheer();
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
  if (player.open) say("一起看吧！", 2000);
  schedule(8000);
}

function buddyNewEpisode() {
  if (buddy.sleeping) nap(false);
  if (!buddy.busy && !reduceMotion) hop();
}

function buddyLeave() {
  clearTimeout(buddy.timer);
  clearTimeout(buddy.napTimer);
  nap(false);
  buddyEl.classList.remove("show", "talking");
  lane.querySelectorAll(".lane-pixel").forEach((p) => p.remove());
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

// ---------- 提示訊息與慶祝 ----------

// 播放器打開時，提示要放進播放器裡才不會被蓋住
const layer = () => (player.open ? player : document.body);

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

// 網址帶有 #v=影片代碼 時，直接打開那一集（分享連結用）
function openFromHash() {
  const m = location.hash.match(/v=([\w-]{11})/);
  if (m && byId.has(m[1]) && (!player.open || current.id !== m[1])) openPlayer(byId.get(m[1]));
}
addEventListener("hashchange", openFromHash);
openFromHash();
