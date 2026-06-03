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
  const [showIntro, setShowIntro] = useState(true);  // intro card before chat starts
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

  // Start conversation only after user dismisses intro
  useEffect(() => {
    if (showIntro) return;
    if (initRef.current) return;
    initRef.current = true;
    sendAiMessage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);

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

  // ── Intro screen ─────────────────────────────────────────────
  if (showIntro) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, direction: dir }}>
        {/* Bot icon */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--ds-primary, #4a9d8e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <Ic n="bot" s={32} c="#fff" />
          </div>
          <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
            {isRtl ? "گفتگو با هوش مصنوعی دلگوش" : "Chat with Delgoosh AI"}
          </h2>
        </div>

        {/* Explanation card */}
        <div style={{
          background: "var(--ds-cream, #edf7f5)", borderRadius: 12,
          padding: "16px 18px", fontSize: 14, color: "var(--ds-text)",
          lineHeight: 1.7, direction: dir,
        }}>
          {isRtl
            ? "هوش مصنوعی دلگوش می‌خواهد چند سؤال از شما بپرسد تا اطلاعات بیشتری درباره نیازها و وضعیت شما جمع‌آوری کند. این به ما کمک می‌کند بهترین درمانگر را برای شما پیدا کنیم."
            : "Delgoosh AI would like to ask you a few questions to better understand your needs. This helps us find the therapist who is the best match for you."}
        </div>

        <div style={{
          background: "var(--ds-card-bg, #fff)", border: "1.5px solid var(--ds-border, #d4e5e1)",
          borderRadius: 12, padding: "14px 18px", fontSize: 13,
          color: "var(--ds-text-mid)", lineHeight: 1.6, direction: dir,
        }}>
          {isRtl
            ? "می‌توانید این مرحله را رد کنید. در این صورت، بر اساس پاسخ‌هایی که تا اینجا دادید، بهترین تطابق ممکن را برای شما پیدا می‌کنیم."
            : "You can skip this step at any time. We'll still match you with the best available therapist based on your questionnaire answers."}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost2" onClick={onNext} style={{ flex: 1 }}>
            {isRtl ? "رد کردن" : "Skip"}
          </Button>
          <Button variant="primary" onClick={() => setShowIntro(false)} style={{ flex: 2 }}>
            {isRtl ? "شروع گفتگو" : "Start chat"}
          </Button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
            {t("onboarding.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("onboarding.aiChatTitle")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("onboarding.aiChatSub")}</p>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, minHeight: 300, maxHeight: 420,
          overflowY: "auto", padding: 12,
          background: "var(--ds-card-bg)", borderRadius: RADIUS.lg,
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
              background: "var(--ds-bg)", color: "var(--ds-text)",
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

      {/* Navigation — Skip always visible; Next prominent after chat finishes */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        {chatDone ? (
          <Button variant="primary" onClick={onNext} style={{ flex: 2 }}>
            {t("onboarding.next")}
          </Button>
        ) : (
          <Button variant="ghost2" onClick={onNext} style={{ flex: 2 }}>
            {isRtl ? "رد کردن و ادامه" : "Skip & continue"}
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
        background: COLORS.cream, color: "var(--ds-text-light)", fontSize: 12,
        fontStyle: "italic",
      }}>
        {t("onboarding.aiTyping")}
      </div>
      {isRtl && <BotAvatar />}
    </div>
  );
}
