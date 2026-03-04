// ─────────────────────────────────────────────────────────────
// THERAPIST / Profile
// ─────────────────────────────────────────────────────────────
// Displays therapist profile info with edit capability via
// BottomSheet. Sections: personal, professional, matching prefs,
// session settings.
// TODO(backend-integration): replace mock state with API data
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  useLang, useIsDesktop,
  Card, Button, Tag, Avatar, Ic, BottomSheet,
  Checkbox, RadioGroup, Select,
} from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Mock profile data (simulates onboarding responses) ──────
const INITIAL_PROFILE = {
  firstName:  { en: "Bahar",  fa: "بهار" },
  lastName:   { en: "Nazari", fa: "نظری" },
  email:      "bahar.nazari@clinic.com",
  phone:      "+98 912 345 6789",
  bio:        { en: "Clinical psychologist specialized in anxiety and trauma.", fa: "روان‌شناس بالینی متخصص اضطراب و تروما." },
  avatar:     null,
};

const INITIAL_Q = {
  specializations:      ["cbt", "humanistic"],
  experience:           "10+",
  sessionFormat:        "both",
  languages:            ["en", "fa"],
  approaches:           ["mindfulness", "emdr"],
  clientTypes:          ["individuals", "couples"],
  styleTags:            ["warm", "cultural", "trauma"],
  culturalCompetencies: ["middleEast", "southAsian"],
  ageGroups:            ["18-25", "26-40", "41-60"],
  genderIdentity:       "female",
};

// ── Label maps (value → i18n key) ────────────────────────────
const specLabels = (t) => ({
  cbt:           t("onboarding.tq1CBT"),
  psychodynamic: t("onboarding.tq1Psychodynamic"),
  humanistic:    t("onboarding.tq1Humanistic"),
  family:        t("onboarding.tq1Family"),
  childAdol:     t("onboarding.tq1ChildAdol"),
  addiction:     t("onboarding.tq1Addiction"),
});
const approachLabels = (t) => ({
  mindfulness: t("onboarding.tq5Mindfulness"),
  emdr:        t("onboarding.tq5EMDR"),
  dbt:         t("onboarding.tq5DBT"),
  act:         t("onboarding.tq5ACT"),
  somatic:     t("onboarding.tq5Somatic"),
});
const langLabels = (t) => ({
  en: t("onboarding.tq4En"),
  fa: t("onboarding.tq4Fa"),
  ar: t("onboarding.tq4Ar"),
  tr: t("onboarding.tq4Tr"),
  fr: t("onboarding.tq4Fr"),
});
const clientLabels = (t) => ({
  individuals: t("onboarding.tq6Individuals"),
  couples:     t("onboarding.tq6Couples"),
  families:    t("onboarding.tq6Families"),
  teens:       t("onboarding.tq6Teens"),
  children:    t("onboarding.tq6Children"),
});
const styleLabels = (t) => ({
  warm:     t("onboarding.tq7Warm"),
  direct:   t("onboarding.tq7Direct"),
  cultural: t("onboarding.tq7Cultural"),
  lgbtq:    t("onboarding.tq7LGBTQ"),
  faith:    t("onboarding.tq7Faith"),
  trauma:   t("onboarding.tq7Trauma"),
});
const cultureLabels = (t) => ({
  middleEast:    t("onboarding.tq8MiddleEast"),
  southAsian:    t("onboarding.tq8SouthAsian"),
  eastAsian:     t("onboarding.tq8EastAsian"),
  african:       t("onboarding.tq8African"),
  latinAmerican: t("onboarding.tq8LatinAmerican"),
  european:      t("onboarding.tq8European"),
  northAmerican: t("onboarding.tq8NorthAmerican"),
});
const ageLabels = (t) => ({
  "13-17": t("onboarding.tq9_13_17"),
  "18-25": t("onboarding.tq9_18_25"),
  "26-40": t("onboarding.tq9_26_40"),
  "41-60": t("onboarding.tq9_41_60"),
  "60+":   t("onboarding.tq9_60Plus"),
});
const genderLabels = (t) => ({
  male:           t("onboarding.tq10Male"),
  female:         t("onboarding.tq10Female"),
  nonBinary:      t("onboarding.tq10NonBinary"),
  preferNotToSay: t("onboarding.tq10PreferNotToSay"),
});
const expLabels = (t) => ({
  "<2":  t("onboarding.tq2v1"),
  "2-5": t("onboarding.tq2v2"),
  "5-10":t("onboarding.tq2v3"),
  "10+": t("onboarding.tq2v4"),
});
const formatLabels = (t) => ({
  video: t("onboarding.tq3Video"),
  audio: t("onboarding.tq3Audio"),
  both:  t("onboarding.tq3Both"),
});

