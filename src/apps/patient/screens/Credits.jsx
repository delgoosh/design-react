// ─────────────────────────────────────────────────────────────
// PATIENT / Wallet  (real-money model — replaces the old coupon model)
// ─────────────────────────────────────────────────────────────
// Patients hold ONE shared wallet of real money in £ (GBP).
// The wallet shows ONLY the UNCOMMITTED REMAINDER — money not yet
// locked into a booked session. Once money funds a booking it leaves
// the visible balance and appears in "Upcoming sessions".
//
// Care profiles (drop-down): self / partner / child. Each profile =
// one therapist + one weekly slot + a per-profile subscription.
// Subscription = auto-recharge via Stripe + keeps the weekly slot.
//   • 1 session (no discount)  or  • 8-for-7 bundle (subscriber only).
//
// Auto-booking: money added to the wallet is immediately converted into
// bookings (whole multiples of the active profile's session price); the
// sub-session leftover stays as the visible remainder.
//
// Refunds always land in the wallet first; the only path back to the
// card is an explicit "wallet → card" pull (Stripe fee deducted).
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { Card, Button, Tag, BottomSheet, Select } from "@ds";

const STRIPE_FEE = 0.5; // mock flat Stripe fee (£) deducted on wallet→card refunds

// Mock care profiles. Each = one therapist + weekly slot + subscription.
const INITIAL_PROFILES = [
  {
    id: "self",
    name: { en: "Myself", fa: "خودم" },
    therapist: { en: "Dr. Sara Tehrani", fa: "دکتر سارا تهرانی" },
    slot: { en: "Mondays 18:00", fa: "دوشنبه‌ها ۱۸:۰۰" },
    price: 60,             // all-in £ per session (standard tier)
    premium: false,
    subscribed: true,
    rechargeSize: "bundle", // "single" | "bundle"
  },
  {
    id: "partner",
    name: { en: "Partner (couples)", fa: "همسر (زوج‌درمانی)" },
    therapist: { en: "Dr. Omid Karimi", fa: "دکتر امید کریمی" },
    slot: { en: "Wednesdays 20:00", fa: "چهارشنبه‌ها ۲۰:۰۰" },
    price: 90,             // premium therapist sets own all-in price
    premium: true,
    subscribed: false,
    rechargeSize: "single",
  },
  {
    id: "child",
    name: { en: "Sara (child)", fa: "سارا (کودک)" },
    therapist: { en: "Dr. Niloofar Rad", fa: "دکتر نیلوفر راد" },
    slot: { en: "Saturdays 10:00", fa: "شنبه‌ها ۱۰:۰۰" },
    price: 55,
    premium: false,
    subscribed: true,
    rechargeSize: "single",
  },
];

const INITIAL_UPCOMING = [
  {
    id: "up1",
    profileId: "self",
    therapist: { en: "Dr. Sara Tehrani", fa: "دکتر سارا تهرانی" },
    amount: 60,
    dateISO: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "up2",
    profileId: "self",
    therapist: { en: "Dr. Sara Tehrani", fa: "دکتر سارا تهرانی" },
    amount: 60,
    dateISO: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(),
  },
];

const PRESETS = [20, 80, 160];

