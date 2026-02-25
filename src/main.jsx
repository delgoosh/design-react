// ─────────────────────────────────────────────────────────────
// ENTRY POINT
//
// Switch APP_MODE to change what renders:
//   "storybook"  → design system storybook (default for dev)
//   "patient"    → patient app
//   "therapist"  → therapist panel
// ─────────────────────────────────────────────────────────────
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@ds";

// ── Change this to switch between apps ───────────────────────
const APP_MODE = import.meta.env.VITE_APP_MODE || "storybook";

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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AppComponent />
    </LanguageProvider>
  </StrictMode>
);
