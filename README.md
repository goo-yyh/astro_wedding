# 婚期计算

根据新人生日、所选民俗规则和家庭档期筛选婚期。浏览器负责公农历换算、规则核对、分类和排序。DeepSeek 可将用户备注整理成待确认的条件，并在两日对照中选出值得关注的差异。

## 本地运行

使用 Node.js 22.12 或更高版本。在项目根目录执行：

```sh
npm ci
npm run dev
```

AI 服务端读取环境变量 `deepseek_key`，本地可放在项目根目录的 `.env`。未配置时仍可使用日期计算和对照表。不要将密钥放入浏览器环境变量。

## 构建与启动

```sh
npm run check
npm run build
npm start
```

本地构建使用 Astro Node standalone 适配器。Node 服务同时提供页面和同源的 `/api/analysis`，可通过 HOST、PORT 配置监听地址与端口。

Vercel 项目 `astro_wedding` 从 `main` 部署到 [正式网站](https://www.weddingsavior.com)。使用 Astro 框架预设和 Node.js 24.x，构建时由 `VERCEL=1` 启用 Vercel 适配器。AI 接口从 Production 环境读取敏感变量 `deepseek_key`。更新变量后需重新部署，再运行以下命令验证线上备注解析、评分和首选日期。

```sh
WEDDING_TEST_URL=https://www.weddingsavior.com node --experimental-strip-types scripts/verify-deepseek.mjs
```

产品口径见 [婚期计算网站设计方案](specs/婚期计算网站设计方案.md)。页面「规则说明」列出本版采用的生肖换年、闰月与行嫁月份口径。
