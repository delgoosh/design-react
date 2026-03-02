// ─────────────────────────────────────────────────────────────
// THERAPIST / Calendar  (CREDIT-201 + CREDIT-202)
// ─────────────────────────────────────────────────────────────
// Two modes:
//   View  — weekly grid/list of generated 90-min blocks
//   Edit  — CRUD availability ranges per weekday
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, Ic } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { SCHEDULE_DAYS } from "@shared/components/onboarding/mockData.js";
import {
  generateTherapistBlocks,
  getWeekStartDate,
  toDateStr,
  BOOKING_HORIZON_WEEKS,
  BLOCK_DURATION_MIN,
  TIME_OPTIONS,
  addRange,
  updateRange,
  removeRange,
  validateRange,
  countBlocksInRange,
  parseTimeToMinutes,
  minutesToTime,
} from "@shared/utils/availability.js";

// ── Helpers ──────────────────────────────────────────────────

function formatBlockTime(timeStr, lang) {
  const [h, m] = timeStr.split(":").map(Number);
  if (lang === "fa") {
    const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
    return `${toFa(String(h).padStart(2, "0"))}:${toFa(String(m).padStart(2, "0"))}`;
  }
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatWeekLabel(weekStart, lang) {
  const opts = { month: "short", day: "numeric" };
  if (lang === "fa") opts.calendar = "persian";
  return weekStart.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", opts);
}

function formatDayHeader(date, lang) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  if (lang === "fa") opts.calendar = "persian";
  return date.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", opts);
}

/** Valid end times: start + 90n (n=1,2,...) up to 24:00 */
function getValidEndOptions(startTime) {
  if (!startTime) return [];
  const startMin = parseTimeToMinutes(startTime);
  const opts = [];
  for (let n = 1; ; n++) {
    const endMin = startMin + BLOCK_DURATION_MIN * n;
    if (endMin > 1440) break; // past midnight
    opts.push(minutesToTime(endMin));
  }
  return opts;
}

/** Min start time for a new range: previous range end + 30 min */
function getMinStartForNewRange(dayRanges) {
  if (!dayRanges || dayRanges.length === 0) return 0;
  const lastEnd = parseTimeToMinutes(dayRanges[dayRanges.length - 1].end);
  return lastEnd + 30;
}

/** Can we add another range? Need room for gap (30 min) + 1 block (90 min) */
function canAddRange(dayRanges) {
  if (!dayRanges || dayRanges.length === 0) return true;
  const lastEnd = parseTimeToMinutes(dayRanges[dayRanges.length - 1].end);
  return lastEnd + 30 + BLOCK_DURATION_MIN <= 1440;
}

/** Filter start time options: must be >= minStart */
function getStartOptionsFrom(minStartMin) {
  return TIME_OPTIONS.filter((t) => parseTimeToMinutes(t) >= minStartMin);
}

const STATUS_STYLE = {
  open:   { bg: `${COLORS.primary}28`, border: COLORS.primary, color: COLORS.primary, label: "open" },
  held:   { bg: `${COLORS.primary}18`, border: COLORS.primary, color: COLORS.primary, label: "heldBlock", dash: true },
  booked: { bg: `${COLORS.accent}28`, border: COLORS.accent, color: COLORS.accent, label: "booked" },
};

// ── Main component ───────────────────────────────────────────

