// ─────────────────────────────────────────────────────────────
// STEP 2 — Questionnaire (role-specific questions)
// Uses Checkbox, RadioGroup, Select primitives from the DS.
// TODO(backend-integration): questions should be fetched from
// the backend and answers posted to the matching engine.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button, Card, Checkbox, RadioGroup, Select } from "@ds";
import { COLORS } from "@ds";

// ── Question definitions ─────────────────────────────────────
const patientQuestions = (t) => [
  {
    id: "concerns",
    label: t("onboarding.pq1Label"),
    type: "checkbox",
    required: true,
    options: [
      { value: "anxiety",       label: t("onboarding.pq1Anxiety") },
      { value: "depression",    label: t("onboarding.pq1Depression") },
      { value: "relationships", label: t("onboarding.pq1Relationships") },
      { value: "selfEsteem",    label: t("onboarding.pq1SelfEsteem") },
      { value: "grief",         label: t("onboarding.pq1Grief") },
      { value: "trauma",        label: t("onboarding.pq1Trauma") },
      { value: "other",         label: t("onboarding.pq1Other") },
    ],
  },
  {
    id: "therapyHistory",
    label: t("onboarding.pq2Label"),
    type: "radio",
    required: true,
    options: [
      { value: "never", label: t("onboarding.pq2Never") },
      { value: "1-5",   label: t("onboarding.pq2Yes1") },
      { value: "6+",    label: t("onboarding.pq2Yes6") },
    ],
  },
  {
    id: "mood",
    label: t("onboarding.pq3Label"),
    type: "radio",
    options: [
      { value: "1", label: t("onboarding.pq3v1") },
      { value: "2", label: t("onboarding.pq3v2") },
      { value: "3", label: t("onboarding.pq3v3") },
      { value: "4", label: t("onboarding.pq3v4") },
      { value: "5", label: t("onboarding.pq3v5") },
    ],
  },
  {
    id: "therapistPrefs",
    label: t("onboarding.pq4Label"),
    type: "checkbox",
    options: [
      { value: "male",         label: t("onboarding.pq4Male") },
      { value: "female",       label: t("onboarding.pq4Female") },
      { value: "noPreference", label: t("onboarding.pq4NoPreference") },
      { value: "sameLanguage", label: t("onboarding.pq4SameLanguage") },
    ],
  },
  {
    id: "preferredTime",
    label: t("onboarding.pq5Label"),
    type: "select",
    options: [
      { value: "morning",   label: t("onboarding.pq5Morning") },
      { value: "afternoon", label: t("onboarding.pq5Afternoon") },
      { value: "evening",   label: t("onboarding.pq5Evening") },
      { value: "weekend",   label: t("onboarding.pq5Weekend") },
    ],
  },
];

const therapistQuestions = (t) => [
  {
    id: "specializations",
    label: t("onboarding.tq1Label"),
    type: "checkbox",
    required: true,
    options: [
      { value: "cbt",           label: t("onboarding.tq1CBT") },
      { value: "psychodynamic", label: t("onboarding.tq1Psychodynamic") },
      { value: "humanistic",    label: t("onboarding.tq1Humanistic") },
      { value: "family",        label: t("onboarding.tq1Family") },
      { value: "childAdol",     label: t("onboarding.tq1ChildAdol") },
      { value: "addiction",     label: t("onboarding.tq1Addiction") },
    ],
  },
  {
    id: "experience",
    label: t("onboarding.tq2Label"),
    type: "select",
    required: true,
    options: [
      { value: "<2",  label: t("onboarding.tq2v1") },
      { value: "2-5", label: t("onboarding.tq2v2") },
      { value: "5-10",label: t("onboarding.tq2v3") },
      { value: "10+", label: t("onboarding.tq2v4") },
    ],
  },
  {
    id: "sessionFormat",
    label: t("onboarding.tq3Label"),
    type: "radio",
    options: [
      { value: "video", label: t("onboarding.tq3Video") },
      { value: "audio", label: t("onboarding.tq3Audio") },
      { value: "both",  label: t("onboarding.tq3Both") },
    ],
  },
  {
    id: "languages",
    label: t("onboarding.tq4Label"),
    type: "checkbox",
    options: [
      { value: "en", label: t("onboarding.tq4En") },
      { value: "fa", label: t("onboarding.tq4Fa") },
      { value: "ar", label: t("onboarding.tq4Ar") },
      { value: "tr", label: t("onboarding.tq4Tr") },
      { value: "fr", label: t("onboarding.tq4Fr") },
    ],
  },
  {
    id: "approaches",
    label: t("onboarding.tq5Label"),
    type: "checkbox",
    options: [
      { value: "mindfulness", label: t("onboarding.tq5Mindfulness") },
      { value: "emdr",        label: t("onboarding.tq5EMDR") },
      { value: "dbt",         label: t("onboarding.tq5DBT") },
      { value: "act",         label: t("onboarding.tq5ACT") },
      { value: "somatic",     label: t("onboarding.tq5Somatic") },
    ],
  },
];

export const StepQuestionnaire = ({ role, answers, setAnswers, onNext, onBack }) => {
  const { t } = useLang();
  const [error, setError] = useState(null);
  const questions = role === "patient" ? patientQuestions(t) : therapistQuestions(t);

  const setAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setError(null);
  };

  const toggleCheckbox = (qId, value) => {
    setAnswers((prev) => {
      const curr = prev[qId] || [];
      return {
        ...prev,
        [qId]: curr.includes(value) ? curr.filter((v) => v !== value) : [...curr, value],
      };
    });
    setError(null);
  };

  const handleNext = () => {
    // Validate first 2 required questions
    const required = questions.filter((q) => q.required);
    for (const q of required) {
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setError(t("onboarding.requiredQuestions"));
        return;
      }
    }
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: COLORS.textDark, marginBottom: 6 }}>
          {t("onboarding.questionnaireTitle")}
        </h2>
        <p style={{ fontSize: 13, color: COLORS.textMid }}>{t("onboarding.questionnaireSub")}</p>
      </div>

      {questions.map((q) => (
        <Card key={q.id} variant="sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark }}>
            {q.label}
            {q.required && <span style={{ color: COLORS.danger }}> *</span>}
          </p>

          {q.type === "checkbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt) => (
                <Checkbox
                  key={opt.value}
                  checked={(answers[q.id] || []).includes(opt.value)}
                  onChange={() => toggleCheckbox(q.id, opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          )}

          {q.type === "radio" && (
            <RadioGroup
              options={q.options}
              value={answers[q.id]}
              onChange={(val) => setAnswer(q.id, val)}
            />
          )}

          {q.type === "select" && (
            <Select
              options={q.options}
              value={answers[q.id]}
              onChange={(val) => setAnswer(q.id, val)}
              placeholder="—"
            />
          )}
        </Card>
      ))}

      {/* Error */}
      {error && <p style={{ fontSize: 12, color: COLORS.danger, textAlign: "center" }}>{error}</p>}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost2" onClick={onBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        <Button variant="primary" onClick={handleNext} style={{ flex: 2 }}>
          {t("onboarding.next")}
        </Button>
      </div>
    </div>
  );
};
