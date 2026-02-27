// ─────────────────────────────────────────────────────────────
// THERAPIST / Dashboard
// ─────────────────────────────────────────────────────────────
// Accessible summary view: income, patients, sessions,
// transcription/AI summaries, pending notes, upcoming sessions.
//
// TODO(backend-integration): all data is mock — replace with
// real API calls for sessions, patients, notes, earnings, etc.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, Ic, StatCard, SessionCard } from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Mock data ─────────────────────────────────────────────────
// TODO(backend-integration): replace with real API data
const MOCK = {
  name:     { en: "Dr. Bijan Nezhad", fa: "دکتر بیژن نژاد" },
  initials: { en: "BN", fa: "ب.ن" },
  stats: {
    weekSessions:   5,
    activePatients: 12,
    pendingNotes:   3,
    monthEarnings:  { en: "$2,450", fa: "۲٬۴۵۰ $" },
  },
  notifications: [
    { id: 1, text: { en: "Session with Sara M. in 2 hours",      fa: "جلسه با سارا م. تا ۲ ساعت دیگر" },     time: "2h" },
    { id: 2, text: { en: "3 session notes are pending review",   fa: "۳ یادداشت جلسه در انتظار بررسی" },      time: "1d" },
    { id: 3, text: { en: "Ali R. completed breathing exercise",  fa: "علی ر. تمرین تنفس را تکمیل کرد" },     time: "3h" },
  ],
  nextSession: {
    patientName:    { en: "Sara Mohammadi", fa: "سارا محمدی" },
    patientInitials: "SM",
    topic:          { en: "Anxiety management — session 4", fa: "مدیریت اضطراب — جلسه ۴" },
    date:           { en: "Tue, Feb 27", fa: "سه‌شنبه ۸ اسفند" },
    time:           { en: "10:00 AM",    fa: "۱۰:۰۰ صبح" },
    hoursUntil:     2,
  },
  // Recent sessions needing therapist notes — with transcript/AI summary availability
  pendingNotes: [
    {
      id: 1,
      patient: { en: "Sara Mohammadi", fa: "سارا محمدی" },
      initials: "SM",
      date:    { en: "Feb 25, 10:00 AM", fa: "۶ اسفند، ۱۰:۰۰ صبح" },
      topic:   { en: "Anxiety management", fa: "مدیریت اضطراب" },
      hasTranscript: true,
      hasAiSummary:  true,
      hasNote:       false,
    },
    {
      id: 2,
      patient: { en: "Ali Rezaei", fa: "علی رضایی" },
      initials: "AR",
      date:    { en: "Feb 24, 2:00 PM",  fa: "۵ اسفند، ۱۴:۰۰" },
      topic:   { en: "Depression follow-up", fa: "پیگیری افسردگی" },
      hasTranscript: true,
      hasAiSummary:  false,
      hasNote:       false,
    },
    {
      id: 3,
      patient: { en: "Maryam Hosseini", fa: "مریم حسینی" },
      initials: "MH",
      date:    { en: "Feb 23, 11:00 AM", fa: "۴ اسفند، ۱۱:۰۰ صبح" },
      topic:   { en: "Couples therapy", fa: "زوج‌درمانی" },
      hasTranscript: false,
      hasAiSummary:  false,
      hasNote:       false,
    },
  ],
  upcomingSessions: [
    { id: 1, patient: { en: "Ali Rezaei",      fa: "علی رضایی" },    initials: "AR", date: { en: "Thu, Feb 27", fa: "پنجشنبه ۸ اسفند" }, time: { en: "2:00 PM", fa: "۱۴:۰۰" } },
    { id: 2, patient: { en: "Maryam Hosseini", fa: "مریم حسینی" },   initials: "MH", date: { en: "Fri, Feb 28", fa: "جمعه ۹ اسفند" },    time: { en: "11:00 AM", fa: "۱۱:۰۰ صبح" } },
    { id: 3, patient: { en: "Nima Tavakoli",   fa: "نیما توکلی" },   initials: "NT", date: { en: "Sat, Mar 1",  fa: "شنبه ۱۰ اسفند" },  time: { en: "9:00 AM", fa: "۹:۰۰ صبح" } },
  ],
  // Patient tasks that need review
  patientTasks: [
    { id: 1, patient: { en: "Ali Rezaei", fa: "علی رضایی" }, initials: "AR", task: { en: "Completed breathing exercise", fa: "تمرین تنفس را تکمیل کرد" }, time: "3h" },
    { id: 2, patient: { en: "Sara Mohammadi", fa: "سارا محمدی" }, initials: "SM", task: { en: "Submitted mood journal", fa: "دفترچه خلق را ارسال کرد" }, time: "1d" },
  ],
};

