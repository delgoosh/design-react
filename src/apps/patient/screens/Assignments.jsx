// ─────────────────────────────────────────────────────────────
// PATIENT / Assignments
// ─────────────────────────────────────────────────────────────
// Props: assignments, onCompleteAssignment, chosenTherapist
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, useIsDesktop, Card, Tag, Button, ProgressBar, Ic, BottomSheet, Textarea, RadioGroup } from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Type config ──────────────────────────────────────────────
const TYPE_CONFIG = {
  questionnaire: { icon: "book",     ctaKey: "ctaQuestionnaire",  typeKey: "typeQuestionnaire" },
  journal:       { icon: "edit",     ctaKey: "ctaJournal",        typeKey: "typeJournal"       },
  reading:       { icon: "book",     ctaKey: "ctaReading",        typeKey: "typeReading"       },
  exercise:      { icon: "activity", ctaKey: "ctaExercise",       typeKey: "typeExercise"      },
  breathing:     { icon: "wind",     ctaKey: "ctaBreathing",      typeKey: "typeBreathing"     },
  mindfulness:   { icon: "heart",    ctaKey: "ctaMindfulness",    typeKey: "typeMindfulness"   },
};

const URGENCY_TAG_COLOR = {
  urgent:  "danger",
  soon:    "neutral",
  ongoing: "accent",
};

// ── Helpers ──────────────────────────────────────────────────
function loc(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}

// ── Form: Questionnaire ──────────────────────────────────────
const QuestionnaireForm = ({ t, onSubmit }) => {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const canSubmit = q1 && q2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{t("assignments.formQ1")}</p>
      <RadioGroup
        options={[
          { value: "a", label: t("assignments.formQ1a") },
          { value: "b", label: t("assignments.formQ1b") },
          { value: "c", label: t("assignments.formQ1c") },
          { value: "d", label: t("assignments.formQ1d") },
        ]}
        value={q1}
        onChange={setQ1}
      />
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{t("assignments.formQ2")}</p>
      <RadioGroup
        options={[
          { value: "a", label: t("assignments.formQ2a") },
          { value: "b", label: t("assignments.formQ2b") },
          { value: "c", label: t("assignments.formQ2c") },
        ]}
        value={q2}
        onChange={setQ2}
      />
      <Button variant="primary" onClick={onSubmit} style={{ width: "100%", opacity: canSubmit ? 1 : 0.5 }}>
        {t("assignments.submit")}
      </Button>
    </div>
  );
};

// ── Form: Text-based (journal, reading, mindfulness) ─────────
const TextForm = ({ t, promptKey, onSubmit }) => {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{t(`assignments.${promptKey}`)}</p>
      <Textarea value={text} onChange={setText} rows={5} placeholder={t(`assignments.${promptKey}`)} />
      <Button variant="primary" onClick={onSubmit} style={{ width: "100%", opacity: text.trim() ? 1 : 0.5 }}>
        {t("assignments.submit")}
      </Button>
    </div>
  );
};

// ── Form: Activity log (exercise, breathing) ─────────────────
const ActivityForm = ({ t, promptKey, isExercise, onSubmit }) => {
  const [sessions, setSessions] = useState(1);
  const [note, setNote] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isExercise && (
        <>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{t("assignments.formSessionsLabel")}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <button
              onClick={() => setSessions(Math.max(1, sessions - 1))}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${COLORS.primary}`,
                background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Ic n="minus" s={16} c={COLORS.primary} />
            </button>
            <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textDark, minWidth: 40, textAlign: "center" }}>
              {sessions}
            </span>
            <button
              onClick={() => setSessions(sessions + 1)}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${COLORS.primary}`,
                background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Ic n="plus" s={16} c={COLORS.primary} />
            </button>
          </div>
        </>
      )}
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark }}>{t(`assignments.${promptKey}`)}</p>
      <Textarea value={note} onChange={setNote} rows={3} placeholder={t("assignments.formNotesPlaceholder")} />
      <Button variant="primary" onClick={onSubmit} style={{ width: "100%" }}>
        {t("assignments.submit")}
      </Button>
    </div>
  );
};

// ── Assignment Form Bottom Sheet ─────────────────────────────
const AssignmentFormSheet = ({ assignment, lang, t, onClose, onSubmit }) => {
  const cfg = TYPE_CONFIG[assignment.type] || TYPE_CONFIG.questionnaire;

  const handleSubmit = () => {
    onSubmit(assignment.id);
    onClose();
  };

  const formContent = {
    questionnaire: <QuestionnaireForm t={t} onSubmit={handleSubmit} />,
    journal:       <TextForm t={t} promptKey="formJournalPrompt" onSubmit={handleSubmit} />,
    reading:       <TextForm t={t} promptKey="formReflectionPrompt" onSubmit={handleSubmit} />,
    exercise:      <ActivityForm t={t} promptKey="formExercisePrompt" isExercise onSubmit={handleSubmit} />,
    breathing:     <ActivityForm t={t} promptKey="formBreathingPrompt" isExercise={false} onSubmit={handleSubmit} />,
    mindfulness:   <TextForm t={t} promptKey="formGratitudePrompt" onSubmit={handleSubmit} />,
  };

  return (
    <BottomSheet onClose={onClose}>
      {/* Sheet header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Tag color="primary" style={{ gap: 4, display: "flex", alignItems: "center" }}>
          <Ic n={cfg.icon} s={12} c={COLORS.primary} />
          {t(`assignments.${cfg.typeKey}`)}
        </Tag>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.textDark, marginBottom: 4 }}>
        {loc(assignment.title, lang)}
      </p>
      <p style={{ fontSize: 12, color: COLORS.textMid, marginBottom: 20 }}>
        {loc(assignment.description, lang)}
      </p>

      {/* Type-specific form */}
      {formContent[assignment.type] || formContent.journal}

      {/* Cancel link */}
      <button
        onClick={onClose}
        style={{
          display: "block", width: "100%", marginTop: 12, padding: "8px 0",
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: COLORS.textMid, fontFamily: "inherit",
        }}
      >
        {t("assignments.cancel")}
      </button>
    </BottomSheet>
  );
};

