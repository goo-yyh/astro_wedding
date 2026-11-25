# Routes
/ → src/pages/index.astro wrapped by src/layouts/BaseLayout.astro. Existing landing page starts with a general almanac, then service categories, downloads and FAQs. File-based routing. The new personalized form replaces this entry.
### astro.config.mjs

```mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});

```

