// ─────────────────────────────────────────────────────────────
// THERAPIST APP — shell + router
// Renders the correct screen based on `tab` state.
// Desktop: sidebar nav | Mobile: bottom nav (5 tabs max)
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
import { useLang, useIsDesktop, makeGlobalCSS, Logo, SidebarNavItem, BottomNavItem } from "@ds";
import { COLORS } from "@ds";
import { MOCK_THERAPIST_AVAILABILITY, MOCK_THERAPISTS } from "@shared/components/onboarding/mockData.js";
import {
  generateTherapistBlocks,
  toDateStr,
} from "@shared/utils/availability.js";

// ── Mock booked/held data ─────────────────────────────────────
// Generates realistic block keys based on actual t1 availability
function createMockBlockData() {
  const avail = MOCK_THERAPIST_AVAILABILITY["t1"];
  const blocks = generateTherapistBlocks(avail, new Set(), new Set(), new Date());
  // Pick specific blocks to mark as booked/held (spread across first 3 weeks)
  const booked = new Set();
  const held = new Set();
  const info = {};
  const patients = [
    { en: "Sara Mohammadi", fa: "سارا محمدی" },
    { en: "Ali Rezaei", fa: "علی رضایی" },
    { en: "Maryam Hosseini", fa: "مریم حسینی" },
    { en: "Nima Tavakoli", fa: "نیما توکلی" },
    { en: "Zahra Karimi", fa: "زهرا کریمی" },
  ];
  // Mark blocks: pick first block of Mon, 2nd of Tue, 1st of Wed, 2nd of Thu
  // across weeks 0-2 to get a mix
  let bookedIdx = 0;
  const openBlocks = blocks.filter((b) => b.status === "open");
  const seen = { mon: 0, tue: 0, wed: 0, thu: 0 };
  for (const b of openBlocks) {
    const key = `${b.date}|${b.start}`;
    if (b.dayKey === "mon" && seen.mon < 2) {
      if (seen.mon === 0) { booked.add(key); info[key] = { patient: patients[0] }; }
      else { held.add(key); }
      seen.mon++;
    } else if (b.dayKey === "tue" && seen.tue < 2) {
      if (seen.tue === 0) { booked.add(key); info[key] = { patient: patients[1] }; }
      else { booked.add(key); info[key] = { patient: patients[3] }; }
      seen.tue++;
    } else if (b.dayKey === "wed" && seen.wed < 2) {
      if (seen.wed === 0) { held.add(key); }
      else { booked.add(key); info[key] = { patient: patients[2] }; }
      seen.wed++;
    } else if (b.dayKey === "thu" && seen.thu < 2) {
      if (seen.thu === 0) { booked.add(key); info[key] = { patient: patients[4] }; }
      else { held.add(key); }
      seen.thu++;
    }
    if (booked.size + held.size >= 8) break;
  }
  return { booked, held, info };
}

const MOCK_BLOCK_DATA = createMockBlockData();

// Auth is shared — handles both apps
import Auth from "@shared/components/Auth.jsx";
import { Dashboard } from "./screens/Dashboard.jsx";
import { Patients }  from "./screens/Patients.jsx";
import { Resources } from "./screens/Resources.jsx";
import { Calendar }  from "./screens/Calendar.jsx";
import { Earnings }  from "./screens/Earnings.jsx";
import { Profile }   from "./screens/Profile.jsx";
import { Support }   from "./screens/Support.jsx";

const NAV_ITEMS = (t) => [
  { id: "home",      icon: "home",    label: t("nav.home"),      badge: null },
  { id: "patients",  icon: "users",   label: t("nav.patients"),  badge: null },
  { id: "resources", icon: "book",    label: t("nav.resources"), badge: null },
  { id: "calendar",  icon: "cal",     label: t("nav.calendar"),  badge: null },
  { id: "earnings",  icon: "money",   label: t("nav.earnings"),  badge: null },
  { id: "profile",   icon: "user",    label: t("nav.profile"),   badge: null },
  { id: "support",   icon: "support", label: t("nav.support"),   badge: "1"  },
];

// Bottom nav shows only 5 items on mobile (most important)
const MOBILE_NAV_IDS = ["home", "patients", "calendar", "earnings", "support"];

const SCREENS = {
  home:      Dashboard,
  patients:  Patients,
  resources: Resources,
  calendar:  Calendar,
  earnings:  Earnings,
  profile:   Profile,
  support:   Support,
};

// TODO(backend-integration): remove skipAuth prop — auth state should come
// from a real session/JWT, not a prop passed by the demo router.
export const TherapistApp = ({ skipAuth }) => {
  const { lang, dir, t } = useLang();
  const isD  = useIsDesktop();
  const [authed, setAuthed] = useState(skipAuth || false);
  const [tab,    setTab]    = useState("home");

  // ── Availability state (CREDIT-201/202) ──────────────────
  const [availability, setAvailability] = useState(MOCK_THERAPIST_AVAILABILITY["t1"]);
  const [bookedBlocks, setBookedBlocks] = useState(MOCK_BLOCK_DATA.booked);
  const [heldBlocks, setHeldBlocks]     = useState(MOCK_BLOCK_DATA.held);

  if (!authed) {
    return <Auth mode="therapist" onLogin={() => setAuthed(true)} />;
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
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 20px 26px", borderBottom: `1px solid ${COLORS.sidebarBorder}`, marginBottom: 12 }}>
              <Logo size={36} />
              <div>
                <p className="ds-heading" style={{ fontSize: 20, color: COLORS.primary, lineHeight: 1 }}>{t("app.name")}</p>
                <p style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.04em" }}>{t("app.therapistPanel").toUpperCase()}</p>
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
            {/* Sidebar footer — therapist avatar */}
            <div style={{ marginTop: "auto", padding: "16px 20px 0", borderTop: `1px solid ${COLORS.sidebarBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primaryGhost}, ${COLORS.accentGhost})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
                  ب.ن
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>دکتر بیژن نژاد</p>
                  <p style={{ fontSize: 11, color: COLORS.textLight }}>روان‌پزشک</p>
                </div>
              </div>
            </div>
          </aside>
          <main className="ds-main">
            <Screen setTab={setTab} availability={availability} setAvailability={setAvailability} bookedBlocks={bookedBlocks} setBookedBlocks={setBookedBlocks} heldBlocks={heldBlocks} setHeldBlocks={setHeldBlocks} bookedBlockInfo={MOCK_BLOCK_DATA.info} />
          </main>
        </div>
      ) : (
        // ── Mobile layout ───────────────────────────────────
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "var(--ds-bg)", position: "relative" }}>
          <Screen setTab={setTab} availability={availability} setAvailability={setAvailability} bookedBlocks={bookedBlocks} setBookedBlocks={setBookedBlocks} heldBlocks={heldBlocks} setHeldBlocks={setHeldBlocks} bookedBlockInfo={MOCK_BLOCK_DATA.info} />
          <nav className="ds-bottom-nav">
            {mobileNavItems.map((item) => (
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
