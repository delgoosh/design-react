// ─────────────────────────────────────────────────────────────
// PATIENT / Dashboard
// ─────────────────────────────────────────────────────────────
// Full patient home screen with: greeting + notification bell,
// session credits, next session, quick actions, mood check-in,
// upcoming sessions, active assignments, progress, resources.
//
// TODO(backend-integration): all data is mock — replace with
// real API calls for sessions, credits, assignments, etc.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, Ic, ProgressBar } from "@ds";
import { COLORS, RADIUS, SHADOW } from "@ds";

// ── Mock data ─────────────────────────────────────────────────
// TODO(backend-integration): replace with real API data
const MOCK = {
  firstName: "Sara",
  credits: 3,
  notifications: [
    { id: 1, text: "notifSessionReminder", time: "2h" },
    { id: 2, text: "notifAssignmentDue", time: "1d" },
  ],
  nextSession: {
    therapistName: "Dr. Mina Karimi",
    therapistInitials: "MK",
    topic: "Anxiety management",
    topicFa: "مدیریت اضطراب",
    date: "Tue, Feb 25",
    dateFa: "سه‌شنبه ۶ اسفند",
    time: "10:00 AM",
    timeFa: "۱۰:۰۰ صبح",
    hoursUntil: 26,
  },
  upcomingSessions: [
    { id: 1, therapist: "Dr. Mina Karimi", initials: "MK", date: "Thu, Feb 27", dateFa: "پنجشنبه ۸ اسفند", time: "10:00 AM", timeFa: "۱۰:۰۰ صبح" },
    { id: 2, therapist: "Dr. Mina Karimi", initials: "MK", date: "Tue, Mar 4",  dateFa: "سه‌شنبه ۱۳ اسفند", time: "10:00 AM", timeFa: "۱۰:۰۰ صبح" },
  ],
  assignments: [
    { id: 1, title: "Daily mood journal", titleFa: "دفترچه خلق روزانه", from: "Dr. Mina Karimi", due: "Ongoing", dueFa: "مستمر", progress: 60 },
    { id: 2, title: "Breathing exercise", titleFa: "تمرین تنفس", from: "Dr. Mina Karimi", due: "3 days", dueFa: "۳ روز", progress: 30 },
  ],
  progress: {
    sessions: 8,
    assignments: 12,
    streak: 3,
  },
  resources: [
    { id: 1, title: "Understanding anxiety", titleFa: "شناخت اضطراب", type: "article", typeFa: "مقاله" },
    { id: 2, title: "5-minute mindfulness", titleFa: "ذهن‌آگاهی ۵ دقیقه‌ای", type: "exercise", typeFa: "تمرین" },
  ],
};

// Notification strings (mock, bilingual)
const NOTIF_STRINGS = {
  notifSessionReminder: { en: "Session with Dr. Karimi tomorrow at 10 AM", fa: "جلسه با دکتر کریمی فردا ساعت ۱۰ صبح" },
  notifAssignmentDue:   { en: "Mood journal assignment is due today",      fa: "تکلیف دفترچه خلق امروز موعد دارد" },
};

