// ─────────────────────────────────────────────────────────────
// THERAPIST / Dashboard
// ─────────────────────────────────────────────────────────────
// Accessible summary view: income, patients, sessions,
// transcription/AI summaries, pending notes, upcoming sessions.
//
// TODO(backend-integration): all data is mock — replace with
// real API calls for sessions, patients, notes, earnings, etc.
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, Ic, StatCard, SessionCard, BottomSheet, Textarea } from "@ds";
import { COLORS, RADIUS, FONTS } from "@ds";
import { convertTimeBetweenOffsets } from "@shared/utils/availability.js";

// ── Note constants & helpers ──────────────────────────────────
const LOCK_DAYS = 3;
const AUTOSAVE_DELAY = 2000;
const LS_KEY = "delgoosh_therapist_notes";

const loadNotes = () => {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
};
const persistNotes = (notes) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch { /* quota */ }
};

/** Compute effective status — auto-lock after LOCK_DAYS past submission */
const effectiveStatus = (note) => {
  if (!note || note.status === "empty") return "empty";
  if (note.status === "draft") return "draft";
  if (note.status === "submitted") {
    const lockTime = new Date(note.submittedAt).getTime() + LOCK_DAYS * 86400000;
    return Date.now() >= lockTime ? "locked" : "submitted";
  }
  return note.status;
};

