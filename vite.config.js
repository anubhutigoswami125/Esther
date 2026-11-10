import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Esther is deployed as a GitHub Pages project site at /Esther/.
  base: "/Esther/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
});
