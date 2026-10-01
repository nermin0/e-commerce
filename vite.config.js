import react from "@vitejs/plugin-react"
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: "esbuild",
  },
  server: {
    proxy: {
      "/api": {
        target: "https://graduationecommerce.runasp.net",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});