export const Calendar = ({
  availability, setAvailability,
  bookedBlocks = new Set(), heldBlocks = new Set(),
}) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate all blocks
  const allBlocks = useMemo(
    () => generateTherapistBlocks(availability, bookedBlocks, heldBlocks, new Date()),
    [availability, bookedBlocks, heldBlocks],
  );

  // Filter to current week
  const weekStart = useMemo(() => getWeekStartDate(new Date(), weekOffset), [weekOffset]);
  const weekBlocks = useMemo(() => {
    const ws = toDateStr(weekStart);
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 7);
    const weStr = toDateStr(we);
    return allBlocks.filter((b) => b.date >= ws && b.date < weStr);
  }, [allBlocks, weekStart]);

  // Group by day for list view
  const weekByDay = useMemo(() => {
    const map = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const ds = toDateStr(d);
      map[ds] = { date: d, dateStr: ds, blocks: [] };
    }
    for (const b of weekBlocks) {
      if (map[b.date]) map[b.date].blocks.push(b);
    }
    return Object.values(map);
  }, [weekBlocks, weekStart]);

  const openCount = weekBlocks.filter((b) => b.status === "open").length;
  const pad = isD ? 24 : 12;
  const gap = isD ? 16 : 10;

  return (
    <div style={{ direction: dir, padding: `${pad}px ${pad}px ${isD ? pad : 80}px`, maxWidth: isD ? 1000 : 480, margin: "0 auto" }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ marginBottom: gap + 4 }}>
        <h1 className="ds-heading" style={{ fontSize: isD ? 24 : 19, color: "var(--ds-text)", marginBottom: 2 }}>
          {t("calendar.title")}
        </h1>
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
          {t("calendar.blockDuration")} · {t("calendar.weekHorizon")}
        </p>
      </div>

      {/* ── Mode toggle ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: gap }}>
        <Button
          variant={mode === "view" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setMode("view")}
        >
          <Ic n="cal" s={14} c={mode === "view" ? "#fff" : COLORS.primary} style={{ marginRight: 4, marginLeft: dir === "rtl" ? 4 : 0 }} />
          {t("calendar.viewMode")}
        </Button>
        <Button
          variant={mode === "edit" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
        >
          <Ic n="pen" s={14} c={mode === "edit" ? "#fff" : COLORS.primary} style={{ marginRight: 4, marginLeft: dir === "rtl" ? 4 : 0 }} />
          {t("calendar.editMode")}
        </Button>
      </div>

      {mode === "view" ? (
        <WeekView
          weekByDay={weekByDay}
          weekStart={weekStart}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          openCount={openCount}
          isD={isD} gap={gap} dir={dir} lang={lang} t={t}
        />
      ) : (
        <EditMode
          availability={availability}
          setAvailability={setAvailability}
          setMode={setMode}
          isD={isD} gap={gap} dir={dir} lang={lang} t={t}
        />
      )}
    </div>
  );
};

// ── Week View ────────────────────────────────────────────────

function WeekView({ weekByDay, weekStart, weekOffset, setWeekOffset, openCount, isD, gap, dir, lang, t }) {
  return (
    <>
      {/* Week navigator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: gap }}>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0}>
          {dir === "rtl" ? "→" : "←"}
        </Button>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>
            {t("calendar.weekOf")} {formatWeekLabel(weekStart, lang)}
          </p>
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>
            {openCount} {t("calendar.openBlocks")} {t("calendar.blocksCount")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => Math.min(BOOKING_HORIZON_WEEKS - 1, w + 1))} disabled={weekOffset >= BOOKING_HORIZON_WEEKS - 1}>
          {dir === "rtl" ? "←" : "→"}
        </Button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginBottom: gap, flexWrap: "wrap" }}>
        {["open", "held", "booked"].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 4,
              background: STATUS_STYLE[s].bg,
              border: `1.5px ${STATUS_STYLE[s].dash ? "dashed" : "solid"} ${STATUS_STYLE[s].border}`,
            }} />
            <span style={{ fontSize: 11, color: "var(--ds-text)" }}>{t(`calendar.${STATUS_STYLE[s].label}`)}</span>
          </div>
        ))}
      </div>

      {/* Day-by-day blocks */}
      {isD ? (
        <DesktopGrid weekByDay={weekByDay} lang={lang} t={t} dir={dir} />
      ) : (
        <MobileList weekByDay={weekByDay} lang={lang} t={t} dir={dir} />
      )}
    </>
  );
}

// ── Desktop: 7-column grid ───────────────────────────────────

