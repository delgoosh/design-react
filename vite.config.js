import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/design-react/",
  server: { host: "127.0.0.1" },
  build: { target: "esnext" },
  resolve: {
    alias: {
      // @ds  → src/design-system
      // @patient  → src/apps/patient
      // @therapist → src/apps/therapist
      // @shared → src/shared
      "@ds":        path.resolve(__dirname, "src/design-system"),
      "@patient":   path.resolve(__dirname, "src/apps/patient"),
      "@therapist": path.resolve(__dirname, "src/apps/therapist"),
      "@shared":    path.resolve(__dirname, "src/shared"),
      "@assets":    path.resolve(__dirname, "src/assets"),
    },
  },
});
