import { defineConfig } from "vite";
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
});
