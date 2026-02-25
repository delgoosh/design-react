// ─────────────────────────────────────────────────────────────
// STEP 3 — Simulated AI chat conversation
// Scripted 5-message AI flow with typing indicator.
// TODO(backend-integration): replace scripted messages with
// real streaming AI from the matching engine backend.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useLang, Button, Avatar } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { Ic } from "@ds";
import { AI_CHAT_SCRIPT } from "./mockData.js";

const TYPING_DELAY = 1500; // ms

export const StepAiChat = ({ role, onNext, onBack }) => {
  const { lang, dir, t } = useLang();
  const [messages, setMessages] = useState([]);      // {role, text}
  const [scriptIdx, setScriptIdx] = useState(0);     // next AI message index to send
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [chatDone, setChatDone] = useState(false);
  const scrollRef = useRef(null);
  const initRef = useRef(false); // guard against StrictMode double-mount

  const script = AI_CHAT_SCRIPT[role] || AI_CHAT_SCRIPT.patient;

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Send next AI message after delay
  const sendAiMessage = (idx) => {
    if (idx >= script.length) {
      setChatDone(true);
      return;
    }
    setTyping(true);
    setTimeout(() => {
      const msg = script[idx];
      setMessages((prev) => [...prev, { role: "ai", text: lang === "fa" ? msg.fa : msg.en }]);
      setTyping(false);
      setScriptIdx(idx + 1);
      // If this was the last AI message, mark done
      if (idx === script.length - 1) {
        setChatDone(true);
      }
    }, TYPING_DELAY);
  };

  // Start conversation on mount (guard prevents StrictMode double-fire)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    sendAiMessage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user reply
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || typing || chatDone) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    // Trigger next AI message
    sendAiMessage(scriptIdx);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isRtl = dir === "rtl";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: COLORS.textDark, marginBottom: 6 }}>
          {t("onboarding.aiChatTitle")}
        </h2>
        <p style={{ fontSize: 13, color: COLORS.textMid }}>{t("onboarding.aiChatSub")}</p>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, minHeight: 300, maxHeight: 420,
          overflowY: "auto", padding: 12,
          background: "white", borderRadius: RADIUS.lg,
          border: `1px solid ${COLORS.cardBorder}`,
          display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} isRtl={isRtl} />
        ))}
        {typing && <TypingIndicator isRtl={isRtl} t={t} />}
      </div>

      {/* Input bar */}
      {!chatDone && (
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-end",
          direction: dir,
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("onboarding.aiInputPh")}
            disabled={typing}
            style={{
              flex: 1, padding: "10px 14px", fontSize: 13,
              borderRadius: RADIUS.md, border: `1.5px solid ${COLORS.sand}`,
              background: "white", color: COLORS.textDark,
              fontFamily: "inherit", direction: dir, outline: "none",
              opacity: typing ? 0.6 : 1,
            }}
          />
          <button
            onClick={handleSend}
            disabled={typing || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: RADIUS.md,
              background: input.trim() && !typing ? COLORS.primary : COLORS.sand,
              border: "none", cursor: input.trim() && !typing ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            <Ic n="send" s={18} c="white" />
          </button>
        </div>
      )}

      {/* Navigation (show Next only after chat finishes) */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        {chatDone && (
          <Button variant="primary" onClick={onNext} style={{ flex: 2 }}>
            {t("onboarding.next")}
          </Button>
        )}
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
        background: isAi ? COLORS.cream : COLORS.primaryGhost,
        color: COLORS.textDark, fontSize: 13, lineHeight: 1.55,
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
        background: COLORS.cream, color: COLORS.textLight, fontSize: 12,
        fontStyle: "italic",
      }}>
        {t("onboarding.aiTyping")}
      </div>
      {isRtl && <BotAvatar />}
    </div>
  );
}
