// ─────────────────────────────────────────────────────────────
// PATIENT APP — shell + router
// Renders the correct screen based on `tab` state.
// Desktop: sidebar nav | Mobile: bottom nav
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useLang, useIsDesktop, makeGlobalCSS, Logo, SidebarNavItem, BottomNavItem } from "@ds";
import { COLORS } from "@ds";
import { MOCK_THERAPISTS, MOCK_NEXT_SESSION, MOCK_ASSIGNMENTS, MOCK_TRANSACTIONS } from "@shared/components/onboarding/mockData.js";

// Auth is shared — handles both apps
import Auth from "@shared/components/Auth.jsx";
import { Dashboard }   from "./screens/Dashboard.jsx";
import { Therapists }  from "./screens/Therapists.jsx";
import { AiChat }      from "./screens/AiChat.jsx";
import { Credits }     from "./screens/Credits.jsx";
import { Assignments } from "./screens/Assignments.jsx";
import { Profile }     from "./screens/Profile.jsx";
import { Support }     from "./screens/Support.jsx";

const NAV_ITEMS = (t, assignmentBadge) => [
  { id: "home",        icon: "home",    label: t("nav.home"),        badge: null             },
  { id: "therapists",  icon: "users",   label: t("nav.therapists"),  badge: null             },
  { id: "chat",        icon: "bot",     label: t("nav.chat"),        badge: null             },
  { id: "credits",     icon: "wallet",  label: t("nav.credits"),     badge: null             },
  { id: "assignments", icon: "book",    label: t("nav.assignments"), badge: assignmentBadge  },
  { id: "profile",     icon: "user",    label: t("nav.profile"),     badge: null             },
];

// Bottom nav shows only 5 items on mobile (most important)
const MOBILE_NAV_IDS = ["home", "therapists", "chat", "assignments", "credits"];

// Screen map — add new screens here
const SCREENS = {
  home:        Dashboard,
  therapists:  Therapists,
  chat:        AiChat,
  credits:     Credits,
  assignments: Assignments,
  profile:     Profile,
  support:     Support,
};

// ── Chat persistence helpers ───────────────────────────────
const STORAGE_KEY = "delgoosh_chat_sessions";
const ACTIVE_KEY  = "delgoosh_active_chat";

const loadSessions = () => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
};
const loadActiveId = () => {
  try { return localStorage.getItem(ACTIVE_KEY) || null; }
  catch { return null; }
};

