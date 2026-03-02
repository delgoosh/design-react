// ─────────────────────────────────────────────────────────────
// PATIENT / Therapists
// ─────────────────────────────────────────────────────────────
// Shows chosen therapist (top card), suggested alternatives,
// booking BottomSheet with date strip + time chips,
// recurring-weekly / auto-renew logic, and re-triage flow.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Avatar, StarRating, StepIndicator, Ic, BottomSheet, Checkbox, ProgressBar } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { MOCK_THERAPISTS, MOCK_THERAPIST_AVAILABILITY } from "@shared/components/onboarding/mockData.js";
import {
  generateTherapistBlocks,
  groupBlocksByDate,
  getWeekStartDate,
  toDateStr,
  parseTimeToMinutes,
  minutesToTime,
  BLOCK_DURATION_MIN,
  BOOKING_HORIZON_WEEKS,
} from "@shared/utils/availability.js";
import { StepQuestionnaire } from "@shared/components/onboarding/StepQuestionnaire.jsx";
import { StepAiChat } from "@shared/components/onboarding/StepAiChat.jsx";

// Helper to pick localised value from { en, fa } objects
function loc(obj, lang) {
  if (typeof obj === "string") return obj;
  return obj?.[lang] || obj?.en || "";
}

// ── Format block time for display ────────────────────────────
function formatBlockTime(timeStr, lang) {
  if (lang === "fa") return timeStr.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatWeekLabel(weekStart, lang) {
  if (lang === "fa") return weekStart.toLocaleDateString("fa-IR", { month: "long", day: "numeric" });
  return weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Format date for display
function formatDate(date, lang) {
  if (lang === "fa") {
    return date.toLocaleDateString("fa-IR", { weekday: "short", month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateFull(date, lang) {
  if (lang === "fa") {
    return date.toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// Get short weekday + day number for date strip
function dateStripLabel(date, lang) {
  const weekday = date.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", { weekday: "short" });
  const day = date.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", { day: "numeric" });
  return { weekday, day };
}

// Check if a date is today or tomorrow
function dateRelative(date, t) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return t("therapists.today");
  if (date.toDateString() === tomorrow.toDateString()) return t("therapists.tomorrow");
  return null;
}

// ─────────────────────────────────────────────────────────────
export const Therapists = ({
  navigate,
  chosenTherapist,
  suggestedTherapists = [],
  nextSession,
  onChooseTherapist,
  onBookSession,
  onCancelSession,
  sessionCredits = 3,
  setSessionCredits,
  autoRenew = true,
}) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const isRtl = dir === "rtl";

  // ── Re-triage state ───────────────────────────────────────
  const [retriageMode, setRetriageMode] = useState(false);
  const [retriageStep, setRetriageStep] = useState(0);
  const [retriageAnswers, setRetriageAnswers] = useState({});

  // ── Booking state ─────────────────────────────────────────
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // dateStr e.g. "2026-03-03"
  const [selectedSlot, setSelectedSlot] = useState(null); // block start time e.g. "09:00"
  const [recurringChecked, setRecurringChecked] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null); // null | "success"
  const [bookedSessions, setBookedSessions] = useState([]); // [{ dateStr, startTime }]
  const [heldSlots, setHeldSlots] = useState([]); // [{ dateStr, startTime }]

  // ── Manage & cancel state ─────────────────────────────────
  const [showManage, setShowManage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null); // null | sessionInfo object

  const gap = isD ? 20 : 12;
  const pad = isD ? 28 : 14;

  // Generate block-based availability for chosen therapist (CREDIT-201/202)
  const therapistAvail = chosenTherapist ? MOCK_THERAPIST_AVAILABILITY[chosenTherapist.id] : null;
  const bookedSet = useMemo(() => new Set(bookedSessions.map((b) => `${b.dateStr}|${b.startTime}`)), [bookedSessions]);
  const heldSet = useMemo(() => new Set(heldSlots.map((h) => `${h.dateStr}|${h.startTime}`)), [heldSlots]);

  const allBlocks = useMemo(
    () => therapistAvail ? generateTherapistBlocks(therapistAvail, bookedSet, heldSet) : [],
    [therapistAvail, bookedSet, heldSet],
  );
  const blocksByDate = useMemo(() => groupBlocksByDate(allBlocks), [allBlocks]);

  // Compute recurring count (same weekday + same start time in future weeks)
  const recurringInfo = useMemo(() => {
    if (!selectedDate || !selectedSlot) return { count: 0, dates: [] };
    const selDayObj = blocksByDate.find((d) => d.dateStr === selectedDate);
    if (!selDayObj) return { count: 0, dates: [] };
    const selWeekday = new Date(selectedDate + "T12:00:00").getDay();
    const matchingDates = [selDayObj];
    for (const d of blocksByDate) {
      if (d.dateStr <= selectedDate) continue;
      if (new Date(d.dateStr + "T12:00:00").getDay() !== selWeekday) continue;
      if (d.blocks.some((b) => b.start === selectedSlot && b.status === "open")) matchingDates.push(d);
    }
    const maxByCredits = Math.min(matchingDates.length, sessionCredits);
    return { count: maxByCredits, dates: matchingDates.slice(0, maxByCredits) };
  }, [selectedDate, selectedSlot, blocksByDate, sessionCredits]);

  // Held weeks count for auto-renew (future matching weeks in horizon)
  const heldWeeksCount = useMemo(() => {
    if (!selectedDate || !selectedSlot) return 0;
    const selWeekday = new Date(selectedDate + "T12:00:00").getDay();
    let count = 0;
    for (const d of blocksByDate) {
      if (d.dateStr <= selectedDate) continue;
      if (new Date(d.dateStr + "T12:00:00").getDay() !== selWeekday) continue;
      if (d.blocks.some((b) => b.start === selectedSlot && b.status === "open")) count++;
    }
    return count;
  }, [selectedDate, selectedSlot, blocksByDate]);

  // ── Open booking sheet ──────────────────────────────────
  const handleOpenBooking = () => {
    setShowBooking(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setRecurringChecked(true);
    setBookingStatus(null);
  };

  // ── Confirm booking ────────────────────────────────────
  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot || sessionCredits < 1) return;
    const selDayObj = blocksByDate.find((d) => d.dateStr === selectedDate);
    if (!selDayObj) return;
    const dateObj = new Date(selectedDate + "T12:00:00");
    const [hh, mm] = selectedSlot.split(":").map(Number);
    const isoDate = new Date(dateObj);
    isoDate.setHours(hh, mm, 0, 0);
    const endTime = minutesToTime(parseTimeToMinutes(selectedSlot) + BLOCK_DURATION_MIN);
    const sessionData = {
      date: { en: formatDate(dateObj, "en"), fa: formatDate(dateObj, "fa") },
      time: { en: formatBlockTime(selectedSlot, "en"), fa: formatBlockTime(selectedSlot, "fa") },
      dateISO: isoDate.toISOString(),
      startTime: selectedSlot,
      endTime,
      dateStr: selectedDate,
      description: {
        en: `Session booked — ${loc(chosenTherapist.name, "en")}`,
        fa: `رزرو جلسه — ${loc(chosenTherapist.name, "fa")}`,
      },
    };

    if (autoRenew) {
      // CREDIT-303: Deduct 1 credit, hold future slots
      setSessionCredits?.((s) => s - 1);
      const selWeekday = dateObj.getDay();
      const newHeld = [];
      for (const d of blocksByDate) {
        if (d.dateStr <= selectedDate) continue;
        if (new Date(d.dateStr + "T12:00:00").getDay() !== selWeekday) continue;
        if (d.blocks.some((b) => b.start === selectedSlot && b.status === "open")) {
          newHeld.push({ dateStr: d.dateStr, startTime: selectedSlot });
        }
      }
      setHeldSlots((prev) => [...prev, ...newHeld]);
      setBookedSessions((prev) => [...prev, { dateStr: selectedDate, startTime: selectedSlot }]);
    } else if (recurringChecked && sessionCredits > 1 && recurringInfo.count > 1) {
      // CREDIT-302: Book N sessions, deduct N credits
      const n = recurringInfo.count;
      setSessionCredits?.((s) => s - n);
      const newBooked = recurringInfo.dates.map((d) => ({ dateStr: d.dateStr, startTime: selectedSlot }));
      setBookedSessions((prev) => [...prev, ...newBooked]);
    } else {
      // CREDIT-301: Single booking
      setSessionCredits?.((s) => s - 1);
      setBookedSessions((prev) => [...prev, { dateStr: selectedDate, startTime: selectedSlot }]);
    }

    onBookSession?.(chosenTherapist, sessionData);
    setBookingStatus("success");
    setTimeout(() => {
      setShowBooking(false);
      setBookingStatus(null);
    }, 1500);
  };

  // Check if a block is already booked/held
  const isBooked = (dateStr, startTime) => bookedSet.has(`${dateStr}|${startTime}`);
  const isHeld = (dateStr, startTime) => heldSet.has(`${dateStr}|${startTime}`);

  // ── Re-triage flow ────────────────────────────────────────
  if (retriageMode) {
    return (
      <div style={{
        direction: dir, padding: pad, paddingBottom: 100,
        maxWidth: isD ? 680 : undefined,
        margin: isD ? "0 auto" : undefined,
      }}>
        {/* Header with cancel */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20,
        }}>
          <h2 className="ds-heading" style={{ fontSize: isD ? 22 : 18, color: "var(--ds-text)" }}>
            {t("therapists.redoTriage")}
          </h2>
          <Button variant="ghost2" size="xs" onClick={() => { setRetriageMode(false); setRetriageStep(0); }}>
            {t("action.cancel")}
          </Button>
        </div>

        {/* Step indicator */}
        <div style={{ marginBottom: 24 }}>
          <StepIndicator
            steps={3}
            current={retriageStep}
            labels={[t("onboarding.questionnaireTitle"), t("onboarding.aiChatTitle"), t("onboarding.matchTitle")]}
          />
        </div>

        {/* Step content */}
        {retriageStep === 0 && (
          <StepQuestionnaire
            role="patient"
            answers={retriageAnswers}
            setAnswers={setRetriageAnswers}
            onNext={() => setRetriageStep(1)}
            onBack={() => { setRetriageMode(false); setRetriageStep(0); }}
          />
        )}
        {retriageStep === 1 && (
          <StepAiChat
            role="patient"
            onNext={() => setRetriageStep(2)}
            onBack={() => setRetriageStep(0)}
          />
        )}
        {retriageStep === 2 && (
          <RetriageMatchStep
            lang={lang}
            dir={dir}
            t={t}
            isD={isD}
            onChoose={(th) => {
              onChooseTherapist?.(th);
              setRetriageMode(false);
              setRetriageStep(0);
              setRetriageAnswers({});
            }}
            onBack={() => setRetriageStep(1)}
          />
        )}
      </div>
    );
  }

  // ── Normal view ───────────────────────────────────────────
  return (
    <div style={{
      direction: dir, padding: pad, paddingBottom: 100,
      maxWidth: isD ? 680 : undefined,
      margin: isD ? "0 auto" : undefined,
    }} className="ds-stagger">
      {/* ── Chosen therapist card ──────────────────────────── */}
      {chosenTherapist ? (
        <ChosenTherapistCard
          therapist={chosenTherapist}
          session={nextSession}
          hasActiveSessions={!!nextSession || bookedSessions.length > 0}
          lang={lang}
          dir={dir}
          isD={isD}
          isRtl={isRtl}
          t={t}
          sessionCredits={sessionCredits}
          onBook={handleOpenBooking}
          onManage={() => setShowManage(true)}
          onCancel={() => setShowCancelConfirm(nextSession)}
          onChange={() => {/* scroll to suggestions */}}
        />
      ) : (
        /* Empty state — onboarding incomplete */
        <>
          <div style={{ marginBottom: gap + 4 }} className="ds-anim-fadeUp">
            <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 20, color: "var(--ds-text)", marginBottom: 4 }}>
              {t("therapists.finishOnboarding")}
            </h1>
            <p style={{ fontSize: isD ? 13 : 12, color: "var(--ds-text-mid)" }}>
              {t("therapists.finishOnboardingSub")}
            </p>
          </div>
          <Card style={{
            textAlign: "center", padding: "36px 20px", marginBottom: gap,
          }} className="ds-anim-fadeUp">
            <Ic n="users" s={36} c={COLORS.textLight} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginTop: 12 }}>
              {t("therapists.noTherapistYet")}
            </p>
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", marginTop: 4, marginBottom: 16 }}>
              {t("therapists.noTherapistDesc")}
            </p>
            <Button variant="primary" size="sm" onClick={() => { setRetriageMode(true); setRetriageStep(0); }}>
              <Ic n="zap" s={14} c="white" />
              {t("therapists.startMatch")}
            </Button>
          </Card>
        </>
      )}

      {/* ── Suggested therapists ──────────────────────────── */}
      {suggestedTherapists.length > 0 && (() => {
        const hasActiveSessions = !!nextSession || bookedSessions.length > 0;
        return (
          <div style={{ marginTop: gap }} className="ds-anim-fadeUp">
            <h3 style={{ fontSize: isD ? 15 : 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: gap }}>
              {chosenTherapist ? t("therapists.suggestedTitle") : t("therapists.suggestedPageTitle")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap }}>
              {suggestedTherapists.map((th) => (
                <SuggestedTherapistCard
                  key={th.id}
                  therapist={th}
                  lang={lang}
                  dir={dir}
                  isD={isD}
                  t={t}
                  disabled={hasActiveSessions}
                  onChoose={() => onChooseTherapist?.(th)}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Redo triage card ──────────────────────────────── */}
      <Card variant="ghost" style={{
        marginTop: gap + 8, padding: isD ? 22 : 16,
        border: `1.5px dashed var(--ds-sand)`,
        display: "flex", flexDirection: isD ? "row" : "column",
        gap: isD ? 16 : 12, alignItems: isD ? "center" : "stretch",
      }} className="ds-anim-fadeUp">
        <div style={{
          width: 44, height: 44, borderRadius: RADIUS.md,
          background: COLORS.primaryGhost,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Ic n="zap" s={22} c={COLORS.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)", marginBottom: 3 }}>
            {t("therapists.redoTriage")}
          </p>
          <p style={{ fontSize: 12, color: "var(--ds-text-light)" }}>
            {t("therapists.redoTriageDesc")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setRetriageMode(true); setRetriageStep(0); setRetriageAnswers({}); }}
          style={{ flexShrink: 0 }}
        >
          {t("therapists.startMatch")}
        </Button>
      </Card>

      {/* ── Booking BottomSheet ──────────────────────────── */}
      {showBooking && chosenTherapist && (
        <BookingSheet
          therapist={chosenTherapist}
          blocksByDate={blocksByDate}
          sessionCredits={sessionCredits}
          autoRenew={autoRenew}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          recurringChecked={recurringChecked}
          recurringInfo={recurringInfo}
          heldWeeksCount={heldWeeksCount}
          bookingStatus={bookingStatus}
          onSelectDate={setSelectedDate}
          onSelectSlot={setSelectedSlot}
          onToggleRecurring={setRecurringChecked}
          onConfirm={handleConfirmBooking}
          onClose={() => { setShowBooking(false); setBookingStatus(null); }}
          onGoCredits={() => { setShowBooking(false); navigate?.("credits"); }}
          lang={lang}
          dir={dir}
          isD={isD}
          t={t}
        />
      )}

      {/* ── Manage Booking BottomSheet ─────────────────────── */}
      {showManage && (
        <ManageBookingSheet
          nextSession={nextSession}
          bookedSessions={bookedSessions}
          heldSlots={heldSlots}
          blocksByDate={blocksByDate}
          therapist={chosenTherapist}
          onCancelSession={(sessionInfo) => {
            setShowManage(false);
            setShowCancelConfirm(sessionInfo);
          }}
          onClose={() => setShowManage(false)}
          lang={lang}
          dir={dir}
          isD={isD}
          t={t}
        />
      )}

      {/* ── Cancel Confirm BottomSheet ─────────────────────── */}
      {showCancelConfirm && (
        <CancelConfirmSheet
          sessionInfo={showCancelConfirm}
          onConfirm={() => {
            const result = onCancelSession?.(showCancelConfirm);
            // Remove from local bookedSessions too
            if (showCancelConfirm.dateStr) {
              setBookedSessions((prev) => prev.filter(
                (b) => !(b.dateStr === showCancelConfirm.dateStr && b.startTime === showCancelConfirm.startTime)
              ));
            }
            setShowCancelConfirm(null);
          }}
          onClose={() => setShowCancelConfirm(null)}
          lang={lang}
          dir={dir}
          isD={isD}
          t={t}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ── Booking BottomSheet ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────
function BookingSheet({
  therapist, blocksByDate, sessionCredits, autoRenew,
  selectedDate, selectedSlot, recurringChecked, recurringInfo, heldWeeksCount,
  bookingStatus,
  onSelectDate, onSelectSlot, onToggleRecurring, onConfirm, onClose, onGoCredits,
  lang, dir, isD, t,
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Current week's days from blocksByDate
  const weekStart = useMemo(() => getWeekStartDate(new Date(), weekOffset), [weekOffset]);
  const weekDays = useMemo(() => {
    const ws = toDateStr(weekStart);
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 7);
    const weStr = toDateStr(we);
    return blocksByDate.filter((d) => d.dateStr >= ws && d.dateStr < weStr);
  }, [blocksByDate, weekStart]);

  const selDay = selectedDate ? blocksByDate.find((d) => d.dateStr === selectedDate) : null;
  const hasSlotSelected = selDay && selectedSlot != null;
  const canBook = hasSlotSelected && sessionCredits >= 1;
  const totalCredits = autoRenew
    ? 1
    : (recurringChecked && recurringInfo.count > 1 ? recurringInfo.count : 1);

  // Success state
  if (bookingStatus === "success") {
    return (
      <BottomSheet onClose={onClose}>
        <div style={{ textAlign: "center", padding: "30px 16px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `${COLORS.primary}18`, display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Ic n="check" s={28} c={COLORS.primary} />
          </div>
          <p className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 6 }}>
            {t("therapists.bookingSuccess")}
          </p>
          {autoRenew && heldWeeksCount > 0 && (
            <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginTop: 8 }}>
              <Ic n="shield" s={12} c={COLORS.primary} /> {heldWeeksCount} {t("therapists.heldWeeks")}
            </p>
          )}
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ direction: dir }}>
        {/* Title */}
        <h3 className="ds-heading" style={{ fontSize: isD ? 18 : 16, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("therapists.bookingTitle")}
        </h3>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 16 }}>
          {t("therapists.sessionDuration")} — {loc(therapist.name, lang)}
        </p>

        {/* ── Week navigator ─────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10,
        }}>
          <button
            onClick={() => { if (weekOffset > 0) { setWeekOffset((o) => o - 1); onSelectDate(null); onSelectSlot(null); } }}
            disabled={weekOffset === 0}
            style={{
              background: "none", border: "none", fontFamily: "inherit",
              cursor: weekOffset > 0 ? "pointer" : "default",
              opacity: weekOffset > 0 ? 1 : 0.3, display: "flex", padding: 4,
            }}
          >
            <span style={{ display: "flex", transform: dir === "rtl" ? "scaleX(-1)" : undefined }}>
              <Ic n="chev" s={16} c={COLORS.primary} />
            </span>
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", minWidth: 100, textAlign: "center" }}>
            {t("calendar.weekOf")} {formatWeekLabel(weekStart, lang)}
          </span>
          <button
            onClick={() => { if (weekOffset < BOOKING_HORIZON_WEEKS - 1) { setWeekOffset((o) => o + 1); onSelectDate(null); onSelectSlot(null); } }}
            disabled={weekOffset >= BOOKING_HORIZON_WEEKS - 1}
            style={{
              background: "none", border: "none", fontFamily: "inherit",
              cursor: weekOffset < BOOKING_HORIZON_WEEKS - 1 ? "pointer" : "default",
              opacity: weekOffset < BOOKING_HORIZON_WEEKS - 1 ? 1 : 0.3, display: "flex", padding: 4,
            }}
          >
            <span style={{ display: "flex", transform: dir === "rtl" ? undefined : "scaleX(-1)" }}>
              <Ic n="chev" s={16} c={COLORS.primary} />
            </span>
          </button>
        </div>

        {/* ── Date strip ────────────────────────────────────── */}
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 8, textTransform: "uppercase" }}>
          {t("therapists.selectSlot")}
        </p>
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8,
          WebkitOverflowScrolling: "touch",
        }}>
          {weekDays.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ds-text-light)", padding: "12px 0" }}>
              {t("calendar.noBlocksThisWeek")}
            </p>
          ) : weekDays.map((d) => {
            const dateObj = new Date(d.dateStr + "T12:00:00");
            const { weekday, day } = dateStripLabel(dateObj, lang);
            const isSelected = selectedDate === d.dateStr;
            const hasOpen = d.blocks.some((b) => b.status === "open");
            const rel = dateRelative(dateObj, t);
            return (
              <button
                key={d.dateStr}
                onClick={() => { onSelectDate(d.dateStr); onSelectSlot(null); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "8px 10px", minWidth: 52, borderRadius: RADIUS.md,
                  border: isSelected ? `2px solid ${COLORS.primary}` : "1.5px solid var(--ds-card-border)",
                  background: isSelected ? COLORS.primaryGhost : "var(--ds-card-bg)",
                  cursor: "pointer",
                  opacity: hasOpen ? 1 : 0.5,
                  fontFamily: "inherit", flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? COLORS.primary : "var(--ds-text-mid)" }}>
                  {rel || weekday}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: isSelected ? COLORS.primary : "var(--ds-text)", lineHeight: 1.4 }}>
                  {day}
                </span>
                {hasOpen && (
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%", marginTop: 3,
                    background: isSelected ? COLORS.primary : COLORS.accent,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Time chips (block start times) ──────────────────── */}
        {selDay && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 8 }}>
              {formatDateFull(new Date(selDay.dateStr + "T12:00:00"), lang)}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selDay.blocks.map((block) => {
                const isSelected = selectedSlot === block.start;
                const booked = block.status === "booked";
                const held = block.status === "held";
                return (
                  <button
                    key={block.start}
                    onClick={() => { if (!booked && !held) onSelectSlot(block.start); }}
                    style={{
                      padding: "8px 16px", borderRadius: RADIUS.pill, fontFamily: "inherit",
                      fontSize: 13, fontWeight: 600, cursor: booked || held ? "default" : "pointer",
                      border: booked
                        ? `1.5px solid ${COLORS.success}`
                        : held
                          ? `1.5px dashed ${COLORS.primary}`
                          : isSelected
                            ? `2px solid ${COLORS.accent}`
                            : "1.5px solid var(--ds-card-border)",
                      background: booked
                        ? `${COLORS.success}14`
                        : held
                          ? `${COLORS.primary}08`
                          : isSelected
                            ? `${COLORS.accent}18`
                            : "var(--ds-card-bg)",
                      color: booked
                        ? COLORS.success
                        : held
                          ? COLORS.primary
                          : isSelected
                            ? COLORS.accent
                            : "var(--ds-text)",
                      transition: "all 0.15s",
                    }}
                  >
                    {booked && <Ic n="check" s={11} c={COLORS.success} />}{" "}
                    {held && <Ic n="shield" s={11} c={COLORS.primary} />}{" "}
                    {formatBlockTime(block.start, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Session details + credit info ─────────────────── */}
        {hasSlotSelected && (
          <div style={{ marginTop: 18 }}>
            {/* Selected summary */}
            <Card variant="sm" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: RADIUS.sm,
                background: COLORS.primaryGhost, display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Ic n="cal" s={18} c={COLORS.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
                  {formatDateFull(new Date(selDay.dateStr + "T12:00:00"), lang)}
                </p>
                <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
                  {formatBlockTime(selectedSlot, lang)} · {t("therapists.sessionDuration")}
                </p>
              </div>
            </Card>

            {/* Credit cost */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", borderRadius: RADIUS.sm,
              background: "var(--ds-cream)", marginBottom: 12,
            }}>
              <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
                <Ic n="wallet" s={13} c="var(--ds-text-mid)" /> {t("therapists.currentBalance")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>
                {sessionCredits}
              </span>
            </div>

            {/* No credits warning */}
            {sessionCredits < 1 && (
              <div style={{
                background: `${COLORS.danger}10`, borderRadius: RADIUS.sm,
                padding: "10px 12px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Ic n="alert-triangle" s={15} c={COLORS.danger} />
                <span style={{ fontSize: 12, color: COLORS.danger, fontWeight: 600, flex: 1 }}>
                  {t("therapists.noCredits")}
                </span>
                <Button variant="ghost" size="xs" onClick={onGoCredits}>
                  {t("therapists.buyCreditsLink")}
                </Button>
              </div>
            )}

            {/* ── CREDIT-302: Recurring checkbox (non-subscribed, >1 credit) */}
            {!autoRenew && sessionCredits > 1 && recurringInfo.count > 1 && (
              <Card variant="tinted" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Checkbox
                    checked={recurringChecked}
                    onChange={(v) => onToggleRecurring(v)}
                    label=""
                  />
                  <div style={{ flex: 1 }} onClick={() => onToggleRecurring(!recurringChecked)}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", lineHeight: 1.5, cursor: "pointer" }}>
                      {t("therapists.recurringLabel")}
                    </p>
                    {recurringChecked && (
                      <p style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600, marginTop: 6 }}>
                        {recurringInfo.count} {t("therapists.sessionsWillBook")} · {recurringInfo.count} {t("therapists.creditsCost")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* ── CREDIT-303: Auto-renew info card */}
            {autoRenew && heldWeeksCount > 0 && (
              <Card variant="tinted" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: RADIUS.sm,
                    background: `${COLORS.primary}14`, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Ic n="shield" s={16} c={COLORS.primary} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text)", marginBottom: 3 }}>
                      {t("therapists.autoRenewInfo")}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5 }}>
                      {t("therapists.autoRenewDetail")}
                    </p>
                    <p style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600, marginTop: 6 }}>
                      <Ic n="shield" s={11} c={COLORS.primary} /> {heldWeeksCount} {t("therapists.heldWeeks")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Credit cost summary */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
                {totalCredits === 1 ? t("therapists.creditCost") : `${totalCredits} ${t("therapists.creditsCost")}`}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>
                {sessionCredits} → {sessionCredits - totalCredits}
              </span>
            </div>
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button
            variant="primary"
            onClick={onConfirm}
            style={{
              flex: 1,
              opacity: canBook ? 1 : 0.45,
              cursor: canBook ? "pointer" : "not-allowed",
            }}
            disabled={!canBook}
          >
            <Ic n="check" s={14} c="white" />
            {t("therapists.confirmBooking")}
          </Button>
          <Button variant="ghost2" onClick={onClose} style={{ flexShrink: 0 }}>
            {t("action.cancel")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Manage Booking BottomSheet ───────────────────────────────
// ─────────────────────────────────────────────────────────────
function ManageBookingSheet({
  nextSession, bookedSessions, heldSlots, blocksByDate, therapist,
  onCancelSession, onClose, lang, dir, isD, t,
}) {
  // Collect all upcoming sessions: nextSession + locally booked + held
  const sessions = [];

  // Add the primary next session (from App state)
  if (nextSession) {
    sessions.push({
      type: "booked",
      dateStr: nextSession.dateStr || null,
      startTime: nextSession.startTime ?? null,
      dateISO: nextSession.dateISO || null,
      therapistName: nextSession.therapistName,
      date: nextSession.date,
      time: nextSession.time,
      topic: nextSession.topic,
    });
  }

  // Add locally booked sessions (that aren't the nextSession)
  bookedSessions.forEach((b) => {
    if (nextSession?.dateStr === b.dateStr && nextSession?.startTime === b.startTime) return;
    const dateObj = new Date(b.dateStr + "T12:00:00");
    const [hh, mm] = b.startTime.split(":").map(Number);
    const isoDate = new Date(dateObj);
    isoDate.setHours(hh, mm, 0, 0);
    sessions.push({
      type: "booked",
      dateStr: b.dateStr,
      startTime: b.startTime,
      dateISO: isoDate.toISOString(),
      therapistName: therapist?.name,
      date: { en: formatDate(dateObj, "en"), fa: formatDate(dateObj, "fa") },
      time: { en: formatBlockTime(b.startTime, "en"), fa: formatBlockTime(b.startTime, "fa") },
      topic: null,
    });
  });

  // Add held slots
  heldSlots.forEach((h) => {
    const dateObj = new Date(h.dateStr + "T12:00:00");
    sessions.push({
      type: "held",
      dateStr: h.dateStr,
      startTime: h.startTime,
      dateISO: null,
      therapistName: therapist?.name,
      date: { en: formatDate(dateObj, "en"), fa: formatDate(dateObj, "fa") },
      time: { en: formatBlockTime(h.startTime, "en"), fa: formatBlockTime(h.startTime, "fa") },
      topic: null,
    });
  });

  // Sort by date then time
  sessions.sort((a, b) => {
    const da = a.dateStr || "";
    const db = b.dateStr || "";
    return da.localeCompare(db) || (a.startTime || "").localeCompare(b.startTime || "");
  });

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ direction: dir }}>
        <h3 className="ds-heading" style={{ fontSize: isD ? 18 : 16, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("therapists.manageTitle")}
        </h3>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 16 }}>
          {t("therapists.manageSub")}
        </p>

        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Ic n="cal" s={28} c="var(--ds-text-light)" />
            <p style={{ fontSize: 13, color: "var(--ds-text-light)", marginTop: 8 }}>
              {t("therapists.noUpcoming")}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s, i) => (
              <Card key={i} variant="sm" style={{
                display: "flex", alignItems: "center", gap: 10,
                border: s.type === "held" ? "1.5px dashed var(--ds-card-border)" : undefined,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: RADIUS.sm, flexShrink: 0,
                  background: s.type === "booked" ? `${COLORS.primary}14` : `${COLORS.textLight}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic n="cal" s={16} c={s.type === "booked" ? COLORS.primary : "var(--ds-text-light)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
                    {loc(s.date, lang)}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>
                    {loc(s.time, lang)}
                    {s.topic ? ` · ${loc(s.topic, lang)}` : ""}
                  </p>
                </div>
                <Tag color={s.type === "booked" ? "primary" : "default"} style={{
                  fontSize: 10,
                  ...(s.type === "held" ? { background: "transparent", border: `1px dashed var(--ds-text-light)`, color: "var(--ds-text-light)" } : {}),
                }}>
                  {s.type === "booked" ? t("therapists.statusBooked") : t("therapists.statusHeld")}
                </Tag>
                {s.type === "booked" && (
                  <button
                    onClick={() => onCancelSession(s)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 4,
                      fontFamily: "inherit",
                    }}
                  >
                    <Ic n="x" s={16} c={COLORS.danger} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Button variant="ghost2" onClick={onClose} style={{ width: "100%" }}>
            {t("action.close")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Cancel Confirm BottomSheet ───────────────────────────────
// ─────────────────────────────────────────────────────────────
function CancelConfirmSheet({ sessionInfo, onConfirm, onClose, lang, dir, isD, t }) {
  const hoursUntil = sessionInfo?.dateISO
    ? (new Date(sessionInfo.dateISO).getTime() - Date.now()) / 3600000
    : 0;
  const isFree = hoursUntil > 24;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ direction: dir }}>
        {/* Warning icon */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", margin: "0 auto 12px",
            background: isFree ? `${COLORS.success}14` : `${COLORS.danger}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic n={isFree ? "check" : "alert-triangle"} s={26} c={isFree ? COLORS.success : COLORS.danger} />
          </div>
          <h3 className="ds-heading" style={{ fontSize: isD ? 18 : 16, color: "var(--ds-text)", marginBottom: 4 }}>
            {t("therapists.cancelSession")}
          </h3>
        </div>

        {/* Session details */}
        <Card variant="sm" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: RADIUS.sm, flexShrink: 0,
            background: `${COLORS.primary}14`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic n="cal" s={16} c={COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>
              {sessionInfo?.date ? loc(sessionInfo.date, lang) : ""}
            </p>
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>
              {sessionInfo?.time ? loc(sessionInfo.time, lang) : ""}
              {sessionInfo?.therapistName ? ` · ${loc(sessionInfo.therapistName, lang)}` : ""}
            </p>
          </div>
        </Card>

        {/* 24h rule info */}
        <div style={{
          padding: "12px 14px", borderRadius: RADIUS.sm, marginBottom: 16,
          background: isFree ? `${COLORS.success}10` : `${COLORS.danger}08`,
          border: `1px solid ${isFree ? COLORS.success : COLORS.danger}30`,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Ic n={isFree ? "check" : "alert-triangle"} s={15} c={isFree ? COLORS.success : COLORS.danger} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: isFree ? COLORS.success : COLORS.danger, marginBottom: 3 }}>
                {isFree ? t("therapists.cancelFreeInfo") : t("therapists.cancelLateWarning")}
              </p>
              <p style={{ fontSize: 11, color: "var(--ds-text-mid)", lineHeight: 1.5 }}>
                {isFree ? t("therapists.cancelFreeDetail") : t("therapists.cancelLateDetail")}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="primary"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: isFree ? COLORS.primary : COLORS.danger,
            }}
          >
            {isFree ? t("therapists.confirmCancelFree") : t("therapists.confirmCancelLate")}
          </Button>
          <Button variant="ghost2" onClick={onClose} style={{ flexShrink: 0 }}>
            {t("therapists.keepSession")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Chosen therapist card (rich, gradient) ───────────────────
// ─────────────────────────────────────────────────────────────
function ChosenTherapistCard({ therapist, session, hasActiveSessions, lang, dir, isD, isRtl, t, sessionCredits, onBook, onManage, onCancel }) {
  const name = loc(therapist.name, lang);
  const initials = name.split(" ").map((w) => w[0]).join("");
  const gap = isD ? 14 : 10;

  return (
    <div className="ds-anim-fadeUp" style={{ marginBottom: isD ? 20 : 12 }}>
      {/* Label */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {t("therapists.yourTherapist")}
      </p>

      <Card style={{
        background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
        border: "none", color: "white", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -30, ...(isRtl ? { left: -30 } : { right: -30 }),
          width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -15, ...(isRtl ? { right: 20 } : { left: 20 }),
          width: 70, height: 70, borderRadius: "50%", background: "rgba(232,160,122,0.15)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Row 1: Avatar + info + match tag */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: gap }}>
            <Avatar initials={initials} src={therapist.avatar} size={isD ? 52 : 44} style={{
              background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.3)", color: "white",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: isD ? 17 : 15, fontWeight: 700, color: "white" }}>{name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>
                {loc(therapist.credentials, lang)}
              </p>
            </div>
            <Tag color="primary" style={{ fontWeight: 700, background: "rgba(255,255,255,0.18)", color: "white", border: "none" }}>
              {therapist.matchPercent}% {t("therapists.matchLabel")}
            </Tag>
          </div>

          {/* Specialties */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: gap }}>
            {therapist.specialties.map((sp, i) => (
              <span key={i} style={{
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: RADIUS.sm,
                background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)",
              }}>
                {loc(sp, lang)}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div style={{ marginBottom: gap }}>
            <StarRating value={therapist.rating} />
          </div>

          {/* Next session or no session */}
          {session ? (
            <div style={{
              background: "rgba(255,255,255,0.1)", borderRadius: RADIUS.sm, padding: "10px 12px",
              marginBottom: gap,
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 6, textTransform: "uppercase" }}>
                {t("therapists.nextSessionLabel")}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  ["cal", loc(session.date, lang)],
                  ["clock", loc(session.time, lang)],
                  ["activity", loc(session.topic, lang)],
                ].map(([ic, tx], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Ic n={ic} s={11} c="rgba(255,255,255,0.5)" />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{tx}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: gap,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Ic n="cal" s={13} c="rgba(255,255,255,0.4)" />
              {t("therapists.noSessionYet")}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {session ? (
              <>
                <Button variant="accent" size={isD ? "sm" : "xs"} onClick={onManage} style={{ flex: 1 }}>
                  {t("therapists.manageBooking")}
                </Button>
                <Button variant="ghost" size={isD ? "sm" : "xs"} onClick={onCancel} style={{
                  color: "#ff9b8a", borderColor: "rgba(255,155,138,0.35)",
                }}>
                  {t("therapists.cancelSession")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="accent" size={isD ? "sm" : "xs"} onClick={onBook} style={{ flex: 1 }}>
                  <Ic n="wallet" s={12} c="white" />
                  {t("therapists.bookSession")}
                  {sessionCredits != null && (
                    <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>({sessionCredits})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size={isD ? "sm" : "xs"}
                  onClick={() => {}}
                  disabled={hasActiveSessions}
                  style={{
                    color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)",
                    ...(hasActiveSessions ? { opacity: 0.35, cursor: "not-allowed" } : {}),
                  }}
                >
                  {t("therapists.changeTherapist")}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Suggested therapist card (compact) ───────────────────────
// ─────────────────────────────────────────────────────────────
function SuggestedTherapistCard({ therapist, lang, dir, isD, t, onChoose, disabled }) {
  const name = loc(therapist.name, lang);
  const initials = name.split(" ").map((w) => w[0]).join("");

  return (
    <Card variant="sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Top row: avatar + name + match */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar initials={initials} src={therapist.avatar} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{name}</p>
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{loc(therapist.credentials, lang)}</p>
        </div>
        <Tag color="primary" style={{ fontWeight: 700 }}>{therapist.matchPercent}% {t("therapists.matchLabel")}</Tag>
      </div>

      {/* Specialties */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {therapist.specialties.map((sp, i) => (
          <Tag key={i} color="accent" style={{ fontSize: 10 }}>{loc(sp, lang)}</Tag>
        ))}
      </div>

      {/* Rating + next slot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating value={therapist.rating} />
        <span style={{ fontSize: 11, color: "var(--ds-text-mid)", display: "flex", alignItems: "center", gap: 4 }}>
          <Ic n="clock" s={11} c="var(--ds-text-light)" />
          {loc(therapist.nextSlot, lang)}
        </span>
      </div>

      {/* Choose button */}
      <Button
        variant="ghost"
        size="xs"
        onClick={disabled ? undefined : onChoose}
        disabled={disabled}
        style={{
          width: "100%",
          ...(disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}),
        }}
      >
        {t("therapists.chooseTherapist")}
      </Button>
      {disabled && (
        <p style={{ fontSize: 10, color: "var(--ds-text-light)", textAlign: "center", marginTop: -4 }}>
          {t("therapists.cancelSessionsFirst")}
        </p>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// ── Re-triage match step (inline) ────────────────────────────
// ─────────────────────────────────────────────────────────────
function RetriageMatchStep({ lang, dir, t, isD, onChoose, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h2 className="ds-heading" style={{ fontSize: isD ? 20 : 17, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("onboarding.matchTitle")}
        </h2>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("onboarding.matchSub")}</p>
      </div>

      {MOCK_THERAPISTS.map((th) => {
        const name = loc(th.name, lang);
        const initials = name.split(" ").map((w) => w[0]).join("");
        return (
          <Card key={th.id} variant="sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials={initials} src={th.avatar} size={44} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{name}</p>
                <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{loc(th.credentials, lang)}</p>
              </div>
              <Tag color="primary" style={{ fontWeight: 700 }}>{th.matchPercent}% {t("therapists.matchLabel")}</Tag>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {th.specialties.map((sp, i) => (
                <Tag key={i} color="accent" style={{ fontSize: 10 }}>{loc(sp, lang)}</Tag>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StarRating value={th.rating} />
              <span style={{ fontSize: 11, color: "var(--ds-text-mid)", display: "flex", alignItems: "center", gap: 4 }}>
                <Ic n="clock" s={11} c="var(--ds-text-light)" />
                {loc(th.nextSlot, lang)}
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={() => onChoose(th)} style={{ width: "100%" }}>
              {t("therapists.chooseTherapist")}
            </Button>
          </Card>
        );
      })}

      <Button variant="ghost2" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        {t("onboarding.back")}
      </Button>
    </div>
  );
}
