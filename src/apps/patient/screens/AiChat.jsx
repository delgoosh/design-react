// ─────────────────────────────────────────────────────────────
// PATIENT / AI Chat
// ─────────────────────────────────────────────────────────────
// Persistent AI assistant chat screen. Open-ended conversation
// with mock responses. If entered from Dashboard mood check-in,
// the AI greets with a mood-specific message and follows up.
//
// TODO(backend-integration): replace mock follow-up pool with
// real streaming AI responses from the backend.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useLang, useIsDesktop, Ic } from "@ds";
import { COLORS, RADIUS, SHADOW } from "@ds";

// ── Mood → welcome key mapping ──────────────────────────────
const MOOD_WELCOME = {
  5: "chat.welcomeGreat",
  4: "chat.welcomeGood",
  3: "chat.welcomeOkay",
  2: "chat.welcomeLow",
  1: "chat.welcomeBad",
};

// ── Follow-up response pool (cycled) ────────────────────────
const FOLLOW_UP_KEYS = [
  "chat.followUp1", "chat.followUp2", "chat.followUp3",
  "chat.followUp4", "chat.followUp5", "chat.followUp6",
  "chat.followUp7", "chat.followUp8",
];

const TYPING_DELAY = 1500;

export const AiChat = ({ chatContext, chatCredit = 20 }) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isRtl = dir === "rtl";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const initRef = useRef(false);

  // Determine initial AI greeting
  const welcomeKey = chatContext?.mood
    ? MOOD_WELCOME[chatContext.mood] || "chat.welcomeDefault"
    : "chat.welcomeDefault";

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Initial greeting on mount (StrictMode guard)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setTyping(true);
    setTimeout(() => {
      setMessages([{ role: "ai", text: t(welcomeKey) }]);
      setTyping(false);
      // Focus input after greeting
      inputRef.current?.focus();
    }, TYPING_DELAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user send
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || typing) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    // AI responds with next follow-up from pool
    setTyping(true);
    setTimeout(() => {
      const key = FOLLOW_UP_KEYS[followUpIdx % FOLLOW_UP_KEYS.length];
      setMessages((prev) => [...prev, { role: "ai", text: t(key) }]);
      setFollowUpIdx((i) => i + 1);
      setTyping(false);
    }, TYPING_DELAY);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const pad = isD ? 28 : 14;

  return (
    <div
      style={{
        direction: dir,
        display: "flex",
        flexDirection: "column",
        height: isD ? "100%" : "100vh",
        maxWidth: isD ? 860 : 480,
        margin: "0 auto",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ padding: `${pad}px ${pad}px 12px`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: COLORS.primary, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Ic n="bot" s={22} c="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="ds-heading" style={{ fontSize: isD ? 22 : 18, color: "var(--ds-text)", lineHeight: 1.2 }}>
              {t("chat.title")}
            </h1>
            <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginTop: 2 }}>
              {t("chat.subtitle")}
            </p>
          </div>
          {/* Credit pill */}
          <CreditPill credit={chatCredit} />
        </div>
      </div>

      {/* ── Chat area (scrollable) ──────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", padding: `0 ${pad}px`,
          display: "flex", flexDirection: "column", gap: 12,
          minHeight: 0, // needed for flex overflow
        }}
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} isRtl={isRtl} />
        ))}
        {typing && <TypingIndicator isRtl={isRtl} t={t} />}
        {/* Spacer to keep last message above input */}
        <div style={{ minHeight: 8, flexShrink: 0 }} />
      </div>

      {/* ── Input bar (sticky bottom) ───────────────────────── */}
      <div style={{
        padding: `12px ${pad}px`,
        paddingBottom: isD ? 12 : 80, // account for bottom nav on mobile
        borderTop: "1px solid var(--ds-card-border)",
        background: "var(--ds-bg)",
        flexShrink: 0,
        display: "flex", gap: 8, alignItems: "flex-end",
        direction: dir,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.inputPh")}
          disabled={typing}
          style={{
            flex: 1, padding: "10px 14px", fontSize: 13,
            borderRadius: RADIUS.md, border: "1.5px solid var(--ds-sand)",
            background: "var(--ds-card-bg)", color: "var(--ds-text)",
            fontFamily: "inherit", direction: dir, outline: "none",
            opacity: typing ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={typing || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: RADIUS.md,
            background: input.trim() && !typing ? COLORS.primary : "var(--ds-sand)",
            border: "none", cursor: input.trim() && !typing ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
        >
          <Ic n="send" s={18} c="white" />
        </button>
      </div>
    </div>
  );
};

// ── Chat bubble ──────────────────────────────────────────────
function ChatBubble({ role, text, isRtl }) {
  const isAi = role === "ai";
  const align = isAi
    ? (isRtl ? "flex-end" : "flex-start")
    : (isRtl ? "flex-start" : "flex-end");

  return (
    <div style={{ display: "flex", justifyContent: align, gap: 8, alignItems: "flex-end" }}>
      {isAi && !isRtl && <BotAvatar />}
      {!isAi && isRtl && <div style={{ width: 28 }} />}
      <div style={{
        maxWidth: "75%", padding: "10px 14px",
        borderRadius: isAi ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
        background: isAi ? "var(--ds-cream)" : COLORS.primaryGhost,
        color: "var(--ds-text)", fontSize: 13, lineHeight: 1.55,
      }}>
        {text}
      </div>
      {isAi && isRtl && <BotAvatar />}
    </div>
  );
}

function BotAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: COLORS.primary, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Ic n="bot" s={16} c="white" />
    </div>
  );
}

function CreditPill({ credit }) {
  const color = credit > 50
    ? COLORS.primary
    : credit >= 20
      ? COLORS.accent
      : COLORS.danger;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: RADIUS.pill,
      background: `${color}14`, flexShrink: 0,
    }}>
      <Ic n="zap" s={13} c={color} />
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{credit}%</span>
    </div>
  );
}

function TypingIndicator({ isRtl, t }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isRtl ? "flex-end" : "flex-start",
      gap: 8, alignItems: "flex-end",
    }}>
      {!isRtl && <BotAvatar />}
      <div style={{
        padding: "10px 14px", borderRadius: "14px 14px 14px 4px",
        background: "var(--ds-cream)", color: "var(--ds-text-light)", fontSize: 12,
        fontStyle: "italic",
      }}>
        {t("chat.typing")}
      </div>
      {isRtl && <BotAvatar />}
    </div>
  );
}