// TODO(backend-integration): remove skipAuth prop — auth state should come
// from a real session/JWT, not a prop passed by the demo router.
export const PatientApp = ({ skipAuth }) => {
  const { lang, dir, t } = useLang();
  const isD  = useIsDesktop();
  const [authed, setAuthed] = useState(skipAuth || false);
  const [tab, setTab] = useState("home");
  const [chatContext, setChatContext] = useState(null);
  const [chatCredit, setChatCredit] = useState(20);   // lifted so Chat + Credits share it

  // ── Credit state (lifted so Therapists + Credits share it) ──
  const [sessionCredits, setSessionCredits] = useState(3);
  const [autoRenew, setAutoRenew] = useState(true);     // auto-renew ON by default

  // ── Transaction ledger ──────────────────────────────────
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  const addTransaction = useCallback((type, creditDelta, extra = {}) => {
    setTransactions((prev) => {
      const balanceAfter = (prev.length > 0 ? prev[0].balanceAfter : sessionCredits) + creditDelta;
      return [{
        id: `tx${Date.now()}`,
        type,
        creditDelta,
        balanceAfter,
        date: new Date().toISOString(),
        receiptAvailable: type === "purchase" || type === "auto_renew",
        therapistName: null,
        reasonCode: null,
        ...extra,
      }, ...prev];
    });
  }, [sessionCredits]);

  // ── Therapist state ────────────────────────────────────
  const [chosenTherapist, setChosenTherapist] = useState(MOCK_THERAPISTS[0]);
  const [suggestedTherapists, setSuggestedTherapists] = useState(MOCK_THERAPISTS.slice(1));
  const [nextSession, setNextSession] = useState(() => MOCK_NEXT_SESSION(MOCK_THERAPISTS[0]));

  const handleChooseTherapist = useCallback((therapist) => {
    setChosenTherapist(therapist);
    setSuggestedTherapists(MOCK_THERAPISTS.filter((th) => th.id !== therapist.id));
    setNextSession(null);
  }, []);

  const handleBookSession = useCallback((therapist, sessionData) => {
    // sessionData may come from the booking sheet with specific date/time
    if (sessionData) {
      setNextSession({
        therapistId: therapist.id,
        therapistName: therapist.name,
        topic: { en: "Therapy session", fa: "جلسه درمان" },
        date: sessionData.date,
        time: sessionData.time,
        dateISO: sessionData.dateISO,
        startTime: sessionData.startTime,
        dateStr: sessionData.dateStr,
      });
      addTransaction("booking", -1, {
        description: sessionData.description || { en: "Session booked", fa: "رزرو جلسه" },
        therapistName: therapist.name,
      });
    } else {
      setNextSession(MOCK_NEXT_SESSION(therapist));
    }
  }, [addTransaction]);

  // ── Cancel session callback ────────────────────────────
  // Returns { refunded: boolean } so the UI can show the right message
  const handleCancelSession = useCallback((sessionInfo) => {
    if (!sessionInfo?.dateISO) {
      setNextSession(null);
      return { refunded: false };
    }
    const hoursUntil = (new Date(sessionInfo.dateISO).getTime() - Date.now()) / 3600000;
    const isFree = hoursUntil > 24;

    if (isFree) {
      setSessionCredits((s) => s + 1);
      addTransaction("patient_cancel_refund", 1, {
        description: { en: "Cancellation refund (>24h)", fa: "بازگشت اعتبار لغو (بیش از ۲۴ ساعت)" },
        therapistName: sessionInfo.therapistName,
        reasonCode: "patient_free",
      });
    } else {
      addTransaction("patient_cancel_refund", 0, {
        description: { en: "Late cancellation (<24h) — no refund", fa: "لغو دیرهنگام (کمتر از ۲۴ ساعت) — بدون بازگشت" },
        therapistName: sessionInfo.therapistName,
        reasonCode: "patient_late",
      });
    }

    // Clear nextSession if this is the next session being cancelled
    if (nextSession?.dateISO === sessionInfo.dateISO) {
      setNextSession(null);
    }
    return { refunded: isFree };
  }, [nextSession, addTransaction]);

  // ── Assignment state ─────────────────────────────────────
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);

  const handleCompleteAssignment = useCallback((id) => {
    setAssignments((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: "completed", progress: 100, completedAt: { en: "Today", fa: "امروز" } } : a
    ));
  }, []);

  // ── Chat session state (persisted to localStorage) ─────
  const [chatSessions, setChatSessions] = useState(loadSessions);
  const [activeChatId, setActiveChatId] = useState(loadActiveId);

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions)); } catch { /* quota */ }
  }, [chatSessions]);
  useEffect(() => {
    try { if (activeChatId) localStorage.setItem(ACTIVE_KEY, activeChatId); } catch { /* */ }
  }, [activeChatId]);

  // ── Chat management functions ──────────────────────────
  const createChat = useCallback((ctx = null) => {
    const id = `chat_${Date.now()}`;
    const session = { id, title: "", messages: [], createdAt: Date.now() };
    setChatSessions((prev) => [session, ...prev]);
    setActiveChatId(id);
    if (ctx) setChatContext(ctx);
    return id;
  }, []);

  const updateChatMessages = useCallback((chatId, messages) => {
    setChatSessions((prev) => prev.map((s) =>
      s.id === chatId ? { ...s, messages } : s
    ));
  }, []);

  const updateChatTitle = useCallback((chatId, title) => {
    setChatSessions((prev) => prev.map((s) =>
      s.id === chatId && !s.title ? { ...s, title } : s
    ));
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChatSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== chatId);
      // If we deleted the active chat, switch to the most recent one
      if (chatId === activeChatId) {
        setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  }, [activeChatId]);

  const switchChat = useCallback((chatId) => {
    setActiveChatId(chatId);
    setChatContext(null);
  }, []);

  const newChat = useCallback(() => {
    createChat();
    setChatContext(null);
  }, [createChat]);

  // Navigate helper — allows screens to change tab with optional context
  const navigate = useCallback((tabId, ctx = null) => {
    if (tabId === "chat" && ctx?.mood) {
      // Mood check-in from Dashboard: always create a new chat
      createChat(ctx);
    } else if (tabId === "chat" && !activeChatId) {
      // Going to chat with no active session: create one
      createChat();
    }
    if (ctx) setChatContext(ctx);
    setTab(tabId);
  }, [activeChatId, createChat]);

  // Nav click handler — for sidebar/bottom nav
  const handleNavClick = useCallback((itemId) => {
    if (itemId === "chat" && !activeChatId) {
      createChat();
    }
    setChatContext(null);
    setTab(itemId);
  }, [activeChatId, createChat]);

  if (!authed) {
    return <Auth mode="patient" onLogin={() => setAuthed(true)} />;
  }

  const activeAssignmentCount = assignments.filter((a) => a.status === "active").length;
  const navItems       = NAV_ITEMS(t, activeAssignmentCount > 0 ? String(activeAssignmentCount) : null);
  const mobileNavItems = navItems.filter((i) => MOBILE_NAV_IDS.includes(i.id));
  const Screen         = SCREENS[tab] || Dashboard;

  // Chat-specific props passed to screens
  const chatProps = {
    activeChatId,
    chatSessions,
    onUpdateMessages: updateChatMessages,
    onUpdateTitle:    updateChatTitle,
    onDeleteChat:     deleteChat,
    onSwitchChat:     switchChat,
    onNewChat:        newChat,
  };

  // Assignment-specific props
  const assignmentProps = {
    assignments,
    onCompleteAssignment: handleCompleteAssignment,
  };

  // Credit-specific props (shared between Credits + Therapists)
  const creditProps = {
    sessionCredits,
    setSessionCredits,
    autoRenew,
    setAutoRenew,
    transactions,
    addTransaction,
  };

  // Therapist-specific props
  const therapistProps = {
    chosenTherapist,
    suggestedTherapists,
    nextSession,
    onChooseTherapist: handleChooseTherapist,
    onBookSession:     handleBookSession,
    onCancelSession:   handleCancelSession,
    ...creditProps,
  };

  return (
    <>
      <style>{makeGlobalCSS(lang)}</style>
      {isD ? (
        // ── Desktop layout ──────────────────────────────────
        <div style={{ display: "flex", flexDirection: dir === "rtl" ? "row" : "row-reverse", minHeight: "100vh" }}>
          <aside className="ds-sidebar">
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 20px 26px", borderBottom: "1px solid var(--ds-sidebar-border)", marginBottom: 12 }}>
              <Logo size={36} />
              <div>
                <p className="ds-heading" style={{ fontSize: 20, color: COLORS.primary, lineHeight: 1 }}>{t("app.name")}</p>
                <p style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.04em" }}>{t("app.patientPanel").toUpperCase()}</p>
              </div>
            </div>
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                badge={item.badge}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </aside>
          <main className="ds-main">
            <Screen
              key={tab === "chat" ? `chat-${activeChatId || "empty"}` : tab}
              navigate={navigate}
              chatContext={tab === "chat" ? chatContext : undefined}
              chatCredit={chatCredit}
              setChatCredit={setChatCredit}
              {...chatProps}
              {...therapistProps}
              {...assignmentProps}
              {...creditProps}
            />
          </main>
        </div>
      ) : (
        // ── Mobile layout ───────────────────────────────────
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--ds-bg)", position: "relative" }}>
          <Screen
            key={tab === "chat" ? `chat-${activeChatId || "empty"}` : tab}
            navigate={navigate}
            chatContext={tab === "chat" ? chatContext : undefined}
            chatCredit={chatCredit}
            setChatCredit={setChatCredit}
            {...chatProps}
            {...therapistProps}
            {...assignmentProps}
            {...creditProps}
          />
          <nav className="ds-bottom-nav">
            {mobileNavItems.map((item) => (
              <BottomNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                badge={!!item.badge}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
