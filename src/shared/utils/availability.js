// ─────────────────────────────────────────────────────────────
// availability.js — CREDIT-201 + CREDIT-202 pure logic
// ─────────────────────────────────────────────────────────────
// Pure functions for:
//   1. Therapist availability CRUD (time ranges per weekday)
//   2. 90-minute Therapist Block generation for 25-week horizon
//
// No UI dependencies. No React. No i18n.
// ─────────────────────────────────────────────────────────────

// ── Constants ────────────────────────────────────────────────
export const BLOCK_DURATION_MIN = 90;
export const BOOKING_HORIZON_WEEKS = 25;

// JS getDay() → our day keys (0=Sun, 6=Sat)
const JS_DAY_TO_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// ── Time helpers ─────────────────────────────────────────────

/** "13:30" → 810 */
export function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** 810 → "13:30" */
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Date → "wed" */
export function getDayKeyFromDate(date) {
  return JS_DAY_TO_KEY[date.getDay()];
}

/** Date → "YYYY-MM-DD" */
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Block generation within a single range ───────────────────

/**
 * Given a range { start: "09:00", end: "17:00" } and block duration,
 * returns an array of block start times that fit.
 * No partial blocks: if remaining < duration, skip.
 */
export function getBlockStartsInRange(range, durationMin = BLOCK_DURATION_MIN) {
  const starts = [];
  const startMins = parseTimeToMinutes(range.start);
  const endMins = parseTimeToMinutes(range.end);
  let cursor = startMins;
  while (cursor + durationMin <= endMins) {
    starts.push(minutesToTime(cursor));
    cursor += durationMin;
  }
  return starts;
}

/** Count how many blocks fit in a single range */
export function countBlocksInRange(range, durationMin = BLOCK_DURATION_MIN) {
  return getBlockStartsInRange(range, durationMin).length;
}

// ── Full block generation (CREDIT-202) ───────────────────────

/**
 * Generate Therapist Blocks for `BOOKING_HORIZON_WEEKS` weeks.
 *
 * @param {Object} availConfig - { timezone, utcOffset, ranges: { sat: [...], ... } }
 * @param {Set<string>} bookedSet - Set of "YYYY-MM-DD|HH:MM" keys
 * @param {Set<string>} heldSet   - Set of "YYYY-MM-DD|HH:MM" keys
 * @param {Date} startDate - generate from this date (typically tomorrow)
 * @returns {Array<{ date: string, dayKey: string, start: string, end: string, status: string }>}
 */
export function generateTherapistBlocks(
  availConfig,
  bookedSet = new Set(),
  heldSet = new Set(),
  startDate = new Date(),
) {
  if (!availConfig?.ranges) return [];

  const blocks = [];
  const totalDays = BOOKING_HORIZON_WEEKS * 7;
  const base = new Date(startDate);
  base.setHours(0, 0, 0, 0);

  // Start from today (i = 0)
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dateStr = toDateStr(d);
    const dayKey = getDayKeyFromDate(d);
    const dayRanges = availConfig.ranges[dayKey];
    if (!dayRanges || dayRanges.length === 0) continue;

    for (const range of dayRanges) {
      const starts = getBlockStartsInRange(range);
      for (const start of starts) {
        const endMins = parseTimeToMinutes(start) + BLOCK_DURATION_MIN;
        const end = minutesToTime(endMins);
        const key = `${dateStr}|${start}`;
        let status = "open";
        if (bookedSet.has(key)) status = "booked";
        else if (heldSet.has(key)) status = "held";

        blocks.push({ date: dateStr, dayKey, start, end, status });
      }
    }
  }

  return blocks;
}

/**
 * Group blocks by date for patient-side date strip.
 * Returns: [{ date: Date, dateStr, blocks: [{ start, end, status }] }]
 */
export function groupBlocksByDate(blocks) {
  const map = new Map();
  for (const b of blocks) {
    if (!map.has(b.date)) {
      map.set(b.date, { date: new Date(b.date + "T00:00:00"), dateStr: b.date, blocks: [] });
    }
    map.get(b.date).blocks.push({ start: b.start, end: b.end, status: b.status });
  }
  return Array.from(map.values());
}

/**
 * Get the Monday (or Saturday for Iranian week) that starts the Nth week from a reference.
 * We use Saturday-start weeks matching SCHEDULE_DAYS.
 */
export function getWeekStartDate(refDate, weekOffset = 0) {
  const d = new Date(refDate);
  d.setHours(0, 0, 0, 0);
  // Find the most recent Saturday
  const dow = d.getDay(); // 0=Sun
  const daysBackToSat = dow === 6 ? 0 : dow + 1; // Sat=6 → 0, Sun=0 → 1, Mon=1 → 2 ...
  d.setDate(d.getDate() - daysBackToSat + weekOffset * 7);
  return d;
}

// ── Availability CRUD (CREDIT-201) ───────────────────────────

/**
 * Add a time range to a day. Returns new ranges object (immutable).
 */
export function addRange(ranges, dayKey, newRange) {
  const dayRanges = [...(ranges[dayKey] || []), newRange];
  dayRanges.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
  return { ...ranges, [dayKey]: dayRanges };
}

/**
 * Update a range at a specific index for a day.
 */
export function updateRange(ranges, dayKey, index, newRange) {
  const dayRanges = [...(ranges[dayKey] || [])];
  dayRanges[index] = newRange;
  dayRanges.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
  return { ...ranges, [dayKey]: dayRanges };
}

/**
 * Remove a range from a day.
 */
export function removeRange(ranges, dayKey, index) {
  const dayRanges = [...(ranges[dayKey] || [])];
  dayRanges.splice(index, 1);
  return { ...ranges, [dayKey]: dayRanges };
}

/**
 * Validate a range against existing ranges for a day.
 * Times must be on :00 or :30 boundaries.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateRange(existingDayRanges, range, excludeIndex = -1) {
  const startMins = parseTimeToMinutes(range.start);
  const endMins = parseTimeToMinutes(range.end);

  // Must be on half-hour boundaries
  if (startMins % 30 !== 0 || endMins % 30 !== 0) {
    return { valid: false, error: "invalidRange" };
  }

  // End must be after start
  if (endMins <= startMins) {
    return { valid: false, error: "invalidRange" };
  }

  // Must fit at least one 90-min block
  if (endMins - startMins < BLOCK_DURATION_MIN) {
    return { valid: false, error: "rangeTooShort" };
  }

  // No overlaps with other ranges on the same day
  for (let i = 0; i < existingDayRanges.length; i++) {
    if (i === excludeIndex) continue;
    const ex = existingDayRanges[i];
    const exStart = parseTimeToMinutes(ex.start);
    const exEnd = parseTimeToMinutes(ex.end);
    if (startMins < exEnd && endMins > exStart) {
      return { valid: false, error: "rangeOverlap" };
    }
  }

  return { valid: true, error: null };
}

// ── Half-hour time option list ───────────────────────────────
// For time picker selects (00:00 → 23:30 in 30-min steps)
export const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return opts;
})();
