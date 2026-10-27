import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://danghuyenvu.github.io",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});