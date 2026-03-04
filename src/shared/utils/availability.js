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

// ── Timezone helpers ────────────────────────────────────────

/** Common IANA timezone names — fallback when Intl.supportedValuesOf is unavailable */
export const COMMON_TIMEZONES = [
  "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
  "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Atlantic/Reykjavik", "Europe/London",
  "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Africa/Cairo", "Asia/Dubai", "Asia/Tehran",
  "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka",
  "Asia/Bangkok", "Asia/Shanghai", "Asia/Tokyo",
  "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
  "America/Mexico_City", "America/Toronto", "Europe/Moscow",
  "Africa/Nairobi", "Asia/Singapore", "Asia/Hong_Kong",
];

/** Get all IANA timezone names — tries Intl API first, falls back to curated list */
export function getAllTimezones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return COMMON_TIMEZONES;
  }
}

/**
 * Parse a UTC offset string like "+03:30" or "-05:00" into total minutes.
 * "+03:30" → 210, "-05:00" → -300
 */
export function parseUtcOffsetToMinutes(offsetStr) {
  if (!offsetStr) return 0;
  const sign = offsetStr.startsWith("-") ? -1 : 1;
  const clean = offsetStr.replace(/^[+-]/, "");
  const [h, m] = clean.split(":").map(Number);
  return sign * (h * 60 + (m || 0));
}

/**
 * Get UTC offset string for an IANA timezone name.
 * e.g. "Asia/Tehran" → "+03:30"
 */
export function getTimezoneOffset(tzName) {
  try {
    const d = new Date();
    const parts = d.toLocaleString("en-US", { timeZone: tzName, timeZoneName: "shortOffset" });
    const m = parts.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
    if (!m) return "+00:00";
    let offset = m[1];
    // Normalize: "+3" → "+03:00", "+3:30" → "+03:30"
    if (!offset.includes(":")) offset += ":00";
    const [sign, rest] = [offset[0], offset.slice(1)];
    const [hh, mm] = rest.split(":");
    return `${sign}${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
  } catch {
    return "+00:00";
  }
}

/**
 * Convert a time string between two UTC offsets.
 * Handles both "10:00 AM"/"2:30 PM" (12h) and "14:00" (24h) formats.
 *
 * @param {string} timeStr - e.g. "10:00 AM" or "14:30"
 * @param {string} fromOffset - e.g. "+03:30"
 * @param {string} toOffset - e.g. "-05:00"
 * @returns {string} converted time in same format as input
 */
export function convertTimeBetweenOffsets(timeStr, fromOffset, toOffset) {
  if (!timeStr || !fromOffset || !toOffset) return timeStr;

  // Detect format
  const is12h = /[AaPp][Mm]/.test(timeStr);
  let hours, minutes;

  if (is12h) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
    if (!match) return timeStr;
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else {
    const parts = timeStr.split(":").map(Number);
    hours = parts[0];
    minutes = parts[1] || 0;
  }

  // Convert to UTC, then to target offset
  const fromMins = parseUtcOffsetToMinutes(fromOffset);
  const toMins = parseUtcOffsetToMinutes(toOffset);
  const diff = toMins - fromMins;

  let totalMins = hours * 60 + minutes + diff;
  // Wrap around 24h
  totalMins = ((totalMins % 1440) + 1440) % 1440;

  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;

  if (is12h) {
    const period = newH >= 12 ? "PM" : "AM";
    const displayH = newH === 0 ? 12 : newH > 12 ? newH - 12 : newH;
    return `${displayH}:${String(newM).padStart(2, "0")} ${period}`;
  }
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
