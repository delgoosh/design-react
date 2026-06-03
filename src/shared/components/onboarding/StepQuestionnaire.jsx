// ─────────────────────────────────────────────────────────────
// STEP 2 — Questionnaire (one question per screen, BetterHelp-style)
// Radio questions auto-advance on selection.
// Checkbox/Select questions require pressing "Next".
// crisisFlag triggers the CrisisResources screen inline.
// TODO(backend-integration): answers should be posted to the
// matching engine API after completion.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button, Checkbox, RadioGroup, Select } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { CrisisResources } from "./CrisisResources.jsx";

// ── Patient questions (preferredTime removed — asked at booking stage) ──
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
    id: "serviceType",
    label: t("onboarding.pq6Label"),
    type: "radio",
    required: true,
    options: [
      { value: "individual", label: t("onboarding.pq6Individual") },
      { value: "couples",    label: t("onboarding.pq6Couples") },
      { value: "family",     label: t("onboarding.pq6Family") },
      { value: "teen",       label: t("onboarding.pq6Teen") },
    ],
  },
  {
    id: "crisisFlag",
    label: t("onboarding.pq7Label"),
    type: "radio",
    required: true,
    crisis: true,          // triggers crisis screen when value === "yes"
    options: [
      { value: "no",  label: t("onboarding.pq7No") },
      { value: "yes", label: t("onboarding.pq7Yes") },
    ],
  },
  {
    id: "therapistPrefs",
    label: t("onboarding.pq4Label"),
    type: "radio",
    options: [
      { value: "male",         label: t("onboarding.pq4Male") },
      { value: "female",       label: t("onboarding.pq4Female") },
      { value: "noPreference", label: t("onboarding.pq4NoPreference") },
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
    id: "therapistAge",
    label: t("onboarding.pq8Label"),
    type: "radio",
    options: [
      { value: "noPref", label: t("onboarding.pq8NoPref") },
      { value: "25-35",  label: t("onboarding.pq8_25_35") },
      { value: "35-45",  label: t("onboarding.pq8_35_45") },
      { value: "45+",    label: t("onboarding.pq8_45Plus") },
    ],
  },
  {
    id: "lgbtqAffirming",
    label: t("onboarding.pq9Label"),
    type: "radio",
    options: [
      { value: "important",  label: t("onboarding.pq9Important") },
      { value: "niceToHave", label: t("onboarding.pq9NiceToHave") },
      { value: "noPref",     label: t("onboarding.pq9NoPref") },
    ],
  },
  {
    id: "religiousView",
    label: t("onboarding.pq10Label"),
    type: "radio",
    options: [
      { value: "believer",  label: t("onboarding.pq10Believer") },
      { value: "cultural",  label: t("onboarding.pq10Cultural") },
      { value: "secular",   label: t("onboarding.pq10Secular") },
      { value: "against",   label: t("onboarding.pq10Against") },
      { value: "noPref",    label: t("onboarding.pq10NoPref") },
    ],
  },
  {
    id: "culturalBackground",
    label: t("onboarding.pq11Label"),
    subtitle: t("onboarding.pq11Sub"),
    type: "radio",
    options: [
      { value: "veryImportant",  label: t("onboarding.pq11VeryImportant") },
      { value: "somewhat",       label: t("onboarding.pq11Somewhat") },
      { value: "notImportant",   label: t("onboarding.pq11NotImportant") },
      { value: "opposite",       label: t("onboarding.pq11Opposite") },
    ],
  },
];

