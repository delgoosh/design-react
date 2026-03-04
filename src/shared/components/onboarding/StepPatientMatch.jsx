// ─────────────────────────────────────────────────────────────
// STEP 4a — Patient: suggested therapists + timezone
// Shows crisis interstitial when patient flagged crisis concern.
// TODO(backend-integration): therapist suggestions should come
// from the real matching engine, not mock data.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button, Card, Avatar, Tag, StarRating } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { Ic } from "@ds";
import { MOCK_THERAPISTS } from "./mockData.js";
import { CrisisResources } from "./CrisisResources.jsx";

export const StepPatientMatch = ({ answers, onBookSession, onComplete, onBack }) => {
  const { lang, t } = useLang();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Crisis gate — show resources first if patient flagged crisis
  const hasCrisis = answers?.crisisFlag === "yes";
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);

  if (hasCrisis && !crisisAcknowledged) {
    return <CrisisResources onContinue={() => setCrisisAcknowledged(true)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("onboarding.matchTitle")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("onboarding.matchSub")}</p>
      </div>

      {/* Timezone tag */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
        <Tag color="neutral" style={{ gap: 5 }}>
          <Ic n="globe" s={13} c="var(--ds-text-mid)" />
          {t("onboarding.timezone")}: {tz}
        </Tag>
      </div>

      {/* Crisis resources link (for testing — always visible) */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setCrisisAcknowledged(false)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: COLORS.danger, fontWeight: 600,
            textDecoration: "underline", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Ic n="alert" s={12} c={COLORS.danger} /> {t("crisis.crisisLink")}
        </button>
      </div>

      {/* Therapist cards */}
      {MOCK_THERAPISTS.map((th) => (
        <Card key={th.id} variant="sm" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar
              initials={localised(th.name, lang).split(" ").map((w) => w[0]).join("")}
              src={th.avatar}
              size={48}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>{localised(th.name, lang)}</p>
              <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{localised(th.credentials, lang)}</p>
            </div>
            <Tag color="primary" style={{ fontWeight: 700 }}>{th.matchPercent}% {t("onboarding.matchPercent")}</Tag>
          </div>

          {/* Specialties + style tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {th.specialties.map((sp, i) => (
              <Tag key={i} color="accent" style={{ fontSize: 10 }}>{localised(sp, lang)}</Tag>
            ))}
            {th.styleTags?.map((st, i) => (
              <Tag key={`s${i}`} color="neutral" style={{ fontSize: 10 }}>{localised(st, lang)}</Tag>
            ))}
          </div>

          {/* Rating + next slot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StarRating value={th.rating} />
            <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
              <Ic n="clock" s={12} c="var(--ds-text-light)" />{" "}
              {t("onboarding.nextAvailable")}: {localised(th.nextSlot, lang)}
            </span>
          </div>

          {/* Book button */}
          <Button variant="primary" size="sm" onClick={() => onBookSession?.(th)} style={{ width: "100%" }}>
            {t("onboarding.bookSession")}
          </Button>
        </Card>
      ))}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        <Button variant="ghost" onClick={onComplete} style={{ flex: 1 }}>
          {t("onboarding.skip")}
        </Button>
        <Button variant="primary" onClick={onComplete} style={{ flex: 2 }}>
          {t("onboarding.goToDashboard")}
        </Button>
      </div>
    </div>
  );
};

// Helper to pick localised value from { en, fa } objects
function localised(obj, lang) {
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}