export const Dashboard = ({ navigate }) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isFa = lang === "fa";

  const [showNotifs, setShowNotifs] = useState(false);
  const [mood, setMood] = useState(null);

  // Time-based greeting
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "goodMorning" : hour < 17 ? "goodAfternoon" : "goodEvening";
  const greeting = t(`dashboard.${greetKey}`);

  const gap = isD ? 20 : 12;
  const pad = isD ? 28 : 14;

  return (
    <div style={{ direction: dir, padding: pad, maxWidth: isD ? 860 : 480, margin: "0 auto" }}>

      {/* ── Header: Greeting + Notification bell ────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: gap }}>
        <div>
          <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", lineHeight: 1.2 }}>
            {greeting}، {MOCK.firstName}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginTop: 4 }}>
            {t("dashboard.today")} — {new Date().toLocaleDateString(isFa ? "fa-IR" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Profile avatar — mobile only (not in bottom nav) */}
          {!isD && (
            <button
              onClick={() => navigate?.("profile")}
              style={{
                width: 42, height: 42, borderRadius: "50%", border: "none",
                background: "none", cursor: "pointer", padding: 0,
              }}
            >
              <Avatar initials="SM" size={42} />
            </button>
          )}
          <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              width: 42, height: 42, borderRadius: RADIUS.md, border: "1.5px solid var(--ds-card-border)",
              background: "var(--ds-card-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--ds-shadow-stat)",
            }}
          >
            <Ic n="bell" s={20} c="var(--ds-text-mid)" />
            {MOCK.notifications.length > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2, width: 10, height: 10,
                background: COLORS.accent, borderRadius: "50%", border: "2px solid var(--ds-card-bg)",
              }} />
            )}
          </button>
          {/* Notification dropdown */}
          {showNotifs && (
            <div style={{
              position: "absolute", top: 50, ...(dir === "rtl" ? { left: 0 } : { right: 0 }),
              width: 280, background: "var(--ds-card-bg)", borderRadius: RADIUS.lg,
              border: "1px solid var(--ds-card-border)", boxShadow: "var(--ds-shadow-card)",
              padding: 12, zIndex: 10,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 10 }}>
                {t("dashboard.notifications")}
              </p>
              {MOCK.notifications.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--ds-text-light)" }}>{t("dashboard.noNotifications")}</p>
              ) : (
                MOCK.notifications.map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--ds-cream)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: "var(--ds-text)", lineHeight: 1.4 }}>
                        {NOTIF_STRINGS[n.text]?.[lang] || n.text}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* ── Credit balance + Next session row (desktop: side by side) ── */}
      <div style={{ display: isD ? "flex" : "block", gap, marginBottom: gap }}>
        {/* Credit balance */}
        <Card variant={isD ? "default" : "sm"} style={{ flex: isD ? 1 : undefined, marginBottom: isD ? 0 : gap, display: "flex", alignItems: "center", gap: isD ? 16 : 10 }}>
          <div style={{
            width: isD ? 48 : 38, height: isD ? 48 : 38, borderRadius: RADIUS.sm,
            background: COLORS.primaryGhost, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Ic n="wallet" s={isD ? 24 : 18} c={COLORS.primary} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: isD ? 12 : 11, color: "var(--ds-text-mid)" }}>{t("dashboard.creditsBalance")}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <p className="ds-heading" style={{ fontSize: isD ? 28 : 22, color: "var(--ds-text)", lineHeight: 1 }}>
                {MOCK.credits}
              </p>
              <p style={{ fontSize: 10, color: "var(--ds-text-light)" }}>{t("dashboard.creditsLeft")}</p>
            </div>
          </div>
          <Button variant="ghost" size="xs" style={{ alignSelf: "center", flexShrink: 0 }}>
            {t("dashboard.buyMore")}
          </Button>
        </Card>

        {/* Next session */}
        {MOCK.nextSession ? (
          <Card variant={isD ? "default" : "sm"} style={{
            flex: isD ? 1.4 : undefined,
            background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
            border: "none", color: "white", position: "relative", overflow: "hidden",
          }}>
            {/* Decorative circle — desktop only */}
            {isD && <div style={{
              position: "absolute", top: -20, ...(dir === "rtl" ? { left: -20 } : { right: -20 }),
              width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
            }} />}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isD ? 12 : 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 2 }}>
                    {t("dashboard.nextSession")}
                  </p>
                  <h3 style={{ fontSize: isD ? 16 : 14, fontWeight: 700, color: "white" }}>
                    {MOCK.nextSession.therapistName}
                  </h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>
                    {isFa ? MOCK.nextSession.topicFa : MOCK.nextSession.topic}
                  </p>
                </div>
                <Avatar initials={MOCK.nextSession.therapistInitials} size={isD ? 42 : 34} style={{
                  background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.3)", color: "white",
                }} />
              </div>
              <div style={{ display: "flex", gap: isD ? 14 : 10, marginBottom: isD ? 14 : 10, flexWrap: "wrap" }}>
                {[
                  ["cal", isFa ? MOCK.nextSession.dateFa : MOCK.nextSession.date],
                  ["clock", isFa ? MOCK.nextSession.timeFa : MOCK.nextSession.time],
                  ["video", t("dashboard.onlineMeeting")],
                ].map(([ic, tx], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Ic n={ic} s={11} c="rgba(255,255,255,0.5)" />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{tx}</span>
                  </div>
                ))}
              </div>
              <Button variant="accent" size={isD ? "sm" : "xs"}>{t("dashboard.joinSession")}</Button>
            </div>
          </Card>
        ) : (
          <Card style={{ flex: isD ? 1.4 : undefined, textAlign: "center", padding: "30px 20px" }}>
            <Ic n="cal" s={32} c={COLORS.textLight} />
            <p style={{ fontSize: 14, color: "var(--ds-text-mid)", fontWeight: 600, marginTop: 8 }}>
              {t("dashboard.noUpcoming")}
            </p>
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 4 }}>
              {t("dashboard.bookFirst")}
            </p>
            <Button variant="primary" size="sm" style={{ marginTop: 14 }}>
              {t("dashboard.findTherapist")}
            </Button>
          </Card>
        )}
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div style={{ marginBottom: gap }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text)", marginBottom: 8 }}>
          {t("dashboard.quickActions")}
        </p>
        <div style={{ display: "flex", gap: isD ? 10 : 8, overflowX: "auto" }}>
          {[
            { icon: "users",   label: t("dashboard.qBookSession"), color: COLORS.primary,        tab: "therapists" },
            { icon: "book",    label: t("dashboard.qAssignments"), color: COLORS.accent,         tab: "assignments" },
            { icon: "heart",   label: t("dashboard.qResources"),   color: COLORS.success,        tab: null },
            { icon: "support", label: t("dashboard.qSupport"),     color: "var(--ds-text-mid)",  tab: "support" },
          ].map((a, i) => (
            <button key={i} onClick={() => a.tab && navigate?.(a.tab)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: isD ? 6 : 4,
              padding: isD ? "14px 16px" : "10px 8px", borderRadius: RADIUS.sm, border: "1px solid var(--ds-card-border)",
              background: "var(--ds-card-bg)", cursor: "pointer", minWidth: isD ? 80 : 0, flex: 1,
              boxShadow: "var(--ds-shadow-stat)", fontFamily: "inherit",
            }}>
              <div style={{
                width: isD ? 38 : 30, height: isD ? 38 : 30, borderRadius: RADIUS.sm,
                background: `${a.color}14`, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic n={a.icon} s={isD ? 18 : 15} c={a.color} />
              </div>
              <span style={{ fontSize: isD ? 11 : 10, fontWeight: 600, color: "var(--ds-text)", whiteSpace: "nowrap" }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Mood check-in ─────────────────────────────────────── */}
      <Card variant={isD ? "default" : "sm"} style={{ marginBottom: gap }}>
        <p style={{ fontSize: isD ? 13 : 12, fontWeight: 700, color: "var(--ds-text)", marginBottom: isD ? 12 : 8 }}>
          {t("dashboard.moodCheckin")}
        </p>
        {mood === null ? (
          <div style={{ display: "flex", gap: isD ? 8 : 0, justifyContent: "center" }}>
            {[
              { emoji: "😊", key: "moodGreat", value: 5 },
              { emoji: "🙂", key: "moodGood",  value: 4 },
              { emoji: "😐", key: "moodOkay",  value: 3 },
              { emoji: "😔", key: "moodLow",   value: 2 },
              { emoji: "😢", key: "moodBad",   value: 1 },
            ].map((m) => (
              <button key={m.value} onClick={() => { setMood(m.value); navigate?.("chat", { mood: m.value }); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: isD ? "10px 14px" : "8px 6px", borderRadius: RADIUS.sm, border: "1.5px solid transparent",
                background: "transparent", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                flex: isD ? undefined : 1,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.background = COLORS.primaryGhost; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: isD ? 24 : 22 }}>{m.emoji}</span>
                <span style={{ fontSize: isD ? 10 : 9, color: "var(--ds-text-mid)", fontWeight: 600 }}>{t(`dashboard.${m.key}`)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ fontSize: 14, color: COLORS.success, fontWeight: 600 }}>
              ✓ {t("dashboard.moodThanks")}
            </p>
          </div>
        )}
      </Card>

      {/* ── Two-column: Upcoming sessions + Active assignments (desktop) ── */}
      <div style={{ display: isD ? "flex" : "block", gap, marginBottom: gap }}>

        {/* Upcoming sessions */}
        <Card style={{ flex: 1, marginBottom: isD ? 0 : gap }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
              {t("dashboard.upcomingSessions")}
            </p>
            <Tag color="primary">{MOCK.upcomingSessions.length}</Tag>
          </div>
          {MOCK.upcomingSessions.map((s) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderTop: "1px solid var(--ds-cream)",
            }}>
              <Avatar initials={s.initials} size={36} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{s.therapist}</p>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
                  {isFa ? s.dateFa : s.date} · {isFa ? s.timeFa : s.time}
                </p>
              </div>
              <Tag color="primary"><Ic n="video" s={11} c={COLORS.primary} /></Tag>
            </div>
          ))}
        </Card>

        {/* Active assignments */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
              {t("dashboard.activeAssignments")}
            </p>
            <Tag color="accent">{MOCK.assignments.length}</Tag>
          </div>
          {MOCK.assignments.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", padding: "10px 0" }}>
              {t("dashboard.noAssignments")}
            </p>
          ) : (
            MOCK.assignments.map((a) => (
              <div key={a.id} style={{
                padding: "10px 0", borderTop: "1px solid var(--ds-cream)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
                    {isFa ? a.titleFa : a.title}
                  </p>
                  <Tag color="neutral">{isFa ? a.dueFa : a.due}</Tag>
                </div>
                <ProgressBar value={a.progress} />
                <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 4 }}>
                  {t("dashboard.withTherapist")} {a.from}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ── Progress snapshot ──────────────────────────────────── */}
      <div style={{ marginBottom: gap }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 10 }}>
          {t("dashboard.yourProgress")}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { icon: "video",    label: t("dashboard.sessionsCompleted"), value: MOCK.progress.sessions, color: COLORS.primary },
            { icon: "check",    label: t("dashboard.assignmentsDone"),   value: MOCK.progress.assignments, color: COLORS.success },
            { icon: "activity", label: t("dashboard.streak"),            value: `${MOCK.progress.streak} ${t("dashboard.weeks")}`, color: COLORS.accent },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "var(--ds-card-bg)", borderRadius: RADIUS.md,
              padding: "14px 12px", border: "1px solid var(--ds-card-border)",
              boxShadow: "var(--ds-shadow-stat)", textAlign: "center",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: RADIUS.sm,
                background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px",
              }}>
                <Ic n={s.icon} s={16} c={s.color} />
              </div>
              <p className="ds-heading" style={{ fontSize: 20, color: "var(--ds-text)", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: "var(--ds-text-mid)", marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommended resources ──────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 12 }}>
          {t("dashboard.recommended")}
        </p>
        {MOCK.resources.map((r) => (
          <div key={r.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0", borderTop: "1px solid var(--ds-cream)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: RADIUS.sm,
              background: "var(--ds-cream)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic n={r.type === "exercise" ? "wind" : "book"} s={16} c={COLORS.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{isFa ? r.titleFa : r.title}</p>
              <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>{isFa ? r.typeFa : r.type}</p>
            </div>
            <Ic n="chev" s={14} c={COLORS.textLight} style={{ transform: dir === "rtl" ? undefined : "rotate(180deg)" }} />
          </div>
        ))}
      </Card>
    </div>
  );
};