// ── Therapist questions (unchanged) ─────────────────────────
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
  {
    id: "clientTypes",
    label: t("onboarding.tq6Label"),
    type: "checkbox",
    options: [
      { value: "individuals", label: t("onboarding.tq6Individuals") },
      { value: "couples",     label: t("onboarding.tq6Couples") },
      { value: "families",    label: t("onboarding.tq6Families") },
      { value: "teens",       label: t("onboarding.tq6Teens") },
      { value: "children",    label: t("onboarding.tq6Children") },
    ],
  },
  {
    id: "styleTags",
    label: t("onboarding.tq7Label"),
    type: "checkbox",
    options: [
      { value: "warm",     label: t("onboarding.tq7Warm") },
      { value: "direct",   label: t("onboarding.tq7Direct") },
      { value: "cultural", label: t("onboarding.tq7Cultural") },
      { value: "lgbtq",    label: t("onboarding.tq7LGBTQ") },
      { value: "faith",    label: t("onboarding.tq7Faith") },
      { value: "trauma",   label: t("onboarding.tq7Trauma") },
    ],
  },
  {
    id: "culturalCompetencies",
    label: t("onboarding.tq8Label"),
    type: "checkbox",
    options: [
      { value: "middleEast",    label: t("onboarding.tq8MiddleEast") },
      { value: "southAsian",    label: t("onboarding.tq8SouthAsian") },
      { value: "eastAsian",     label: t("onboarding.tq8EastAsian") },
      { value: "african",       label: t("onboarding.tq8African") },
      { value: "latinAmerican", label: t("onboarding.tq8LatinAmerican") },
      { value: "european",      label: t("onboarding.tq8European") },
      { value: "northAmerican", label: t("onboarding.tq8NorthAmerican") },
    ],
  },
  {
    id: "ageGroups",
    label: t("onboarding.tq9Label"),
    type: "checkbox",
    options: [
      { value: "13-17", label: t("onboarding.tq9_13_17") },
      { value: "18-25", label: t("onboarding.tq9_18_25") },
      { value: "26-40", label: t("onboarding.tq9_26_40") },
      { value: "41-60", label: t("onboarding.tq9_41_60") },
      { value: "60+",   label: t("onboarding.tq9_60Plus") },
    ],
  },
  {
    id: "genderIdentity",
    label: t("onboarding.tq10Label"),
    type: "radio",
    options: [
      { value: "male",           label: t("onboarding.tq10Male") },
      { value: "female",         label: t("onboarding.tq10Female") },
      { value: "nonBinary",      label: t("onboarding.tq10NonBinary") },
      { value: "preferNotToSay", label: t("onboarding.tq10PreferNotToSay") },
    ],
  },
];

