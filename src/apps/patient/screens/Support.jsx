// ─────────────────────────────────────────────────────────────
// PATIENT / Support
// ─────────────────────────────────────────────────────────────
// Props: navigate
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Ic, BottomSheet, Select, Textarea, RadioGroup } from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Mock tickets with messages ──────────────────────────────
const INITIAL_TICKETS = [
  {
    id: "T-1024",
    subject:   { en: "Video call keeps disconnecting", fa: "تماس ویدیویی مدام قطع می‌شود" },
    type:      "technical",
    priority:  "important",
    status:    "open",
    createdAt: { en: "Feb 24", fa: "۵ اسفند" },
    messages: [
      { id: "m1", from: "user",    text: { en: "My video calls disconnect after about 5 minutes every time. I've tried different browsers.", fa: "تماس ویدیویی من هر بار بعد از حدود ۵ دقیقه قطع می‌شود. مرورگرهای مختلف را امتحان کردم." }, time: { en: "Feb 24, 10:30 AM", fa: "۵ اسفند، ۱۰:۳۰" } },
      { id: "m2", from: "support", text: { en: "Thank you for reaching out. Could you let us know your internet connection speed? You can check at fast.com.", fa: "ممنون از تماس شما. لطفاً سرعت اینترنت خود را بررسی کنید. می‌توانید در fast.com ببینید." }, time: { en: "Feb 24, 11:15 AM", fa: "۵ اسفند، ۱۱:۱۵" } },
    ],
  },
  {
    id: "T-1021",
    subject:   { en: "Credit not applied after purchase", fa: "اعتبار پس از خرید اعمال نشد" },
    type:      "financial",
    priority:  "normal",
    status:    "resolved",
    createdAt: { en: "Feb 18", fa: "۲۹ بهمن" },
    messages: [
      { id: "m1", from: "user",    text: { en: "I purchased a 5-session package but my account still shows 0 credits.", fa: "بسته ۵ جلسه‌ای خریدم اما حسابم هنوز ۰ اعتبار نشان می‌دهد." }, time: { en: "Feb 18, 2:00 PM", fa: "۲۹ بهمن، ۱۴:۰۰" } },
      { id: "m2", from: "support", text: { en: "We're looking into this. Could you share the transaction confirmation email?", fa: "در حال بررسی هستیم. لطفاً ایمیل تأیید تراکنش را به اشتراک بگذارید." }, time: { en: "Feb 18, 2:45 PM", fa: "۲۹ بهمن، ۱۴:۴۵" } },
      { id: "m3", from: "user",    text: { en: "Here's the confirmation number: TXN-88421", fa: "شماره تأیید: TXN-88421" }, time: { en: "Feb 18, 3:10 PM", fa: "۲۹ بهمن، ۱۵:۱۰" } },
      { id: "m4", from: "support", text: { en: "Credits have been applied to your account. Sorry for the inconvenience!", fa: "اعتبار به حساب شما اضافه شد. از ناراحتی پوزش می‌خواهیم!" }, time: { en: "Feb 19, 9:00 AM", fa: "۳۰ بهمن، ۹:۰۰" } },
    ],
  },
];

// ── Auto-reply pool ─────────────────────────────────────────
const SUPPORT_REPLIES = [
  { en: "Thank you for the update. We're looking into this and will get back to you shortly.", fa: "ممنون از اطلاع‌رسانی. در حال بررسی هستیم و به زودی پاسخ می‌دهیم." },
  { en: "Got it. A team member has been assigned to your ticket. Please allow 24 hours for a detailed response.", fa: "متوجه شدیم. یک عضو تیم به تیکت شما اختصاص داده شد. لطفاً ۲۴ ساعت فرصت دهید." },
  { en: "Thanks for the additional details. We'll update you as soon as we have more information.", fa: "ممنون از جزئیات اضافی. به محض دریافت اطلاعات بیشتر شما را مطلع می‌کنیم." },
];

const STATUS_TAB_KEYS = ["all", "open", "inReview", "resolved"];

const STATUS_TAG_COLOR = {
  open:       "accent",
  inReview:   "primary",
  resolved:   "success",
};

const PRIORITY_TAG_COLOR = {
  normal:    "neutral",
  important: "accent",
  urgent:    "danger",
};

function loc(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}

// ── Shared input style ──────────────────────────────────────
const inputStyle = (dir) => ({
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", fontSize: 13,
  borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
  background: "var(--ds-card-bg)", color: "var(--ds-text)",
  fontFamily: "inherit", direction: dir, outline: "none",
});

// ── Back button ─────────────────────────────────────────────
const BackButton = ({ onClick, t, dir }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 4, marginBottom: 12,
      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 13, color: COLORS.primary, fontWeight: 600, padding: 0,
    }}
  >
    <Ic n="chev" s={14} c={COLORS.primary} style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
    {t("action.back")}
  </button>
);

