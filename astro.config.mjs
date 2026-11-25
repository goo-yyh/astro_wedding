import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: node({ mode: "standalone" }),
  integrations: [preact()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
