# 婚礼救星主站设计方案

更新时间：2026-03-17

## 1. 项目目标

`婚礼救星` 是一个面向备婚新人的静态主站，核心职责不是承载复杂交易，而是用清晰、可信、效率导向的方式完成 4 件事：

1. 让用户快速理解站点价值：帮新人高效完成备婚决策。
2. 展示婚礼服务供给：司仪、场布、酒店、婚纱、化妆等本地服务商。
3. 提供准确的宜婚日历入口：用户可以快速查看适合结婚的日期。
4. 推动 App 下载：在 Header 明确展示 iOS / Android 两个二维码。

站点定位参考 `motherduck.com` 的信息密度、强边框卡片、标签式标题、米白背景和高对比强调色，但内容语气从技术产品转为“婚礼筹备工具平台”。

## 2. 参考网站抽象

参考来源：<https://motherduck.com/>

建议借鉴的不是具体图形，而是以下视觉规律：

1. 大标题直接、短句、强结论。
2. 米白主背景 + 深色文字 + 高饱和强调色。
3. 2px 深色描边、纸卡片感、偏平面但有偏移阴影。
4. 章节之间有明显节奏切换，避免单调的纯白落地页。
5. 标签、编号、说明文案带一点“工具感”和“仪表盘感”。

不建议照搬的部分：

1. Duck 吉祥物和技术品牌隐喻。
2. 过多 B2B SaaS 式的英文术语。
3. 过多炫技动画。

## 3. 技术基线

### 3.1 依赖策略

当前方案只引入当前页面真正需要的依赖，保持最小化：

- `astro@6.0.5`
- `tailwindcss@4.2.1`
- `@tailwindcss/vite@4.2.1`

可选但当前不强依赖：

- `@astrojs/vercel@10.0.1`

说明：

1. 这是一个纯静态主站，部署到 Vercel 时不需要为了“静态页面”额外引入 `@astrojs/vercel`。
2. 只有未来要接入 Vercel 的 SSR、Server Actions、Image Optimization 等能力时，再添加 `@astrojs/vercel`。
3. `Tailwind CSS + Astro` 当前官方推荐集成方式是 `@tailwindcss/vite`，不是旧的 `@astrojs/tailwind`。

### 3.2 当前版本确认

2026-03-17 已核对：

- `astro`: `6.0.5`
- `tailwindcss`: `4.2.1`
- `@tailwindcss/vite`: `4.2.1`
- `@astrojs/vercel`: `10.0.1`
- `vercel` CLI: `50.32.5`

### 3.3 Node 版本

Astro 6 当前要求：

- `node ^20.19.1 || >=22.12.0`

建议本项目统一使用：

- `Node.js 22 LTS`

## 4. 信息架构

主站建议为单页结构，导航锚点跳转：

1. `Hero / 首页首屏`
2. `婚礼服务分类`
3. `平台价值说明`
4. `宜婚日历`
5. `合作商家展示`
6. `App 下载区`
7. `FAQ`
8. `Footer / 联系方式`

Header 锚点建议：

- 服务
- 良辰吉日
- 合作商家
- 下载 App
- 联系我们

## 5. 用户路径

### 5.1 首次访问用户

1. 进入首页看到一句话价值主张。
2. 看到 App 下载二维码，明确知道平台有移动端。
3. 下滑查看服务分类和精选商家。
4. 查看宜婚日期卡片。
5. 留资或直接下载 App。

### 5.2 有明确日期需求的用户

1. 从 Hero CTA 直接进入 `宜婚日历` 区块。
2. 查看近期推荐日期和筛选说明。
3. 再跳转到相关服务商列表。

### 5.3 有明确采购需求的用户

1. 从 Hero CTA 进入 `婚礼服务分类`。
2. 浏览司仪 / 场布 / 酒店 / 婚纱 / 化妆等卡片。
3. 进一步查看精选商家和下载 App。

## 6. 页面结构设计

### 6.1 Header

目标：在最上层就完成品牌识别、导航和 App 下载入口。

布局：

- 左侧：Logo + 品牌名 `婚礼救星`
- 中间：锚点导航
- 右侧：两个二维码卡片

桌面端表现：

- 直接展示两个紧凑二维码模块
- 标签分别为 `iOS App` 和 `Android App`
- 二维码卡片上方加一行单行说明：`扫码下载备婚助手`

移动端表现：

- Header 保留品牌与菜单按钮
- 二维码不挤在顶部，改成点击 `下载 App` 后展开抽屉
- 抽屉内展示两个二维码和文案

