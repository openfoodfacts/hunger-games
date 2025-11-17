import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/assets/**/*",
          dest: "assets/webcomponents",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
