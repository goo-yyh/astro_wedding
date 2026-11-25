# Existing shell
BaseLayout owns SEO and outer background; Header renders site navigation and the download panel; Footer presents links and contacts.
### src/layouts/BaseLayout.astro

```astro
---
import "../styles/global.css";

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "婚礼救星 | 帮新人把备婚安排清楚",
  description = "婚礼救星聚合本地婚礼服务、宜婚日历和 App 下载入口，帮助新人更高效地完成备婚。",
} = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#f4efea" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <title>{title}</title>
  </head>
  <body class="bg-bg-page font-body text-ink-strong antialiased">
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute left-[6%] top-18 h-64 w-64 rounded-full bg-brand-primary/30 blur-3xl"></div>
      <div class="absolute right-[10%] top-32 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl"></div>
      <div class="absolute bottom-[-4rem] left-[18%] h-72 w-72 rounded-full bg-brand-secondary/18 blur-3xl"></div>
    </div>
    <slot />
  </body>
</html>

```

### src/components/Header.astro

```astro
---
import type { AppPlatform, NavItem } from "../data/site";
import AppQrPanel from "./AppQrPanel.astro";

interface Props {
  navigation: NavItem[];
  platforms: AppPlatform[];
}

const { navigation, platforms } = Astro.props;
const hasNav = navigation.length > 0;
---

<header class="sticky top-0 z-50 border-b-2 border-transparent bg-bg-page/80 backdrop-blur-md">
  <div class="container-shell py-3">
    <div class="flex items-center justify-between gap-4">
      <a href="#top" class="flex items-center gap-2.5">
        <span class="grid h-10 w-10 place-items-center rounded-[14px] border-2 border-ink-strong bg-brand-primary font-display text-lg font-bold shadow-[4px_4px_0_0_#383838]">
          婚
        </span>
        <span class="space-y-1">
          <span class="block font-display text-lg font-bold tracking-tight">婚礼救星</span>
          <span class="block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-soft">
            Wedding Ops
          </span>
        </span>
      </a>

      {
        hasNav && (
          <nav class="hidden items-center gap-6 lg:flex">
            {
              navigation.map((item) => (
                <a
                  href={item.href}
                  class="border-b-2 border-transparent pb-1 text-sm font-medium text-ink-strong transition hover:border-brand-accent hover:text-ink-strong"
                >
                  {item.label}
                </a>
              ))
            }
          </nav>
        )
      }

      <div class="group relative hidden lg:block">
        <a
          href="#download"
          class="inline-flex items-center gap-2 rounded-full border-2 border-ink-strong bg-bg-soft px-4 py-2.5 font-mono text-[0.74rem] uppercase tracking-[0.16em] text-ink-strong shadow-[4px_4px_0_0_rgba(56,56,56,0.16)] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          下载 App
          <span aria-hidden="true">+</span>
        </a>
        <div class="pointer-events-none absolute right-0 top-[calc(100%+0.9rem)] w-[24rem] translate-y-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div class="mb-2 text-right font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
            App 敬请期待
          </div>
          <AppQrPanel platforms={platforms} compact />
        </div>
      </div>

      <details class="relative lg:hidden">
        <summary class="btn-secondary cursor-pointer px-4 py-2 text-sm">下载 App</summary>
        <div class="paper-card absolute right-0 top-[calc(100%+1rem)] w-[min(24rem,calc(100vw-2rem))] p-5">
          <div class="space-y-4">
            <p class="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft">
              App 敬请期待
            </p>
            <AppQrPanel platforms={platforms} />
          </div>
        </div>
      </details>
    </div>
  </div>
</header>

```

### src/components/Footer.astro

```astro
---
import type { NavItem } from "../data/site";

interface ContactInfo {
  email: string;
  wechat: string;
  location: string;
}

interface Props {
  navigation: NavItem[];
  contact: ContactInfo;
  siteName: string;
  blurb: string;
}

const { navigation, contact, siteName, blurb } = Astro.props;
const year = new Date().getFullYear();
---

<footer id="contact" class="border-t-2 border-ink-strong bg-ink-strong py-12 text-bg-soft">
  <div class="container-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.76fr)]">
    <div>
      <p class="font-mono text-[0.78rem] uppercase tracking-[0.18em] text-brand-primary">
        {siteName}
      </p>
      <h2 class="mt-4 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[0.98] font-bold tracking-[-0.04em] lg:whitespace-nowrap">
        {blurb}
      </h2>
    </div>

    <div class="grid gap-6 rounded-[28px] border-2 border-white/18 bg-white/6 p-6 backdrop-blur-sm">
      <div class="grid gap-3">
        <p class="font-mono text-[0.78rem] uppercase tracking-[0.18em] text-brand-secondary">
          Contact
        </p>
        <a class="text-lg text-white hover:text-brand-primary" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
      </div>

      {
        navigation.length > 0 && (
          <div class="grid gap-3 border-t border-white/18 pt-5">
            <p class="font-mono text-[0.78rem] uppercase tracking-[0.18em] text-brand-secondary">
              Sitemap
            </p>
            <div class="flex flex-wrap gap-3">
              {
                navigation.map((item) => (
                  <a
                    href={item.href}
                    class="rounded-full border border-white/24 px-3 py-2 text-sm text-white/72 transition hover:border-brand-primary hover:text-white"
                  >
                    {item.label}
                  </a>
                ))
              }
            </div>
          </div>
        )
      }

      <p class="border-t border-white/18 pt-5 text-sm text-white/58">
        © {year} {siteName}.
      </p>
    </div>
  </div>
</footer>

```

