import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "./", // rutas relativas: funciona en Vercel, Netlify y GitHub Pages (subcarpetas)
  build: {
    // Una sola página: todo el JS/CSS inline-friendly y con hashes para caché
    assetsInlineLimit: 2048,
  },
});