视觉建议：

- Header 固定顶部
- 背景色 `var(--bg-page)`
- 滚动后出现 2px 下边框
- 导航 hover 用底边线 + 强调色

### 6.2 Hero 首屏

首屏目标：3 秒内说明“这是一个帮助新人高效备婚的平台”。

建议文案：

- Eyebrow：`WEDDING OPS PLATFORM`
- 主标题：`婚礼救星，让备婚不再手忙脚乱`
- 副标题：`找司仪、找酒店、找婚纱、看良辰吉日，把婚礼筹备需要的关键决策放进一个地方。`

CTA：

- 主按钮：`查看良辰吉日`
- 次按钮：`查找婚礼服务`

右侧视觉区建议做成“堆叠卡片”而不是传统大插画：

1. 一张本月宜婚日期卡。
2. 一张精选酒店卡。
3. 一张婚纱档期卡。
4. 角落贴纸元素：`已收录本地婚礼服务`

这样更贴合 MotherDuck 的“产品卡片 + 信息拼贴”风格，也更契合婚礼业务。

### 6.3 婚礼服务分类

建议用 6 张大卡片组成不规则网格：

1. 司仪主持
2. 婚礼场布
3. 酒店宴会
4. 婚纱礼服
5. 新娘化妆
6. 摄影摄像

每张卡片包含：

- 分类名
- 一句话说明
- 服务数量或示例
- 小型图标
- 跳转按钮

示例说明文案：

- `司仪主持`: 控场、流程、气氛一站筛选
- `婚礼场布`: 宴会厅、户外仪式区、主题搭建
- `酒店宴会`: 看场地容量、档期、配套餐标
- `婚纱礼服`: 轻婚纱、主纱、敬酒服集中查看
- `新娘化妆`: 妆面风格、试妆档期、跟妆服务
- `摄影摄像`: 双机位、快剪、纪实风格统一筛选

### 6.4 平台价值说明

这一区块承担“为什么要用婚礼救星”的解释工作，建议用 3 列卡片：

1. `本地婚礼服务聚合`
2. `宜婚日期清晰可查`
3. `移动端随时对比选择`

每列卡片内包含：

- 编号 `01 / 02 / 03`
- 标题
- 一段 40-60 字说明

可选增加一条横向跑马灯：

- `司仪 / 酒店 / 婚纱 / 化妆 / 摄影 / 跟拍 / 场布 / 婚车 / 四大金刚`

这样能把首页节奏从“静态内容”拉成更鲜活的品牌首页。

### 6.5 宜婚日历

这是全站核心功能区。

建议采用“双层结构”：

1. 上层：说明区
2. 下层：月历卡片 + 推荐日期列表

说明区内容：

- 标题：`近期宜婚日期，一眼看清`
- 文案：`展示近期适合举办婚礼的日期，并附带周末、节假日、档期紧张提醒。`
- 说明标签：
  - `宜`
  - `周末优先`
  - `热门档期`

月历表现建议：

- 默认展示当前月 + 下个月
- “宜”日期高亮为黄色底
- “热门”日期右上角加蓝色圆点
- 节假日使用浅青底
- 当天用深色描边强调

推荐列表建议字段：

- 公历日期
- 星期
- 农历
- 标签
- 推荐原因

示例：

| 日期 | 星期 | 农历 | 标签 | 推荐原因 |
| --- | --- | --- | --- | --- |
| 2026-05-16 | 周六 | 四月初一 | 宜 / 周末 | 仪式和宴会排期友好 |
| 2026-05-24 | 周日 | 四月初九 | 宜 / 热门 | 周末日期，建议提早锁档 |
| 2026-06-06 | 周六 | 四月廿二 | 宜 / 节点 | 便于亲友安排出行 |

### 准确性约束

“宜婚日期”如果要保证准确，不建议在前端临时写死计算逻辑。

静态站点第一版建议：

1. 由可信数据源预生成 `JSON`。
2. Astro 在构建时读取该数据。
3. 首页只展示最近 60-90 天的高价值日期。

推荐数据结构：

```ts
export interface AuspiciousDate {
  date: string; // 2026-05-16
  weekday: string; // 周六
  lunar: string; // 四月初一
  isAuspicious: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isPopular: boolean;
  note: string; // 仪式和宴会排期友好
}
```

### 6.6 合作商家展示

建议用精选卡片展示，不要上来就做复杂的列表页。

首页只展示 6-8 个精选商家卡片，每张卡片包含：

- 品牌名
- 类别
- 城市 / 区域
- 主打风格
- 预算区间
- 标签

