// ─────────────────────────────────────────────────────────────
// THERAPIST / Earnings
// ─────────────────────────────────────────────────────────────
// Balance hero · stat cards · income rules · transaction history
// Withdrawal flow with TRC20 / ERC20 crypto support
// TODO(backend-integration): replace MOCK_TX with real API data
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Button, Ic, BottomSheet, Select } from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Constants ──────────────────────────────────────────────────
const SESSION_RATE = 15; // $15 per session
const PENALTY_RATE = 0.5; // 50% deduction for late cancel
const GAS_FEE = 3; // flat gas fee
const GAS_THRESHOLD = 300; // under this balance → gas fee applies

// ── Explorer helpers ────────────────────────────────────────────
const explorerUrl = (network, txHash) =>
  network === "ERC20"
    ? `https://etherscan.io/tx/${txHash}`
    : `https://tronscan.org/#/transaction/${txHash}`;

const explorerName = (network) =>
  network === "ERC20" ? "Etherscan" : "Tronscan";

// ── Mock transaction data ──────────────────────────────────────
// type: "session" | "penalty" | "withdrawal" | "gas"
// withdrawal entries: status "pending" | "completed", network, wallet, txHash (if completed)
const INITIAL_TX = [
  { id: 1,  type: "session",    date: "2026-02-01", amount: SESSION_RATE,                  patient: { en: "Zahra Karimi",     fa: "زهرا کریمی" } },
  { id: 2,  type: "session",    date: "2026-02-05", amount: SESSION_RATE,                  patient: { en: "Sara Mohammadi",   fa: "سارا محمدی" } },
  { id: 3,  type: "session",    date: "2026-02-08", amount: SESSION_RATE,                  patient: { en: "Ali Rezaei",       fa: "علی رضایی" } },
  { id: 4,  type: "session",    date: "2026-02-12", amount: SESSION_RATE,                  patient: { en: "Maryam Hosseini",  fa: "مریم حسینی" } },
  { id: 5,  type: "session",    date: "2026-02-15", amount: SESSION_RATE,                  patient: { en: "Nima Tavakoli",    fa: "نیما توکلی" } },
  { id: 6,  type: "penalty",    date: "2026-02-18", amount: +(SESSION_RATE * PENALTY_RATE).toFixed(2), patient: { en: "Zahra Karimi", fa: "زهرا کریمی" } },
  { id: 7,  type: "session",    date: "2026-02-22", amount: SESSION_RATE,                  patient: { en: "Sara Mohammadi",   fa: "سارا محمدی" } },
  { id: 8,  type: "session",    date: "2026-02-24", amount: SESSION_RATE,                  patient: { en: "Ali Rezaei",       fa: "علی رضایی" } },
  { id: 9,  type: "gas",        date: "2026-02-25", amount: GAS_FEE },
  { id: 10, type: "withdrawal", date: "2026-02-25", amount: 57, status: "completed", network: "ERC20", wallet: "0xABcDeF1234567890abcDEF1234567890aBcDEF78", txHash: "0xd4f8a2b3c5e6f7890123456789abcdef01234567890abcdef01234567890ab3a1" },
  { id: 11, type: "session",    date: "2026-03-01", amount: SESSION_RATE,                  patient: { en: "Maryam Hosseini",  fa: "مریم حسینی" } },
  { id: 12, type: "session",    date: "2026-03-03", amount: SESSION_RATE,                  patient: { en: "Nima Tavakoli",    fa: "نیما توکلی" } },
];

// ── Compute running balances ────────────────────────────────────
function computeBalances(txs) {
  let bal = 0;
  return txs.map((tx) => {
    const before = bal;
    if (tx.type === "session") bal += tx.amount;
    else bal -= tx.amount; // penalty, withdrawal, gas are deductions
    return { ...tx, balBefore: before, balAfter: bal };
  });
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n) => {
  const abs = Math.abs(n);
  return abs % 1 === 0 ? `$${abs}` : `$${abs.toFixed(2)}`;
};

