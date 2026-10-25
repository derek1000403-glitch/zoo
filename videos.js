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
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第40集]熱容量與焓",
    "youtube": "https://www.youtube.com/watch?v=--Cjx4LUqdM"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第41集]等溫與絕熱過程",
    "youtube": "https://www.youtube.com/watch?v=lnnv5Jd9heA"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第42集]多方過程與大氣",
    "youtube": "https://www.youtube.com/watch?v=rdE1eSV2erc"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第43集]循環過程與卡諾循環",
    "youtube": "https://www.youtube.com/watch?v=__AyZayapD4"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第44集]熱力學第二定律",
    "youtube": "https://www.youtube.com/watch?v=snCLDCCR16Y"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第45集]熵",
    "youtube": "https://www.youtube.com/watch?v=nyoPdl4KIT4"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第46集]熵增加原理",
    "youtube": "https://www.youtube.com/watch?v=d-lmoLyplCk"
  },
  {
    "category": "熱學",
    "description": "",
    "title": "[第47集]相變與克拉珀龍方程",
    "youtube": "https://www.youtube.com/watch?v=7lyyCAkyjsA"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第48集]簡諧振動",
    "youtube": "https://www.youtube.com/watch?v=_C_YX0QyqIQ"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第49集]簡正模",
    "youtube": "https://www.youtube.com/watch?v=oOUeLaVio70"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第50集]阻尼振動",
    "youtube": "https://www.youtube.com/watch?v=hSizAa8SjMs"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第51集]受迫振動",
    "youtube": "https://www.youtube.com/watch?v=065pZ1LoRgE"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第52集]共振",
    "youtube": "https://www.youtube.com/watch?v=ErU0TLlvkKY"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第53集]振動的合成",
    "youtube": "https://www.youtube.com/watch?v=i2VY0l5Vu2U"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第54集]傅里葉分解",
    "youtube": "https://www.youtube.com/watch?v=zh2_QRllhc8"
  },
  {
    "category": "振盪",
    "description": "",
    "title": "[第55集]非線性振動與混沌",
    "youtube": "https://www.youtube.com/watch?v=p7zrfnQgpwI"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第1集]電荷與庫侖定律",
    "youtube": "https://www.youtube.com/watch?v=w6-ykEIydkU"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第2集]電場與電場線",
    "youtube": "https://www.youtube.com/watch?v=2zLJ5uISx2I"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第3集]連續分布電荷的電場",
    "youtube": "https://www.youtube.com/watch?v=hvzjUoZoTTQ"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第4集]電通量與高斯定理",
    "youtube": "https://www.youtube.com/watch?v=n7nMRUIWgvM"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第5集]高斯定理的應用",
    "youtube": "https://www.youtube.com/watch?v=V4HuOlHxpFk"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第6集]電勢與電勢差",
    "youtube": "https://www.youtube.com/watch?v=sLWNaiHlwV4"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第7集]等勢面與電勢梯度",
    "youtube": "https://www.youtube.com/watch?v=w2MdrKixZ6I"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第8集]靜電平衡與導體上的電荷",
    "youtube": "https://www.youtube.com/watch?v=JbAdPlBfTuw"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第9集]導體殼與靜電屏蔽",
    "youtube": "https://www.youtube.com/watch?v=W20iK5xSDQU"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第10集]靜電能",
    "youtube": "https://www.youtube.com/watch?v=_9Y0K4GPGTI"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第11集]電容與電容器",
    "youtube": "https://www.youtube.com/watch?v=W0ePMyjDA4E"
  },
  {
    "category": "第二期・靜電場",
    "description": "",
    "title": "[第二期第12集]唯一性定理與電像法",
    "youtube": "https://www.youtube.com/watch?v=-dyjY2VmWJc"
  },
  {
    "category": "第二期・恆定電流場",
    "description": "",
    "title": "[第二期第13集]恆定電流場",
    "youtube": "https://www.youtube.com/watch?v=6WDrM17W5tk"
  },
  {
    "category": "第二期・恆定電流場",
    "description": "",
    "title": "[第二期第14集]電流線的折射與電動勢",
    "youtube": "https://www.youtube.com/watch?v=nq6P_9Nx_S0"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第15集]磁的基本現象與安培定律",
    "youtube": "https://www.youtube.com/watch?v=NAeRckSkPkU"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第16集]B 與畢奧-薩伐爾定律",
    "youtube": "https://www.youtube.com/watch?v=QdscCeE81ZA"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第17集]圓線圈與螺線管",
    "youtube": "https://www.youtube.com/watch?v=u1Uo8e6zAzs"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第18集]安培環路定理",
    "youtube": "https://www.youtube.com/watch?v=hPlmeGP5gyE"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第19集]高斯定理與磁矢勢",
    "youtube": "https://www.youtube.com/watch?v=qiMlFtuTh50"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第20集]安培力與磁矩",
    "youtube": "https://www.youtube.com/watch?v=xS6PkTu95J8"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第21集]洛倫茲力・粒子運動",
    "youtube": "https://www.youtube.com/watch?v=Y7EFJFD1QVo"
  },
  {
    "category": "第二期・磁場",
    "description": "",
    "title": "[第二期第22集]回旋・霍爾・磁約束",
    "youtube": "https://www.youtube.com/watch?v=LBBNjfaqNbw"
  },
  {
    "category": "第二期・電磁感應",
    "description": "",
    "title": "[第二期第23集]法拉第定律・楞次定律",
    "youtube": "https://www.youtube.com/watch?v=ejl0c6GzSk8"
  },
  {
    "category": "第二期・電磁感應",
    "description": "",
    "title": "[第二期第24集]動生與感生電動勢",
    "youtube": "https://www.youtube.com/watch?v=I_PuogjPMdw"
  },
  {
    "category": "第二期・電磁感應",
    "description": "",
    "title": "[第二期第25集]磁矢勢與粒子動量",
    "youtube": "https://www.youtube.com/watch?v=Yx3Pju6WjtA"
  },
  {
    "category": "第二期・電磁感應",
    "description": "",
    "title": "[第二期第26集]電磁場的相對論變換",
    "youtube": "https://www.youtube.com/watch?v=ci7UvEoxMWw"
  },
  {
    "category": "第二期・電磁感應",
    "description": "",
    "title": "[第二期第27集]互感與自感",
    "youtube": "https://www.youtube.com/watch?v=h2fwYMRICuU"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第28集]電介質的極化",
    "youtube": "https://www.youtube.com/watch?v=srGt4-Xeu1c"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第29集]電位移與介電常量",
    "youtube": "https://www.youtube.com/watch?v=2K4d4dg7C_8"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第30集]磁介質：分子電流",
    "youtube": "https://www.youtube.com/watch?v=K3HBu5XVftk"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第31集]磁荷觀點與等效",
    "youtube": "https://www.youtube.com/watch?v=GG8hRnmZyHM"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第32集]鐵磁質與鐵電體",
    "youtube": "https://www.youtube.com/watch?v=yBAOkcHEgQM"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第33集]邊界條件與磁路",
    "youtube": "https://www.youtube.com/watch?v=RJ6i84IUjig"
  },
  {
    "category": "第二期・電磁介質",
    "description": "",
    "title": "[第二期第34集]電磁場的能量",
    "youtube": "https://www.youtube.com/watch?v=ZlSIJF_X2lw"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第35集]電源與電動勢",
    "youtube": "https://www.youtube.com/watch?v=POs1ueGFR-I"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第36集]導電機制",
    "youtube": "https://www.youtube.com/watch?v=jgJ38tO_neM"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第37集]基爾霍夫定律",
    "youtube": "https://www.youtube.com/watch?v=Qk0BHKOfSHM"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第38集]RC 與 LR 暫態",
    "youtube": "https://www.youtube.com/watch?v=RqE6eoSz-sQ"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第39集]LCR 暫態過程",
    "youtube": "https://www.youtube.com/watch?v=fsC_NGKRnBw"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第40集]交流電與交流元件",
    "youtube": "https://www.youtube.com/watch?v=vPjxzdB_aj8"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第41集]矢量圖與複數法",
    "youtube": "https://www.youtube.com/watch?v=vwwXJ4dl-6Y"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第42集]交流電的功率",
    "youtube": "https://www.youtube.com/watch?v=PLwuK2fwLEc"
  },
  {
    "category": "第二期・電路",
    "description": "",
    "title": "[第二期第43集]諧振電路",
    "youtube": "https://www.youtube.com/watch?v=_FJNXQxACY8"
  }
];

// 每個單元的介紹文字和代表色（可以不寫；新單元沒寫的話，網站會自動配色）
const UNITS = {
  "運動學": { desc: "位置、速度、加速度——學會用數學描述「動」這件事", color: "#ff9a62" },
  "力學與能量": { desc: "從牛頓定律到能量守恆，理解運動背後的原因", color: "#ff5c8a" },
  "分析力學": { desc: "開普勒、拉格朗日，換個更高的視角看力學", color: "#a78bfa" },
  "熱學": { desc: "溫度、氣體與熱力學定律，從微觀看懂巨觀", color: "#4cc9f0" },
};

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
