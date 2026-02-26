// ─────────────────────────────────────────────────────────────
// ONBOARDING SHELL — step router, progress, layout, state
// Renders the 5-step onboarding flow for patient (4 for therapist).
// TODO(backend-integration): persist onboarding state to backend
// so refreshing the page resumes where the user left off.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, makeGlobalCSS, Logo, Button, StepIndicator, LanguageToggle } from "@ds";
import { COLORS } from "@ds";

import { StepProfile }           from "./StepProfile.jsx";
import { StepQuestionnaire }     from "./StepQuestionnaire.jsx";
import { StepAiChat }            from "./StepAiChat.jsx";
import { StepPatientMatch }      from "./StepPatientMatch.jsx";
import { StepPayment }           from "./StepPayment.jsx";
import { StepTherapistSchedule } from "./StepTherapistSchedule.jsx";
import { MOCK_THERAPISTS }       from "./mockData.js";

export const OnboardingShell = ({ role, email, initialStep = 0, onComplete }) => {
  const { lang, dir, t } = useLang();
  const isD = useIsDesktop();
  const isPatient = role === "patient";
  const TOTAL_STEPS = isPatient ? 5 : 4;

  // DEMO SHORTCUT: clamp initialStep to valid range
  const clampedStart = Math.min(Math.max(initialStep, 0), TOTAL_STEPS - 1);
  const [step, setStep] = useState(clampedStart);

  // Shared form data — preserved across steps
  // When jumping ahead, pre-fill with dummy data so earlier steps don't break
  const [profile, setProfile] = useState(
    clampedStart > 0
      ? { firstName: "Test", lastName: "User", avatar: null, email: email || "", phone: "+1234567890" }
      : { firstName: "", lastName: "", avatar: null, email: email || "", phone: "" }
  );
  const [answers, setAnswers] = useState(
    clampedStart > 1 ? { q_concerns: ["anxiety"], q_therapy_before: "never", q_mood: "3" } : {}
  );
  const [selectedTherapist, setSelectedTherapist] = useState(
    clampedStart >= 4 && isPatient ? MOCK_THERAPISTS[0] : null
  );

  const stepLabels = isPatient
    ? [
        t("onboarding.profileTitle"),
        t("onboarding.questionnaireTitle"),
        t("onboarding.aiChatTitle"),
        t("onboarding.matchTitle"),
        t("onboarding.paymentTitle"),
      ]
    : [
        t("onboarding.profileTitle"),
        t("onboarding.questionnaireTitle"),
        t("onboarding.aiChatTitle"),
        t("onboarding.scheduleTitle"),
      ];

  const canGoNext = step < TOTAL_STEPS - 1;
  const canGoBack = step > 0;

  const goNext = () => { if (canGoNext) setStep((s) => s + 1); };
  const goBack = () => { if (canGoBack) setStep((s) => s - 1); };

  // Patient: "Book session" → save therapist, jump to payment step
  const handleBookSession = (therapist) => {
    setSelectedTherapist(therapist);
    setStep(4); // payment step
  };

  // Booking failed (slot taken) → return to match list
  const handleBookingFailed = () => {
    setSelectedTherapist(null);
    setStep(3);
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 0: return <StepProfile profile={profile} setProfile={setProfile} originalEmail={email || ""} onNext={goNext} />;
      case 1: return <StepQuestionnaire role={role} answers={answers} setAnswers={setAnswers} onNext={goNext} onBack={goBack} />;
      case 2: return <StepAiChat role={role} onNext={goNext} onBack={goBack} />;
      case 3:
        return isPatient
          ? <StepPatientMatch onBookSession={handleBookSession} onComplete={onComplete} onBack={goBack} />
          : <StepTherapistSchedule onComplete={onComplete} onBack={goBack} />;
      case 4:
        return isPatient
          ? <StepPayment therapist={selectedTherapist} onComplete={onComplete} onBookingFailed={handleBookingFailed} onBack={goBack} />
          : null;
      default: return null;
    }
  };

  return (
    <>
      <style>{makeGlobalCSS(lang)}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, var(--ds-bg) 0%, var(--ds-cream) 100%)",
        direction: dir,
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isD ? "20px 40px" : "16px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={30} />
            <span className="ds-heading" style={{ fontSize: 17, color: COLORS.primary }}>{t("app.name")}</span>
          </div>
          {/* Hide toggle from AI chat onward — chat messages are language-locked */}
          {step <= 1 && <LanguageToggle />}
        </header>

        {/* Step indicator */}
        <div style={{ padding: isD ? "8px 40px 0" : "8px 20px 0" }}>
          <StepIndicator steps={TOTAL_STEPS} current={step} labels={isD ? stepLabels : []} />
        </div>

        {/* Step content */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center",
          padding: isD ? "24px 40px 40px" : "20px 16px 100px",
        }}>
          <div style={{
            width: "100%",
            maxWidth: isD ? 600 : 480,
          }}>
            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
};
