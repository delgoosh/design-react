// ─────────────────────────────────────────────────────────────
// STEP 1 — Profile setup (name, email, phone, avatar)
// Matches the Edit Profile form from Profile.jsx.
// If the user changes their email from the one they signed up
// with, an inline OTP verification is required before proceeding.
// TODO(backend-integration): OTP send/verify should call real
// POST /auth/send-otp and POST /auth/verify-otp endpoints.
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { useLang, Button, AvatarUpload, Card } from "@ds";
import { COLORS, RADIUS } from "@ds";

export const StepProfile = ({ profile, setProfile, originalEmail, onNext }) => {
  const { t, dir } = useLang();
  const [error, setError] = useState(null);

  // ── Email-change OTP state ──────────────────────────────
  const [showOtp, setShowOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { clearInterval(countdownRef.current); return; }
    countdownRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(countdownRef.current); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [countdown]);

  // Reset verification when email changes back to original
  const emailChanged = profile.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
  useEffect(() => {
    if (!emailChanged) { setShowOtp(false); setEmailVerified(false); setOtp(""); }
  }, [emailChanged]);

  const updateField = (key, val) => {
    setProfile((prev) => ({ ...prev, [key]: val }));
    setError(null);
  };

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleNext = () => {
    if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
      setError(t("onboarding.fieldsRequired"));
      return;
    }
    if (!isValidEmail(profile.email.trim())) {
      setError(t("auth.invalidEmail"));
      return;
    }
    // Email changed → require OTP verification
    if (emailChanged && !emailVerified) {
      setShowOtp(true);
      if (countdown <= 0) setCountdown(120);
      return;
    }
    onNext();
  };

  const handleVerifyOtp = () => {
    if (otp.replace(/\s/g, "").length === 6) {
      // TODO(backend-integration): verify OTP with POST /auth/verify-otp
      setEmailVerified(true);
      setShowOtp(false);
      onNext();
    }
  };

  const handleCancelOtp = () => {
    setShowOtp(false);
    setOtp("");
    setCountdown(0);
    updateField("email", originalEmail);
  };

  const handleResend = () => {
    if (countdown <= 0) {
      // TODO(backend-integration): resend OTP
      setCountdown(120);
      setOtp("");
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", fontSize: 13,
    borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
    background: "var(--ds-card-bg)", color: "var(--ds-text)",
    fontFamily: "inherit", direction: dir, outline: "none",
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block",
  };

  const canSubmit = profile.firstName.trim() && profile.lastName.trim() && profile.email.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {/* Title */}
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

      {/* Form fields — matches Edit Profile in Profile.jsx */}
      <Card style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>{t("onboarding.firstName")}</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder={t("onboarding.firstNamePh")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t("onboarding.lastName")}</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder={t("onboarding.lastNamePh")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t("onboarding.email")}</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={t("onboarding.emailPh")}
            style={inputStyle}
            disabled={showOtp}
          />

          {/* ── Inline OTP verification ───────────────── */}
          {showOtp && (
            <div style={{
              marginTop: 12, padding: 16, borderRadius: RADIUS.md,
              background: "var(--ds-cream)", border: "1.5px solid var(--ds-sand)",
              display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
            }}>
              <p style={{ fontSize: 12, color: "var(--ds-text-mid)", textAlign: "center", margin: 0 }}>
                {t("onboarding.otpSentTo")}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text)", margin: 0, direction: "ltr" }}>
                {profile.email}
              </p>

              {/* 6-digit OTP input */}
              <OtpInput value={otp} onChange={setOtp} />

              <Button
                variant="primary"
                onClick={handleVerifyOtp}
                style={{ width: "100%", opacity: otp.replace(/\s/g, "").length < 6 ? 0.5 : 1 }}
              >
                {t("onboarding.verifyNewEmail")}
              </Button>

              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: 12, color: "var(--ds-text-light)" }}>
                    {t("auth.resendIn")} {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: COLORS.primary, fontFamily: "inherit",
                    }}
                  >
                    {t("auth.resendCode")}
                  </button>
                )}
                <button
                  onClick={handleCancelOtp}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: COLORS.danger, fontFamily: "inherit",
                  }}
                >
                  {t("action.cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>{t("onboarding.phone")}</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder={t("onboarding.phonePh")}
            style={{ ...inputStyle, direction: "ltr" }}
          />
        </div>
      </Card>

      {/* Error */}
      {error && <p style={{ fontSize: 12, color: COLORS.danger, textAlign: "center" }}>{error}</p>}

      {/* Next */}
      {!showOtp && (
        <Button
          variant="primary"
          onClick={handleNext}
          style={{ width: "100%", opacity: canSubmit ? 1 : 0.5 }}
        >
          {t("onboarding.next")}
        </Button>
      )}
    </div>
  );
};

// ── Inline 6-digit OTP input (same pattern as Auth.jsx) ────
function OtpInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (!value[i] && i > 0) {
        refs[i - 1].current?.focus();
        const next = value.split("");
        next[i - 1] = "";
        onChange(next.join(""));
      } else {
        const next = value.split("");
        next[i] = "";
        onChange(next.join(""));
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = value.padEnd(6, " ").split("");
    next[i] = e.key;
    onChange(next.join(""));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text.padEnd(6, "").slice(0, 6));
    refs[Math.min(text.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", direction: "ltr" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 40, height: 48, textAlign: "center",
            fontSize: 18, fontWeight: 700, borderRadius: RADIUS.md,
            border: `1.5px solid ${value[i] && value[i] !== " " ? COLORS.primary : "var(--ds-sand)"}`,
            background: value[i] && value[i] !== " " ? COLORS.primaryGhost : "var(--ds-card-bg)",
            color: "var(--ds-text)",
            boxShadow: value[i] && value[i] !== " " ? "0 0 0 3px rgba(59,175,160,0.13)" : "none",
            transition: "all 0.15s",
            outline: "none",
          }}
        />
      ))}
    </div>
  );
}
