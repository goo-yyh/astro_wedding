export interface NavItem {
  label: string;
  href: string;
}

export interface AppPlatform {
  name: string;
  badge: string;
  qrSrc: string;
  description: string;
  downloadLabel: string;
}

export interface ServiceCategory {
  title: string;
  description: string;
  countLabel: string;
  href: string;
  icon: "host" | "decor" | "hotel" | "dress" | "makeup" | "photo";
}

export interface ValueProp {
  index: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const siteMeta = {
  name: "婚礼救星",
  title: "婚礼救星 | 帮新人把备婚安排清楚",
  description:
    "婚礼救星聚合本地婚礼服务、宜婚日历和 App 下载入口，帮助新人更高效地完成备婚。",
  eyebrow: "WEDDING OPS PLATFORM",
  heroTitle: "婚礼救星，把备婚安排清楚",
  heroDescription:
    "从良辰吉日到婚礼服务，把备婚最关键的决定先整理成清晰的一页。",
  footerBlurb: "把备婚安排得更清楚。",
};

export const navigation: NavItem[] = [];

// 上线前请替换为真实联系方式。
export const contact = {
  email: "lyy_lvyouyou@163.com",
  wechat: "HunLiJiuXing",
  location: "杭州",
};

export const appPlatforms: AppPlatform[] = [
  {
    name: "iOS App",
    badge: "IOS",
    qrSrc: "/qr/ios.svg",
    description: "iOS 版正在准备中，下载入口敬请期待。",
    downloadLabel: "iOS 版敬请期待",
  },
  {
    name: "Android App",
    badge: "ANDROID",
    qrSrc: "/qr/android.svg",
    description: "Android 版正在准备中，下载入口敬请期待。",
    downloadLabel: "Android 版敬请期待",
  },
];

export const heroMetrics = [
  {
    value: "6 大品类",
    label: "司仪、场布、酒店、婚纱、化妆、摄影一页看懂",
  },
  {
    value: "2 端 App",
    label: "下载入口正在准备中，移动端敬请期待",
  },
  {
    value: "动态黄历",
    label: "按当前月份生成宜婚日期和农历说明",
  },
];

export const serviceCategories: ServiceCategory[] = [
  {
    title: "司仪主持",
    description: "控场、流程、节奏和气氛一次比清楚。",
    countLabel: "关键环节",
    href: "#download",
    icon: "host",
  },
  {
    title: "婚礼场布",
    description: "宴会厅、户外仪式区和主题布景集中筛选。",
    countLabel: "风格方向",
    href: "#download",
    icon: "decor",
  },
  {
    title: "酒店宴会",
    description: "看容量、档期和套餐，快速判断是否合适。",
    countLabel: "场地维度",
    href: "#download",
    icon: "hotel",
  },
  {
    title: "婚纱礼服",
    description: "主纱、轻婚纱、敬酒服一站对比。",
    countLabel: "选款参考",
    href: "#download",
    icon: "dress",
  },
  {
    title: "新娘化妆",
    description: "试妆风格、跟妆档期和妆面案例集中查看。",
    countLabel: "妆面风格",
    href: "#download",
    icon: "makeup",
  },
  {
    title: "摄影摄像",
    description: "纪实、电影感、双机位和快剪统一筛选。",
    countLabel: "影像方案",
    href: "#download",
    icon: "photo",
  },
];

export const valueProps: ValueProp[] = [
  {
    index: "01",
    title: "备婚信息一页看懂",
    description:
      "把新人最关心的服务类别、时间规划和下载入口整理到一个主站里，减少跳转成本。",
  },
  {
    index: "02",
    title: "当月日期清晰可查",
    description:
      "首页直出当前月份适合办婚礼的日期、周末标签和热门提醒，先看日期再定档期。",
  },
  {
    index: "03",
    title: "移动端敬请期待",
    description:
      "首页保留双平台下载入口的预告态，等 App 上线后可以自然承接移动端浏览。",
  },
];

export const tickerItems = [
  "司仪",
  "酒店",
  "婚纱",
  "化妆",
  "摄影",
  "跟拍",
  "场布",
  "婚车",
  "主持词",
  "仪式流程",
  "热门档期",
  "良辰吉日",
];

export const faqItems: FaqItem[] = [
  {
    question: "婚礼救星主要提供哪些服务？",
    answer:
      "主站主要负责介绍备婚关键服务类别、展示宜婚日期，以及引导用户通过 App 继续查看更完整的信息。",
  },
  {
    question: "宜婚日期多久更新一次？",
    answer:
      "当前页面在构建阶段按当月生成日期信息。正式上线后建议接入可信黄历源并按日或按周更新。",
  },
  {
    question: "首页会直接展示真实商家吗？",
    answer:
      "当前版本不会在首页直接展示真实商家卡片，首页重点是介绍品类、日期和 App 下载入口，避免信息过载。",
  },
  {
    question: "如果想合作入驻，如何联系？",
    answer:
      "可以通过页面底部的邮箱或微信联系，后续也可以补充合作表单或商家入驻页。",
  },
];
