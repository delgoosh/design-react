// ─────────────────────────────────────────────────────────────
// DEMO ROUTER — routes to patient or therapist app based on email
//
// ⚠️  SECURITY: THIS IS A MOCK — REMOVE BEFORE PRODUCTION
//
// This file exists only for front-end demo purposes.
// It routes users based on whether their email contains
// "therapist" (→ TherapistApp) or not (→ PatientApp).
//
// Flow: Auth → Onboarding (4 steps) → Main App
//
// TODO(backend-integration):
//   - Replace with real authentication flow (OAuth / OTP via API).
//   - User role (patient vs therapist) must come from the backend
//     after credential verification — NEVER from client-side email parsing.
//   - Onboarding completion state should be persisted server-side.
//   - Delete this file entirely once real auth is in place.
// ─────────────────────────────────────────────────────────────
import { useState, lazy, Suspense } from "react";
import Auth from "@shared/components/Auth.jsx";
import { OnboardingShell } from "@shared/components/onboarding/OnboardingShell.jsx";

const PatientApp = lazy(() =>
  import("./patient/App.jsx").then((m) => ({ default: m.PatientApp }))
);
const TherapistApp = lazy(() =>
  import("./therapist/App.jsx").then((m) => ({ default: m.TherapistApp }))
);

export const DemoRouter = () => {
  const [email, setEmail] = useState(null);
  // TODO(backend-integration): onboarding state should come from
  // the backend (e.g. user.onboarded flag in session/JWT)
  const [onboarded, setOnboarded] = useState(false);

  // DEMO SHORTCUT: emails containing "old" (e.g. "oldpatient@…") skip onboarding
  const skipOnboarding = email?.toLowerCase().includes("old");

  // Step 1: Not logged in → Auth
  if (!email) {
    return <Auth onLogin={(e) => setEmail(e)} />;
  }

  // TODO(backend-integration): role must come from backend JWT/session, not email string
  const isTherapist = email.toLowerCase().includes("therapist");
  const role = isTherapist ? "therapist" : "patient";

  // Step 2: Logged in but not onboarded → Onboarding
  if (!onboarded && !skipOnboarding) {
    return (
      <OnboardingShell
        role={role}
        email={email}
        onComplete={() => setOnboarded(true)}
      />
    );
  }

  // Step 3: Logged in + onboarded → Main App
  return (
    <Suspense fallback={null}>
      {isTherapist ? <TherapistApp skipAuth /> : <PatientApp skipAuth />}
    </Suspense>
  );
};
