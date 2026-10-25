/*
  ============================================================
  這是「影片清單」—— 你平常只需要改這一個檔案！
  ============================================================

  新增一部影片：複製下面任何一段 { ... }, 貼在清單裡，然後改內容。

  每部影片有這些欄位：
    title    影片標題
    youtube  YouTube 影片網址（直接把網址整段貼上就可以）
    category 分類名稱（相同分類的影片會被歸在一起）
    description 簡短說明（可以不寫，留空 "" 就好）

  小提醒：
    - 每段 { ... } 後面要加一個逗號 ,
    - 文字要用英文的雙引號 " " 包起來
    - 想先上傳但不公開？在 YouTube 把影片設成「不公開」就可以放在這裡，
      只有來你網站的人看得到。
*/

const VIDEOS = [
  {
    title: "範例影片：認識這個網站",
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "入門",
    description: "這是一部範例影片，你可以把它換成自己的教學影片。",
  },
  {
    title: "範例影片：第二課",
    youtube: "https://youtu.be/jNQXAC9IVRw",
    category: "入門",
    description: "把網址換成你的影片網址就完成了。",
  },
  {
    title: "範例影片：進階技巧",
    youtube: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    category: "進階",
    description: "",
  },
];

/* 網站的名稱和標語，也可以在這裡改 */
const SITE = {
  name: "我的教學影片",
  tagline: "一步一步，輕鬆學會",
};
