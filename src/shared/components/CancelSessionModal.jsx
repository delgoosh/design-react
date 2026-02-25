// ─────────────────────────────────────────────────────────────
// CancelSessionModal — shared by patient + therapist.
// Props:
//   session      { id, patientName, therapistName, time, date, hoursUntil }
//   actor        "patient" | "therapist"
//   onConfirm    () => void
//   onClose      () => void
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Modal, Button, Ic } from "@ds";
import { useLang } from "@ds";
import { COLORS } from "@ds";

// TODO: Implement full component
// Penalty rules:
//   therapist: hoursUntil < 24 → 50% deduction
//   patient:   hoursUntil < 24 → ticket not returned (forfeit)
export const CancelSessionModal = ({ session, actor, onConfirm, onClose }) => {
  const { t } = useLang();
  const isPenalty = session?.hoursUntil < 24;

  return (
    <Modal onClose={onClose} title={t("session.cancelTitle")}>
      <p style={{ color: COLORS.textMid, fontSize: 13, marginBottom: 20 }}>
        {/* TODO: penalty copy */}
        {isPenalty ? t("session.cancelPenaltyDetail") : t("session.cancelNoPenaltyDetail")}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="ghost2" style={{ flex: 1 }} onClick={onClose}>{t("action.cancel")}</Button>
        <Button variant="danger" style={{ flex: 1 }} onClick={onConfirm}>
          {isPenalty ? t("session.confirmCancelPenalty") : t("session.confirmCancel")}
        </Button>
      </div>
    </Modal>
  );
};
