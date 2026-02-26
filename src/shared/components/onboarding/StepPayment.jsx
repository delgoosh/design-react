// ─────────────────────────────────────────────────────────────
// STEP 5 — Purchase credits & confirm booking
// Simplified Credits page (no chat credit) for the onboarding
// flow. Patient sees this after picking a therapist + time slot.
// TODO(backend-integration): buy/subscribe calls real payment
// gateway; "Confirm booking" POSTs to /sessions/book endpoint;
// failure is a real 409 from the backend, not a random mock.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button, Card, Avatar, Tag, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";

// Helper to pick localised value from { en, fa } objects
const L = (obj, lang) => (typeof obj === "string" ? obj : obj[lang] || obj.en || "");

export const StepPayment = ({ therapist, onComplete, onBookingFailed, onBack }) => {
  const { lang, t, dir } = useLang();

  const [sessionCredits, setSessionCredits] = useState(0);
  const [subEnabled, setSubEnabled] = useState(true);
  const [voucher, setVoucher] = useState("");
  const [voucherMsg, setVoucherMsg] = useState(null);
  const [booking, setBooking] = useState(null); // null | "loading" | "success" | "failed"

  // ── Voucher ────────────────────────────────────────────────
  const handleVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (!code) return;
    if (code === "VOUCH") {
      setSessionCredits((s) => s + 1);
      setVoucherMsg({ type: "success", text: t("credits.voucherSuccess") });
      setVoucher("");
    } else {
      setVoucherMsg({ type: "error", text: t("credits.voucherError") });
    }
  };

  // ── Mock buy ───────────────────────────────────────────────
  const handleBuy = (amount) => {
    // TODO(backend-integration): integrate real payment gateway
    setSessionCredits((s) => s + amount);
  };

  // ── Confirm booking ────────────────────────────────────────
  const handleConfirmBooking = () => {
    if (sessionCredits < 1) return;
    setBooking("loading");
    // TODO(backend-integration): POST /sessions/book with therapist.id + slot
    setTimeout(() => {
      // Mock: 80% success, 20% slot-taken failure
      const success = Math.random() < 0.8;
      if (success) {
        setSessionCredits((s) => s - 1);
        setBooking("success");
        setTimeout(() => onComplete(), 1200);
      } else {
        setBooking("failed");
        setTimeout(() => onBookingFailed(), 2500);
      }
    }, 1500);
  };

  const isRtl = dir === "rtl";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("onboarding.paymentTitle")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("onboarding.paymentSub")}</p>
      </div>

      {/* ── Selected therapist summary ────────────────────── */}
      {therapist && (
        <Card variant="sm" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar
            initials={L(therapist.name, lang).split(" ").map((w) => w[0]).join("")}
            src={therapist.avatar}
            size={42}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>{L(therapist.name, lang)}</p>
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>
              <Ic n="clock" s={11} c="var(--ds-text-light)" />{" "}
              {t("onboarding.selectedSlot")}: {L(therapist.nextSlot, lang)}
            </p>
          </div>
          <Tag color="primary" style={{ fontWeight: 700 }}>{therapist.matchPercent}%</Tag>
        </Card>
      )}

      {/* ── Session credit balance ────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
        borderRadius: RADIUS.lg, padding: 16,
        color: "white", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circle */}
        <div style={{
          position: "absolute", top: -30,
          ...(isRtl ? { left: -30 } : { right: -30 }),
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(255,255,255,0.18)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ic n="wallet" s={17} c="white" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 1 }}>{t("credits.balance")}</p>
              <p className="ds-heading" style={{ fontSize: 24, color: "white", lineHeight: 1 }}>
                {sessionCredits}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
            {sessionCredits} {t("credits.remaining")}
          </p>

          {/* Auto-renew toggle */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.15)",
          }}>
            <ToggleSwitch checked={subEnabled} onChange={setSubEnabled} light />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
              {t("credits.subscriptionToggle")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Auto-renew warning ────────────────────────────── */}
      {!subEnabled && (
        <div style={{
          background: `${COLORS.accent}14`, borderRadius: RADIUS.md,
          padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Ic n="alert-triangle" s={16} c={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", lineHeight: 1.55 }}>
            {t("credits.subscriptionWarning")}
          </p>
        </div>
      )}

      {/* ── Buy / Subscribe credits ───────────────────────── */}
      <div>
        <h3 className="ds-heading" style={{ fontSize: 15, color: "var(--ds-text)", marginBottom: 10 }}>
          {t("credits.buyCredit")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BuyCard
            title={t("credits.single")}
            sub={t("credits.singleSub")}
            btnLabel={subEnabled ? t("credits.subscribe") : t("credits.buy")}
            onClick={() => handleBuy(1)}
          />
          <BuyCard
            title={t("credits.pack4")}
            badge={t("credits.popularBadge")}
            badgeColor="accent"
            btnLabel={subEnabled ? t("credits.subscribeBundle") : t("credits.buyBundle")}
            onClick={() => handleBuy(4)}
          />
          <BuyCard
            title={t("credits.pack6")}
            badge={t("credits.bestValueBadge")}
            badgeColor="success"
            btnLabel={subEnabled ? t("credits.subscribeBundle") : t("credits.buyBundle")}
            onClick={() => handleBuy(6)}
          />
        </div>
      </div>

      {/* ── Voucher ──────────────────────────────────────── */}
      <div>
        <h3 className="ds-heading" style={{ fontSize: 15, color: "var(--ds-text)", marginBottom: 10 }}>
          {t("credits.voucherTitle")}
        </h3>
        <Card>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={voucher}
              onChange={(e) => { setVoucher(e.target.value); setVoucherMsg(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleVoucher()}
              placeholder={t("credits.voucherPlaceholder")}
              style={{
                flex: 1, padding: "9px 12px", fontSize: 13,
                borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
                background: "var(--ds-card-bg)", color: "var(--ds-text)",
                fontFamily: "inherit", direction: dir, outline: "none",
              }}
            />
            <Button variant="primary" size="sm" onClick={handleVoucher} style={{ flexShrink: 0 }}>
              {t("credits.voucherApply")}
            </Button>
          </div>
          {voucherMsg && (
            <p style={{
              fontSize: 11, marginTop: 6, fontWeight: 600,
              color: voucherMsg.type === "success" ? COLORS.primary : COLORS.danger,
            }}>
              {voucherMsg.text}
            </p>
          )}
        </Card>
      </div>

      {/* ── Booking status messages ──────────────────────── */}
      {booking === "success" && (
        <Card variant="tinted" style={{ textAlign: "center", padding: "16px 12px" }}>
          <Ic n="check-circle" s={28} c={COLORS.primary} />
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)", marginTop: 8 }}>
            {t("onboarding.bookingSuccess")}
          </p>
        </Card>
      )}
      {booking === "failed" && (
        <Card style={{ textAlign: "center", padding: "16px 12px", border: `1.5px solid ${COLORS.danger}` }}>
          <Ic n="alert-triangle" s={28} c={COLORS.danger} />
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.danger, marginTop: 8 }}>
            {t("onboarding.bookingFailed")}
          </p>
        </Card>
      )}

      {/* ── Actions ─────────────────────────────────────── */}
      {!booking && (
        <>
          {sessionCredits < 1 && (
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", textAlign: "center" }}>
              {t("onboarding.needCredit")}
            </p>
          )}
          <Button
            variant="primary"
            onClick={handleConfirmBooking}
            style={{ width: "100%", opacity: sessionCredits >= 1 ? 1 : 0.45 }}
          >
            {t("onboarding.confirmBooking")}
          </Button>
          <Button variant="ghost2" onClick={onBack} style={{ width: "100%" }}>
            {t("onboarding.back")}
          </Button>
        </>
      )}
      {booking === "loading" && (
        <Button variant="primary" style={{ width: "100%", opacity: 0.6 }} disabled>
          <Ic n="loader" s={16} c="white" /> {t("onboarding.confirmBooking")}…
        </Button>
      )}
    </div>
  );
};

// ── Toggle switch (same pattern as Credits.jsx) ──────────────
function ToggleSwitch({ checked, onChange, light }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      style={{
        width: 38, height: 22, borderRadius: 11, border: "none",
        background: light
          ? (checked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)")
          : (checked ? COLORS.primary : "var(--ds-sand)"),
        cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        background: "white", position: "absolute",
        top: 3,
        left: checked ? 19 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ── Buy card (same pattern as Credits.jsx) ──────────────────
function BuyCard({ title, sub, badge, badgeColor, btnLabel, onClick }) {
  return (
    <Card variant="sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
          {badge && <Tag color={badgeColor}>{badge}</Tag>}
        </div>
        {sub && <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 1 }}>{sub}</p>}
      </div>
      <Button variant="primary" size="sm" onClick={onClick} style={{ flexShrink: 0 }}>
        {btnLabel}
      </Button>
    </Card>
  );
}