示例类别：

- `司仪`
- `酒店`
- `婚纱`
- `化妆`
- `场布`
- `摄影`

卡片形式建议：

- 上半部分是图片区
- 下半部分是信息区
- 右上角有类别标签
- 底部有 `查看详情` 或 `去 App 里看更多`

### 6.7 App 下载区

虽然 Header 已经透出二维码，但页面中部仍建议做一个下载强化区。

结构：

- 左：说明文案
- 右：两个大二维码卡

建议文案：

- 标题：`把备婚安排装进手机`
- 说明：`在 App 里随时查看婚礼服务、收藏商家、关注宜婚日期和热门档期。`

二维码卡片内容：

- 平台名
- 二维码图片
- 下载说明

### 6.8 FAQ

建议放 4 条：

1. `婚礼救星主要提供哪些服务？`
2. `宜婚日期多久更新一次？`
3. `我可以只看本地商家吗？`
4. `如果想合作入驻，如何联系？`

FAQ 用手风琴组件即可，避免首页过长。

### 6.9 Footer

必须包含个人信息透出。

建议字段：

- 品牌名：`婚礼救星`
- 一句话：`帮新人把备婚这件事，安排得更清楚。`
- 邮箱：`hello@example.com`
- 微信：`your_wechat_id`
- 小红书 / 抖音 / 微信公众号：可选
- 所在城市：可选
- 版权信息

Footer 建议做成深底浅字，与主体形成段落收口。

## 7. 视觉系统

### 7.1 色彩 Tokens

以下 tokens 基于 MotherDuck 的综合色感做婚礼化调整：

```css
:root {
  --bg-page: #f4efea;
  --bg-panel: #f8f8f7;
  --bg-soft: #fffdf9;
  --ink-strong: #383838;
  --ink-soft: #6b6661;
  --line-strong: #383838;

  --brand-primary: #ffde00;
  --brand-secondary: #53dbc9;
  --brand-accent: #6fc2ff;
  --brand-warm: #e7d4bf;

  --state-success: #53dbc9;
  --state-highlight: #ffde00;
  --state-info: #6fc2ff;

  --shadow-card: 8px 8px 0 0 #383838;
  --shadow-card-sm: 4px 4px 0 0 #383838;
}
```

配色逻辑：

1. `#F4EFEA` 做大面积背景，保留 MotherDuck 的纸张感。
2. `#383838` 做主文字和描边，保证可读性。
3. `#FFDE00` 用于关键 CTA 和宜婚高亮。
4. `#53DBC9` 用于模块强调和辅助标签。
5. `#6FC2FF` 用于信息提示、热门档期点缀。

### 7.2 字体系统

建议字体组合：

- Display：`Space Grotesk`
- Body：`Noto Sans SC`
- Mono / Label：`IBM Plex Mono`

原因：

1. `Space Grotesk` 有 MotherDuck 那种现代、粗粝、工具感。
2. `Noto Sans SC` 中文可读性稳定。
3. `IBM Plex Mono` 适合章节标签、日期标签、编号。

字号建议：

- Hero 标题：`clamp(3rem, 6vw, 6rem)`
- H2：`clamp(2rem, 3vw, 3.5rem)`
- H3：`1.25rem - 1.5rem`
- 正文：`1rem`
- 辅助说明：`0.875rem`
- Eyebrow / Label：`0.75rem`

### 7.3 圆角、描边、阴影

建议规则：

- 大卡片圆角：`24px`
- 小卡片圆角：`16px`
- 按钮圆角：`999px`
- 主描边：`2px solid var(--line-strong)`
- 阴影：偏移式硬阴影，不使用柔和模糊投影

这是整站最重要的“MotherDuck 感”来源之一。

### 7.4 组件状态

按钮状态：

- Default：黄底深字
- Hover：向上轻微位移 + 阴影缩短
- Active：阴影归零
- Secondary：透明底 + 深色描边

卡片状态：

- Hover：`translate(-2px, -2px)`
- Border 强调
- 图片略微放大

## 8. 布局规范

页面容器：

- 最大宽度：`1280px`
- 内容宽度：`min(1280px, calc(100% - 32px))`

Section 间距：

- 桌面端：`96px - 140px`
- 移动端：`64px - 88px`

栅格建议：

- Desktop：12 列
- Tablet：6 列
- Mobile：1 列

Hero 布局：

- 左 6 列：标题、说明、CTA
- 右 6 列：信息拼贴卡片

服务分类：

- Desktop：`3 x 2`
- Mobile：`1 x 6`

