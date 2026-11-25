import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: process.env.VERCEL === "1"
    ? vercel({ maxDuration: 60 })
    : node({ mode: "standalone" }),
  integrations: [preact()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
