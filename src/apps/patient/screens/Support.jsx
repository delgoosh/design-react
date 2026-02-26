// ─────────────────────────────────────────────────────────────
// PATIENT / Support
// ─────────────────────────────────────────────────────────────
// Props: navigate
// ─────────────────────────────────────────────────────────────
import { useLang, useIsDesktop, Card, Tag, Button, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Mock tickets ─────────────────────────────────────────────
const MOCK_TICKETS = [
  {
    id: "T-1024",
    subject:   { en: "Video call keeps disconnecting", fa: "تماس ویدیویی مدام قطع می‌شود" },
    type:      "technical",
    status:    "open",
    createdAt: { en: "Feb 24", fa: "۵ اسفند" },
  },
  {
    id: "T-1021",
    subject:   { en: "Credit not applied after purchase", fa: "اعتبار پس از خرید اعمال نشد" },
    type:      "financial",
    status:    "resolved",
    createdAt: { en: "Feb 18", fa: "۲۹ بهمن" },
  },
];

const STATUS_TAG_COLOR = {
  open:       "accent",
  inReview:   "primary",
  resolved:   "success",
};

function loc(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}

// ── Ticket card ──────────────────────────────────────────────
const TicketCard = ({ ticket, lang, t }) => {
  const statusKey = ticket.status === "inReview" ? "inReview" : ticket.status;
  return (
    <Card variant="sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--ds-text-light)", fontWeight: 600 }}>
          #{ticket.id}
        </span>
        <Tag color={STATUS_TAG_COLOR[ticket.status] || "neutral"}>
          {t(`support.statuses.${statusKey}`)}
        </Tag>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)", lineHeight: 1.4 }}>
        {loc(ticket.subject, lang)}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tag color="neutral" style={{ gap: 4, display: "flex", alignItems: "center" }}>
          <Ic n="info" s={10} c="var(--ds-text-mid)" />
          {t(`support.issueTypes.${ticket.type}`)}
        </Tag>
        <span style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
          {loc(ticket.createdAt, lang)}
        </span>
      </div>
    </Card>
  );
};

// ── Main Component ───────────────────────────────────────────
export const Support = ({ navigate }) => {
  const { lang, dir, t } = useLang();
  const isD = useIsDesktop();

  const gap = isD ? 20 : 14;
  const pad = isD ? 28 : 16;

  return (
    <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
      {/* ── Back button (mobile) ──────────────────────── */}
      {!isD && (
        <button
          onClick={() => navigate?.("profile")}
          style={{
            display: "flex", alignItems: "center", gap: 4, marginBottom: 12,
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, color: COLORS.primary, fontWeight: 600, padding: 0,
          }}
        >
          <Ic n="chev" s={14} c={COLORS.primary} style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
          {t("action.back")}
        </button>
      )}

      {/* ── Header ──────────────────────────────────── */}
      <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", marginBottom: 4 }}>
        {t("support.title")}
      </h1>
      <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginBottom: gap }}>
        {t("support.subtitle")}
      </p>

      {/* ── New ticket button ─────────────────────────── */}
      <Button variant="primary" style={{ width: "100%", marginBottom: gap }}>
        <Ic n="plus" s={14} c="#fff" style={{ marginInlineEnd: 6 }} />
        {t("support.newTicket")}
      </Button>

      {/* ── My tickets ────────────────────────────────── */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 10 }}>
        {t("support.myTickets")}
      </p>

      {MOCK_TICKETS.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <Ic n="support" s={40} c="var(--ds-text-light)" />
          <p style={{ fontSize: 14, color: "var(--ds-text-mid)", marginTop: 12 }}>
            {t("support.newTicket")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_TICKETS.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} lang={lang} t={t} />
          ))}
        </div>
      )}
    </div>
  );
};
