/* 物奧教學影片：依集數排列。新增影片時保留 title、youtube、category、description 欄位。 */
const VIDEOS = [
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第1集]一瞬間有多快？",
    "youtube": "https://www.youtube.com/watch?v=sd_1iysmx9o"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第2集]面積就是路程",
    "youtube": "https://www.youtube.com/watch?v=gtFwCEMBQQQ"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第3集]加速度登場",
    "youtube": "https://www.youtube.com/watch?v=qQcGRTJulaM"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第4集]小量分析工具箱",
    "youtube": "https://www.youtube.com/watch?v=DivDjmuYg1w"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第5集]會自己變化的量",
    "youtube": "https://www.youtube.com/watch?v=g-ON9gUIbGc"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第6集]速度長出箭頭",
    "youtube": "https://www.youtube.com/watch?v=dfHaA5Z1DiE"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第7集]拋體運動",
    "youtube": "https://www.youtube.com/watch?v=1sGi36xr_0g"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第8集]等速圓周運動",
    "youtube": "https://www.youtube.com/watch?v=YKzVMelofWM"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第9集]切向與法向加速度",
    "youtube": "https://www.youtube.com/watch?v=OuLSHa5PUi0"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第10集]相對運動",
    "youtube": "https://www.youtube.com/watch?v=JFNjUm_rhrw"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第11集]慣性",
    "youtube": "https://www.youtube.com/watch?v=c30yF77PmK0"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第12集]動量、力與衝量",
    "youtube": "https://www.youtube.com/watch?v=6sHK7f-YoN8"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第13集]牛頓三定律與常見的力",
    "youtube": "https://www.youtube.com/watch?v=8P_FvGfzX2Q"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第14集]非慣性系與慣性力",
    "youtube": "https://www.youtube.com/watch?v=vToczKJ-bus"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第15集]科里奧利力",
    "youtube": "https://www.youtube.com/watch?v=qCIzsHhkF8M"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第16集]功與動能",
    "youtube": "https://www.youtube.com/watch?v=jca9reOsTg8"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第17集]保守力與位能",
    "youtube": "https://www.youtube.com/watch?v=ffEuadQEDd8"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第18集]機械能守恆",
    "youtube": "https://www.youtube.com/watch?v=DXgTAqO-Rjs"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第19集]一維位能曲線",
    "youtube": "https://www.youtube.com/watch?v=TnC7sGEJtp0"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第20集]質心與兩體碰撞",
    "youtube": "https://www.youtube.com/watch?v=5MeXNNqhrmI"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第21集]單位制與量綱分析",
    "youtube": "https://www.youtube.com/watch?v=w1fR2NGgFwA"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第27集]開普勒運動",
    "youtube": "https://www.youtube.com/watch?v=y1wFqPuxCbI"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第28集]廣義座標與約束",
    "youtube": "https://www.youtube.com/watch?v=Pnkp8hnW44M"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第29集]最小作用量原理",
    "youtube": "https://www.youtube.com/watch?v=TuME5vxv-d8"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第30集]拉格朗日方程",
    "youtube": "https://www.youtube.com/watch?v=JNYFAGMkrC8"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第31集]用拉格朗日解題",
    "youtube": "https://www.youtube.com/watch?v=d7hu5Go5nmQ"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第32集]循環座標與守恆量",
    "youtube": "https://www.youtube.com/watch?v=nRkrMpBgovc"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第33集]溫度與熱平衡",
    "youtube": "https://www.youtube.com/watch?v=ePE5hDa7enY"
  },
  {
    "category": "物奧教學",
    "description": "",
    "title": "[第34集]理想氣體狀態方程",
    "youtube": "https://www.youtube.com/watch?v=9hx8lZqC_ZA"
  }
];

const SITE = {
  name: "大川物奧教學",
  tagline: "依集數學習物理奧林匹亞"
};
