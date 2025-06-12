import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "./node_modules/@openfoodfacts/openfoodfacts-webcomponents/dist/localization/locales/*.js"),
          dest: "assets/localization/locales",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
