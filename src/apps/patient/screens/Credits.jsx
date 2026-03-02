// ─────────────────────────────────────────────────────────────
// PATIENT / Credits
// ─────────────────────────────────────────────────────────────
// Two credit types:
//   1. Session credits — integer count, used to book therapy sessions
//   2. Chat credit — percentage gauge (0–110%), fuels AI Chat
//      - Starts at 20% free
//      - Convert 1 session credit → +100% chat credit
//      - Convert disabled when chatCredit > 10% (max 110%)
//
// Auto-renew toggle lives inside the balance card (default ON).
// When ON → buy buttons become "Subscribe".
// Voucher code input: test code "VOUCH" adds 1 session credit.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { Card, Button, Tag } from "@ds";

export const Credits = ({
  chatCredit = 20, setChatCredit,
  sessionCredits = 3, setSessionCredits,
  autoRenew = true, setAutoRenew,
  transactions = [], addTransaction,
}) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();

  const [voucher, setVoucher] = useState("");
  const [voucherMsg, setVoucherMsg] = useState(null); // null | { type: "success"|"error", text }

  // Convert handler
  const canConvert = chatCredit <= 10 && sessionCredits > 0;
  const handleConvert = () => {
    if (!canConvert) return;
    setSessionCredits((s) => s - 1);
    setChatCredit?.((c) => Math.min(c + 100, 110));
  };

  // Voucher handler
  const handleVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (!code) return;
    if (code === "VOUCH") {
      setSessionCredits((s) => s + 1);
      addTransaction?.("voucher", 1, {
        description: { en: "Voucher redeemed — VOUCH", fa: "کد تخفیف استفاده شد — VOUCH" },
      });
      setVoucherMsg({ type: "success", text: t("credits.voucherSuccess") });
      setVoucher("");
    } else {
      setVoucherMsg({ type: "error", text: t("credits.voucherError") });
    }
  };

  // Buy handler
  const handleBuy = (amount) => {
    setSessionCredits((s) => s + amount);
    const txType = autoRenew ? "auto_renew" : "purchase";
    addTransaction?.(txType, amount, {
      description: amount === 1
        ? { en: `${autoRenew ? "Subscription" : "Purchased"} — 1 session credit`, fa: `${autoRenew ? "اشتراک" : "خرید"} — ۱ اعتبار جلسه` }
        : { en: `${autoRenew ? "Subscription" : "Purchased"} — ${amount} session credits`, fa: `${autoRenew ? "اشتراک" : "خرید"} — ${amount} اعتبار جلسه` },
    });
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

      {/* ── Top row: Session credit + Chat credit ─────────── */}
      <div style={{
        display: "flex",
        flexDirection: isD ? "row" : "column",
        gap,
        marginBottom: !autoRenew ? 0 : gap + 4,
      }}>
        {/* Session credits — teal gradient card with auto-renew toggle */}
        <SessionCreditCard
          credits={sessionCredits}
          autoRenew={autoRenew}
          onToggleSub={(v) => setAutoRenew?.(v)}
          t={t}
          isD={isD}
          dir={dir}
        />

        {/* Chat credit gauge card */}
        <ChatCreditCard
          chatCredit={chatCredit}
          sessionCredits={sessionCredits}
          canConvert={canConvert}
          onConvert={handleConvert}
          t={t}
          isD={isD}
          dir={dir}
        />
      </div>

      {/* ── Warning when auto-renew is OFF ────────────────── */}
      {!autoRenew && (
        <div style={{
          background: `${COLORS.accent}14`, borderRadius: RADIUS.md,
          padding: "10px 12px", marginTop: gap, marginBottom: gap + 4,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Ic n="alert-triangle" s={16} c={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", lineHeight: 1.55 }}>
            {t("credits.subscriptionWarning")}
          </p>
        </div>
      )}

      {/* ── Buy / Subscribe credits section ──────────────── */}
      <div style={{ marginBottom: gap + 4 }}>
        <h2 className="ds-heading" style={{ fontSize: isD ? 17 : 15, color: "var(--ds-text)", marginBottom: 10 }}>
          {t("credits.buyCredit")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <BuyCard
            title={t("credits.single")}
            sub={t("credits.singleSub")}
            btnLabel={autoRenew ? t("credits.subscribe") : t("credits.buy")}
            onBuy={() => handleBuy(1)}
          />
          <BuyCard
            title={t("credits.pack4")}
            badge={t("credits.popularBadge")}
            badgeColor="accent"
            btnLabel={autoRenew ? t("credits.subscribeBundle") : t("credits.buyBundle")}
            onBuy={() => handleBuy(4)}
          />
          <BuyCard
            title={t("credits.pack6")}
            badge={t("credits.bestValueBadge")}
            badgeColor="success"
            btnLabel={autoRenew ? t("credits.subscribeBundle") : t("credits.buyBundle")}
            onBuy={() => handleBuy(6)}
          />
        </div>
      </div>

      {/* ── Voucher code ────────────────────────────────────── */}
      <div style={{ marginBottom: gap + 4 }}>
        <h2 className="ds-heading" style={{ fontSize: isD ? 17 : 15, color: "var(--ds-text)", marginBottom: 10 }}>
          {t("credits.voucherTitle")}
        </h2>
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
            <Button
              variant="primary"
              size="sm"
              onClick={handleVoucher}
              style={{ flexShrink: 0 }}
            >
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

      {/* ── Refund policy ─────────────────────────────────── */}
      <Card variant="tinted" style={{ marginBottom: gap + 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Ic n="info" s={15} c="var(--ds-text-mid)" />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{t("credits.refundPolicy")}</h3>
        </div>
        <p style={{ fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5, marginBottom: 10 }}>
          {t("credits.refundDetail")}
        </p>
        <Button variant="ghost2" size="sm">
          <Ic n="send" s={12} c="var(--ds-text-mid)" />
          {t("credits.requestRefund")}
        </Button>
      </Card>

      {/* ── Transaction history ────────────────────────────── */}
      <TransactionHistory transactions={transactions} lang={lang} dir={dir} isD={isD} t={t} />
    </div>
  );
};

// ── Session credit card (teal gradient) with auto-renew toggle ──
function SessionCreditCard({ credits, autoRenew, onToggleSub, t, isD, dir }) {
  const isRtl = dir === "rtl";
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
      borderRadius: RADIUS.lg, padding: isD ? 20 : 16,
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
            width: isD ? 40 : 34, height: isD ? 40 : 34, borderRadius: 10,
            background: "rgba(255,255,255,0.18)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ic n="wallet" s={isD ? 20 : 17} c="white" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 1 }}>{t("credits.balance")}</p>
            <p className="ds-heading" style={{ fontSize: isD ? 30 : 24, color: "white", lineHeight: 1 }}>
              {credits}
            </p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
          {credits} {t("credits.remaining")}
        </p>

        {/* Auto-renew toggle row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.15)",
        }}>
          <ToggleSwitch checked={autoRenew} onChange={onToggleSub} light />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            {t("credits.subscriptionToggle")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Chat credit gauge card ────────────────────────────────────
function ChatCreditCard({ chatCredit, sessionCredits, canConvert, onConvert, t, isD }) {
  const gaugeColor = chatCredit > 50
    ? COLORS.primary
    : chatCredit >= 20
      ? COLORS.accent
      : COLORS.danger;

  const gaugeWidth = Math.min(100, (chatCredit / 110) * 100);

  const disabledText = sessionCredits === 0
    ? t("credits.noSessionCredits")
    : t("credits.convertDisabled");

  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: isD ? 40 : 34, height: isD ? 40 : 34, borderRadius: 10,
            background: `${gaugeColor}14`, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ic n="zap" s={isD ? 20 : 17} c={gaugeColor} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginBottom: 1 }}>{t("credits.chatCredit")}</p>
            <p className="ds-heading" style={{ fontSize: isD ? 30 : 24, color: "var(--ds-text)", lineHeight: 1 }}>
              {chatCredit}%
            </p>
          </div>
        </div>
        {chatCredit === 20 && (
          <Tag color="success">{t("credits.freeGift")}</Tag>
        )}
      </div>

      {/* Fuel gauge bar */}
      <div style={{
        height: 8, borderRadius: RADIUS.pill,
        background: "var(--ds-cream)", overflow: "hidden",
        marginBottom: 4,
      }}>
        <div style={{
          height: "100%", borderRadius: RADIUS.pill,
          background: gaugeColor,
          width: `${gaugeWidth}%`,
          transition: "width 0.4s ease, background 0.4s ease",
        }} />
      </div>
      <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginBottom: 10 }}>
        {chatCredit}% {t("credits.chatCreditLeft")}
      </p>

      {/* Convert button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onConvert}
        disabled={!canConvert}
        style={{
          width: "100%",
          opacity: canConvert ? 1 : 0.45,
          cursor: canConvert ? "pointer" : "not-allowed",
        }}
      >
        <Ic n="repeat" s={13} c={canConvert ? COLORS.primary : "var(--ds-text-light)"} />
        {t("credits.convertCredit")}
      </Button>
      {!canConvert && (
        <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 4, textAlign: "center" }}>
          {disabledText}
        </p>
      )}
    </Card>
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
  purchase:              { icon: "wallet",   color: COLORS.primary },
  auto_renew:            { icon: "repeat",   color: COLORS.primary },
  booking:               { icon: "cal",      color: COLORS.accent  },
  patient_cancel_refund: { icon: "history",  color: COLORS.success },
  therapist_cancel_refund: { icon: "history", color: COLORS.success },
  voucher:               { icon: "gift",     color: COLORS.primary },
};

const TX_LABEL_KEY = {
  purchase:              "credits.txPurchase",
  auto_renew:            "credits.txAutoRenew",
  booking:               "credits.txBooking",
  patient_cancel_refund: "credits.txPatientCancelFree",
  therapist_cancel_refund: "credits.txTherapistCancel",
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
    `Credit change:   ${tx.creditDelta > 0 ? "+" : ""}${tx.creditDelta}`,
    `Balance after:   ${tx.balanceAfter}`,
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

function TransactionHistory({ transactions, lang, dir, isD, t }) {
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
          const deltaColor = tx.creditDelta > 0
            ? COLORS.success
            : tx.creditDelta < 0
              ? COLORS.danger
              : "var(--ds-text-light)";
          const deltaPrefix = tx.creditDelta > 0 ? "+" : "";
          const deltaLabel = tx.creditDelta === 0
            ? t("credits.noRefund")
            : tx.creditDelta > 0
              ? `${Math.abs(tx.creditDelta)} ${t("credits.creditAdded")}`
              : `${Math.abs(tx.creditDelta)} ${t("credits.creditUsed")}`;

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
                  {tx.description ? loc(tx.description, lang) : t(TX_LABEL_KEY[tx.type] || "credits.txPurchase")}
                </p>
                <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>
                  {formatTxDate(tx.date, lang)}
                </p>
              </div>

              {/* Delta + balance */}
              <div style={{ textAlign: dir === "rtl" ? "left" : "right", flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: deltaColor }}>
                  {deltaPrefix}{tx.creditDelta}
                </p>
                <p style={{ fontSize: 9, color: "var(--ds-text-light)" }}>
                  {deltaLabel}
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

// ── Buy card ──────────────────────────────────────────────────
function BuyCard({ title, sub, badge, badgeColor, btnLabel, onBuy }) {
  return (
    <Card variant="sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
          {badge && <Tag color={badgeColor}>{badge}</Tag>}
        </div>
        {sub && <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 1 }}>{sub}</p>}
      </div>
      <Button variant="primary" size="sm" style={{ flexShrink: 0 }} onClick={onBuy}>
        {btnLabel}
      </Button>
    </Card>
  );
}
