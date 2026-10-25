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
const CHECK = `<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>`;
const COLORS = ["#ff5c8a", "#ffb84d", "#6bcbff", "#7bd389", "#b388ff", "#ff9a62"];

// ---------- 吉祥物（像素畫） ----------

function mascot(cls = "") {
  const px = (x, y, w = 1, h = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  return `<svg class="mascot ${cls}" viewBox="0 -1 18 12" shape-rendering="crispEdges" aria-hidden="true">
    <g class="m-legs-a" fill="#da7858">${px(3, 9, 1, 2)}${px(12, 9, 1, 2)}</g>
    <g class="m-legs-b" fill="#da7858">${px(5, 9, 1, 2)}${px(14, 9, 1, 2)}</g>
    <rect x="0" y="0" width="18" height="5" fill="#da7858"/>
    <rect x="2" y="5" width="14" height="4" fill="#da7858"/>
    <rect x="2" y="8" width="14" height="1" fill="#c4664c"/>
    <rect x="0" y="0" width="18" height="1" fill="#e98c6c"/>
    <g class="m-eyes" fill="#2a1206">${px(5, 2)}${px(4, 3)}${px(6, 3)}${px(12, 2)}${px(11, 3)}${px(13, 3)}</g>
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
  cta.onclick = () => openPlayer(v);

  $("sign-kicker").textContent = started ? (resume ? "繼續觀看" : "下一集") : "從這裡開始";
  $("sign-title").textContent = v.name;
  $("sign-sub").textContent = `${v.category} · 第 ${list.indexOf(v) + 1} / ${list.length} 集`;
  $("hero-sign").onclick = () => openPlayer(v);
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
  b.onclick = () => openPlayer(v);
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
  s.querySelector(".play-unit").onclick = () => openPlayer(list.find((v) => !isDone(v)) || list[0]);
  const grid = s.querySelector(".grid");
  list.forEach((v, i) => grid.appendChild(card(v, i)));
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
  if (yt && yt.stopVideo) yt.stopVideo();
  else $("yt").innerHTML = "";
  history.replaceState(null, "", location.pathname + location.search);
  refreshAll();
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

function confetti(x, y, n = 70) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement("i");
    const a = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 260;
    c.className = "confetti";
    c.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};` +
      `--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist + 160}px;--r:${Math.random() * 720}deg;` +
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

// 吉祥物：點一下會跳起來
$("brand-mascot").innerHTML = mascot();
$("walker").innerHTML = mascot("walking");
const heroMascot = $("hero-mascot");
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
$("hero-mascot").parentElement.querySelector(".pixels").innerHTML = Array.from({ length: 14 }, (_, i) =>
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
