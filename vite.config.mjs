import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/assets/images/**/*",
          dest: "assets/webcomponents",
          rename: { stripBase: 6 },
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    restoreMocks: true,
  },
  build: {
    rolldownOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          // i18next dynamically imports locale JSON; prefix those chunks without
          // changing the names of route and vendor chunks.
          const isLanguageChunk = chunkInfo.moduleIds.some(
            (moduleId) =>
              moduleId.includes("/src/i18n/") && moduleId.endsWith(".json"),
          );

          return isLanguageChunk
            ? "assets/lang-[name]-[hash].js"
            : "assets/[name]-[hash].js";
        },
      },
    },
  },
});