精选商家：

- Desktop：`4 x 2` 或 `3 x 2`
- Mobile：横向滑动卡片

## 9. 内容语气

建议语气：清晰、利落、可信、少废话。

避免：

- 过于甜腻的婚礼营销语言
- 夸张承诺
- 太长的段落

推荐文案风格：

- `先看日期，再定档期。`
- `本地婚礼服务，集中对比。`
- `从司仪到婚纱，把备婚安排清楚。`

## 10. 推荐目录结构

```text
/
├─ public/
│  ├─ qr/
│  │  ├─ ios.png
│  │  └─ android.png
│  └─ images/
│     ├─ hero-calendar-card.webp
│     ├─ vendor-hotel-01.webp
│     └─ vendor-dress-01.webp
├─ src/
│  ├─ components/
│  │  ├─ AppQrPanel.astro
│  │  ├─ Header.astro
│  │  ├─ HeroSection.astro
│  │  ├─ ServiceCategoryGrid.astro
│  │  ├─ ValueProps.astro
│  │  ├─ LuckyDateCalendar.astro
│  │  ├─ FeaturedVendors.astro
│  │  ├─ DownloadSection.astro
│  │  ├─ FaqSection.astro
│  │  └─ Footer.astro
│  ├─ data/
│  │  ├─ vendors.ts
│  │  └─ auspicious-dates.ts
│  ├─ layouts/
│  │  └─ BaseLayout.astro
│  ├─ pages/
│  │  └─ index.astro
│  └─ styles/
│     └─ global.css
├─ astro.config.mjs
├─ package.json
└─ vercel.json // 可选
```

## 11. Astro 组件拆分建议

### 11.1 `BaseLayout.astro`

职责：

- 全局 Meta
- 字体引入
- 全局背景和 body 类
- 插入 Header / Footer

### 11.2 `Header.astro`

职责：

- 品牌 Logo
- 锚点导航
- 下载二维码面板
- 移动端菜单

### 11.3 `HeroSection.astro`

职责：

- 首屏文案
- CTA 按钮
- 右侧信息拼贴卡片

### 11.4 `ServiceCategoryGrid.astro`

职责：

- 输出婚礼服务分类卡片

输入数据：

```ts
type ServiceCategory = {
  title: string;
  description: string;
  countLabel: string;
  href: string;
  icon: string;
};
```

### 11.5 `LuckyDateCalendar.astro`

职责：

- 展示月份网格
- 输出宜婚日期标签
- 旁边展示推荐日期列表

### 11.6 `FeaturedVendors.astro`

职责：

- 展示精选合作商家卡片

输入数据：

```ts
type Vendor = {
  name: string;
  category: "司仪" | "场布" | "酒店" | "婚纱" | "化妆" | "摄影";
  city: string;
  district?: string;
  style: string;
  priceRange: string;
  tags: string[];
  image: string;
  href: string;
};
```

## 12. Tailwind 4 实现建议

### 12.1 `package.json`

```json
{
  "name": "astro-wedding",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^6.0.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.1",
    "tailwindcss": "^4.2.1"
  }
}
```

说明：

1. 对当前静态主站，先不要引入不必要依赖。
2. 如果后续要加内容管理或表单，再按需补。

### 12.2 `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 12.3 `src/styles/global.css`

```css
@import "tailwindcss";

@theme {
  --color-bg-page: #f4efea;
  --color-bg-panel: #f8f8f7;
  --color-bg-soft: #fffdf9;
  --color-ink-strong: #383838;
  --color-ink-soft: #6b6661;
  --color-brand-primary: #ffde00;
  --color-brand-secondary: #53dbc9;
  --color-brand-accent: #6fc2ff;

  --font-display: "Space Grotesk", "Noto Sans SC", sans-serif;
  --font-body: "Noto Sans SC", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background: var(--color-bg-page);
    color: var(--color-ink-strong);
    font-family: var(--font-body);
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
  }
}

@layer components {
  .container-shell {
    @apply mx-auto w-[min(1280px,calc(100%_-_2rem))];
  }

  .section-gap {
    @apply py-20 md:py-28 lg:py-32;
  }

  .paper-card {
    @apply rounded-[24px] border-2 border-[var(--color-ink-strong)] bg-[var(--color-bg-panel)];
    box-shadow: 8px 8px 0 0 var(--color-ink-strong);
  }

  .chip-label {
    @apply inline-flex items-center rounded-full border-2 border-[var(--color-ink-strong)] px-3 py-1 text-[0.75rem] uppercase tracking-[0.18em];
    font-family: var(--font-mono);
  }

  .btn-primary {
    @apply inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink-strong)] bg-[var(--color-brand-primary)] px-6 py-3 font-medium text-[var(--color-ink-strong)] transition;
    box-shadow: 4px 4px 0 0 var(--color-ink-strong);
  }

  .btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 0 var(--color-ink-strong);
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink-strong)] bg-transparent px-6 py-3 font-medium text-[var(--color-ink-strong)];
  }
}
```

