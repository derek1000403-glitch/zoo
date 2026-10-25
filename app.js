// 網站運作的程式。一般情況下不需要修改這個檔案，改 videos.js 就好。

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const videos = VIDEOS.map((v) => ({ ...v, id: youtubeId(v.youtube) })).filter((v) => v.id);
const categories = ["全部", ...new Set(videos.map((v) => v.category).filter(Boolean))];
let currentCategory = "全部";

document.title = SITE.name;
document.getElementById("site-name").textContent = SITE.name;
document.getElementById("site-tagline").textContent = SITE.tagline;
document.querySelector(".footer").textContent = `© ${new Date().getFullYear()} ${SITE.name}`;

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const chips = document.getElementById("categories");
const empty = document.getElementById("empty");
const player = document.getElementById("player");
const frame = document.getElementById("frame");

function renderChips() {
  chips.innerHTML = "";
  for (const c of categories) {
    const b = document.createElement("button");
    b.textContent = c;
    b.className = c === currentCategory ? "active" : "";
    b.onclick = () => { currentCategory = c; renderChips(); renderGrid(); };
    chips.appendChild(b);
  }
}

function renderGrid() {
  const q = search.value.trim().toLowerCase();
  const list = videos.filter((v) =>
    (currentCategory === "全部" || v.category === currentCategory) &&
    (!q || `${v.title} ${v.description || ""} ${v.category || ""}`.toLowerCase().includes(q))
  );
  grid.innerHTML = "";
  empty.hidden = list.length > 0;
  for (const v of list) {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb"><img loading="lazy" alt=""></div>
      <div class="card-body"><span class="cat"></span><h3></h3><p></p></div>`;
    card.querySelector("img").src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    card.querySelector(".cat").textContent = v.category || "";
    card.querySelector("h3").textContent = v.title;
    card.querySelector("p").textContent = v.description || "";
    card.onclick = () => openPlayer(v);
    grid.appendChild(card);
  }
}

function openPlayer(v) {
  frame.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
  document.getElementById("player-title").textContent = v.title;
  document.getElementById("player-desc").textContent = v.description || "";
  player.showModal();
}

function closePlayer() {
  frame.src = "";
  player.close();
}

document.getElementById("close").onclick = closePlayer;
player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
player.addEventListener("close", () => { frame.src = ""; });
search.addEventListener("input", renderGrid);

renderChips();
renderGrid();