/** Returns { days, hours, totalHours } until lock, or null */
const editTimeRemaining = (note) => {
  if (!note || note.status !== "submitted") return null;
  const lockTime = new Date(note.submittedAt).getTime() + LOCK_DAYS * 86400000;
  const diff = lockTime - Date.now();
  if (diff <= 0) return null;
  const totalHours = Math.floor(diff / 3600000);
  return { days: Math.floor(totalHours / 24), hours: totalHours % 24, totalHours };
};

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
    therapistUtcOffset: "+03:30",   // Asia/Tehran
    patientUtcOffset:   "-05:00",   // America/New_York
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
      transcriptText: {
        en: "Therapist: How have you been feeling since our last session?\n\nSara: I've been doing a bit better, actually. The breathing exercises have helped when I feel the anxiety coming on, especially in the mornings before work.\n\nTherapist: That's great progress. Can you tell me more about what triggers the anxiety in the mornings?\n\nSara: It's usually when I start thinking about my workload. I have this pattern of catastrophizing — imagining everything going wrong before the day even starts.\n\nTherapist: Let's work on some cognitive restructuring techniques today. When you notice that pattern, I'd like you to try identifying the specific thought and asking yourself: what evidence do I have that this will actually happen?",
        fa: "درمانگر: از جلسه قبل تا حالا چه حالی داشتید؟\n\nسارا: راستش کمی بهتر بوده. تمرین‌های تنفس وقتی احساس می‌کنم اضطراب داره میاد کمک کرده، مخصوصاً صبح‌ها قبل از کار.\n\nدرمانگر: این پیشرفت خوبی‌ه. می‌تونید بیشتر بگید چه چیزی صبح‌ها اضطراب رو تحریک می‌کنه؟\n\nسارا: معمولاً وقتی شروع می‌کنم به فکر کردن درباره حجم کارم. یه الگوی فاجعه‌سازی دارم — تصور می‌کنم همه چیز قبل از شروع روز خراب می‌شه.\n\nدرمانگر: بیایید امروز روی تکنیک‌های بازسازی شناختی کار کنیم. وقتی این الگو رو متوجه می‌شید، می‌خوام سعی کنید فکر خاص رو شناسایی کنید و از خودتان بپرسید: چه مدرکی دارم که این واقعاً اتفاق بیفتد؟",
      },
      aiSummaryText: {
        en: "Session focused on anxiety management with cognitive restructuring techniques.\n\nKey observations:\n• Patient reports improvement with breathing exercises, particularly effective in morning anxiety episodes\n• Primary trigger identified: work-related catastrophizing thoughts before the day begins\n• Pattern of anticipatory anxiety with cognitive distortion (catastrophizing)\n\nInterventions used:\n• Cognitive restructuring — evidence-based thought challenging\n• Continued breathing exercises as coping mechanism\n\nRecommendations:\n• Continue daily breathing practice\n• Introduce thought record journal for tracking catastrophizing patterns\n• Follow up on sleep quality next session",
        fa: "جلسه بر مدیریت اضطراب با تکنیک‌های بازسازی شناختی متمرکز بود.\n\nمشاهدات کلیدی:\n• بیمار بهبود با تمرین‌های تنفس گزارش می‌دهد، به‌ویژه در دوره‌های اضطراب صبحگاهی مؤثر بوده\n• محرک اصلی شناسایی شده: افکار فاجعه‌ساز مرتبط با کار قبل از شروع روز\n• الگوی اضطراب پیش‌بینانه با تحریف شناختی (فاجعه‌سازی)\n\nمداخلات استفاده‌شده:\n• بازسازی شناختی — چالش فکر مبتنی بر شواهد\n• ادامه تمرین‌های تنفس به‌عنوان مکانیسم مقابله\n\nتوصیه‌ها:\n• ادامه تمرین تنفس روزانه\n• معرفی دفترچه ثبت افکار برای ردیابی الگوهای فاجعه‌سازی\n• پیگیری کیفیت خواب در جلسه بعدی",
      },
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
      transcriptText: {
        en: "Therapist: Ali, how has your mood been this past week?\n\nAli: It's been up and down. I had a couple of good days where I actually felt motivated to go for a walk, but then the weekend hit and I just stayed in bed most of the time.\n\nTherapist: Those good days are important. What was different about them?\n\nAli: I think it was because I had plans with a friend. Having something to look forward to helped.\n\nTherapist: That's an insightful observation. Social connection seems to be a protective factor for you. Let's explore how we can build more of that into your routine.",
        fa: "درمانگر: علی، این هفته خلقتون چطور بوده؟\n\nعلی: بالا و پایین بوده. چند روز خوب داشتم که واقعاً انگیزه داشتم برم پیاده‌روی، ولی آخر هفته رسید و بیشتر وقتم رو تو تخت موندم.\n\nدرمانگر: اون روزهای خوب مهم‌ان. چه فرقی داشتن؟\n\nعلی: فکر کنم چون با یه دوست قرار داشتم. داشتن چیزی برای منتظرش بودن کمک کرد.\n\nدرمانگر: این مشاهده بصیرت‌آمیزیه. ارتباط اجتماعی انگار یه عامل محافظتی برای شماست. بیایید ببینیم چطور می‌تونیم بیشتر از این رو تو برنامه روزانه‌تون بگنجونیم.",
      },
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
  const notesRef = useRef(null);
  const scrollToNotes = () => notesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Read-only panel state (transcript / AI summary) ──────
  const [viewPanel, setViewPanel] = useState(null); // null | { type: "transcript"|"summary", session }

  // ── Notes state ───────────────────────────────────────────
  const [notes, setNotes] = useState(loadNotes);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const autoSaveTimer = useRef(null);

  // Persist notes to localStorage on every change
  useEffect(() => { persistNotes(notes); }, [notes]);
  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

  const debouncedSave = useCallback((sessionId, text) => {
    clearTimeout(autoSaveTimer.current);
    setSaveStatus("unsaved");
    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      setNotes((prev) => {
        const existing = prev[sessionId] || { sessionId, status: "empty", content: "", createdAt: null, updatedAt: null, submittedAt: null };
        const now = new Date().toISOString();
        return { ...prev, [sessionId]: { ...existing, content: text, status: existing.status === "empty" ? "draft" : existing.status, createdAt: existing.createdAt || now, updatedAt: now } };
      });
      setTimeout(() => setSaveStatus("saved"), 400);
    }, AUTOSAVE_DELAY);
  }, []);

  const handleNoteChange = (text) => { setNoteText(text); if (activeNoteId != null) debouncedSave(activeNoteId, text); };

  const openNote = (sessionId) => {
    const existing = notes[sessionId];
    setActiveNoteId(sessionId);
    setNoteText(existing?.content || "");
    setSaveStatus("saved");
  };

  const closeNote = () => {
    clearTimeout(autoSaveTimer.current);
    if (activeNoteId != null && noteText.trim()) {
      setNotes((prev) => {
        const existing = prev[activeNoteId] || { sessionId: activeNoteId, status: "empty", content: "", createdAt: null, updatedAt: null, submittedAt: null };
        const now = new Date().toISOString();
        return { ...prev, [activeNoteId]: { ...existing, content: noteText, status: existing.status === "empty" ? "draft" : existing.status, createdAt: existing.createdAt || now, updatedAt: now } };
      });
    }
    setActiveNoteId(null); setNoteText(""); setSaveStatus("saved");
  };

  const submitNote = () => {
    if (activeNoteId == null || !noteText.trim()) return;
    const now = new Date().toISOString();
    setNotes((prev) => ({ ...prev, [activeNoteId]: { ...(prev[activeNoteId] || {}), content: noteText, status: "submitted", submittedAt: now, updatedAt: now } }));
    setSaveStatus("saved");
  };

  const pendingCount = MOCK.pendingNotes.filter((n) => { const s = effectiveStatus(notes[n.id]); return s === "empty" || s === "draft"; }).length;

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Profile avatar — mobile only (not in bottom nav) */}
          {!isD && (
            <button
              onClick={() => setTab?.("profile")}
              style={{
                width: 42, height: 42, borderRadius: "50%", border: "none",
                background: "none", cursor: "pointer", padding: 0,
              }}
            >
              <Avatar initials={loc(MOCK.initials, lang)} size={42} />
            </button>
          )}
          {/* Notification bell with dropdown */}
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
      </div>

      {/* ── Compact stat cards with CTAs ─────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isD ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap, marginBottom: gap }}>
        {[
          { icon: "money", value: loc(MOCK.stats.monthEarnings, lang), label: t("dashboard.monthEarnings"), color: COLORS.success, cta: t("earnings.requestWithdraw"), onClick: () => setTab?.("earnings") },
          { icon: "users", value: MOCK.stats.activePatients, label: t("dashboard.activePatients"), color: COLORS.primary, cta: t("nav.patients"), onClick: () => setTab?.("patients") },
          { icon: "video", value: MOCK.stats.weekSessions,   label: t("dashboard.weekSessions"),   color: COLORS.primaryDark, cta: t("nav.calendar"), onClick: () => setTab?.("calendar") },
          { icon: "edit",  value: pendingCount,              label: t("dashboard.pendingNotes"),   color: COLORS.warn, cta: t("dashboard.pendingNotes"), onClick: scrollToNotes },
        ].map((s, i) => (
          <div key={i} onClick={s.onClick} role="button" tabIndex={0} style={{
            background: "var(--ds-card-bg)", borderRadius: 14, padding: isD ? "12px 14px" : "10px 12px",
            border: "1px solid var(--ds-card-border)", boxShadow: "var(--ds-shadow-stat)",
            cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: isD ? 32 : 28, height: isD ? 32 : 28, background: `${s.color}14`, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Ic n={s.icon} s={isD ? 15 : 14} c={s.color} />
              </div>
              <p className="ds-heading" style={{ fontSize: isD ? 22 : 20, color: "var(--ds-text)", lineHeight: 1 }}>{s.value}</p>
            </div>
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{s.label}</p>
            <p style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.cta} {dir === "rtl" ? "←" : "→"}</p>
          </div>
        ))}
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
            counterpartHint={(() => {
              const pt = convertTimeBetweenOffsets(
                MOCK.nextSession.time.en,
                MOCK.nextSession.therapistUtcOffset,
                MOCK.nextSession.patientUtcOffset
              );
              return `${pt} ${t("dashboard.theirTime")} ${loc(MOCK.nextSession.patientName, lang)}`;
            })()}
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

      {/* ── Pending notes — with transcript/AI summary access ── */}
      <div ref={notesRef} />
      <Card style={{ marginBottom: gap }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
            {pendingCount} {t("dashboard.pendingNotes")}
          </p>
          {pendingCount > 0 && <Tag color="warn">{t("dashboard.noteRequired")}</Tag>}
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
                    {loc(note.topic, lang)} · {loc(note.date, lang)}
                  </p>
                  {effectiveStatus(notes[note.id]) === "draft" && (
                    <Tag color="warn" style={{ fontSize: 8, padding: "1px 5px" }}>{t("notes.statusDraft")}</Tag>
                  )}
                  {effectiveStatus(notes[note.id]) === "submitted" && (
                    <Tag color="success" style={{ fontSize: 8, padding: "1px 5px" }}>{t("notes.statusSubmitted")}</Tag>
                  )}
                  {effectiveStatus(notes[note.id]) === "locked" && (
                    <Tag color="neutral" style={{ fontSize: 8, padding: "1px 5px" }}>{t("notes.statusLocked")}</Tag>
                  )}
                </div>
              </div>
              {(() => {
                const status = effectiveStatus(notes[note.id]);
                if (status === "draft") return <Button variant="ghost" size="xs" onClick={() => openNote(note.id)}><Ic n="pen" s={11} c={COLORS.primary} /> {t("notes.editNote")}</Button>;
                if (status === "submitted") return <Button variant="ghost" size="xs" onClick={() => openNote(note.id)}><Ic n="pen" s={11} c={COLORS.success} /> {t("notes.editNote")}</Button>;
                if (status === "locked") return <Button variant="ghost2" size="xs" onClick={() => openNote(note.id)}>{t("notes.statusLocked")}</Button>;
                return <Button variant="primary" size="xs" onClick={() => openNote(note.id)}>{t("dashboard.addNote")}</Button>;
              })()}
            </div>
            {/* Transcript / AI summary availability */}
            <div style={{ display: "flex", gap: 6, marginTop: 8, ...(dir === "rtl" ? { marginRight: 50 } : { marginLeft: 50 }) }}>
              {note.hasTranscript && (
                <button onClick={() => setViewPanel({ type: "transcript", session: note })} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                  borderRadius: RADIUS.sm, border: `1px solid ${COLORS.primaryGhost}`,
                  background: COLORS.primaryGhost, cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Ic n="file" s={11} c={COLORS.primary} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary }}>{t("dashboard.transcript")}</span>
                </button>
              )}
              {note.hasAiSummary && (
                <button onClick={() => setViewPanel({ type: "summary", session: note })} style={{
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
            {t("nav.patients")} {dir === "rtl" ? "←" : "→"}
          </Button>
        </Card>
      </div>

      {/* ── Note BottomSheet ───────────────────────────────────── */}
      {activeNoteId != null && (() => {
        const session = MOCK.pendingNotes.find((n) => n.id === activeNoteId);
        const noteData = notes[activeNoteId];
        const status = effectiveStatus(noteData);
        const isLocked = status === "locked";
        const remaining = editTimeRemaining(noteData);
        return (
          <BottomSheet onClose={closeNote}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{t("notes.sheetTitle")}</p>
                <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>
                  {t("notes.forSession")} {loc(session?.patient, lang)} · {loc(session?.date, lang)}
                </p>
              </div>
              <button onClick={closeNote} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Ic n="x" s={18} c="var(--ds-text-mid)" />
              </button>
            </div>

            {/* Status row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {status === "draft" && <Tag color="warn">{t("notes.statusDraft")}</Tag>}
              {status === "submitted" && <Tag color="success">{t("notes.statusSubmitted")}</Tag>}
              {isLocked && <Tag color="neutral">{t("notes.statusLocked")}</Tag>}
              {remaining && (
                <span style={{ fontSize: 10, color: COLORS.warn, fontWeight: 600 }}>
                  {remaining.days > 0
                    ? `${remaining.days} ${remaining.days === 1 ? t("notes.dayLeft") : t("notes.daysLeft")}`
                    : `${remaining.totalHours} ${t("notes.hoursLeft")}`}
                </span>
              )}
              {!isLocked && (
                <span style={{
                  fontSize: 10, fontWeight: 600, marginInlineStart: "auto",
                  color: saveStatus === "saving" ? COLORS.warn : saveStatus === "unsaved" ? COLORS.danger : COLORS.success,
                }}>
                  {saveStatus === "saving" ? t("notes.saving") : saveStatus === "unsaved" ? t("notes.unsaved") : t("notes.saved")}
                </span>
              )}
            </div>

            {/* Lock warning */}
            {isLocked && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                borderRadius: RADIUS.sm, background: "var(--ds-cream)", marginBottom: 12,
              }}>
                <Ic n="shield" s={14} c="var(--ds-text-light)" />
                <span style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{t("notes.lockWarning")}</span>
              </div>
            )}

            {/* Textarea */}
            <Textarea
              value={noteText}
              onChange={isLocked ? undefined : handleNoteChange}
              placeholder={t("notes.placeholder")}
              rows={8}
              style={{
                fontFamily: FONTS.note.family, fontSize: 15, lineHeight: 1.8, marginBottom: 12,
                ...(isLocked && { opacity: 0.7, pointerEvents: "none", background: "var(--ds-cream)" }),
              }}
            />

            {/* Privacy note */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <Ic n="shield" s={11} c="var(--ds-text-light)" />
              <span style={{ fontSize: 10, color: "var(--ds-text-light)", fontStyle: "italic" }}>{t("notes.private")}</span>
            </div>

            {/* Actions */}
            {!isLocked ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost2" size="sm" onClick={closeNote} style={{ flex: 1 }}>
                  {t("action.close")}
                </Button>
                {(status === "empty" || status === "draft") && (
                  <Button variant="primary" size="sm" onClick={submitNote} disabled={!noteText.trim()} style={{ flex: 1 }}>
                    {t("notes.submitNote")}
                  </Button>
                )}
                {status === "submitted" && (
                  <Button variant="primary" size="sm" onClick={submitNote} disabled={!noteText.trim()} style={{ flex: 1 }}>
                    {t("action.save")}
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="ghost2" size="sm" onClick={closeNote} style={{ width: "100%" }}>
                {t("action.close")}
              </Button>
            )}
          </BottomSheet>
        );
      })()}

      {/* ── Read-only panel BottomSheet (transcript / AI summary) ── */}
      {viewPanel && (() => {
        const s = viewPanel.session;
        const isTranscript = viewPanel.type === "transcript";
        const title = isTranscript ? t("session.transcript") : t("session.aiSummary");
        const icon  = isTranscript ? "file" : "bot";
        const color = isTranscript ? COLORS.primary : COLORS.success;
        const ghost = isTranscript ? COLORS.primaryGhost : COLORS.successGhost;
        const text  = isTranscript ? loc(s.transcriptText, lang) : loc(s.aiSummaryText, lang);
        return (
          <BottomSheet onClose={() => setViewPanel(null)}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: RADIUS.sm, background: ghost,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Ic n={icon} s={16} c={color} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
                  <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>
                    {loc(s.topic, lang)} · {loc(s.date, lang)}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Ic n="x" s={18} c="var(--ds-text-mid)" />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: 16, borderRadius: RADIUS.md, background: "var(--ds-cream)",
              borderInlineStart: `3px solid ${color}`, marginBottom: 16,
              maxHeight: "55vh", overflowY: "auto",
            }}>
              <p style={{
                fontFamily: FONTS.note.family, fontSize: 14, lineHeight: 1.9,
                color: "var(--ds-text)", whiteSpace: "pre-wrap",
              }}>
                {text}
              </p>
            </div>

            {/* Close */}
            <Button variant="ghost2" size="sm" onClick={() => setViewPanel(null)} style={{ width: "100%" }}>
              {t("action.close")}
            </Button>
          </BottomSheet>
        );
      })()}
    </div>
  );
};
