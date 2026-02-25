// ─────────────────────────────────────────────────────────────
// THERAPIST / Patients
// ─────────────────────────────────────────────────────────────
// Props contract:
//   (to be defined when building this screen)
//
// Imports should come from:
//   @ds        → design system tokens + primitives
//   @shared    → shared cross-app components
//   ../components → therapist-only sub-components
// ─────────────────────────────────────────────────────────────
import { useLang, useIsDesktop } from "@ds";

// TODO: Build this screen
export const Patients = () => {
  const { t, dir } = useLang();
  const isD = useIsDesktop();

  return (
    <div style={{ direction: dir, padding: 24 }}>
      <p style={{ color: "#7AADA7", fontSize: 13 }}>
        Therapist / Patients — not yet implemented
      </p>
    </div>
  );
};
