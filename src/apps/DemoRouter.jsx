// ─────────────────────────────────────────────────────────────
// DEMO ROUTER — routes to patient or therapist app based on email
//
// ⚠️  SECURITY: THIS IS A MOCK — REMOVE BEFORE PRODUCTION
//
// This file exists only for front-end demo purposes.
// It routes users based on whether their email contains
// "therapist" (→ TherapistApp) or not (→ PatientApp).
//
// TODO(backend-integration):
//   - Replace with real authentication flow (OAuth / OTP via API).
//   - User role (patient vs therapist) must come from the backend
//     after credential verification — NEVER from client-side email parsing.
//   - Delete this file entirely once real auth is in place.
// ─────────────────────────────────────────────────────────────
import { useState, lazy, Suspense } from "react";
import Auth from "@shared/components/Auth.jsx";

const PatientApp = lazy(() =>
  import("./patient/App.jsx").then((m) => ({ default: m.PatientApp }))
);
const TherapistApp = lazy(() =>
  import("./therapist/App.jsx").then((m) => ({ default: m.TherapistApp }))
);

export const DemoRouter = () => {
  const [email, setEmail] = useState(null);

  if (!email) {
    return <Auth onLogin={(e) => setEmail(e)} />;
  }

  // TODO(backend-integration): role must come from backend JWT/session, not email string
  const isTherapist = email.toLowerCase().includes("therapist");

  return (
    <Suspense fallback={null}>
      {isTherapist ? <TherapistApp skipAuth /> : <PatientApp skipAuth />}
    </Suspense>
  );
};