export const Credits = ({
  walletBalance = 42,
  transactions = [],
  addTransaction,
}) => {
  const { t, lang, dir, n } = useLang();
  const isD = useIsDesktop();

  // Local GBP formatter — fmtCurrency from useLang is USD-only, so don't use it here.
  const gbp = (v) => "£" + n(Math.round(v));

  // ── Wallet + profile state (local mock) ───────────────────
  const [balance, setBalance] = useState(walletBalance);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [activeId, setActiveId] = useState(INITIAL_PROFILES[0].id);
  const [upcoming, setUpcoming] = useState(INITIAL_UPCOMING);
  const [topUpResult, setTopUpResult] = useState(null); // { booked, remainder }

  // ── Wallet → card refund sheet ────────────────────────────
  const [showRefund, setShowRefund] = useState(false);
  const [refundDone, setRefundDone] = useState(false);

  const active = profiles.find((p) => p.id === activeId) || profiles[0];

  const setActiveField = (field, value) =>
    setProfiles((prev) => prev.map((p) => (p.id === activeId ? { ...p, [field]: value } : p)));

  // ── Top-up + auto-booking simulation ──────────────────────
  const handleTopUp = (amount) => {
    const price = active.price;
    let pool = balance + amount;
    const booked = [];
    const now = Date.now();
    // Book whole sessions until the remainder drops below one session price.
    let i = upcoming.filter((u) => u.profileId === active.id).length;
    while (pool >= price) {
      pool -= price;
      i += 1;
      booked.push({
        id: `up${now}_${i}`,
        profileId: active.id,
        therapist: active.therapist,
        amount: price,
        dateISO: new Date(now + i * 7 * 24 * 3600 * 1000).toISOString(),
      });
    }
    setBalance(pool);
    if (booked.length) setUpcoming((prev) => [...prev, ...booked]);
    setTopUpResult({ booked: booked.length, remainder: pool });

    addTransaction?.("topup", amount, {
      description: {
        en: `Top-up ${gbp(amount)}`,
        fa: `شارژ ${gbp(amount)}`,
      },
    });
    if (booked.length) {
      addTransaction?.("booking", -booked.length * price, {
        description: {
          en: `Auto-booked ${booked.length} session${booked.length > 1 ? "s" : ""}`,
          fa: `${n(booked.length)} جلسه به‌صورت خودکار رزرو شد`,
        },
        therapistName: active.therapist,
      });
    }
  };

  // ── Cancel an upcoming (booked) session ───────────────────
  const handleCancel = (sess) => {
    const hoursUntil = (new Date(sess.dateISO).getTime() - Date.now()) / 3600000;
    const refundable = hoursUntil > 24;
    setUpcoming((prev) => prev.filter((u) => u.id !== sess.id));
    if (refundable) {
      setBalance((b) => b + sess.amount);
      addTransaction?.("patient_cancel_refund", sess.amount, {
        description: { en: "Cancellation refund (>24h) → wallet", fa: "بازگشت وجه لغو (بیش از ۲۴ ساعت) ← کیف پول" },
        therapistName: sess.therapist,
      });
    } else {
      addTransaction?.("late_cancel", -sess.amount, {
        description: { en: "Late cancellation (<24h) — charged", fa: "لغو دیرهنگام (کمتر از ۲۴ ساعت) — کسر شد" },
        therapistName: sess.therapist,
      });
    }
  };

  // ── Wallet → card refund ──────────────────────────────────
  const handleWalletRefund = () => {
    const returned = Math.max(0, balance - STRIPE_FEE);
    addTransaction?.("refund", -balance, {
      description: {
        en: `Wallet → card refund (−${gbp(STRIPE_FEE)} fee)`,
        fa: `بازگشت کیف پول ← کارت (−${gbp(STRIPE_FEE)} کارمزد)`,
      },
    });
    setBalance(0);
    setShowRefund(false);
    setRefundDone({ returned });
  };

  const pad = isD ? 24 : 12;
  const gap = isD ? 16 : 10;

  return (
    <div style={{ direction: dir, padding: `${pad}px ${pad}px ${isD ? pad : 80}px`, maxWidth: isD ? 860 : 480, margin: "0 auto" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: gap + 4 }}>
        <h1 className="ds-heading" style={{ fontSize: isD ? 24 : 19, color: "var(--ds-text)", marginBottom: 2 }}>
          {t("credits.title")}
        </h1>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("credits.subtitle")}</p>
      </div>

      {/* ── Care-profile dropdown ───────────────────────────── */}
      <div style={{ marginBottom: gap }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("credits.careProfile")}
        </label>
        <Select
          options={profiles.map((p) => ({ value: p.id, label: loc(p.name, lang) }))}
          value={activeId}
          onChange={(v) => { setActiveId(v); setTopUpResult(null); }}
        />
      </div>

      {/* ── Uncommitted remainder hero card ─────────────────── */}
      <WalletCard balance={balance} gbp={gbp} t={t} isD={isD} dir={dir} />

      {/* ── Active profile panel ────────────────────────────── */}
      <ProfilePanel
        profile={active}
        gbp={gbp}
        t={t}
        lang={lang}
        dir={dir}
        isD={isD}
        onToggleSub={(v) => setActiveField("subscribed", v)}
        onRechargeSize={(v) => setActiveField("rechargeSize", v)}
      />

      {/* ── Top up / recharge ───────────────────────────────── */}
      <div style={{ marginTop: gap + 4, marginBottom: gap + 4 }}>
        <h2 className="ds-heading" style={{ fontSize: isD ? 17 : 15, color: "var(--ds-text)", marginBottom: 2 }}>
          {t("credits.topUpTitle")}
        </h2>
        <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginBottom: 10, lineHeight: 1.5 }}>
          {t("credits.autoBookNote")}
        </p>
        <Card>
          <div style={{ display: "flex", gap: 8 }}>
            {PRESETS.map((amt) => (
              <Button
                key={amt}
                variant="primary"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => handleTopUp(amt)}
              >
                + {gbp(amt)}
              </Button>
            ))}
          </div>
          {topUpResult && (
            <div style={{
              marginTop: 10, padding: "8px 12px", borderRadius: RADIUS.sm,
              background: `${COLORS.success}14`,
              fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5,
            }}>
              {topUpResult.booked > 0
                ? t("credits.topUpBooked")
                    .replace("{n}", n(topUpResult.booked))
                    .replace("{rem}", gbp(topUpResult.remainder))
                : t("credits.topUpRemainder").replace("{rem}", gbp(topUpResult.remainder))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Upcoming booked sessions ────────────────────────── */}
      <UpcomingSessions
        sessions={upcoming}
        gbp={gbp}
        t={t}
        lang={lang}
        dir={dir}
        isD={isD}
        onCancel={handleCancel}
      />

      {/* ── Wallet → card refund ────────────────────────────── */}
      <Card variant="tinted" style={{ marginTop: gap + 4, marginBottom: gap + 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Ic n="info" s={15} c="var(--ds-text-mid)" />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{t("credits.refundPolicy")}</h3>
        </div>
        <p style={{ fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5, marginBottom: 10 }}>
          {t("credits.refundDetail")}
        </p>
        <Button variant="ghost2" size="sm" disabled={balance <= 0} onClick={() => { setRefundDone(false); setShowRefund(true); }} style={{ opacity: balance <= 0 ? 0.45 : 1 }}>
          <Ic n="send" s={12} c="var(--ds-text-mid)" />
          {t("credits.refundToCard")}
        </Button>
      </Card>

      {/* ── Refund success message ──────────────────────────── */}
      {refundDone && (
        <Card variant="tinted" style={{ marginBottom: gap + 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Ic n="check" s={16} c={COLORS.success} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", lineHeight: 1.5 }}>
              {t("credits.refundSuccess").replace("{amt}", gbp(refundDone.returned))}
            </p>
          </div>
        </Card>
      )}

      {/* ── Transaction history ─────────────────────────────── */}
      <TransactionHistory transactions={transactions} gbp={gbp} lang={lang} dir={dir} isD={isD} t={t} />

      {/* ── Wallet → card refund sheet ──────────────────────── */}
      {showRefund && (
        <BottomSheet onClose={() => setShowRefund(false)}>
          <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 6 }}>
            {t("credits.refundToCard")}
          </h2>
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", lineHeight: 1.55, marginBottom: 16 }}>
            {t("credits.refundIntro")}
          </p>

          <div style={{
            background: "var(--ds-cream)", borderRadius: RADIUS.md,
            padding: "12px 14px", marginBottom: 18,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <Row label={t("credits.walletBalance")} value={gbp(balance)} />
            <Row label={t("credits.stripeFee")} value={"−" + gbp(STRIPE_FEE)} />
            <div style={{ height: 1, background: "var(--ds-sand)", margin: "2px 0" }} />
            <Row label={t("credits.youReceive")} value={gbp(Math.max(0, balance - STRIPE_FEE))} bold />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" onClick={handleWalletRefund} style={{ flex: 1 }}>
              {t("credits.refundConfirm")}
            </Button>
            <Button variant="ghost2" onClick={() => setShowRefund(false)} style={{ flexShrink: 0 }}>
              {t("credits.refundCancel")}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

// ── Small label/value row ─────────────────────────────────────
function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--ds-text-mid)", fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 15 : 13, color: bold ? COLORS.primary : "var(--ds-text)", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

// ── Wallet hero card (teal gradient) ──────────────────────────
function WalletCard({ balance, gbp, t, isD, dir }) {
  const isRtl = dir === "rtl";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
      borderRadius: RADIUS.lg, padding: isD ? 22 : 18,
      color: "white", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -30,
        ...(isRtl ? { left: -30 } : { right: -30 }),
        width: 120, height: 120, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: isD ? 42 : 36, height: isD ? 42 : 36, borderRadius: 10,
            background: "rgba(255,255,255,0.18)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ic n="wallet" s={isD ? 21 : 18} c="white" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 1 }}>{t("credits.available")}</p>
            <p className="ds-heading" style={{ fontSize: isD ? 34 : 28, color: "white", lineHeight: 1 }}>
              {gbp(balance)}
            </p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
          {t("credits.availableHint")}
        </p>
      </div>
    </div>
  );
}

// ── Active profile panel ──────────────────────────────────────
function ProfilePanel({ profile, gbp, t, lang, dir, isD, onToggleSub, onRechargeSize }) {
  const therapist = loc(profile.therapist, lang);
  const slot = loc(profile.slot, lang);
  return (
    <Card style={{ marginTop: isD ? 16 : 10 }}>
      {/* Therapist + slot + price */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>{therapist}</p>
            {profile.premium && <Tag color="accent">{t("credits.premiumTag")}</Tag>}
          </div>
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
            <Ic n="cal" s={12} c="var(--ds-text-light)" />
            {slot}
          </p>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "left" : "right", flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{gbp(profile.price)}</p>
          <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>{t("credits.perSession")}</p>
        </div>
      </div>

      {/* Subscription toggle */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingTop: 12, borderTop: "1px solid var(--ds-sand)",
      }}>
        <ToggleSwitch checked={profile.subscribed} onChange={onToggleSub} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, color: "var(--ds-text)", fontWeight: 600 }}>
            {t("credits.subscriptionToggle")}
          </span>
          <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 1 }}>
            {t("credits.subscriptionHint")}
          </p>
        </div>
      </div>

      {/* When ON: recharge-size selector */}
      {profile.subscribed && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <RechargeOption
            active={profile.rechargeSize === "single"}
            title={t("credits.rechargeSingle")}
            sub={t("credits.rechargeSingleSub")}
            onClick={() => onRechargeSize("single")}
          />
          <RechargeOption
            active={profile.rechargeSize === "bundle"}
            title={t("credits.rechargeBundle")}
            sub={t("credits.rechargeBundleSub")}
            onClick={() => onRechargeSize("bundle")}
          />
        </div>
      )}

      {/* When OFF: slot-not-reserved warning */}
      {!profile.subscribed && (
        <div style={{
          background: `${COLORS.accent}14`, borderRadius: RADIUS.md,
          padding: "10px 12px", marginTop: 12,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Ic n="alert-triangle" s={16} c={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.55 }}>
            {t("credits.subscriptionWarning")}
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Recharge-size option pill ─────────────────────────────────
function RechargeOption({ active, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, textAlign: "start", cursor: "pointer", fontFamily: "inherit",
        padding: "10px 12px", borderRadius: RADIUS.md,
        border: `1.5px solid ${active ? COLORS.primary : "var(--ds-sand)"}`,
        background: active ? `${COLORS.primary}10` : "var(--ds-card-bg)",
        transition: "border 0.15s, background 0.15s",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: active ? COLORS.primary : "var(--ds-text)" }}>{title}</p>
      <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>{sub}</p>
    </button>
  );
}

// ── Upcoming booked sessions ──────────────────────────────────
function UpcomingSessions({ sessions, gbp, t, lang, dir, isD, onCancel }) {
  if (!sessions || sessions.length === 0) return null;
  const sorted = [...sessions].sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
  return (
    <div style={{ marginTop: isD ? 16 : 12 }}>
      <h2 className="ds-heading" style={{ fontSize: isD ? 17 : 15, color: "var(--ds-text)", marginBottom: 2 }}>
        {t("credits.upcomingTitle")}
      </h2>
      <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginBottom: 10 }}>{t("credits.upcomingSub")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((s) => {
          const hoursUntil = (new Date(s.dateISO).getTime() - Date.now()) / 3600000;
          const refundable = hoursUntil > 24;
          return (
            <Card key={s.id} variant="sm" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: RADIUS.sm, flexShrink: 0,
                background: `${COLORS.accent}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic n="cal" s={16} c={COLORS.accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {loc(s.therapist, lang)}
                </p>
                <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>
                  {formatTxDate(s.dateISO, lang)} · {gbp(s.amount)}
                </p>
              </div>
              <button
                onClick={() => onCancel(s)}
                title={refundable ? t("credits.cancelFree") : t("credits.cancelLate")}
                style={{
                  background: "none", border: "1px solid var(--ds-sand)", cursor: "pointer",
                  borderRadius: RADIUS.sm, padding: "5px 10px", flexShrink: 0,
                  fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                  color: refundable ? "var(--ds-text-mid)" : COLORS.danger,
                }}
              >
                {t("credits.cancel")}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
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

// ── Transaction history ─────────────────────────────────────
function loc(obj, lang) {
  if (typeof obj === "string") return obj;
  return obj?.[lang] || obj?.en || "";
}

const TX_META = {
  topup:                 { icon: "wallet",   color: COLORS.primary },
  purchase:              { icon: "wallet",   color: COLORS.primary },
  auto_renew:            { icon: "repeat",   color: COLORS.primary },
  booking:               { icon: "cal",      color: COLORS.accent  },
  patient_cancel_refund: { icon: "history",  color: COLORS.success },
  therapist_cancel_refund: { icon: "history", color: COLORS.success },
  late_cancel:           { icon: "alert-triangle", color: COLORS.danger },
  refund:                { icon: "history",  color: COLORS.success },
  voucher:               { icon: "gift",     color: COLORS.primary },
};

const TX_LABEL_KEY = {
  topup:                 "credits.txTopUp",
  purchase:              "credits.txTopUp",
  auto_renew:            "credits.txAutoRenew",
  booking:               "credits.txBooking",
  patient_cancel_refund: "credits.txPatientCancelFree",
  therapist_cancel_refund: "credits.txTherapistCancel",
  late_cancel:           "credits.txLateCancel",
  refund:                "credits.txRefund",
  voucher:               "credits.txVoucher",
};

function formatTxDate(iso, lang) {
  const d = new Date(iso);
  if (lang === "fa") return d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function downloadReceipt(tx, lang) {
  const lines = [
    "═══════════════════════════════════════",
    "       DELGOOSH — RECEIPT",
    "═══════════════════════════════════════",
    "",
    `Transaction ID:  ${tx.id}`,
    `Date:            ${new Date(tx.date).toLocaleString(lang === "fa" ? "fa-IR" : "en-US")}`,
    `Type:            ${tx.type}`,
    `Description:     ${loc(tx.description, lang)}`,
    `Amount:          ${tx.creditDelta > 0 ? "+" : ""}£${tx.creditDelta}`,
    "",
    "═══════════════════════════════════════",
    "  Thank you for using Delgoosh!",
    "═══════════════════════════════════════",
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `delgoosh-receipt-${tx.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function TransactionHistory({ transactions, gbp, lang, dir, isD, t }) {
  const PAGE_SIZE = 5;
  const [expanded, setExpanded] = useState(false);

  if (!transactions || transactions.length === 0) return null;

  const visible = expanded ? transactions : transactions.slice(0, PAGE_SIZE);
  const hasMore = transactions.length > PAGE_SIZE;

  return (
    <div>
      <h2 className="ds-heading" style={{ fontSize: isD ? 17 : 15, color: "var(--ds-text)", marginBottom: 10 }}>
        {t("credits.transactionHistory")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((tx) => {
          const meta = TX_META[tx.type] || { icon: "wallet", color: "var(--ds-text-mid)" };
          const delta = tx.creditDelta || 0;
          const deltaColor = delta > 0
            ? COLORS.success
            : delta < 0
              ? COLORS.danger
              : "var(--ds-text-light)";
          const deltaPrefix = delta > 0 ? "+" : delta < 0 ? "−" : "";

          return (
            <Card key={tx.id} variant="sm" style={{
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {/* Icon */}
              <div style={{
                width: 34, height: 34, borderRadius: RADIUS.sm, flexShrink: 0,
                background: `${meta.color}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic n={meta.icon} s={16} c={meta.color} />
              </div>

              {/* Description + date */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tx.description ? loc(tx.description, lang) : t(TX_LABEL_KEY[tx.type] || "credits.txTopUp")}
                </p>
                <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>
                  {formatTxDate(tx.date, lang)}
                </p>
              </div>

              {/* £ delta */}
              <div style={{ textAlign: dir === "rtl" ? "left" : "right", flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: deltaColor }}>
                  {delta === 0 ? "—" : `${deltaPrefix}${gbp(Math.abs(delta))}`}
                </p>
              </div>

              {/* Receipt download */}
              {tx.receiptAvailable && (
                <button
                  onClick={() => downloadReceipt(tx, lang)}
                  title={t("credits.downloadReceipt")}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 4,
                    flexShrink: 0, fontFamily: "inherit",
                  }}
                >
                  <Ic n="download" s={14} c="var(--ds-text-mid)" />
                </button>
              )}
            </Card>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            width: "100%", marginTop: 8, padding: "8px 0",
            background: "none", border: "1px solid var(--ds-border, rgba(255,255,255,.1))",
            borderRadius: RADIUS.sm, cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)",
            fontFamily: "inherit",
          }}
        >
          <Ic n="chev" s={14} c="var(--ds-text-mid)" style={{ transform: expanded ? "rotate(90deg)" : "rotate(-90deg)" }} />
          {expanded ? t("credits.showLess") : t("credits.showMore")}
        </button>
      )}
    </div>
  );
}