function DesktopGrid({ weekByDay, lang, t, dir }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
      {/* Column headers */}
      {weekByDay.map((day) => (
        <div key={day.dateStr} style={{ textAlign: "center", padding: "6px 0", borderBottom: "1px solid var(--ds-card-border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)" }}>
            {formatDayHeader(day.date, lang)}
          </p>
        </div>
      ))}
      {/* Block cells */}
      {weekByDay.map((day) => (
        <div key={day.dateStr + "_blocks"} style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 80 }}>
          {day.blocks.length === 0 && (
            <p style={{ fontSize: 10, color: "var(--ds-text-mid)", textAlign: "center", marginTop: 8 }}>—</p>
          )}
          {day.blocks.map((b) => {
            const st = STATUS_STYLE[b.status];
            return (
              <div
                key={b.start}
                style={{
                  padding: "4px 6px", borderRadius: 6,
                  background: st.bg,
                  border: `1.5px ${st.dash ? "dashed" : "solid"} ${st.border}`,
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 600, color: st.color }}>
                  {formatBlockTime(b.start, lang)}
                </p>
                <p style={{ fontSize: 9, color: "var(--ds-text-mid)" }}>
                  {formatBlockTime(b.end, lang)}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Mobile: day-by-day list ──────────────────────────────────

function MobileList({ weekByDay, lang, t, dir }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {weekByDay.map((day) => (
        <Card key={day.dateStr} variant="sm">
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", marginBottom: 6 }}>
            {formatDayHeader(day.date, lang)}
          </p>
          {day.blocks.length === 0 ? (
            <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{t("calendar.noBlocksThisWeek")}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {day.blocks.map((b) => {
                const st = STATUS_STYLE[b.status];
                return (
                  <div
                    key={b.start}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "4px 10px", borderRadius: 20,
                      background: st.bg,
                      border: `1.5px ${st.dash ? "dashed" : "solid"} ${st.border}`,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: st.color }}>
                      {formatBlockTime(b.start, lang)}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--ds-text-mid)" }}>
                      – {formatBlockTime(b.end, lang)}
                    </span>
                    <Tag color={b.status === "booked" ? "accent" : b.status === "held" ? "muted" : "primary"} style={{ fontSize: 9 }}>
                      {t(`calendar.${STATUS_STYLE[b.status].label}`)}
                    </Tag>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Edit Mode ────────────────────────────────────────────────

function EditMode({ availability, setAvailability, setMode, isD, gap, dir, lang, t }) {
  const [saved, setSaved] = useState(false);
  const ranges = availability?.ranges || {};

  const handleAddRange = (dayKey) => {
    const existing = ranges[dayKey] || [];
    const minStartMin = getMinStartForNewRange(existing);
    // Default start: 30 min after prev end, or 09:00 if first
    let defaultStart = existing.length > 0 ? minutesToTime(minStartMin) : "09:00";
    // Default end: start + 90 min (first valid end option)
    const startMin = parseTimeToMinutes(defaultStart);
    const defaultEnd = minutesToTime(startMin + BLOCK_DURATION_MIN);
    const newRanges = addRange(ranges, dayKey, { start: defaultStart, end: defaultEnd });
    setAvailability((prev) => ({ ...prev, ranges: newRanges }));
  };

  const handleUpdateRange = (dayKey, idx, field, value) => {
    const existing = ranges[dayKey] || [];
    const updated = { ...existing[idx], [field]: value };
    // When start changes: auto-set end to first valid option (start + 90)
    if (field === "start") {
      const validEnds = getValidEndOptions(value);
      if (validEnds.length > 0) {
        const currentEnd = parseTimeToMinutes(updated.end);
        const newStart = parseTimeToMinutes(value);
        // Keep current end if it's still a valid multiple, otherwise snap to first
        if (currentEnd <= newStart || (currentEnd - newStart) % BLOCK_DURATION_MIN !== 0) {
          updated.end = validEnds[0];
        }
      }
    }
    const newRanges = updateRange(ranges, dayKey, idx, updated);
    setAvailability((prev) => ({ ...prev, ranges: newRanges }));
  };

  const handleRemoveRange = (dayKey, idx) => {
    const newRanges = removeRange(ranges, dayKey, idx);
    setAvailability((prev) => ({ ...prev, ranges: newRanges }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); setMode("view"); }, 1200);
  };

  return (
    <div>
      <Card style={{ padding: isD ? 20 : 14, marginBottom: gap }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Ic n="info" s={16} c={COLORS.primary} />
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("calendar.blockDurationInfo")}</p>
        </div>
        {availability?.timezone && (
          <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>
            {t("calendar.timezone")}: {availability.timezone} (UTC{availability.utcOffset})
          </p>
        )}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SCHEDULE_DAYS.map((dayKey) => {
          const dayRanges = ranges[dayKey] || [];
          return (
            <Card key={dayKey} variant="sm" style={{ padding: isD ? 16 : 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: dayRanges.length > 0 ? 8 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
                  {t(`calendar.daysFull.${dayKey}`)}
                </p>
                <Button variant="ghost2" size="sm" onClick={() => handleAddRange(dayKey)} disabled={!canAddRange(dayRanges)} style={{ fontSize: 11 }}>
                  <Ic n="plus" s={12} c={COLORS.primary} style={{ marginRight: 3, marginLeft: dir === "rtl" ? 3 : 0 }} />
                  {t("calendar.addRange")}
                </Button>
              </div>

              {dayRanges.length === 0 && (
                <p style={{ fontSize: 11, color: "var(--ds-text-mid)" }}>{t("calendar.noAvailability")}</p>
              )}

              {dayRanges.map((range, idx) => {
                const validation = validateRange(dayRanges, range, idx);
                const blockCount = validation.valid ? countBlocksInRange(range) : 0;
                // Start options: if not first range, must be >= prev end + 30 min
                const prevRange = idx > 0 ? dayRanges[idx - 1] : null;
                const minStartMin = prevRange ? parseTimeToMinutes(prevRange.end) + 30 : 0;
                const startOpts = getStartOptionsFrom(minStartMin);
                // End options: only valid multiples of 90 min from start
                const endOpts = getValidEndOptions(range.start);
                const endDisabled = !range.start;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <TimeSelect
                      value={range.start}
                      onChange={(v) => handleUpdateRange(dayKey, idx, "start", v)}
                      label={t("calendar.rangeStart")}
                      dir={dir}
                      options={startOpts}
                    />
                    <span style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>–</span>
                    <TimeSelect
                      value={range.end}
                      onChange={(v) => handleUpdateRange(dayKey, idx, "end", v)}
                      label={t("calendar.rangeEnd")}
                      dir={dir}
                      options={endOpts}
                      disabled={endDisabled}
                    />
                    {validation.valid && (
                      <Tag color="primary" style={{ fontSize: 10 }}>{blockCount} {t("calendar.blocksCount")}</Tag>
                    )}
                    {!validation.valid && validation.error && (
                      <span style={{ fontSize: 10, color: COLORS.danger }}>{t(`calendar.${validation.error}`)}</span>
                    )}
                    <button
                      onClick={() => handleRemoveRange(dayKey, idx)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, fontFamily: "inherit" }}
                      title={t("calendar.removeRange")}
                    >
                      <Ic n="trash" s={14} c={COLORS.danger} />
                    </button>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>

      {/* Save button */}
      <div style={{ marginTop: gap, display: "flex", gap: 8 }}>
        <Button variant="ghost2" onClick={() => setMode("view")} style={{ flex: 1 }}>
          {t("action.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave} style={{ flex: 2 }}>
          {saved ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Ic n="check" s={14} c="#fff" /> {t("calendar.savedSuccess")}
            </span>
          ) : (
            t("calendar.setAvailability")
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Time Select ──────────────────────────────────────────────

function TimeSelect({ value, onChange, label, dir, options, disabled }) {
  const opts = options || TIME_OPTIONS;
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 4, opacity: disabled ? 0.4 : 1 }}>
      <span style={{ fontSize: 10, color: "var(--ds-text-mid)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: "4px 6px", fontSize: 12, fontFamily: "inherit",
          borderRadius: 6, border: "1px solid var(--ds-card-border)",
          background: "var(--ds-card-bg)", color: "var(--ds-text)",
          direction: "ltr", cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {disabled && <option value="">—</option>}
        {opts.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </label>
  );
}