const fmtDate = (iso, lang) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", {
    month: "short",
    day: "numeric",
  });
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ── WithdrawSheet ───────────────────────────────────────────────
const WithdrawSheet = ({ balance, savedWallet, onConfirm, onClose, t, dir, isD }) => {
  const [network, setNetwork] = useState(savedWallet.network || "TRC20");
  const [address, setAddress] = useState(savedWallet.address || "");

  const hasGas = balance < GAS_THRESHOLD;
  const fee = hasGas ? GAS_FEE : 0;
  const finalAmt = balance - fee;
  const canConfirm = balance > 0 && address.trim().length > 5;

  return (
    <BottomSheet onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: COLORS.primaryGhost,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ic n="money" s={18} c={COLORS.primary} />
        </div>
        <p className="ds-heading" style={{ fontSize: 18 }}>{t("earnings.withdrawTitle")}</p>
      </div>

      {/* Network select */}
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
        {t("earnings.network")}
      </label>
      <Select
        value={network}
        onChange={setNetwork}
        options={[
          { value: "TRC20", label: "TRC20 (Tron)" },
          { value: "ERC20", label: "ERC20 (Ethereum)" },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Wallet address */}
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
        {t("earnings.walletAddress")}
      </label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t("earnings.walletPlaceholder")}
        dir="ltr"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", fontSize: 13,
          borderRadius: RADIUS.sm,
          border: "1.5px solid var(--ds-sand)",
          background: "var(--ds-card-bg)",
          color: "var(--ds-text)",
          fontFamily: "monospace",
        }}
      />

      {/* Summary box */}
      <div style={{
        marginTop: 16, padding: "12px 14px",
        borderRadius: RADIUS.sm,
        background: "var(--ds-bg)",
        border: "1px solid var(--ds-card-border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ds-text)", marginBottom: 4 }}>
          <span>{t("earnings.fullBalance")}</span>
          <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(balance)}</span>
        </div>
        {hasGas && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.warn, marginBottom: 4 }}>
            <span>{t("earnings.gasFee")}</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>−{fmt(fee)}</span>
          </div>
        )}
        <div style={{ borderTop: "1px solid var(--ds-card-border)", marginTop: 4, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span style={{ fontWeight: 700, color: COLORS.primary }}>{t("earnings.finalAmount")}</span>
          <span style={{ fontWeight: 700, color: COLORS.primary, fontVariantNumeric: "tabular-nums" }}>{fmt(finalAmt)}</span>
        </div>
      </div>

      {/* Gas note */}
      {hasGas && (
        <p style={{ fontSize: 11, color: COLORS.warn, marginTop: 6, lineHeight: 1.5 }}>
          {t("earnings.gasFeeNote")}
        </p>
      )}

      {/* Warnings */}
      <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginTop: 10, lineHeight: 1.5 }}>
        {t("earnings.walletWarning")}
      </p>
      <p style={{ fontSize: 11, color: "var(--ds-text-mid)", marginTop: 4, lineHeight: 1.5 }}>
        {t("earnings.processingNote")}
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Button
          variant="primary"
          size="md"
          style={{ flex: 1, opacity: canConfirm ? 1 : 0.45, pointerEvents: canConfirm ? "auto" : "none" }}
          onClick={() => canConfirm && onConfirm({ network, address, amount: balance, fee })}
        >
          {t("earnings.confirmWithdraw")}
        </Button>
        <Button variant="ghost" size="md" onClick={onClose}>
          {t("auth.back")}
        </Button>
      </div>

      {/* No balance message */}
      {balance <= 0 && (
        <p style={{ textAlign: "center", fontSize: 12, color: COLORS.danger, marginTop: 10 }}>
          {t("earnings.noBalance")}
        </p>
      )}
    </BottomSheet>
  );
};

