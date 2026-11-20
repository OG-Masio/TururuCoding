import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set VITE_BASE=/sub/path/ when hosting under a sub-path.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
  },
  // strictPort: never fall back to another port. Each port is a separate site to the
  // browser with its own storage, so a silent switch would look like lost progress.
  server: { port: 5180, strictPort: true },
  preview: { port: 4180, strictPort: true },
});
