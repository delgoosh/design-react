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
if (APP_MODE === "patient") {
  const { PatientApp } = await import("./apps/patient/App.jsx");
  AppComponent = PatientApp;
} else if (APP_MODE === "therapist") {
  const { TherapistApp } = await import("./apps/therapist/App.jsx");
  AppComponent = TherapistApp;
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