const loc = (obj, lang) => obj?.[lang] || obj?.en || "";

export const Dashboard = ({ setTab }) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isFa = lang === "fa";

  const [showNotifs, setShowNotifs] = useState(false);

  // Time-based greeting
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "goodMorning" : hour < 17 ? "goodAfternoon" : "goodEvening";

  const gap = isD ? 20 : 12;
  const pad = isD ? 28 : 14;

  return (
    <div style={{ direction: dir, padding: pad, maxWidth: isD ? 860 : 480, margin: "0 auto" }}>

      {/* ── Header: Greeting + Notification bell ────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: gap }}>
        <div>
          <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", lineHeight: 1.2 }}>
            {t(`dashboard.${greetKey}`)}، {loc(MOCK.name, lang)}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginTop: 4 }}>
            {t("dashboard.today")} — {new Date().toLocaleDateString(isFa ? "fa-IR" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
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
          {showNotifs && (
            <div style={{
              position: "absolute", top: 50, ...(dir === "rtl" ? { left: 0 } : { right: 0 }),
              width: 300, background: "var(--ds-card-bg)", borderRadius: RADIUS.lg,
              border: "1px solid var(--ds-card-border)", boxShadow: "var(--ds-shadow-card)",
              padding: 12, zIndex: 10,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 10 }}>
                {t("dashboard.notifications")}
              </p>
              {MOCK.notifications.map((n) => (
                <div key={n.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--ds-cream)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: "var(--ds-text)", lineHeight: 1.4 }}>{loc(n.text, lang)}</p>
                    <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards (on mobile these double as quick actions) ── */}
      <div style={{ display: "grid", gridTemplateColumns: isD ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap, marginBottom: gap }}>
        <StatCard icon="money"  value={loc(MOCK.stats.monthEarnings, lang)} label={t("dashboard.monthEarnings")} accentColor={COLORS.success}
          onClick={!isD ? () => setTab?.("earnings") : undefined} sub={!isD ? t("earnings.requestWithdraw") : undefined} />
        <StatCard icon="users"  value={MOCK.stats.activePatients} label={t("dashboard.activePatients")} accentColor={COLORS.primary}
          onClick={!isD ? () => setTab?.("patients") : undefined} />
        <StatCard icon="video"  value={MOCK.stats.weekSessions}   label={t("dashboard.weekSessions")}   accentColor={COLORS.primaryDark}
          onClick={!isD ? () => setTab?.("calendar") : undefined} sub={!isD ? t("dashboard.viewCalendar") : undefined} />
        <StatCard icon="edit"   value={MOCK.stats.pendingNotes}   label={t("dashboard.pendingNotes")}   accentColor={COLORS.warn} />
      </div>

      {/* ── Next session — full width ─────────────────────────── */}
      <div style={{ marginBottom: gap }}>
        {MOCK.nextSession ? (
          <SessionCard
            patientName={loc(MOCK.nextSession.patientName, lang)}
            initials={MOCK.nextSession.patientInitials}
            topic={loc(MOCK.nextSession.topic, lang)}
            date={loc(MOCK.nextSession.date, lang)}
            time={loc(MOCK.nextSession.time, lang)}
            hoursUntil={MOCK.nextSession.hoursUntil}
            onJoin={() => {}}
            onCancel={() => {}}
          />
        ) : (
          <Card style={{ textAlign: "center", padding: "30px 20px" }}>
            <Ic n="cal" s={32} c={COLORS.textLight} />
            <p style={{ fontSize: 14, color: "var(--ds-text-mid)", fontWeight: 600, marginTop: 8 }}>
              {t("dashboard.noUpcoming")}
            </p>
          </Card>
        )}
      </div>

      {/* ── Quick actions — desktop only (on mobile, stat cards are tappable) */}
      {isD && (
        <div style={{ marginBottom: gap }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text)", marginBottom: 8 }}>
            {t("dashboard.quickActions")}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: "cal",   label: t("dashboard.viewCalendar"),   color: COLORS.primary,     tab: "calendar" },
              { icon: "users", label: t("nav.patients"),             color: COLORS.primaryDark, tab: "patients" },
              { icon: "money", label: t("earnings.requestWithdraw"), color: COLORS.success,     tab: "earnings" },
            ].map((a, i) => (
              <button key={i} onClick={() => setTab?.(a.tab)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "14px 16px", borderRadius: RADIUS.sm, border: "1px solid var(--ds-card-border)",
                background: "var(--ds-card-bg)", cursor: "pointer", minWidth: 80, flex: 1,
                boxShadow: "var(--ds-shadow-stat)", fontFamily: "inherit",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: RADIUS.sm,
                  background: `${a.color}14`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic n={a.icon} s={18} c={a.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text)", whiteSpace: "nowrap" }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending notes — with transcript/AI summary access ── */}
      <Card style={{ marginBottom: gap }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
            {MOCK.pendingNotes.length} {t("dashboard.pendingNotes")}
          </p>
          <Tag color="warn">{t("dashboard.noteRequired")}</Tag>
        </div>
        {MOCK.pendingNotes.map((note) => (
          <div key={note.id} style={{
            padding: "12px 0", borderTop: "1px solid var(--ds-cream)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials={note.initials} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
                    {loc(note.patient, lang)}
                  </p>
                  <button onClick={() => setTab?.("patients")} style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex",
                  }}>
                    <Ic n="chev" s={12} c={COLORS.textLight} style={{ transform: dir === "rtl" ? undefined : "rotate(180deg)" }} />
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 1 }}>
                  {loc(note.topic, lang)} · {loc(note.date, lang)}
                </p>
              </div>
              <Button variant="primary" size="xs">{t("dashboard.addNote")}</Button>
            </div>
            {/* Transcript / AI summary availability */}
            <div style={{ display: "flex", gap: 6, marginTop: 8, ...(dir === "rtl" ? { marginRight: 50 } : { marginLeft: 50 }) }}>
              {note.hasTranscript && (
                <button style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                  borderRadius: RADIUS.sm, border: `1px solid ${COLORS.primaryGhost}`,
                  background: COLORS.primaryGhost, cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Ic n="file" s={11} c={COLORS.primary} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary }}>{t("dashboard.transcript")}</span>
                </button>
              )}
              {note.hasAiSummary && (
                <button style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                  borderRadius: RADIUS.sm, border: `1px solid ${COLORS.successGhost}`,
                  background: COLORS.successGhost, cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Ic n="bot" s={11} c={COLORS.success} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.success }}>{t("dashboard.aiSummary")}</span>
                </button>
              )}
              {!note.hasTranscript && !note.hasAiSummary && (
                <span style={{ fontSize: 10, color: "var(--ds-text-light)", fontStyle: "italic" }}>
                  {t("dashboard.viewSession")}
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* ── Two-column: Upcoming sessions + Patient task updates ── */}
      <div style={{ display: isD ? "flex" : "block", gap, marginBottom: gap + 40 }}>

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
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
                  {loc(s.patient, lang)}
                </p>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
                  {loc(s.date, lang)} · {loc(s.time, lang)}
                </p>
              </div>
              <button onClick={() => setTab?.("patients")} style={{
                background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex",
              }}>
                <Ic n="chev" s={14} c={COLORS.textLight} style={{ transform: dir === "rtl" ? undefined : "rotate(180deg)" }} />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="xs" style={{ marginTop: 8, width: "100%" }} onClick={() => setTab?.("calendar")}>
            {t("dashboard.viewCalendar")}
          </Button>
        </Card>

        {/* Patient task updates — assignments that need review */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
              {t("dashboard.tasks")}
            </p>
            <Tag color="accent">{MOCK.patientTasks.length}</Tag>
          </div>
          {MOCK.patientTasks.map((task) => (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderTop: "1px solid var(--ds-cream)",
            }}>
              <Avatar initials={task.initials} size={36} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
                  {loc(task.patient, lang)}
                </p>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 1 }}>
                  {loc(task.task, lang)} · {task.time}
                </p>
              </div>
              <Button variant="ghost" size="xs">{t("dashboard.patientProfile")}</Button>
            </div>
          ))}
          <Button variant="ghost" size="xs" style={{ marginTop: 8, width: "100%" }} onClick={() => setTab?.("patients")}>
            {t("nav.patients")} →
          </Button>
        </Card>
      </div>
    </div>
  );
};