// ── Helpers ──────────────────────────────────────────────────
const loc = (obj, lang) => (typeof obj === "string" ? obj : (obj?.[lang] || obj?.en || ""));

const TagList = ({ items, labelMap, color = "primary" }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {items.map((v) => (
      <Tag key={v} color={color} style={{ fontSize: 11 }}>{labelMap[v] || v}</Tag>
    ))}
  </div>
);

const SectionHeader = ({ title, onEdit, t }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
    <button
      onClick={onEdit}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 12, color: COLORS.primary, fontWeight: 600,
        fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
      }}
    >
      <Ic n="edit" s={12} c={COLORS.primary} /> {t("profile.editSection")}
    </button>
  </div>
);

const FieldRow = ({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 2 }}>{label}</p>
    <p style={{ fontSize: 13, color: "var(--ds-text)" }}>{value || "—"}</p>
  </div>
);

// ── Checkbox editor helper ──────────────────────────────────
const CheckboxEditor = ({ options, selected, onToggle }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {Object.entries(options).map(([value, label]) => (
      <Checkbox
        key={value}
        checked={selected.includes(value)}
        onChange={() => onToggle(value)}
        label={label}
      />
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════
export const Profile = () => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();

  // State
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [q, setQ] = useState(INITIAL_Q);
  const [editSection, setEditSection] = useState(null);
  const [draft, setDraft] = useState({});

  // Open BottomSheet for a section
  const openEdit = (section) => {
    if (section === "personal") {
      setDraft({ ...profile });
    } else if (section === "professional") {
      setDraft({
        specializations: [...q.specializations],
        experience: q.experience,
        approaches: [...q.approaches],
        languages: [...q.languages],
      });
    } else if (section === "matching") {
      setDraft({
        clientTypes: [...q.clientTypes],
        styleTags: [...q.styleTags],
        culturalCompetencies: [...q.culturalCompetencies],
        ageGroups: [...q.ageGroups],
        genderIdentity: q.genderIdentity,
      });
    } else if (section === "session") {
      setDraft({ sessionFormat: q.sessionFormat });
    }
    setEditSection(section);
  };

  const toggleDraft = (field, value) => {
    setDraft((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const saveDraft = () => {
    if (editSection === "personal") {
      setProfile(draft);
    } else if (editSection === "professional") {
      setQ((prev) => ({ ...prev, ...draft }));
    } else if (editSection === "matching") {
      setQ((prev) => ({ ...prev, ...draft }));
    } else if (editSection === "session") {
      setQ((prev) => ({ ...prev, ...draft }));
    }
    setEditSection(null);
  };

  // Label maps (memoised per render is fine for mock)
  const specs   = specLabels(t);
  const apprs   = approachLabels(t);
  const langs   = langLabels(t);
  const clients = clientLabels(t);
  const styles  = styleLabels(t);
  const cultures = cultureLabels(t);
  const ages    = ageLabels(t);
  const genders = genderLabels(t);
  const exps    = expLabels(t);
  const fmts    = formatLabels(t);

  const initials = loc(profile.firstName, lang).charAt(0) + loc(profile.lastName, lang).charAt(0);

  return (
    <div style={{
      direction: dir,
      maxWidth: isD ? 700 : 480,
      margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
        <Avatar initials={initials} src={profile.avatar} size={72} />
        <div style={{ flex: 1 }}>
          <h2 className="ds-heading" style={{ fontSize: 20, color: "var(--ds-text)", marginBottom: 2 }}>
            {loc(profile.firstName, lang)} {loc(profile.lastName, lang)}
          </h2>
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 6 }}>{profile.email}</p>
          <Tag color="primary" style={{ fontSize: 10 }}>{t("profile.verified")}</Tag>
        </div>
      </div>

      {/* ── Personal Info ────────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("profile.personalInfo")} onEdit={() => openEdit("personal")} t={t} />
        <FieldRow label={t("profile.firstName")} value={loc(profile.firstName, lang)} />
        <FieldRow label={t("profile.lastName")} value={loc(profile.lastName, lang)} />
        <FieldRow label={t("profile.email")} value={profile.email} />
        <FieldRow label={t("profile.phone")} value={profile.phone} />
        {profile.bio && <FieldRow label={t("profile.bio")} value={loc(profile.bio, lang)} />}
      </Card>

      {/* ── Professional ─────────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("profile.professionalTitle")} onEdit={() => openEdit("professional")} t={t} />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4 }}>{t("profile.specialties")}</p>
        <TagList items={q.specializations} labelMap={specs} color="primary" />
        <FieldRow label={t("profile.yearsExp")} value={exps[q.experience] || q.experience} />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4, marginTop: 8 }}>{t("onboarding.tq5Label")}</p>
        <TagList items={q.approaches} labelMap={apprs} color="accent" />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4, marginTop: 8 }}>{t("profile.languages")}</p>
        <TagList items={q.languages} labelMap={langs} color="neutral" />
      </Card>

      {/* ── Matching Preferences ──────────────────────────────── */}
      <Card>
        <SectionHeader title={t("profile.matchingTitle")} onEdit={() => openEdit("matching")} t={t} />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4 }}>{t("profile.clientTypes")}</p>
        <TagList items={q.clientTypes} labelMap={clients} color="primary" />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4, marginTop: 8 }}>{t("profile.styleTags")}</p>
        <TagList items={q.styleTags} labelMap={styles} color="accent" />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4, marginTop: 8 }}>{t("profile.culturalCompetencies")}</p>
        <TagList items={q.culturalCompetencies} labelMap={cultures} color="neutral" />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 4, marginTop: 8 }}>{t("profile.ageGroups")}</p>
        <TagList items={q.ageGroups} labelMap={ages} color="neutral" />
        <FieldRow label={t("profile.genderIdentity")} value={genders[q.genderIdentity] || q.genderIdentity} />
      </Card>

      {/* ── Session Settings ──────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("profile.sessionSettingsTitle")} onEdit={() => openEdit("session")} t={t} />
        <FieldRow label={t("onboarding.tq3Label")} value={fmts[q.sessionFormat] || q.sessionFormat} />
      </Card>

      {/* ═══ EDIT BOTTOM SHEETS ═══════════════════════════════ */}

      {/* Personal Info Edit */}
      {editSection === "personal" && (
        <BottomSheet onClose={() => setEditSection(null)}>
          <h3 className="ds-heading" style={{ fontSize: 17, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("profile.personalInfo")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
              {t("profile.firstName")}
              <input
                type="text" value={loc(draft.firstName, lang)}
                onChange={(e) => setDraft((d) => ({ ...d, firstName: { ...d.firstName, [lang]: e.target.value } }))}
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
              {t("profile.lastName")}
              <input
                type="text" value={loc(draft.lastName, lang)}
                onChange={(e) => setDraft((d) => ({ ...d, lastName: { ...d.lastName, [lang]: e.target.value } }))}
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
              {t("profile.email")}
              <input
                type="email" value={draft.email || ""}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
              {t("profile.phone")}
              <input
                type="tel" value={draft.phone || ""}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                style={inputStyle}
              />
            </label>
          </div>
          <SheetButtons onCancel={() => setEditSection(null)} onSave={saveDraft} t={t} />
        </BottomSheet>
      )}

      {/* Professional Edit */}
      {editSection === "professional" && (
        <BottomSheet onClose={() => setEditSection(null)}>
          <h3 className="ds-heading" style={{ fontSize: 17, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("profile.professionalTitle")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.specialties")}</p>
              <CheckboxEditor options={specs} selected={draft.specializations || []} onToggle={(v) => toggleDraft("specializations", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.yearsExp")}</p>
              <Select
                options={Object.entries(exps).map(([value, label]) => ({ value, label }))}
                value={draft.experience}
                onChange={(v) => setDraft((d) => ({ ...d, experience: v }))}
              />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("onboarding.tq5Label")}</p>
              <CheckboxEditor options={apprs} selected={draft.approaches || []} onToggle={(v) => toggleDraft("approaches", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.languages")}</p>
              <CheckboxEditor options={langs} selected={draft.languages || []} onToggle={(v) => toggleDraft("languages", v)} />
            </div>
          </div>
          <SheetButtons onCancel={() => setEditSection(null)} onSave={saveDraft} t={t} />
        </BottomSheet>
      )}

      {/* Matching Edit */}
      {editSection === "matching" && (
        <BottomSheet onClose={() => setEditSection(null)}>
          <h3 className="ds-heading" style={{ fontSize: 17, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("profile.matchingTitle")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.clientTypes")}</p>
              <CheckboxEditor options={clients} selected={draft.clientTypes || []} onToggle={(v) => toggleDraft("clientTypes", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.styleTags")}</p>
              <CheckboxEditor options={styles} selected={draft.styleTags || []} onToggle={(v) => toggleDraft("styleTags", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.culturalCompetencies")}</p>
              <CheckboxEditor options={cultures} selected={draft.culturalCompetencies || []} onToggle={(v) => toggleDraft("culturalCompetencies", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.ageGroups")}</p>
              <CheckboxEditor options={ages} selected={draft.ageGroups || []} onToggle={(v) => toggleDraft("ageGroups", v)} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("profile.genderIdentity")}</p>
              <RadioGroup
                options={Object.entries(genders).map(([value, label]) => ({ value, label }))}
                value={draft.genderIdentity}
                onChange={(v) => setDraft((d) => ({ ...d, genderIdentity: v }))}
              />
            </div>
          </div>
          <SheetButtons onCancel={() => setEditSection(null)} onSave={saveDraft} t={t} />
        </BottomSheet>
      )}

      {/* Session Settings Edit */}
      {editSection === "session" && (
        <BottomSheet onClose={() => setEditSection(null)}>
          <h3 className="ds-heading" style={{ fontSize: 17, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("profile.sessionSettingsTitle")}
          </h3>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 6 }}>{t("onboarding.tq3Label")}</p>
            <RadioGroup
              options={Object.entries(fmts).map(([value, label]) => ({ value, label }))}
              value={draft.sessionFormat}
              onChange={(v) => setDraft((d) => ({ ...d, sessionFormat: v }))}
            />
          </div>
          <SheetButtons onCancel={() => setEditSection(null)} onSave={saveDraft} t={t} />
        </BottomSheet>
      )}
    </div>
  );
};

// ── Shared styled components ─────────────────────────────────
const inputStyle = {
  display: "block", width: "100%", marginTop: 4,
  padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS.sm, outline: "none",
  background: "var(--ds-bg)", color: "var(--ds-text)",
};

const SheetButtons = ({ onCancel, onSave, t }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
    <Button variant="ghost2" onClick={onCancel} style={{ flex: 1 }}>
      {t("action.cancel")}
    </Button>
    <Button variant="primary" onClick={onSave} style={{ flex: 2 }}>
      {t("profile.saveChanges")}
    </Button>
  </div>
);
