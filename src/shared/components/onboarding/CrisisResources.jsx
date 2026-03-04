// ─────────────────────────────────────────────────────────────
// CRISIS RESOURCES — shown when patient flags crisis concern
// Warm, reassuring page with hotline numbers + continue button.
// ─────────────────────────────────────────────────────────────
import { useLang, Button, Card, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";

export const CrisisResources = ({ onContinue }) => {
  const { t, dir } = useLang();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: dir }}>
      {/* ── Title ───────────────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: COLORS.accentGhost,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <Ic n="heart" s={28} c={COLORS.accent} />
        </div>
        <h2 className="ds-heading" style={{ fontSize: 24, color: COLORS.textDark, marginBottom: 6 }}>
          {t("crisis.title")}
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textMid, lineHeight: 1.5 }}>
          {t("crisis.subtitle")}
        </p>
      </div>

      {/* ── Banner ──────────────────────────────────────────── */}
      <p style={{
        fontSize: 13, color: COLORS.textMid, lineHeight: 1.5,
        background: COLORS.accentGhost, borderRadius: RADIUS.md,
        padding: "10px 14px", textAlign: "center",
      }}>
        {t("crisis.crisisBanner")}
      </p>

      {/* ── Emergency call ──────────────────────────────────── */}
      <Card style={{
        background: COLORS.dangerGhost,
        border: `1px solid ${COLORS.danger}30`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Ic n="alert" s={20} c={COLORS.danger} />
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.danger, flex: 1 }}>
          {t("crisis.emergencyCall")}
        </p>
      </Card>

      {/* ── Hotlines ────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.textDark, marginBottom: 10 }}>
          {t("crisis.hotlineTitle")}
        </p>

        {/* 988 Lifeline */}
        <Card variant="sm" style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: COLORS.primaryGhost,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Ic n="phone" s={18} c={COLORS.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark }}>{t("crisis.hotline988")}</p>
              <p style={{ fontSize: 12, color: COLORS.textMid }}>{t("crisis.hotline988Sub")}</p>
            </div>
          </div>
          <a href="tel:988" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" style={{ width: "100%" }}>
              <Ic n="phone" s={14} c="#fff" /> {t("crisis.callNow")}
            </Button>
          </a>
        </Card>

        {/* Crisis Text Line */}
        <Card variant="sm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: COLORS.primaryGhost,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Ic n="message" s={18} c={COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark }}>{t("crisis.hotlineText")}</p>
            <p style={{ fontSize: 12, color: COLORS.textMid }}>{t("crisis.hotlineTextSub")}</p>
          </div>
        </Card>
      </div>

      {/* ── Reassurance ─────────────────────────────────────── */}
      <p style={{
        fontSize: 13, color: COLORS.textMid, lineHeight: 1.6,
        textAlign: "center", fontStyle: "italic",
        padding: "0 8px",
      }}>
        {t("crisis.reassurance")}
      </p>

      {/* ── Continue ────────────────────────────────────────── */}
      <Button variant="ghost" onClick={onContinue} style={{ width: "100%" }}>
        {t("crisis.continueToMatches")}
      </Button>
    </div>
  );
};