// ── Message bubble ──────────────────────────────────────────
const MessageBubble = ({ msg, lang, dir, t }) => {
  const isUser = msg.from === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ds-text-light)", marginBottom: 4 }}>
        {isUser ? t("support.you") : t("support.supportTeam")}
      </span>
      <div style={{
        maxWidth: "85%", padding: "10px 14px",
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isUser ? COLORS.primaryGhost : "var(--ds-cream)",
        color: "var(--ds-text)", fontSize: 13, lineHeight: 1.55,
      }}>
        {loc(msg.text, lang)}
      </div>
      <span style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 4 }}>
        {loc(msg.time, lang)}
      </span>
    </div>
  );
};

// ── Ticket card ──────────────────────────────────────────────
const TicketCard = ({ ticket, lang, t, dir, onClick }) => {
  const statusKey = ticket.status === "inReview" ? "inReview" : ticket.status;
  return (
    <Card variant="sm" style={{ display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }} onClick={onClick}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Tag color="neutral" style={{ gap: 4, display: "flex", alignItems: "center" }}>
          <Ic n="info" s={10} c="var(--ds-text-mid)" />
          {t(`support.issueTypes.${ticket.type}`)}
        </Tag>
        <Tag color={PRIORITY_TAG_COLOR[ticket.priority] || "neutral"}>
          {t(`support.priorities.${ticket.priority}`)}
        </Tag>
        <span style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
          {loc(ticket.createdAt, lang)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
        <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>
          {t("support.viewChat")}
        </span>
        <Ic n="chev" s={12} c={COLORS.primary} style={{ transform: dir === "rtl" ? undefined : "rotate(180deg)" }} />
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

  // ── State ───────────────────────────────────────────────
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ type: "", priority: "normal", subject: "", description: "" });
  const [messageInput, setMessageInput] = useState("");
  const [replyIdx, setReplyIdx] = useState(0);
  const threadEndRef = useRef(null);

  // Auto-scroll when messages change
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages?.length]);

  // ── Filtered tickets ────────────────────────────────────
  const filteredTickets = statusFilter === "all"
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  const tabCounts = {
    all:      tickets.length,
    open:     tickets.filter((t) => t.status === "open").length,
    inReview: tickets.filter((t) => t.status === "inReview").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  // ── New ticket submit ───────────────────────────────────
  const handleSubmitTicket = () => {
    const { type, priority, subject, description } = newTicketForm;
    if (!type || !subject.trim()) return;

    const newId = `T-${1100 + tickets.length}`;
    const now = lang === "fa"
      ? { en: "Just now", fa: "همین الان" }
      : { en: "Just now", fa: "همین الان" };

    const newTicket = {
      id: newId,
      subject: { en: subject, fa: subject },
      type,
      priority,
      status: "open",
      createdAt: now,
      messages: [
        {
          id: "m1",
          from: "user",
          text: { en: description || subject, fa: description || subject },
          time: now,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setNewTicketForm({ type: "", priority: "normal", subject: "", description: "" });
    setShowNewTicket(false);
  };

  // ── Send message in ticket detail ───────────────────────
  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !selectedTicketId) return;

    const now = { en: "Just now", fa: "همین الان" };
    const userMsg = {
      id: `m-${Date.now()}`,
      from: "user",
      text: { en: trimmed, fa: trimmed },
      time: now,
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? { ...t, messages: [...t.messages, userMsg] }
          : t
      )
    );
    setMessageInput("");

    // Auto-reply after 1.5s
    setTimeout(() => {
      const reply = SUPPORT_REPLIES[replyIdx % SUPPORT_REPLIES.length];
      const replyMsg = {
        id: `m-${Date.now()}`,
        from: "support",
        text: reply,
        time: { en: "Just now", fa: "همین الان" },
      };
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId
            ? { ...t, messages: [...t.messages, replyMsg] }
            : t
        )
      );
      setReplyIdx((i) => i + 1);
    }, 1500);
  };

  // ══════════════════════════════════════════════════════════
  // TICKET DETAIL VIEW (full-page early return)
  // ══════════════════════════════════════════════════════════
  if (selectedTicketId && selectedTicket) {
    const isActive = selectedTicket.status === "open" || selectedTicket.status === "inReview";
    return (
      <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
        <BackButton onClick={() => { setSelectedTicketId(null); setMessageInput(""); }} t={t} dir={dir} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--ds-text-light)", fontWeight: 600 }}>#{selectedTicket.id}</span>
          <Tag color={STATUS_TAG_COLOR[selectedTicket.status] || "neutral"}>
            {t(`support.statuses.${selectedTicket.status === "inReview" ? "inReview" : selectedTicket.status}`)}
          </Tag>
        </div>
        <h2 className="ds-heading" style={{ fontSize: isD ? 22 : 18, color: "var(--ds-text)", marginBottom: 8 }}>
          {loc(selectedTicket.subject, lang)}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: gap, flexWrap: "wrap" }}>
          <Tag color="neutral" style={{ gap: 4, display: "flex", alignItems: "center" }}>
            <Ic n="info" s={10} c="var(--ds-text-mid)" />
            {t(`support.issueTypes.${selectedTicket.type}`)}
          </Tag>
          <Tag color={PRIORITY_TAG_COLOR[selectedTicket.priority] || "neutral"}>
            {t(`support.priorities.${selectedTicket.priority}`)}
          </Tag>
          <span style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
            {loc(selectedTicket.createdAt, lang)}
          </span>
        </div>

        {/* Message thread */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedTicket.messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} lang={lang} dir={dir} t={t} />
          ))}
          <div ref={threadEndRef} />
        </div>

        {/* Send bar (only for active tickets) */}
        {isActive && (
          <div style={{
            padding: "12px 0",
            paddingBottom: isD ? 12 : 80,
            borderTop: "1px solid var(--ds-sand)",
            marginTop: 16,
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t("support.sendMessage")}
              style={{
                ...inputStyle(dir),
                flex: 1,
                margin: 0,
              }}
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              style={{ padding: "10px 16px", flexShrink: 0 }}
            >
              <Ic n="send" s={16} c="#fff" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // MAIN TICKETS LIST VIEW
  // ══════════════════════════════════════════════════════════
  const issueTypeOptions = ["technical", "admin", "financial", "other"].map((v) => ({
    value: v,
    label: t(`support.issueTypes.${v}`),
  }));

  const priorityOptions = ["normal", "important", "urgent"].map((v) => ({
    value: v,
    label: t(`support.priorities.${v}`),
  }));

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
      <Button variant="primary" onClick={() => setShowNewTicket(true)} style={{ width: "100%", marginBottom: gap }}>
        <Ic n="plus" s={14} c="#fff" style={{ marginInlineEnd: 6 }} />
        {t("support.newTicket")}
      </Button>

      {/* ── Status filter tabs ────────────────────────── */}
      <div style={{
        display: "flex", gap: 0,
        background: "rgba(122,173,167,0.12)",
        borderRadius: RADIUS.pill,
        padding: 3,
        marginBottom: gap,
      }}>
        {STATUS_TAB_KEYS.map((tabId) => {
          const isActive = statusFilter === tabId;
          const label = tabId === "all"
            ? t("support.allTickets")
            : t(`support.statuses.${tabId}`);
          return (
            <button
              key={tabId}
              onClick={() => setStatusFilter(tabId)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: RADIUS.pill,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "inherit",
                transition: "all 0.2s",
                background: isActive ? COLORS.primary : "transparent",
                color: isActive ? "#fff" : COLORS.textMid,
              }}
            >
              {label} ({tabCounts[tabId]})
            </button>
          );
        })}
      </div>

      {/* ── My tickets ────────────────────────────────── */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 10 }}>
        {t("support.myTickets")}
      </p>

      {filteredTickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <Ic n="support" s={40} c="var(--ds-text-light)" />
          <p style={{ fontSize: 14, color: "var(--ds-text-mid)", marginTop: 12 }}>
            {t("support.noTickets")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              lang={lang}
              dir={dir}
              t={t}
              onClick={() => setSelectedTicketId(ticket.id)}
            />
          ))}
        </div>
      )}

      {/* ── New Ticket BottomSheet ─────────────────────── */}
      {showNewTicket && (
        <BottomSheet onClose={() => setShowNewTicket(false)}>
          <div style={{ direction: dir, padding: "4px 0" }}>
            <h3 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 16 }}>
              {t("support.newTicket")}
            </h3>

            {/* Issue type */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", display: "block", marginBottom: 6 }}>
              {t("support.issueType")}
            </label>
            <Select
              options={issueTypeOptions}
              value={newTicketForm.type}
              onChange={(v) => setNewTicketForm((f) => ({ ...f, type: v }))}
              placeholder={t("support.issueType")}
              style={{ marginBottom: 14 }}
            />

            {/* Priority */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", display: "block", marginBottom: 6 }}>
              {t("support.priority")}
            </label>
            <RadioGroup
              options={priorityOptions}
              value={newTicketForm.priority}
              onChange={(v) => setNewTicketForm((f) => ({ ...f, priority: v }))}
              direction="horizontal"
              style={{ marginBottom: 14 }}
            />

            {/* Subject */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", display: "block", marginBottom: 6 }}>
              {t("support.subject")}
            </label>
            <input
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder={t("support.subjectPlaceholder")}
              style={{ ...inputStyle(dir), marginBottom: 14 }}
            />

            {/* Description */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", display: "block", marginBottom: 6 }}>
              {t("support.description")}
            </label>
            <Textarea
              value={newTicketForm.description}
              onChange={(v) => setNewTicketForm((f) => ({ ...f, description: v }))}
              placeholder={t("support.descriptionPlaceholder")}
              rows={4}
              style={{ marginBottom: 18 }}
            />

            {/* Submit */}
            <Button
              variant="primary"
              onClick={handleSubmitTicket}
              disabled={!newTicketForm.type || !newTicketForm.subject.trim()}
              style={{ width: "100%", opacity: (!newTicketForm.type || !newTicketForm.subject.trim()) ? 0.5 : 1 }}
            >
              {t("support.submitTicket")}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
