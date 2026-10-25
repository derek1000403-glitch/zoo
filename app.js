// 網站運作的程式。一般情況下不需要修改這個檔案，改 videos.js 就好。

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const videos = VIDEOS.map((v) => ({ ...v, category: v.category || "其他", id: youtubeId(v.youtube) })).filter((v) => v.id);

// 播放清單：依 videos.js 裡第一次出現的順序排列
const playlists = new Map();
for (const v of videos) {
  if (!playlists.has(v.category)) playlists.set(v.category, []);
  playlists.get(v.category).push(v);
}

let currentCategory = "全部";
let current = null; // 正在播放的影片

document.title = SITE.name;
document.getElementById("site-name").textContent = SITE.name;
document.getElementById("site-tagline").textContent = SITE.tagline;
document.querySelector(".footer").textContent = `© ${new Date().getFullYear()} ${SITE.name}`;

const main = document.getElementById("content");
const search = document.getElementById("search");
const chips = document.getElementById("categories");
const empty = document.getElementById("empty");
const player = document.getElementById("player");
const listEl = document.getElementById("playlist-items");
const autoNext = document.getElementById("auto-next");

function renderChips() {
  chips.innerHTML = "";
  for (const c of ["全部", ...playlists.keys()]) {
    const b = document.createElement("button");
    b.textContent = c === "全部" ? c : `${c}（${playlists.get(c).length}）`;
    b.className = c === currentCategory ? "active" : "";
    b.onclick = () => { currentCategory = c; renderChips(); render(); };
    chips.appendChild(b);
  }
}

function makeCard(v) {
  const card = document.createElement("button");
  card.className = "card";
  card.innerHTML = `
    <div class="thumb"><img loading="lazy" alt=""></div>
    <div class="card-body"><span class="cat"></span><h3></h3><p></p></div>`;
  card.querySelector("img").src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
  card.querySelector(".cat").textContent = v.category;
  card.querySelector("h3").textContent = v.title;
  card.querySelector("p").textContent = v.description || "";
  card.onclick = () => openPlayer(v);
  return card;
}

function makeSection(name, list) {
  const section = document.createElement("section");
  section.className = "playlist";
  section.innerHTML = `
    <div class="playlist-head">
      <h2></h2><span class="count"></span>
      <button class="play-all">▶ 從第一集播放</button>
    </div>
    <div class="grid"></div>`;
  section.querySelector("h2").textContent = name;
  section.querySelector(".count").textContent = `${list.length} 集`;
  section.querySelector(".play-all").onclick = () => openPlayer(list[0]);
  const grid = section.querySelector(".grid");
  for (const v of list) grid.appendChild(makeCard(v));
  return section;
}

function render() {
  const q = search.value.trim().toLowerCase();
  main.innerHTML = "";
  if (q) {
    // 搜尋時：所有符合的影片放在一起
    const list = videos.filter((v) =>
      (currentCategory === "全部" || v.category === currentCategory) &&
      `${v.title} ${v.description || ""} ${v.category}`.toLowerCase().includes(q));
    empty.hidden = list.length > 0;
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const v of list) grid.appendChild(makeCard(v));
    main.appendChild(grid);
    return;
  }
  empty.hidden = true;
  for (const [name, list] of playlists) {
    if (currentCategory === "全部" || currentCategory === name) main.appendChild(makeSection(name, list));
  }
}

// ---------- 播放器 ----------

let yt = null;
let ytReady = false;
window.onYouTubeIframeAPIReady = () => { ytReady = true; };

// 影片播完時，自動接著播放清單的下一集
function onStateChange(e) {
  if (e.data === YT.PlayerState.ENDED && autoNext.checked) step(1);
}

function load(v) {
  if (ytReady) {
    if (!yt) {
      yt = new YT.Player("yt", {
        videoId: v.id,
        host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, rel: 0 },
        events: { onStateChange },
      });
    } else {
      yt.loadVideoById(v.id);
    }
  } else {
    // YouTube 播放器程式還沒載入時，用一般的嵌入方式（無法自動接下一集）
    document.getElementById("yt").innerHTML =
      `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  }
}

function openPlayer(v) {
  current = v;
  const list = playlists.get(v.category);
  const i = list.indexOf(v);
  document.getElementById("player-title").textContent = v.title;
  document.getElementById("player-desc").textContent = v.description || "";
  document.getElementById("playlist-name").textContent = v.category;
  document.getElementById("playlist-pos").textContent = `${i + 1} / ${list.length}`;
  document.getElementById("prev").disabled = i === 0;
  document.getElementById("next").disabled = i === list.length - 1;

  listEl.innerHTML = "";
  list.forEach((item, n) => {
    const row = document.createElement("button");
    row.className = "pl-row" + (item === v ? " now" : "");
    row.innerHTML = `<span class="pl-num"></span><img alt=""><span class="pl-title"></span>`;
    row.querySelector(".pl-num").textContent = item === v ? "▶" : n + 1;
    row.querySelector("img").src = `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`;
    row.querySelector(".pl-title").textContent = item.title;
    row.onclick = () => openPlayer(item);
    listEl.appendChild(row);
  });

  if (!player.open) player.showModal();
  load(v);
  listEl.querySelector(".now").scrollIntoView({ block: "nearest" });
}

function step(d) {
  const list = playlists.get(current.category);
  const next = list[list.indexOf(current) + d];
  if (next) openPlayer(next);
}

function closePlayer() {
  if (player.open) player.close();
}

player.addEventListener("close", () => {
  if (yt && yt.stopVideo) yt.stopVideo();
  else document.getElementById("yt").innerHTML = "";
});
document.getElementById("close").onclick = closePlayer;
document.getElementById("prev").onclick = () => step(-1);
document.getElementById("next").onclick = () => step(1);
player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
search.addEventListener("input", render);

renderChips();
render();