// ── Assignment Card ──────────────────────────────────────────
const AssignmentCard = ({ assignment, lang, t, onOpenForm, isCompleted }) => {
  const cfg = TYPE_CONFIG[assignment.type] || TYPE_CONFIG.questionnaire;
  const showProgress = !isCompleted && assignment.dueUrgency === "ongoing" && assignment.progress > 0;

  return (
    <Card variant="sm" style={{
      display: "flex", flexDirection: "column", gap: 10,
      opacity: isCompleted ? 0.75 : 1,
    }}>
      {/* Top row: type tag + due tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tag color="primary" style={{ gap: 4, display: "flex", alignItems: "center" }}>
          <Ic n={cfg.icon} s={12} c={COLORS.primary} />
          {t(`assignments.${cfg.typeKey}`)}
        </Tag>
        {isCompleted ? (
          <Tag color="success" style={{ gap: 4, display: "flex", alignItems: "center" }}>
            <Ic n="check" s={11} c={COLORS.success} />
            {t("assignments.completedOn")} {loc(assignment.completedAt, lang)}
          </Tag>
        ) : assignment.dueIn ? (
          <Tag color={URGENCY_TAG_COLOR[assignment.dueUrgency] || "neutral"} style={{ gap: 4, display: "flex", alignItems: "center" }}>
            <Ic n="clock" s={11} c={assignment.dueUrgency === "urgent" ? COLORS.danger : COLORS.textMid} />
            {loc(assignment.dueIn, lang)}
          </Tag>
        ) : null}
      </div>

      {/* Title */}
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textDark, lineHeight: 1.4 }}>
        {loc(assignment.title, lang)}
      </p>

      {/* Description */}
      <p style={{ fontSize: 12, color: COLORS.textMid, lineHeight: 1.5 }}>
        {loc(assignment.description, lang)}
      </p>

      {/* Progress bar for ongoing items */}
      {showProgress && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ProgressBar value={assignment.progress} style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 600, minWidth: 32, textAlign: "end" }}>
            {assignment.progress}%
          </span>
        </div>
      )}

      {/* CTA button (active only) */}
      {!isCompleted && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenForm(assignment)}
          style={{ width: "100%", marginTop: 2 }}
        >
          {t(`assignments.${cfg.ctaKey}`)}
        </Button>
      )}
    </Card>
  );
};

// ── Main Component ───────────────────────────────────────────
export const Assignments = ({ assignments = [], onCompleteAssignment, chosenTherapist }) => {
  const { lang, dir, t } = useLang();
  const isD = useIsDesktop();
  const [activeTab, setActiveTab] = useState("active");
  const [openAssignment, setOpenAssignment] = useState(null);

  const activeItems    = assignments.filter((a) => a.status === "active");
  const completedItems = assignments.filter((a) => a.status === "completed");
  const items = activeTab === "active" ? activeItems : completedItems;

  const gap = isD ? 20 : 14;
  const pad = isD ? 28 : 16;

  return (
    <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
      {/* ── Header ──────────────────────────────────── */}
      <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: COLORS.textDark, marginBottom: 4 }}>
        {t("assignments.title")}
      </h1>
      {chosenTherapist && (
        <p style={{ fontSize: 13, color: COLORS.textMid, marginBottom: gap }}>
          {t("assignments.fromTherapist")} {loc(chosenTherapist.name, lang)}
        </p>
      )}

      {/* ── Tab bar ─────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 0,
        background: "rgba(122,173,167,0.12)",
        borderRadius: RADIUS.pill,
        padding: 3,
        marginBottom: gap,
      }}>
        {["active", "completed"].map((tabId) => {
          const isActive = activeTab === tabId;
          const count = tabId === "active" ? activeItems.length : completedItems.length;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: RADIUS.pill,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                transition: "all 0.2s",
                background: isActive ? COLORS.primary : "transparent",
                color: isActive ? "#fff" : COLORS.textMid,
              }}
            >
              {t(`assignments.${tabId}`)} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Cards ───────────────────────────────────── */}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <Ic n={activeTab === "active" ? "book" : "check"} s={40} c={COLORS.textLight} />
          <p style={{ fontSize: 14, color: COLORS.textMid, marginTop: 12 }}>
            {activeTab === "active" ? t("assignments.noActive") : t("assignments.noCompleted")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              lang={lang}
              t={t}
              onOpenForm={setOpenAssignment}
              isCompleted={a.status === "completed"}
            />
          ))}
        </div>
      )}

      {/* ── Form Bottom Sheet ───────────────────────── */}
      {openAssignment && (
        <AssignmentFormSheet
          assignment={openAssignment}
          lang={lang}
          t={t}
          onClose={() => setOpenAssignment(null)}
          onSubmit={onCompleteAssignment}
        />
      )}
    </div>
  );
};