// ── Component ──────────────────────────────────────────────────
export const Earnings = () => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const [showAll, setShowAll] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txList, setTxList] = useState(INITIAL_TX);
  const [savedWallet, setSavedWallet] = useState(() => {
    // Pre-populate from last completed withdrawal in mock data
    const lastW = [...INITIAL_TX].reverse().find((tx) => tx.type === "withdrawal" && tx.wallet);
    return { network: lastW?.network || "TRC20", address: lastW?.wallet || "" };
  });

  const gap = isD ? 20 : 14;

  // ── Computed balances ──────────────────────────────────────────
  const txWithBal = computeBalances(txList);
  const currentBalance = txWithBal[txWithBal.length - 1]?.balAfter ?? 0;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthSessions = txWithBal.filter(
    (tx) => tx.type === "session" && tx.date.startsWith(thisMonth),
  ).length;

  const totalSessions = txWithBal.filter((tx) => tx.type === "session").length;
  const grossEarnings = totalSessions * SESSION_RATE;
  const totalPenalties = txWithBal.filter((tx) => tx.type === "penalty").reduce((s, tx) => s + tx.amount, 0);
  const totalWithdrawn = txWithBal.filter((tx) => tx.type === "withdrawal").reduce((s, tx) => s + tx.amount, 0);

  // Display newest-first; show 5 initially
  const txReversed = [...txWithBal].reverse();
  const txVisible = showAll ? txReversed : txReversed.slice(0, 5);

  // ── Withdrawal handler ─────────────────────────────────────────
  const handleWithdraw = ({ network, address, amount, fee }) => {
    const nextId = Math.max(...txList.map((tx) => tx.id)) + 1;
    const dateStr = today();
    const newTxs = [];

    // Gas fee tx (if applicable)
    if (fee > 0) {
      newTxs.push({ id: nextId, type: "gas", date: dateStr, amount: fee });
    }

    // Withdrawal tx (pending — no txHash yet)
    const withdrawAmt = amount - fee;
    newTxs.push({
      id: nextId + (fee > 0 ? 1 : 0),
      type: "withdrawal",
      date: dateStr,
      amount: withdrawAmt,
      status: "pending",
      network,
      wallet: address,
    });

    setTxList((prev) => [...prev, ...newTxs]);
    setSavedWallet({ network, address });
    setShowWithdraw(false);
  };

  // ── Stat card data ───────────────────────────────────────────
  const stats = [
    { icon: "cal",   value: monthSessions, label: t("earnings.monthSessions"), color: COLORS.primaryDark },
    { icon: "money", value: t("earnings.perSessionRate"), label: t("earnings.grossEarnings") + `: ${fmt(grossEarnings)}`, color: COLORS.success },
    { icon: "alert", value: fmt(totalPenalties), label: t("earnings.penalties"), color: COLORS.warn },
    { icon: "money", value: fmt(totalWithdrawn), label: t("earnings.totalWithdrawn"), color: COLORS.accent },
  ];

  // ── Rules data ───────────────────────────────────────────────
  const rules = [
    { icon: "check", color: COLORS.success, text: t("earnings.rulePerSession") },
    { icon: "alert", color: COLORS.warn,    text: t("earnings.ruleLateCancel") },
    { icon: "alert", color: COLORS.danger,  text: t("earnings.ruleNoShow") },
    { icon: "alert", color: COLORS.warn,    text: t("earnings.ruleLateStart") },
  ];

  // ── TX row style helpers ─────────────────────────────────────
  const txColor = (type) =>
    type === "session" ? COLORS.success
    : type === "penalty" ? COLORS.danger
    : type === "gas" ? COLORS.warn
    : COLORS.accent;

  const txSign = (type) => (type === "session" ? "+" : "−");

  const txLabel = (type) =>
    type === "session"    ? t("earnings.sessionIncome")
    : type === "penalty"  ? t("earnings.penaltyDeduction")
    : type === "gas"      ? t("earnings.gasFeeTx")
    : t("earnings.withdrawal");

  return (
    <div style={{ direction: dir, padding: isD ? "28px 32px 40px" : "22px 16px 100px" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <h1 className="ds-heading" style={{ fontSize: isD ? 28 : 24, marginBottom: 4 }}>
        {t("earnings.title")}
      </h1>

      {/* ── Hero: balance + CTA ─────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          borderRadius: RADIUS.xl,
          padding: isD ? "32px 36px" : "24px 20px",
          marginTop: gap,
          color: "#fff",
        }}
      >
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
          {t("earnings.withdrawable")}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <p
            className="ds-heading"
            style={{ fontSize: isD ? 48 : 40, lineHeight: 1, color: "#fff" }}
          >
            {fmt(currentBalance)}
          </p>
          <span style={{ fontSize: 14, opacity: 0.65 }}>{t("earnings.currency")}</span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
          {thisMonth.replace("-", "/")} · {monthSessions} {t("earnings.sessions")} × ${SESSION_RATE}
          {totalPenalties > 0 ? ` − ${fmt(totalPenalties)} ${t("earnings.penalties").toLowerCase()}` : ""}
        </p>
        <Button
          variant="dark"
          size="md"
          onClick={() => setShowWithdraw(true)}
          style={{
            marginTop: 16,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <Ic n="money" s={15} c="#fff" />
          {t("earnings.requestWithdraw")}
        </Button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isD ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
          gap,
          marginTop: gap,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "var(--ds-card-bg)",
              borderRadius: 14,
              padding: isD ? "12px 14px" : "10px 12px",
              border: "1px solid var(--ds-card-border)",
              boxShadow: "var(--ds-shadow-stat)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: isD ? 32 : 28,
                  height: isD ? 32 : 28,
                  background: `${s.color}14`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Ic n={s.icon} s={isD ? 15 : 14} c={s.color} />
              </div>
              <p
                className="ds-heading"
                style={{ fontSize: isD ? 22 : 20, color: "var(--ds-text)", lineHeight: 1 }}
              >
                {s.value}
              </p>
            </div>
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Income rules ────────────────────────────────────── */}
      <Card style={{ marginTop: gap }}>
        <p className="ds-heading" style={{ fontSize: 16, marginBottom: 10 }}>
          {t("earnings.rules")}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ic n={r.icon} s={16} c={r.color} />
              <p style={{ fontSize: 13, color: "var(--ds-text)" }}>{r.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Transaction history ─────────────────────────────── */}
      <div style={{ marginTop: gap + 4 }}>
        <p className="ds-heading" style={{ fontSize: 16, marginBottom: 8 }}>
          {t("earnings.transactionHistory")}
        </p>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {txVisible.map((tx, idx) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: isD ? "8px 14px" : "7px 10px",
                borderBottom: idx < txVisible.length - 1 ? "1px solid var(--ds-card-border)" : "none",
              }}
            >
              {/* Amount — fixed width */}
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: txColor(tx.type),
                  minWidth: isD ? 58 : 50,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {txSign(tx.type)}{fmt(tx.amount)}
              </span>

              {/* Middle: label · patient / status / explorer */}
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ds-text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{txLabel(tx.type)}</span>
                  {tx.patient && (
                    <span style={{ color: "var(--ds-text-mid)" }}>
                      {" · "}{tx.patient[lang] || tx.patient.en}
                    </span>
                  )}
                  {/* Withdrawal status tag */}
                  {tx.type === "withdrawal" && tx.status === "pending" && (
                    <span style={{
                      marginInlineStart: 6, fontSize: 10, fontWeight: 700,
                      padding: "1px 6px", borderRadius: 4,
                      background: COLORS.warnGhost, color: COLORS.warn,
                    }}>
                      {t("earnings.pendingStatus")}
                    </span>
                  )}
                  {tx.type === "withdrawal" && tx.status === "completed" && (
                    <span style={{
                      marginInlineStart: 6, fontSize: 10, fontWeight: 700,
                      padding: "1px 6px", borderRadius: 4,
                      background: COLORS.successGhost, color: COLORS.success,
                    }}>
                      {t("earnings.completedStatus")}
                    </span>
                  )}
                </p>
                {/* Explorer link for completed withdrawals */}
                {tx.type === "withdrawal" && tx.status === "completed" && tx.txHash && (
                  <a
                    href={explorerUrl(tx.network, tx.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 10, color: COLORS.primary,
                      textDecoration: "none", fontWeight: 500,
                    }}
                  >
                    {t("earnings.viewOnExplorer")} {explorerName(tx.network)} {dir === "rtl" ? "←" : "→"}
                  </a>
                )}
              </div>

              {/* Right: balance annotation + date */}
              <div style={{ flexShrink: 0, textAlign: "end" }}>
                <p style={{ fontSize: 11, color: "var(--ds-text-mid)", fontVariantNumeric: "tabular-nums" }}>
                  {fmtDate(tx.date, lang)}
                </p>
                <p style={{ fontSize: 10, color: "var(--ds-text-mid)", opacity: 0.65, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(tx.balBefore)} → {fmt(tx.balAfter)}
                </p>
              </div>
            </div>
          ))}
        </Card>

        {/* Show more / show less */}
        {txReversed.length > 5 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{
              marginTop: 8,
              background: "none",
              border: "none",
              color: COLORS.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: "2px 0",
              fontFamily: "inherit",
            }}
          >
            {showAll ? t("credits.showLess") : t("credits.showMore")} {!showAll && `(${txReversed.length - 5})`}
          </button>
        )}
      </div>

      {/* ── Withdrawal BottomSheet ─────────────────────────── */}
      {showWithdraw && (
        <WithdrawSheet
          balance={currentBalance}
          savedWallet={savedWallet}
          onConfirm={handleWithdraw}
          onClose={() => setShowWithdraw(false)}
          t={t}
          dir={dir}
          isD={isD}
        />
      )}
    </div>
  );
};
