// ─────────────────────────────────────────────────────────────
// PATIENT / Therapists
// ─────────────────────────────────────────────────────────────
// Shows chosen therapist (top card), suggested alternatives,
// and an option to redo the triage/matching questionnaire.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, StarRating, StepIndicator, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { MOCK_THERAPISTS } from "@shared/components/onboarding/mockData.js";
import { StepQuestionnaire } from "@shared/components/onboarding/StepQuestionnaire.jsx";
import { StepAiChat } from "@shared/components/onboarding/StepAiChat.jsx";

// Helper to pick localised value from { en, fa } objects
function loc(obj, lang) {
  if (typeof obj === "string") return obj;
  return obj?.[lang] || obj?.en || "";
}

export const Therapists = ({
  navigate,
  chosenTherapist,
  suggestedTherapists = [],
  nextSession,
  onChooseTherapist,
  onBookSession,
}) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isRtl = dir === "rtl";

  // ── Re-triage state ───────────────────────────────────────
  const [retriageMode, setRetriageMode] = useState(false);
  const [retriageStep, setRetriageStep] = useState(0); // 0=questionnaire, 1=ai, 2=match
  const [retriageAnswers, setRetriageAnswers] = useState({});

  const gap = isD ? 20 : 12;
  const pad = isD ? 28 : 14;

  // ── Re-triage flow ────────────────────────────────────────
  if (retriageMode) {
    return (
      <div style={{
        direction: dir, padding: pad, paddingBottom: 100,
        maxWidth: isD ? 680 : undefined,
        margin: isD ? "0 auto" : undefined,
      }}>
        {/* Header with cancel */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20,
        }}>
          <h2 className="ds-heading" style={{ fontSize: isD ? 22 : 18, color: "var(--ds-text)" }}>
            {t("therapists.redoTriage")}
          </h2>
          <Button variant="ghost2" size="xs" onClick={() => { setRetriageMode(false); setRetriageStep(0); }}>
            {t("action.cancel")}
          </Button>
        </div>

        {/* Step indicator */}
        <div style={{ marginBottom: 24 }}>
          <StepIndicator
            steps={3}
            current={retriageStep}
            labels={[t("onboarding.questionnaireTitle"), t("onboarding.aiChatTitle"), t("onboarding.matchTitle")]}
          />
        </div>

        {/* Step content */}
        {retriageStep === 0 && (
          <StepQuestionnaire
            role="patient"
            answers={retriageAnswers}
            setAnswers={setRetriageAnswers}
            onNext={() => setRetriageStep(1)}
            onBack={() => { setRetriageMode(false); setRetriageStep(0); }}
          />
        )}
        {retriageStep === 1 && (
          <StepAiChat
            role="patient"
            onNext={() => setRetriageStep(2)}
            onBack={() => setRetriageStep(0)}
          />
        )}
        {retriageStep === 2 && (
          <RetriageMatchStep
            lang={lang}
            dir={dir}
            t={t}
            isD={isD}
            onChoose={(th) => {
              onChooseTherapist?.(th);
              setRetriageMode(false);
              setRetriageStep(0);
              setRetriageAnswers({});
            }}
            onBack={() => setRetriageStep(1)}
          />
        )}
      </div>
    );
  }

  // ── Normal view ───────────────────────────────────────────
  return (
    <div style={{
      direction: dir, padding: pad, paddingBottom: 100,
      maxWidth: isD ? 680 : undefined,
      margin: isD ? "0 auto" : undefined,
    }} className="ds-stagger">
      {/* Page header */}
      <div style={{ marginBottom: gap + 4 }} className="ds-anim-fadeUp">
        <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 20, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("therapists.title")}
        </h1>
        <p style={{ fontSize: isD ? 13 : 12, color: "var(--ds-text-mid)" }}>
          {t("therapists.subtitle")}
        </p>
      </div>

      {/* ── Chosen therapist card ──────────────────────────── */}
      {chosenTherapist ? (
        <ChosenTherapistCard
          therapist={chosenTherapist}
          session={nextSession}
          lang={lang}
          dir={dir}
          isD={isD}
          isRtl={isRtl}
          t={t}
          onBook={() => onBookSession?.(chosenTherapist)}
          onManage={() => navigate?.("credits")}
          onChange={() => {/* scroll to suggestions */}}
        />
      ) : (
        /* Empty state */
        <Card style={{
          textAlign: "center", padding: "36px 20px", marginBottom: gap,
        }} className="ds-anim-fadeUp">
          <Ic n="users" s={36} c={COLORS.textLight} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginTop: 12 }}>
            {t("therapists.noTherapistYet")}
          </p>
          <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 4, marginBottom: 16 }}>
            {t("therapists.noTherapistDesc")}
          </p>
          <Button variant="primary" size="sm" onClick={() => { setRetriageMode(true); setRetriageStep(0); }}>
            <Ic n="zap" s={14} c="white" />
            {t("therapists.startMatch")}
          </Button>
        </Card>
      )}

      {/* ── Suggested therapists ──────────────────────────── */}
      {suggestedTherapists.length > 0 && (
        <div style={{ marginTop: gap }} className="ds-anim-fadeUp">
          <h3 style={{ fontSize: isD ? 15 : 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: gap }}>
            {t("therapists.suggestedTitle")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap }}>
            {suggestedTherapists.map((th) => (
              <SuggestedTherapistCard
                key={th.id}
                therapist={th}
                lang={lang}
                dir={dir}
                isD={isD}
                t={t}
                onChoose={() => onChooseTherapist?.(th)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Redo triage card ──────────────────────────────── */}
      <Card variant="ghost" style={{
        marginTop: gap + 8, padding: isD ? 22 : 16,
        border: `1.5px dashed var(--ds-sand)`,
        display: "flex", flexDirection: isD ? "row" : "column",
        gap: isD ? 16 : 12, alignItems: isD ? "center" : "stretch",
      }} className="ds-anim-fadeUp">
        <div style={{
          width: 44, height: 44, borderRadius: RADIUS.md,
          background: COLORS.primaryGhost,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Ic n="zap" s={22} c={COLORS.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)", marginBottom: 3 }}>
            {t("therapists.redoTriage")}
          </p>
          <p style={{ fontSize: 12, color: "var(--ds-text-light)" }}>
            {t("therapists.redoTriageDesc")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setRetriageMode(true); setRetriageStep(0); setRetriageAnswers({}); }}
          style={{ flexShrink: 0 }}
        >
          {t("therapists.startMatch")}
        </Button>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ── Chosen therapist card (rich, gradient) ───────────────────
// ─────────────────────────────────────────────────────────────
function ChosenTherapistCard({ therapist, session, lang, dir, isD, isRtl, t, onBook, onManage }) {
  const name = loc(therapist.name, lang);
  const initials = name.split(" ").map((w) => w[0]).join("");
  const gap = isD ? 14 : 10;

  return (
    <div className="ds-anim-fadeUp" style={{ marginBottom: isD ? 20 : 12 }}>
      {/* Label */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {t("therapists.yourTherapist")}
      </p>

      <Card style={{
        background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
        border: "none", color: "white", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -30, ...(isRtl ? { left: -30 } : { right: -30 }),
          width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -15, ...(isRtl ? { right: 20 } : { left: 20 }),
          width: 70, height: 70, borderRadius: "50%", background: "rgba(232,160,122,0.15)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Row 1: Avatar + info + match tag */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: gap }}>
            <Avatar initials={initials} src={therapist.avatar} size={isD ? 52 : 44} style={{
              background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.3)", color: "white",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: isD ? 17 : 15, fontWeight: 700, color: "white" }}>{name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>
                {loc(therapist.credentials, lang)}
              </p>
            </div>
            <Tag color="primary" style={{ fontWeight: 700, background: "rgba(255,255,255,0.18)", color: "white", border: "none" }}>
              {therapist.matchPercent}% {t("therapists.matchLabel")}
            </Tag>
          </div>

          {/* Specialties */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: gap }}>
            {therapist.specialties.map((sp, i) => (
              <span key={i} style={{
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: RADIUS.sm,
                background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)",
              }}>
                {loc(sp, lang)}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div style={{ marginBottom: gap }}>
            <StarRating value={therapist.rating} />
          </div>

          {/* Next session or no session */}
          {session ? (
            <div style={{
              background: "rgba(255,255,255,0.1)", borderRadius: RADIUS.sm, padding: "10px 12px",
              marginBottom: gap,
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 6, textTransform: "uppercase" }}>
                {t("therapists.nextSessionLabel")}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  ["cal", loc(session.date, lang)],
                  ["clock", loc(session.time, lang)],
                  ["activity", loc(session.topic, lang)],
                ].map(([ic, tx], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Ic n={ic} s={11} c="rgba(255,255,255,0.5)" />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{tx}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: gap,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Ic n="cal" s={13} c="rgba(255,255,255,0.4)" />
              {t("therapists.noSessionYet")}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {session ? (
              <Button variant="accent" size={isD ? "sm" : "xs"} onClick={onManage} style={{ flex: 1 }}>
                {t("therapists.manageBooking")}
              </Button>
            ) : (
              <Button variant="accent" size={isD ? "sm" : "xs"} onClick={onBook} style={{ flex: 1 }}>
                {t("therapists.bookSession")}
              </Button>
            )}
            <Button variant="ghost" size={isD ? "sm" : "xs"} onClick={onManage} style={{
              color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)",
            }}>
              {t("therapists.changeTherapist")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Suggested therapist card (compact) ───────────────────────
// ─────────────────────────────────────────────────────────────
function SuggestedTherapistCard({ therapist, lang, dir, isD, t, onChoose }) {
  const name = loc(therapist.name, lang);
  const initials = name.split(" ").map((w) => w[0]).join("");

  return (
    <Card variant="sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Top row: avatar + name + match */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar initials={initials} src={therapist.avatar} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{name}</p>
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{loc(therapist.credentials, lang)}</p>
        </div>
        <Tag color="primary" style={{ fontWeight: 700 }}>{therapist.matchPercent}% {t("therapists.matchLabel")}</Tag>
      </div>

      {/* Specialties */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {therapist.specialties.map((sp, i) => (
          <Tag key={i} color="accent" style={{ fontSize: 10 }}>{loc(sp, lang)}</Tag>
        ))}
      </div>

      {/* Rating + next slot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating value={therapist.rating} />
        <span style={{ fontSize: 11, color: "var(--ds-text-mid)", display: "flex", alignItems: "center", gap: 4 }}>
          <Ic n="clock" s={11} c="var(--ds-text-light)" />
          {loc(therapist.nextSlot, lang)}
        </span>
      </div>

      {/* Choose button */}
      <Button variant="ghost" size="xs" onClick={onChoose} style={{ width: "100%" }}>
        {t("therapists.chooseTherapist")}
      </Button>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Re-triage match step (inline) ────────────────────────────
// ─────────────────────────────────────────────────────────────
function RetriageMatchStep({ lang, dir, t, isD, onChoose, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h2 className="ds-heading" style={{ fontSize: isD ? 20 : 17, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("onboarding.matchTitle")}
        </h2>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("onboarding.matchSub")}</p>
      </div>

      {MOCK_THERAPISTS.map((th) => {
        const name = loc(th.name, lang);
        const initials = name.split(" ").map((w) => w[0]).join("");
        return (
          <Card key={th.id} variant="sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials={initials} src={th.avatar} size={44} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{name}</p>
                <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{loc(th.credentials, lang)}</p>
              </div>
              <Tag color="primary" style={{ fontWeight: 700 }}>{th.matchPercent}% {t("therapists.matchLabel")}</Tag>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {th.specialties.map((sp, i) => (
                <Tag key={i} color="accent" style={{ fontSize: 10 }}>{loc(sp, lang)}</Tag>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StarRating value={th.rating} />
              <span style={{ fontSize: 11, color: "var(--ds-text-mid)", display: "flex", alignItems: "center", gap: 4 }}>
                <Ic n="clock" s={11} c="var(--ds-text-light)" />
                {loc(th.nextSlot, lang)}
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={() => onChoose(th)} style={{ width: "100%" }}>
              {t("therapists.chooseTherapist")}
            </Button>
          </Card>
        );
      })}

      <Button variant="ghost2" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        {t("onboarding.back")}
      </Button>
    </div>
  );
}
