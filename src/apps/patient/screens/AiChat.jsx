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
import { useLang, useIsDesktop, Ic, BottomSheet, Button } from "@ds";
import { COLORS, RADIUS } from "@ds";

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

export const AiChat = ({
  chatContext, chatCredit = 20, navigate,
  activeChatId, chatSessions,
  onUpdateMessages, onUpdateTitle,
  onDeleteChat, onSwitchChat, onNewChat,
}) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isRtl = dir === "rtl";

  // Find existing session (if resuming)
  const activeSession = chatSessions?.find((s) => s.id === activeChatId);

  const [messages, setMessages] = useState(activeSession?.messages || []);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [followUpIdx, setFollowUpIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const initRef = useRef(false);

  // Determine initial AI greeting
  const welcomeKey = chatContext?.mood
    ? MOOD_WELCOME[chatContext.mood] || "chat.welcomeDefault"
    : "chat.welcomeDefault";

  const creditEmpty = chatCredit <= 0;

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Sync messages upward for persistence
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      onUpdateMessages?.(activeChatId, messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeChatId]);

  // Initial greeting on mount (StrictMode guard)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // If resuming a chat that already has messages, skip greeting
    if (activeSession?.messages?.length > 0) {
      inputRef.current?.focus();
      return;
    }
    setTyping(true);
    setTimeout(() => {
      setMessages([{ role: "ai", text: t(welcomeKey) }]);
      setTyping(false);
      inputRef.current?.focus();
    }, TYPING_DELAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user send
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || typing || creditEmpty) return;

    const isFirstUserMsg = messages.every((m) => m.role !== "user");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    // Auto-generate title from first user message
    if (isFirstUserMsg && activeChatId) {
      const title = trimmed.length > 30 ? trimmed.slice(0, 30) + "\u2026" : trimmed;
      onUpdateTitle?.(activeChatId, title);
    }

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
        height: isD ? "100%" : "100dvh",
        maxWidth: isD ? 860 : 480,
        margin: "0 auto",
        overflow: "hidden",
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
          {/* History button */}
          <button
            onClick={() => setShowHistory(true)}
            style={{
              width: 36, height: 36, borderRadius: RADIUS.md,
              border: "1.5px solid var(--ds-card-border)",
              background: "var(--ds-card-bg)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ic n="history" s={17} c="var(--ds-text-mid)" />
          </button>
          {/* Credit pill */}
          <CreditPill credit={chatCredit} navigate={navigate} t={t} />
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

      {/* ── Zero-credit banner ──────────────────────────────── */}
      {creditEmpty && (
        <div style={{
          margin: `0 ${pad}px`, padding: "10px 14px",
          borderRadius: RADIUS.md, background: `${COLORS.danger}14`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <Ic n="alert" s={16} c={COLORS.danger} />
          <p style={{ flex: 1, fontSize: 12, color: COLORS.danger, fontWeight: 600 }}>
            {t("chat.creditEmpty")}
          </p>
          <Button variant="primary" size="xs" onClick={() => navigate?.("credits")}>
            {t("chat.creditTopUp")}
          </Button>
        </div>
      )}

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
          disabled={typing || creditEmpty}
          style={{
            flex: 1, padding: "10px 14px", fontSize: 13,
            borderRadius: RADIUS.md, border: "1.5px solid var(--ds-sand)",
            background: "var(--ds-card-bg)", color: "var(--ds-text)",
            fontFamily: "inherit", direction: dir, outline: "none",
            opacity: (typing || creditEmpty) ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={typing || !input.trim() || creditEmpty}
          style={{
            width: 40, height: 40, borderRadius: RADIUS.md,
            background: input.trim() && !typing && !creditEmpty ? COLORS.primary : "var(--ds-sand)",
            border: "none", cursor: input.trim() && !typing && !creditEmpty ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
        >
          <Ic n="send" s={18} c="white" />
        </button>
      </div>

      {/* ── Chat history panel ──────────────────────────────── */}
      {showHistory && (
        <ChatHistoryPanel
          sessions={chatSessions || []}
          activeChatId={activeChatId}
          onSwitch={onSwitchChat}
          onNew={onNewChat}
          onDelete={onDeleteChat}
          onClose={() => setShowHistory(false)}
          t={t}
          isD={isD}
          dir={dir}
        />
      )}
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

// ── Credit pill (tappable, labeled, animated) ────────────────
function CreditPill({ credit, navigate, t }) {
  const color = credit > 50
    ? COLORS.primary
    : credit >= 20
      ? COLORS.accent
      : COLORS.danger;

  const pulseClass = credit <= 0
    ? "ds-credit-pulse-danger"
    : credit < 10
      ? "ds-credit-pulse"
      : "";

  return (
    <button
      className={pulseClass || undefined}
      onClick={() => navigate?.("credits")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: RADIUS.pill,
        background: `${color}14`, flexShrink: 0,
        border: "none", cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.2s",
      }}
    >
      <Ic n="zap" s={13} c={color} />
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)" }}>
        {t("chat.creditLabel")}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{credit}%</span>
    </button>
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

// ── Chat history panel ───────────────────────────────────────
function ChatHistoryPanel({
  sessions, activeChatId, onSwitch, onNew, onDelete, onClose, t, isD, dir,
}) {
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
  const isRtl = dir === "rtl";

  const content = (
    <>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>
          {t("chat.historyTitle")}
        </h3>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
        }}>
          <Ic n="x" s={18} c="var(--ds-text-mid)" />
        </button>
      </div>

      {/* New chat button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => { onNew?.(); onClose(); }}
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Ic n="plus" s={14} c="white" />
        {t("chat.newChat")}
      </Button>

      {/* Chat list */}
      {sorted.length === 0 ? (
        <p style={{
          fontSize: 12, color: "var(--ds-text-light)",
          textAlign: "center", padding: "20px 0",
        }}>
          {t("chat.noHistory")}
        </p>
      ) : (
        sorted.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 8px", marginBottom: 2,
              background: s.id === activeChatId ? `${COLORS.primary}0D` : "transparent",
              borderRadius: RADIUS.sm, cursor: "pointer",
            }}
          >
            <div
              style={{ flex: 1, minWidth: 0 }}
              onClick={() => { onSwitch?.(s.id); onClose(); }}
            >
              <p style={{
                fontSize: 13, fontWeight: 600, color: "var(--ds-text)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {s.title || t("chat.title")}
              </p>
              <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>
                {new Date(s.createdAt).toLocaleDateString(
                  isRtl ? "fa-IR" : "en-US",
                  { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
                )}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(s.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, flexShrink: 0,
              }}
            >
              <Ic n="trash" s={14} c={COLORS.danger} />
            </button>
          </div>
        ))
      )}
    </>
  );

  // Mobile: BottomSheet, Desktop: slide-in overlay
  if (!isD) {
    return <BottomSheet onClose={onClose}>{content}</BottomSheet>;
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
        zIndex: 999, display: "flex",
        justifyContent: isRtl ? "flex-start" : "flex-end",
        animation: "ds-fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 320, background: "var(--ds-card-bg)",
          height: "100%", padding: 24, overflowY: "auto",
          animation: "ds-fadeUp 0.25s ease",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
          direction: dir,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
