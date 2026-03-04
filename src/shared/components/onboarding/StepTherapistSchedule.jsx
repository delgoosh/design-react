// ─────────────────────────────────────────────────────────────
// STEP 4b — Therapist: weekly availability (time ranges)
// Define availability ranges per weekday. 90-min blocks are
// generated automatically within each range.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useLang, Button, Ic, Tag, Select } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { SCHEDULE_DAYS } from "./mockData.js";
import {
  TIME_OPTIONS,
  addRange,
  removeRange,
  updateRange,
  validateRange,
  countBlocksInRange,
  generateTherapistBlocks,
  BLOCK_DURATION_MIN,
  getAllTimezones,
} from "@shared/utils/availability.js";

export const StepTherapistSchedule = ({ onComplete, onBack }) => {
  const { t, dir, lang } = useLang();

  const [ranges, setRanges] = useState(() => {
    const init = {};
    SCHEDULE_DAYS.forEach((d) => { init[d] = []; });
    return init;
  });

  const [detectedTz, setDetectedTz] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  });
  const [showTzSelect, setShowTzSelect] = useState(false);
  const tzOptions = useMemo(() => getAllTimezones().map((z) => ({ value: z, label: z })), []);

  // Total blocks across all days
  const totalBlocks = useMemo(() => {
    let count = 0;
    for (const day of SCHEDULE_DAYS) {
      for (const r of ranges[day] || []) {
        const v = validateRange(ranges[day] || [], r, (ranges[day] || []).indexOf(r));
        if (v.valid) count += countBlocksInRange(r);
      }
    }
    return count;
  }, [ranges]);

  const handleAdd = (dayKey) => {
    const existing = ranges[dayKey] || [];
    let defaultStart = "09:00";
    if (existing.length > 0) defaultStart = existing[existing.length - 1].end;
    setRanges((prev) => addRange(prev, dayKey, { start: defaultStart, end: "17:00" }));
  };

  const handleUpdate = (dayKey, idx, field, value) => {
    const existing = ranges[dayKey] || [];
    const updated = { ...existing[idx], [field]: value };
    setRanges((prev) => updateRange(prev, dayKey, idx, updated));
  };

  const handleRemove = (dayKey, idx) => {
    setRanges((prev) => removeRange(prev, dayKey, idx));
  };

  const handleDone = () => {
    const offset = (() => {
      try {
        const d = new Date();
        const parts = d.toLocaleString("en-US", { timeZone: detectedTz, timeZoneName: "shortOffset" });
        const m = parts.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
        return m ? m[1].padStart(6, "0").replace(/^([+-])(\d)$/, "$1$2:00") : "+00:00";
      } catch { return "+00:00"; }
    })();
    onComplete?.({ ranges, timezone: detectedTz, utcOffset: offset });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("calendar.setAvailability")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("calendar.availabilitySub")}</p>
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 4 }}>
          {t("calendar.blockDurationInfo")}
        </p>
      </div>

      {/* Timezone — editable */}
      {showTzSelect ? (
        <div style={{ maxWidth: 340, margin: "0 auto", width: "100%" }}>
          <Select
            options={tzOptions}
            value={detectedTz}
            onChange={(v) => { setDetectedTz(v); setShowTzSelect(false); }}
            placeholder={t("calendar.timezoneSelect")}
          />
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "6px 12px", borderRadius: RADIUS.sm,
          background: `${COLORS.primary}10`, fontSize: 11, color: "var(--ds-text-mid)",
        }}>
          <Ic n="globe" s={14} c={COLORS.primary} />
          {t("calendar.timezone")}: {detectedTz}
          <button
            onClick={() => setShowTzSelect(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, color: COLORS.primary, fontWeight: 600,
              fontFamily: "inherit", textDecoration: "underline",
              marginInlineStart: 4,
            }}
          >
            {t("calendar.timezoneChange")}
          </button>
        </div>
      )}

      {/* Day rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SCHEDULE_DAYS.map((dayKey) => {
          const dayRanges = ranges[dayKey] || [];
          return (
            <div key={dayKey} style={{
              padding: "10px 12px", borderRadius: RADIUS.sm,
              background: COLORS.cardBg || "rgba(255,255,255,.04)",
              border: `1px solid ${COLORS.cardBorder || "rgba(255,255,255,.08)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: dayRanges.length > 0 ? 8 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>
                  {t(`calendar.daysFull.${dayKey}`)}
                </span>
                <button
                  onClick={() => handleAdd(dayKey)}
                  style={{
                    display: "flex", alignItems: "center", gap: 3,
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: COLORS.primary, fontFamily: "inherit", fontWeight: 600,
                  }}
                >
                  <Ic n="plus" s={12} c={COLORS.primary} /> {t("calendar.addRange")}
                </button>
              </div>

              {dayRanges.length === 0 && (
                <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>{t("calendar.noAvailability")}</p>
              )}

              {dayRanges.map((range, idx) => {
                const validation = validateRange(dayRanges, range, idx);
                const blockCount = validation.valid ? countBlocksInRange(range) : 0;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <TimeSelect value={range.start} onChange={(v) => handleUpdate(dayKey, idx, "start", v)} label={t("calendar.rangeStart")} />
                    <span style={{ fontSize: 11, color: "var(--ds-text-light)" }}>–</span>
                    <TimeSelect value={range.end} onChange={(v) => handleUpdate(dayKey, idx, "end", v)} label={t("calendar.rangeEnd")} />
                    {validation.valid && (
                      <Tag color="primary" style={{ fontSize: 9 }}>{blockCount} {t("calendar.blocksCount")}</Tag>
                    )}
                    {!validation.valid && validation.error && (
                      <span style={{ fontSize: 10, color: COLORS.danger }}>{t(`calendar.${validation.error}`)}</span>
                    )}
                    <button
                      onClick={() => handleRemove(dayKey, idx)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontFamily: "inherit" }}
                    >
                      <Ic n="trash" s={13} c={COLORS.danger} />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {totalBlocks > 0 && (
        <div style={{ textAlign: "center", fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>
          {totalBlocks} {t("calendar.blocksGenerated")} / {t("calendar.blockDuration")}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        <Button variant="primary" onClick={handleDone} style={{ flex: 2 }}>
          {t("onboarding.done")}
        </Button>
      </div>
    </div>
  );
};

function TimeSelect({ value, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 10, color: "var(--ds-text-light)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "3px 5px", fontSize: 11, fontFamily: "inherit",
          borderRadius: 5, border: `1px solid ${COLORS.cardBorder || "rgba(255,255,255,.15)"}`,
          background: COLORS.cardBg || "rgba(255,255,255,.06)", color: "var(--ds-text)",
          direction: "ltr", cursor: "pointer",
        }}
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </label>
  );
}
