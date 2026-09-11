import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

export default defineConfig({
  vite: {
    ssr: {
      noExternal: ["maplibre-gl"],
    },
  },

  integrations: [mdx()],
});