// ── Main component ───────────────────────────────────────────
export const StepQuestionnaire = ({ role, answers, setAnswers, onNext, onBack }) => {
  const { t, dir } = useLang();
  const [subStep, setSubStep]         = useState(0);
  const [error, setError]             = useState(null);
  const [showCrisis, setShowCrisis]   = useState(false);

  const questions = role === "patient" ? patientQuestions(t) : therapistQuestions(t);
  const total     = questions.length;
  const q         = questions[subStep];

  // ── answer helpers ─────────────────────────────────────────
  const setAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setError(null);
  };

  const toggleCheckbox = (qId, value) => {
    setAnswers((prev) => {
      const curr = prev[qId] || [];
      return {
        ...prev,
        [qId]: curr.includes(value)
          ? curr.filter((v) => v !== value)
          : [...curr, value],
      };
    });
    setError(null);
  };

  // ── navigation ─────────────────────────────────────────────
  const advance = () => {
    if (subStep < total - 1) {
      setSubStep((s) => s + 1);
    } else {
      onNext();
    }
  };

  const handleNext = () => {
    if (q.required) {
      const val = answers[q.id];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setError(t("onboarding.requiredQuestion") ?? "Please answer this question to continue.");
        return;
      }
    }
    setError(null);
    advance();
  };

  const handleBack = () => {
    setError(null);
    if (subStep > 0) setSubStep((s) => s - 1);
    else onBack();
  };

  // Radio: just save the answer; user clicks Next to advance
  const handleRadioSelect = (val) => {
    setAnswer(q.id, val);
    setError(null);
    // crisis flag — show crisis resources immediately on "yes"
    if (q.crisis && val === "yes") {
      setTimeout(() => setShowCrisis(true), 150);
    }
  };

  // ── crisis screen ──────────────────────────────────────────
  if (showCrisis) {
    return (
      <CrisisResources
        onContinue={() => {
          setShowCrisis(false);
          advance();
        }}
      />
    );
  }

  // ── progress bar (within this step) ───────────────────────
  const pct = Math.round(((subStep + 1) / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, direction: dir }}>

      {/* Sub-step progress */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 6,
        }}>
          <span style={{ fontWeight: 500 }}>
            {t("onboarding.questionnaireTitle") ?? "A few questions"}
          </span>
          <span>{subStep + 1} / {total}</span>
        </div>
        <div style={{
          height: 4, background: "var(--ds-cream, #e8f0ee)",
          borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: "var(--ds-primary, #4a9d8e)",
            width: `${pct}%`,
            transition: "width 0.35s ease",
          }} />
        </div>
      </div>

      {/* Question label */}
      <div>
        <h2
          className="ds-heading"
          style={{ fontSize: 20, color: "var(--ds-text)", lineHeight: 1.4, margin: 0 }}
        >
          {q.label}
          {q.required && <span style={{ color: COLORS.danger }}> *</span>}
        </h2>
        {q.type === "checkbox" && (
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginTop: 4 }}>
            {dir === "rtl" ? "همه موارد را انتخاب کنید" : "Select all that apply"}
          </p>
        )}
        {q.subtitle && (
          <p style={{
            fontSize: 12, color: "var(--ds-text-mid)", marginTop: 6,
            lineHeight: 1.6, background: "var(--ds-cream, #edf7f5)",
            borderRadius: 8, padding: "8px 10px",
          }}>
            {q.subtitle}
          </p>
        )}
      </div>

      {/* Options */}
      {q.type === "checkbox" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                border: `2px solid ${(answers[q.id] || []).includes(opt.value) ? "var(--ds-primary, #4a9d8e)" : "var(--ds-border, #d4e5e1)"}`,
                borderRadius: RADIUS.md ?? 12,
                background: (answers[q.id] || []).includes(opt.value) ? "var(--ds-primary-ghost, #edf7f5)" : "var(--ds-card-bg, #fff)",
                cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <Checkbox
                checked={(answers[q.id] || []).includes(opt.value)}
                onChange={() => toggleCheckbox(q.id, opt.value)}
                label={null}
              />
              <span style={{ fontSize: 14, color: "var(--ds-text)", fontWeight: 500 }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {q.type === "radio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRadioSelect(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", textAlign: "start",
                  border: `2px solid ${selected ? "var(--ds-primary, #4a9d8e)" : "var(--ds-border, #d4e5e1)"}`,
                  borderRadius: RADIUS.md ?? 12,
                  background: selected ? "var(--ds-primary-ghost, #edf7f5)" : "var(--ds-card-bg, #fff)",
                  cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {/* Radio circle */}
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${selected ? "var(--ds-primary, #4a9d8e)" : "var(--ds-border, #d4e5e1)"}`,
                  background: selected ? "var(--ds-primary, #4a9d8e)" : "var(--ds-card-bg, #fff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s, border-color 0.15s",
                }}>
                  {selected && (
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#fff",
                    }} />
                  )}
                </span>
                <span style={{ fontSize: 14, color: "var(--ds-text)", fontWeight: 500 }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {q.type === "select" && (
        <Select
          options={q.options}
          value={answers[q.id]}
          onChange={(val) => setAnswer(q.id, val)}
          placeholder="—"
        />
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: COLORS.danger, marginTop: -12 }}>{error}</p>
      )}

      {/* Navigation — Back + Next on every question */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Button variant="ghost2" onClick={handleBack} style={{ flex: 1 }}>
          {t("onboarding.back")}
        </Button>
        <Button variant="primary" onClick={handleNext} style={{ flex: 2 }}>
          {t("onboarding.next") ?? "Next"}
        </Button>
      </div>
    </div>
  );
};
