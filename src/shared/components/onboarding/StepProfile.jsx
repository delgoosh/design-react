// ─────────────────────────────────────────────────────────────
// STEP 1 — Profile setup (name, avatar, OAuth import)
// TODO(backend-integration): OAuth import should call the real
// Google/Apple APIs to fetch user info and avatar.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useLang, Button, AvatarUpload, Card } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { MOCK_OAUTH } from "./mockData.js";

// Inline SVG logos (kept small, same pattern as Auth.jsx)
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.06 24.06 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
);
const AppleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
);

export const StepProfile = ({ profile, setProfile, onNext }) => {
  const { t, dir } = useLang();
  const [error, setError] = useState(null);

  const updateField = (key, val) => {
    setProfile((prev) => ({ ...prev, [key]: val }));
    setError(null);
  };

  // TODO(backend-integration): replace with real OAuth flow
  const importOAuth = (provider) => {
    const data = MOCK_OAUTH[provider];
    setProfile((prev) => ({
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar || prev.avatar,
    }));
    setError(null);
  };

  const handleNext = () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError(t("onboarding.fieldsRequired"));
      return;
    }
    onNext();
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", fontSize: 13,
    borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
    background: "var(--ds-card-bg)", color: "var(--ds-text)",
    fontFamily: "inherit", direction: dir, outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <h2 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)", marginBottom: 6 }}>
          {t("onboarding.profileTitle")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("onboarding.profileSub")}</p>
      </div>

      {/* Avatar */}
      <AvatarUpload
        src={profile.avatar}
        onFileSelect={(url) => updateField("avatar", url)}
        size={96}
      />
      <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: -16 }}>{t("onboarding.photoHint")}</p>

      {/* OAuth import buttons */}
      <Card variant="sm" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <OAuthImportButton icon={<GoogleLogo />} label={t("onboarding.importGoogle")} onClick={() => importOAuth("google")} />
        <OAuthImportButton icon={<AppleLogo />} label={t("onboarding.importApple")} onClick={() => importOAuth("apple")} />
      </Card>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <div style={{ flex: 1, height: 1, background: "var(--ds-sand)" }} />
        <span style={{ fontSize: 12, color: "var(--ds-text-light)" }}>{t("onboarding.orEnterManually")}</span>
        <div style={{ flex: 1, height: 1, background: "var(--ds-sand)" }} />
      </div>

      {/* Name fields */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
            {t("onboarding.firstName")}
          </label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder={t("onboarding.firstNamePh")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
            {t("onboarding.lastName")}
          </label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder={t("onboarding.lastNamePh")}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Error */}
      {error && <p style={{ fontSize: 12, color: COLORS.danger, textAlign: "center" }}>{error}</p>}

      {/* Next */}
      <Button
        variant="primary"
        onClick={handleNext}
        style={{ width: "100%", opacity: (!profile.firstName.trim() || !profile.lastName.trim()) ? 0.5 : 1 }}
      >
        {t("onboarding.next")}
      </Button>
    </div>
  );
};

// ── Small OAuth-style import button ────────────────────────
function OAuthImportButton({ icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, padding: "10px 20px", borderRadius: RADIUS.md,
        border: `1.5px solid ${hover ? "var(--ds-sand)" : "rgba(184,216,212,0.3)"}`,
        background: hover ? "var(--ds-cream)" : "var(--ds-card-bg)",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
        color: "var(--ds-text)", transition: "all 0.18s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
