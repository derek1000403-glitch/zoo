/*
  物奧教學影片：依集數排列。
  新增影片時保留 title、youtube、category、description 欄位。
  category 就是「播放清單」名稱：同一個名稱的影片會排在同一個播放清單裡，
  播放時會依照這裡的順序自動接著播下一集。
*/
const VIDEOS = [
  {
    "category": "運動學",
    "description": "",
    "title": "[第1集]一瞬間有多快？",
    "youtube": "https://www.youtube.com/watch?v=sd_1iysmx9o"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第2集]面積就是路程",
    "youtube": "https://www.youtube.com/watch?v=gtFwCEMBQQQ"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第3集]加速度登場",
    "youtube": "https://www.youtube.com/watch?v=qQcGRTJulaM"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第4集]小量分析工具箱",
    "youtube": "https://www.youtube.com/watch?v=DivDjmuYg1w"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第5集]會自己變化的量",
    "youtube": "https://www.youtube.com/watch?v=g-ON9gUIbGc"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第6集]速度長出箭頭",
    "youtube": "https://www.youtube.com/watch?v=dfHaA5Z1DiE"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第7集]拋體運動",
    "youtube": "https://www.youtube.com/watch?v=1sGi36xr_0g"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第8集]等速圓周運動",
    "youtube": "https://www.youtube.com/watch?v=YKzVMelofWM"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第9集]切向與法向加速度",
    "youtube": "https://www.youtube.com/watch?v=OuLSHa5PUi0"
  },
  {
    "category": "運動學",
    "description": "",
    "title": "[第10集]相對運動",
    "youtube": "https://www.youtube.com/watch?v=JFNjUm_rhrw"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第11集]慣性",
    "youtube": "https://www.youtube.com/watch?v=c30yF77PmK0"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第12集]動量、力與衝量",
    "youtube": "https://www.youtube.com/watch?v=6sHK7f-YoN8"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第13集]牛頓三定律與常見的力",
    "youtube": "https://www.youtube.com/watch?v=8P_FvGfzX2Q"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第14集]非慣性系與慣性力",
    "youtube": "https://www.youtube.com/watch?v=vToczKJ-bus"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第15集]科里奧利力",
    "youtube": "https://www.youtube.com/watch?v=qCIzsHhkF8M"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第16集]功與動能",
    "youtube": "https://www.youtube.com/watch?v=jca9reOsTg8"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第17集]保守力與位能",
    "youtube": "https://www.youtube.com/watch?v=ffEuadQEDd8"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第18集]機械能守恆",
    "youtube": "https://www.youtube.com/watch?v=DXgTAqO-Rjs"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第19集]一維位能曲線",
    "youtube": "https://www.youtube.com/watch?v=TnC7sGEJtp0"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第20集]質心與兩體碰撞",
    "youtube": "https://www.youtube.com/watch?v=5MeXNNqhrmI"
  },
  {
    "category": "力學與能量",
    "description": "",
    "title": "[第21集]單位制與量綱分析",
    "youtube": "https://www.youtube.com/watch?v=w1fR2NGgFwA"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第22集]極座標",
    "youtube": "https://www.youtube.com/watch?v=SyhgAjYErVA"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第23集]極座標的加速度",
    "youtube": "https://www.youtube.com/watch?v=e5QvU-tCZVU"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第24集]角動量",
    "youtube": "https://www.youtube.com/watch?v=Ss1x0_XkvYU"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第25集]離心勢能",
    "youtube": "https://www.youtube.com/watch?v=PmMa0Yius3M"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第26集]開普勒定律",
    "youtube": "https://www.youtube.com/watch?v=jjPygjvOiRs"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第27集]開普勒運動",
    "youtube": "https://www.youtube.com/watch?v=y1wFqPuxCbI"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第28集]廣義座標與約束",
    "youtube": "https://www.youtube.com/watch?v=Pnkp8hnW44M"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第29集]最小作用量原理",
    "youtube": "https://www.youtube.com/watch?v=TuME5vxv-d8"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第30集]拉格朗日方程",
    "youtube": "https://www.youtube.com/watch?v=JNYFAGMkrC8"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第31集]用拉格朗日解題",
    "youtube": "https://www.youtube.com/watch?v=d7hu5Go5nmQ"
  },
  {
    "category": "分析力學",
    "description": "",
    "title": "[第32集]循環座標與守恆量",
    "youtube": "https://www.youtube.com/watch?v=nRkrMpBgovc"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第33集]溫度與熱平衡",
    "youtube": "https://www.youtube.com/watch?v=ePE5hDa7enY"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第34集]理想氣體狀態方程",
    "youtube": "https://www.youtube.com/watch?v=9hx8lZqC_ZA"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第35集]壓強與溫度的微觀意義",
    "youtube": "https://www.youtube.com/watch?v=JsH704FS9u0"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第36集]麥克斯韋速度分布",
    "youtube": "https://www.youtube.com/watch?v=a6CCB5xN6yw"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第37集]玻耳茲曼分布",
    "youtube": "https://www.youtube.com/watch?v=49VgRLPm03E"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第38集]能均分定理與熱容量",
    "youtube": "https://www.youtube.com/watch?v=cYoNg8UHkys"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第39集]熱力學第一定律",
    "youtube": "https://www.youtube.com/watch?v=zBZatqgAN-U"
  }
];

const SITE = {
  name: "新時代物理學習平台",
  tagline: "大川的物理學習頻道",

  // YouTube 頻道（網站裡的「訂閱」會訂閱這個頻道）
  channelId: "UCVaLSPHwMhdmlF4t5GYh07w",
  channelUrl: "https://www.youtube.com/@張大川-o3k",

  // Google 登入用的「用戶端 ID」：照著 GOOGLE-SETUP.md 申請好之後，貼在下面的引號裡。
  // 還沒貼之前，按讚／訂閱按鈕會改成開新分頁到 YouTube。
  googleClientId: "",

  // 聯絡信箱（會顯示在隱私權政策頁面，Google 審核需要）
  contact: "",
};