## 13. 首页骨架示例

`src/pages/index.astro` 可以按以下顺序组装：

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/Header.astro";
import HeroSection from "../components/HeroSection.astro";
import ServiceCategoryGrid from "../components/ServiceCategoryGrid.astro";
import ValueProps from "../components/ValueProps.astro";
import LuckyDateCalendar from "../components/LuckyDateCalendar.astro";
import FeaturedVendors from "../components/FeaturedVendors.astro";
import DownloadSection from "../components/DownloadSection.astro";
import FaqSection from "../components/FaqSection.astro";
import Footer from "../components/Footer.astro";

import "../styles/global.css";
---

<BaseLayout
  title="婚礼救星 | 帮新人把备婚安排清楚"
  description="婚礼救星聚合本地婚礼服务、宜婚日历和 App 下载入口，帮助新人更高效地完成备婚。"
>
  <Header />
  <main>
    <HeroSection />
    <ServiceCategoryGrid />
    <ValueProps />
    <LuckyDateCalendar />
    <FeaturedVendors />
    <DownloadSection />
    <FaqSection />
  </main>
  <Footer />
</BaseLayout>
```

## 14. 关键组件视觉建议

### 14.1 二维码组件

二维码卡片不要只放图片，建议加完整标签：

- `iOS 下载`
- `Android 下载`
- `扫码安装婚礼救星 App`

卡片风格：

- 米白底
- 深色描边
- 头部有一条黄底标签
- 内部二维码居中

### 14.2 日历组件

建议做成“卡片式月历”，不要用浏览器默认 table 风格。

每个日期块包含：

- 数字日期
- 小号农历
- 状态点

状态优先级：

1. `当天`
2. `宜婚`
3. `热门`
4. `节假日`

### 14.3 商家卡片

建议采用“封面图 + 底部资料卡”的组合。

信息层级：

1. 品牌名
2. 标签行
3. 城市 + 预算
4. 按钮

## 15. 图片与素材风格

图片风格不要过度影楼化，建议偏真实、干净、自然光。

推荐类型：

1. 婚礼现场全景
2. 婚纱礼服局部
3. 桌花和布置细节
4. 新娘妆面特写
5. 酒店宴会厅空间

插画建议：

- 可少量使用贴纸图形
- 用星芒、爱心、戒指、日历图标
- 不要使用廉价婚庆 PNG 素材堆砌

## 16. Vercel 部署建议

对于当前静态站：

1. 直接部署 Astro 静态输出即可。
2. 不需要接 SSR 适配器。
3. Vercel 输出目录为 `dist`。

推荐配置：

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

如果后续需要动态接口，再引入 `@astrojs/vercel`。

## 17. MVP 范围

第一版主站建议只做以下内容：

1. 单页首页
2. Header 二维码
3. 6 个服务分类卡
4. 近期宜婚日历预览
5. 6-8 个精选商家卡
6. 下载区
7. Footer 联系方式

先把“主站可信度”和“信息组织”打稳，再扩展列表页、城市页和详情页。

## 18. 验收标准

满足以下条件即可认为首页方案达标：

1. 打开页面 3 秒内能理解站点用途。
2. Header 明确可见 iOS / Android 下载入口。
3. 婚礼服务分类在首屏后 1 次滚动内可见。
4. 宜婚日历能快速看出高亮日期。
5. 页面整体风格明显参考 MotherDuck，但不会像技术产品官网。
6. 移动端二维码入口、日历和卡片布局不破。
7. Footer 明确展示邮箱等个人联系信息。

## 19. 外部参考

- MotherDuck 首页：<https://motherduck.com/>
- Tailwind 官方 Astro 安装指南：<https://tailwindcss.com/docs/guides/astro>
- Astro 官方 Vercel 集成说明：<https://docs.astro.build/en/guides/integrations-guide/vercel/>

补充说明：

1. `@astrojs/vercel` 官方文档明确说明，如果 Astro 仅作为静态站点生成器使用，通常不需要这个适配器。
2. 当前依赖版本已于 2026-03-17 通过 npm registry 重新核对。
