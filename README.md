# 婚礼救星

基于 `Astro + Tailwind CSS` 的静态主站项目，用于展示婚礼备婚信息、当月宜婚日期和 App 下载预告。

## 技术栈

- `Astro 6`
- `Tailwind CSS 4`
- `@tailwindcss/vite`
- `lunar-typescript`

## 当前实现

- 单页主站首页
- 当月宜婚日期日历
- 备婚服务分类展示
- App 下载预告态二维码
- FAQ 与联系方式
- 适合部署到 `Vercel`

说明：

- 日历数据在构建阶段通过 `lunar-typescript` 生成
- App 二维码当前是占位和预告态，页面文案显示为“敬请期待”
- 首页已按轻量化方向持续收敛，减少了说明性冗余区块

## 本地运行

要求：

- Node.js `22+`
- npm `11+`

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建产物：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 目录结构

```text
.
├─ public/
│  ├─ images/
│  └─ qr/
├─ specs/
│  └─ design.md
├─ src/
│  ├─ components/
│  ├─ data/
│  ├─ layouts/
│  ├─ pages/
│  └─ styles/
├─ astro.config.mjs
├─ package.json
└─ tsconfig.json
```

## 关键文件

- `src/pages/index.astro`: 首页装配
- `src/components/LuckyDateCalendar.astro`: 日历模块
- `src/data/auspicious-dates.ts`: 宜婚日期数据生成
- `src/data/site.ts`: 站点文案与基础数据
- `src/styles/global.css`: 全局样式与设计 token
- `specs/design.md`: 设计方案文档

## 部署

该项目当前是纯静态站，直接部署到 Vercel 即可。

推荐配置：

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

## 后续可扩展方向

- 首页日历切换月份
- 替换真实二维码与联系信息
- 接入真实的备婚内容数据
- 增加城市页或服务详情页
