import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // @slowcook-ai/review-overlay reads process.env.NEXT_PUBLIC_SLOWCOOK_* at
  // render time (its env-fallback contract). Vite's browser runtime has no
  // `process`, so referencing it throws and white-screens the app. Shim the
  // exact keys the overlay reads UNGUARDED (overlay.js:40-48) from our
  // VITE_SLOWCOOK_* values — narrow, so React's process.env.NODE_ENV is
  // untouched. (The GH-proxy reads are guarded by `typeof process`.)
  const scReviewDefines = {
    "process.env.NEXT_PUBLIC_SLOWCOOK_OWNER": JSON.stringify(env.VITE_SLOWCOOK_OWNER || ""),
    "process.env.NEXT_PUBLIC_SLOWCOOK_REPO": JSON.stringify(env.VITE_SLOWCOOK_REPO || ""),
    "process.env.NEXT_PUBLIC_SLOWCOOK_PR_NUMBER": JSON.stringify(env.VITE_SLOWCOOK_PR_NUMBER || ""),
    "process.env.NEXT_PUBLIC_SLOWCOOK_STORY_ID": JSON.stringify(env.VITE_SLOWCOOK_STORY_ID || ""),
    "process.env.NEXT_PUBLIC_SLOWCOOK_REVIEW": JSON.stringify(env.VITE_SLOWCOOK_REVIEW || ""),
    "process.env.NEXT_PUBLIC_SLOWCOOK_REVIEW_MODE": JSON.stringify(env.VITE_SLOWCOOK_REVIEW_MODE || "lcr"),
    "process.env.NEXT_PUBLIC_SLOWCOOK_AUTH_BASE": JSON.stringify(env.VITE_SLOWCOOK_AUTH_BASE || ""),
  };

  return {
    define: scReviewDefines,
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
  };
});
