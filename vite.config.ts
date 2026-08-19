import { copyFileSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function githubPagesSpaFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const outputDirectory = path.resolve(__dirname, "dist");
      copyFileSync(
        path.join(outputDirectory, "index.html"),
        path.join(outputDirectory, "404.html"),
      );
    },
  };
}

export default defineConfig({
  base: "/nyt-color-tools/",
  plugins: [vue(), tailwindcss(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
