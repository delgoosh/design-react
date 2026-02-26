// ─────────────────────────────────────────────────────────────
// STEP 4b — Therapist: ideal week availability grid
// 7-day × 10-slot grid. Tap to toggle each cell.
// TODO(backend-integration): save the availability grid to the
// backend when the user completes this step.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { SCHEDULE_SLOTS, SCHEDULE_DAYS } from "./mockData.js";

export const StepTherapistSchedule = ({ onComplete, onBack }) => {
  const { t } = useLang();

  // grid[day][slotIndex] = true/false
  const [grid, setGrid] = useState(() => {
    const init = {};
    SCHEDULE_DAYS.forEach((d) => { init[d] = {}; });
    return init;
  });

  const toggleSlot = (day, slotIdx) => {
    setGrid((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slotIdx]: !prev[day][slotIdx] },
    }));
  };

  const CELL_W = 64;
  const CELL_H = 34;
  const HEAD_W = 68;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: COLORS.textDark, marginBottom: 6 }}>
          {t("onboarding.scheduleTitle")}
        </h2>
        <p style={{ fontSize: 13, color: COLORS.textMid }}>{t("onboarding.scheduleSub")}</p>
        <p style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>{t("onboarding.slotInfo")}</p>
      </div>

      {/* Scrollable grid */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 3, margin: "0 auto" }}>
          <thead>
            <tr>
              {/* Top-left empty cell */}
              <th style={{ width: HEAD_W }} />
              {SCHEDULE_SLOTS.map((slot) => (
                <th key={slot} style={{
                  fontSize: 10, fontWeight: 600, color: COLORS.textLight,
                  padding: "4px 0", width: CELL_W, textAlign: "center",
                }}>
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE_DAYS.map((day) => (
              <tr key={day}>
                <td style={{
                  fontSize: 12, fontWeight: 600, color: COLORS.textMid,
                  padding: "0 6px", whiteSpace: "nowrap", textAlign: "center",
                }}>
                  {t(`calendar.days.${day}`)}
                </td>
                {SCHEDULE_SLOTS.map((_, slotIdx) => {
                  const on = !!grid[day]?.[slotIdx];
                  return (
                    <td key={slotIdx} style={{ padding: 0 }}>
                      <button
                        onClick={() => toggleSlot(day, slotIdx)}
                        style={{
                          width: CELL_W, height: CELL_H,
                          borderRadius: 6,
                          border: on ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.cardBorder}`,
                          background: on ? COLORS.primaryGhost : COLORS.cream,
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <LegendItem color={COLORS.primaryGhost} borderColor={COLORS.primary} label={t("calendar.available")} />
        <LegendItem color={COLORS.cream} borderColor={COLORS.cardBorder} label={t("calendar.blocked")} />
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        <Button variant="primary" onClick={onComplete} style={{ flex: 2 }}>
          {t("onboarding.done")}
        </Button>
      </div>
    </div>
  );
};

function LegendItem({ color, borderColor, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 18, height: 14, borderRadius: 4,
        background: color, border: `1.5px solid ${borderColor}`,
      }} />
      <span style={{ fontSize: 11, color: COLORS.textMid }}>{label}</span>
    </div>
  );
}
