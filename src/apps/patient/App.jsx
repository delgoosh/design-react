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
import { Tickets }     from "./screens/Tickets.jsx";
import { Assignments } from "./screens/Assignments.jsx";
import { Profile }     from "./screens/Profile.jsx";

const NAV_ITEMS = (t) => [
  { id: "home",        icon: "home",    label: t("nav.home"),        badge: null  },
  { id: "therapists",  icon: "users",   label: t("nav.therapists"),  badge: null  },
  { id: "tickets",     icon: "ticket",  label: t("nav.tickets"),     badge: null  },
  { id: "assignments", icon: "book",    label: t("nav.assignments"), badge: "2"   },
  { id: "profile",     icon: "user",    label: t("nav.profile"),     badge: null  },
];

// Screen map — add new screens here
const SCREENS = {
  home:        Dashboard,
  therapists:  Therapists,
  tickets:     Tickets,
  assignments: Assignments,
  profile:     Profile,
};

export const PatientApp = () => {
  const { lang, dir, t } = useLang();
  const isD  = useIsDesktop();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("home");

  if (!authed) {
    return <Auth mode="patient" onLogin={() => setAuthed(true)} />;
  }

  const navItems   = NAV_ITEMS(t);
  const Screen     = SCREENS[tab] || Dashboard;

  return (
    <>
      <style>{makeGlobalCSS(lang)}</style>
      {isD ? (
        // ── Desktop layout ──────────────────────────────────
        <div style={{ display: "flex", flexDirection: dir === "rtl" ? "row" : "row-reverse", minHeight: "100vh" }}>
          <aside className="ds-sidebar">
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 20px 26px", borderBottom: `1px solid ${COLORS.sidebarBorder}`, marginBottom: 12 }}>
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
                onClick={() => setTab(item.id)}
              />
            ))}
          </aside>
          <main className="ds-main">
            <Screen />
          </main>
        </div>
      ) : (
        // ── Mobile layout ───────────────────────────────────
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: COLORS.bg, position: "relative" }}>
          <Screen />
          <nav className="ds-bottom-nav">
            {navItems.map((item) => (
              <BottomNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                badge={!!item.badge}
                onClick={() => setTab(item.id)}
              />
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
