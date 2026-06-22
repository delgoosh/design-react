// ─────────────────────────────────────────────────────────────
// ENTRY POINT
//
// Switch APP_MODE to change what renders:
//   "patient"    → patient app (default)
//   "storybook"  → design system storybook
//   "therapist"  → therapist panel
// ─────────────────────────────────────────────────────────────
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@ds";
import { SlowcookReviewOverlay } from "@slowcook-ai/review-overlay/react";

// ── Change this to switch between apps ───────────────────────
const APP_MODE = import.meta.env.VITE_APP_MODE || "patient";

// Lazy imports to keep each bundle separate
let AppComponent;
// TODO(backend-integration): restore separate patient/therapist entry points
// once real auth is in place. DemoRouter is a mock that routes by email content.
if (APP_MODE === "patient" || APP_MODE === "therapist") {
  const { DemoRouter } = await import("./apps/DemoRouter.jsx");
  AppComponent = DemoRouter;
} else {
  // Storybook — the live design system showcase
  const { Storybook } = await import("./storybook/Storybook.jsx");
  AppComponent = Storybook;
}

// ── slowcook review overlay ──────────────────────────────────
// Floating nav/comment/approve overlay for PM design review on a
// mockup PR. LCR mode: design-react is a full navigable app (not a
// scenario picker), so the overlay shows on every route and tags each
// comment with its route. Pure-React, no Next.js — config comes via
// VITE_ env (Vite has no NEXT_PUBLIC_* fallback), and the reviewer's
// GitHub PAT is entered in the overlay UI (stored in localStorage).
// `enabled` is statically replaced at build time so production bundles
// tree-shake the overlay out entirely.
const REVIEW_ENABLED = import.meta.env.VITE_SLOWCOOK_REVIEW === "1";
const reviewProps = {
  enabled: REVIEW_ENABLED,
  reviewMode: "lcr",
  owner: import.meta.env.VITE_SLOWCOOK_OWNER,
  repo: import.meta.env.VITE_SLOWCOOK_REPO,
  prNumber: Number(import.meta.env.VITE_SLOWCOOK_PR_NUMBER) || undefined,
  storyId: import.meta.env.VITE_SLOWCOOK_STORY_ID || null,
  overlayVersion: "0.6.0",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AppComponent />
      {REVIEW_ENABLED && <SlowcookReviewOverlay {...reviewProps} />}
    </LanguageProvider>
  </StrictMode>
);
