// ─────────────────────────────────────────────────────────────
// STEP 4a — Patient: suggested therapists + timezone
// TODO(backend-integration): therapist suggestions should come
// from the real matching engine, not mock data.
// ─────────────────────────────────────────────────────────────
import { useLang, Button, Card, Avatar, Tag, StarRating } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { Ic } from "@ds";
import { MOCK_THERAPISTS } from "./mockData.js";

export const StepPatientMatch = ({ onBookSession, onComplete, onBack }) => {
  const { lang, t } = useLang();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: COLORS.textDark, marginBottom: 6 }}>
          {t("onboarding.matchTitle")}
        </h2>
        <p style={{ fontSize: 13, color: COLORS.textMid }}>{t("onboarding.matchSub")}</p>
      </div>

      {/* Timezone tag */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Tag color="neutral" style={{ gap: 5 }}>
          <Ic n="globe" s={13} c={COLORS.textMid} />
          {t("onboarding.timezone")}: {tz}
        </Tag>
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
              <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{localised(th.name, lang)}</p>
              <p style={{ fontSize: 12, color: COLORS.textMid }}>{localised(th.credentials, lang)}</p>
            </div>
            <Tag color="primary" style={{ fontWeight: 700 }}>{th.matchPercent}% {t("onboarding.matchPercent")}</Tag>
          </div>

          {/* Specialties */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {th.specialties.map((sp, i) => (
              <Tag key={i} color="accent" style={{ fontSize: 10 }}>{localised(sp, lang)}</Tag>
            ))}
          </div>

          {/* Rating + next slot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StarRating value={th.rating} />
            <span style={{ fontSize: 12, color: COLORS.textMid }}>
              <Ic n="clock" s={12} c={COLORS.textLight} />{" "}
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
