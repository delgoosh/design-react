// ─────────────────────────────────────────────────────────────
// PATIENT APP — shell + router
// Renders the correct screen based on `tab` state.
// Desktop: sidebar nav | Mobile: bottom nav
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, makeGlobalCSS, Logo, SidebarNavItem, BottomNavItem } from "@ds";
import { COLORS } from "@ds";

// Auth is shared — handles both apps
import Auth from "@shared/components/Auth.jsx";
import { Dashboard }   from "./screens/Dashboard.jsx";
import { Therapists }  from "./screens/Therapists.jsx";
import { AiChat }      from "./screens/AiChat.jsx";
import { Credits }     from "./screens/Credits.jsx";
import { Assignments } from "./screens/Assignments.jsx";
import { Profile }     from "./screens/Profile.jsx";

const NAV_ITEMS = (t) => [
  { id: "home",        icon: "home",    label: t("nav.home"),        badge: null  },
  { id: "therapists",  icon: "users",   label: t("nav.therapists"),  badge: null  },
  { id: "chat",        icon: "bot",     label: t("nav.chat"),        badge: null  },
  { id: "credits",     icon: "wallet",  label: t("nav.credits"),     badge: null  },
  { id: "assignments", icon: "book",    label: t("nav.assignments"), badge: "2"   },
  { id: "profile",     icon: "user",    label: t("nav.profile"),     badge: null  },
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

  // Navigate helper — allows screens to change tab with optional context
  const navigate = (tabId, ctx = null) => {
    if (ctx) setChatContext(ctx);
    setTab(tabId);
  };

  if (!authed) {
    return <Auth mode="patient" onLogin={() => setAuthed(true)} />;
  }

  const navItems       = NAV_ITEMS(t);
  const mobileNavItems = navItems.filter((i) => MOBILE_NAV_IDS.includes(i.id));
  const Screen         = SCREENS[tab] || Dashboard;

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
                onClick={() => { setChatContext(null); setTab(item.id); }}
              />
            ))}
          </aside>
          <main className="ds-main">
            <Screen
              key={tab === "chat" ? `chat-${chatContext?.mood || "default"}` : tab}
              navigate={navigate}
              chatContext={tab === "chat" ? chatContext : undefined}
              chatCredit={chatCredit}
              setChatCredit={setChatCredit}
            />
          </main>
        </div>
      ) : (
        // ── Mobile layout ───────────────────────────────────
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--ds-bg)", position: "relative" }}>
          <Screen
            key={tab === "chat" ? `chat-${chatContext?.mood || "default"}` : tab}
            navigate={navigate}
            chatContext={tab === "chat" ? chatContext : undefined}
            chatCredit={chatCredit}
            setChatCredit={setChatCredit}
          />
          <nav className="ds-bottom-nav">
            {mobileNavItems.map((item) => (
              <BottomNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                badge={!!item.badge}
                onClick={() => { setChatContext(null); setTab(item.id); }}
              />
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
