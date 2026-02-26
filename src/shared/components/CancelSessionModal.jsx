// ─────────────────────────────────────────────────────────────
// CancelSessionModal — shared by patient + therapist.
// Props:
//   session      { id, patientName, therapistName, time, date, hoursUntil }
//   actor        "patient" | "therapist"
//   onConfirm    () => void
//   onClose      () => void
// ─────────────────────────────────────────────────────────────
import { Modal, Button } from "@ds";
import { useLang } from "@ds";
import { COLORS } from "@ds";

export const CancelSessionModal = ({ session, actor, onConfirm, onClose }) => {
  const { t } = useLang();
  const isPenalty = session?.hoursUntil < 24;
  const isPatientForfeit = isPenalty && actor === "patient";

  const title = isPatientForfeit ? t("session.forfeitTitle") : t("session.cancelTitle");
  const detail = isPatientForfeit
    ? t("session.forfeitDetail")
    : isPenalty
      ? t("session.cancelPenaltyDetail")
      : t("session.cancelNoPenaltyDetail");
  const confirmLabel = isPatientForfeit
    ? t("session.confirmForfeit")
    : isPenalty
      ? t("session.confirmCancelPenalty")
      : t("session.confirmCancel");

  return (
    <Modal onClose={onClose} title={title}>
      <p style={{ color: COLORS.textMid, fontSize: 13, marginBottom: 20 }}>
        {detail}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="ghost2" style={{ flex: 1 }} onClick={onClose}>{t("action.cancel")}</Button>
        <Button variant="danger" style={{ flex: 1 }} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
