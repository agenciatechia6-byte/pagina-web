import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // Una sola página: todo el JS/CSS inline-friendly y con hashes para caché
    assetsInlineLimit: 2048,
  },
});
