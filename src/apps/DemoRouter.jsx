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
  // "nt" prefix (nt2, nt3, nt4) also counts as therapist
  const e = email.toLowerCase();
  const isTherapist = e.includes("therapist") || /\bnt[2-4]\b/.test(e);
  const role = isTherapist ? "therapist" : "patient";

  // DEMO SHORTCUT: emails containing "np2"–"np5" or "nt2"–"nt4" jump to that step
  // Patient: np2=questionnaire, np3=AI chat, np4=matches, np5=payment
  // Therapist: nt2=questionnaire, nt3=AI chat, nt4=schedule (4 steps total)
  const initialStep = (() => {
    if (e.includes("np5")) return 4;
    if (e.includes("np4") || e.includes("nt4")) return 3;
    if (e.includes("np3") || e.includes("nt3")) return 2;
    if (e.includes("np2") || e.includes("nt2")) return 1;
    return 0;
  })();

  // Step 2: Logged in but not onboarded → Onboarding
  if (!onboarded && !skipOnboarding) {
    return (
      <OnboardingShell
        role={role}
        email={email}
        initialStep={initialStep}
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
