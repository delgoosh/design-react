// ─────────────────────────────────────────────────────────────
// PATIENT / Profile
// ─────────────────────────────────────────────────────────────
// Props: navigate
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useLang, useIsDesktop, Card, Avatar, Ic, LanguageToggle, BottomSheet, Button, Checkbox, AvatarUpload, Tag, Select } from "@ds";
import { COLORS, RADIUS } from "@ds";
import { getAllTimezones, getTimezoneOffset } from "@shared/utils/availability.js";

// ── Mock session history ────────────────────────────────────
const MOCK_SESSION_HISTORY = [
  {
    id: "s1",
    therapist: { en: "Dr. Mina Karimi", fa: "دکتر مینا کریمی" },
    topic:     { en: "Anxiety management", fa: "مدیریت اضطراب" },
    date:      { en: "Feb 22", fa: "۳ اسفند" },
    time:      { en: "10:00 AM", fa: "۱۰:۰۰" },
    duration:  { en: "50 min", fa: "۵۰ دقیقه" },
    status:    "completed",
  },
  {
    id: "s2",
    therapist: { en: "Dr. Mina Karimi", fa: "دکتر مینا کریمی" },
    topic:     { en: "Coping strategies", fa: "راهبردهای مقابله" },
    date:      { en: "Feb 15", fa: "۲۶ بهمن" },
    time:      { en: "10:00 AM", fa: "۱۰:۰۰" },
    duration:  { en: "50 min", fa: "۵۰ دقیقه" },
    status:    "completed",
  },
  {
    id: "s3",
    therapist: { en: "Dr. Mina Karimi", fa: "دکتر مینا کریمی" },
    topic:     { en: "Initial assessment", fa: "ارزیابی اولیه" },
    date:      { en: "Feb 8", fa: "۱۹ بهمن" },
    time:      { en: "11:00 AM", fa: "۱۱:۰۰" },
    duration:  { en: "50 min", fa: "۵۰ دقیقه" },
    status:    "completed",
  },
  {
    id: "s4",
    therapist: { en: "Dr. Mina Karimi", fa: "دکتر مینا کریمی" },
    topic:     { en: "Follow-up session", fa: "جلسه پیگیری" },
    date:      { en: "Feb 1", fa: "۱۲ بهمن" },
    time:      { en: "10:00 AM", fa: "۱۰:۰۰" },
    duration:  { en: "50 min", fa: "۵۰ دقیقه" },
    status:    "cancelled",
  },
];

function loc(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || "";
}

// ── Shared input style ──────────────────────────────────────
const inputStyle = (dir) => ({
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", fontSize: 13,
  borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
  background: "var(--ds-card-bg)", color: "var(--ds-text)",
  fontFamily: "inherit", direction: dir, outline: "none",
});

// ── Back button (reused by full-page sub-views) ─────────────
const BackButton = ({ onClick, t, dir }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 4, marginBottom: 12,
      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 13, color: COLORS.primary, fontWeight: 600, padding: 0,
    }}
  >
    <Ic n="chev" s={14} c={COLORS.primary} style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
    {t("action.back")}
  </button>
);

// ── Settings row ─────────────────────────────────────────────
const SettingsRow = ({ icon, iconColor, label, trailing, onClick, danger }) => {
  const { dir } = useLang();
  const Tag = trailing !== undefined ? "div" : "button";
  return (
    <Tag
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "14px 0", background: "none", border: "none",
        borderBottom: "1px solid var(--ds-cream)", cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit", textAlign: dir === "rtl" ? "right" : "left",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: RADIUS.sm,
        background: danger ? `${COLORS.danger}14` : `${iconColor || COLORS.primary}14`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Ic n={icon} s={16} c={danger ? COLORS.danger : (iconColor || COLORS.primary)} />
      </div>
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 600,
        color: danger ? COLORS.danger : "var(--ds-text)",
      }}>
        {label}
      </span>
      {trailing || (
        <Ic n="chev" s={14} c="var(--ds-text-light)" style={{
          transform: dir === "rtl" ? undefined : "rotate(180deg)",
        }} />
      )}
    </Tag>
  );
};

// ── Main Component ───────────────────────────────────────────
export const Profile = ({ navigate }) => {
  const { t, lang, dir } = useLang();
  const isD = useIsDesktop();

  const gap = isD ? 20 : 14;
  const pad = isD ? 28 : 16;

  // ── Sub-view state ──────────────────────────────────────
  const [subView, setSubView] = useState(null);

  // ── Edit Profile form ───────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    firstName: "Sara", lastName: "Mohammadi",
    email: "sara@example.com", phone: "+1 555-0123",
  });
  const [avatarSrc, setAvatarSrc] = useState(null);
  const updateField = (field) => (e) => setProfileForm((p) => ({ ...p, [field]: e.target.value }));

  // ── Notification toggles ────────────────────────────────
  const [notifSettings, setNotifSettings] = useState({
    sessionReminders: true, assignmentDue: true,
    therapistMessages: true, promotions: false, weeklyReport: true,
  });
  const toggleNotif = (key) => setNotifSettings((p) => ({ ...p, [key]: !p[key] }));

  // ── Privacy toggles ────────────────────────────────────
  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: true, anonymousAnalytics: true, showOnlineStatus: false,
  });
  const togglePrivacy = (key) => setPrivacySettings((p) => ({ ...p, [key]: !p[key] }));

  // ── Timezone ──────────────────────────────────────────────
  const detectedTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  }, []);
  const [timezone, setTimezone] = useState(detectedTz);
  const [showTzEdit, setShowTzEdit] = useState(false);
  const tzOptions = useMemo(() => getAllTimezones().map((z) => ({ value: z, label: z })), []);

  // ── Download / Delete states ────────────────────────────
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const closeSheet = () => {
    setSubView(null);
    setDownloadStarted(false);
    setDeleteConfirmText("");
  };

  // ── Full-page: Edit Profile ─────────────────────────────
  if (subView === "editProfile") {
    return (
      <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
        <BackButton onClick={() => setSubView(null)} t={t} dir={dir} />
        <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", marginBottom: gap }}>
          {t("profile.personalInfoTitle")}
        </h1>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: gap }}>
          <AvatarUpload src={avatarSrc} onFileSelect={(f) => { if (f) setAvatarSrc(URL.createObjectURL(f)); }} size={isD ? 96 : 80} />
          <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 8 }}>{t("profile.uploadPhoto")}</p>
        </div>

        {/* Form */}
        <Card style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: gap }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
              {t("profile.firstName")}
            </label>
            <input style={inputStyle(dir)} value={profileForm.firstName} onChange={updateField("firstName")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
              {t("profile.lastName")}
            </label>
            <input style={inputStyle(dir)} value={profileForm.lastName} onChange={updateField("lastName")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
              {t("profile.email")}
            </label>
            <input type="email" style={inputStyle(dir)} value={profileForm.email} onChange={updateField("email")} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 4, display: "block" }}>
              {t("profile.phone")}
            </label>
            <input type="tel" style={{ ...inputStyle(dir), direction: "ltr" }} value={profileForm.phone} onChange={updateField("phone")} />
          </div>
        </Card>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost2" style={{ flex: 1 }} onClick={() => setSubView(null)}>
            {t("action.cancel")}
          </Button>
          <Button variant="primary" style={{ flex: 2 }} onClick={() => setSubView(null)}>
            {t("action.submit")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Full-page: Session History ──────────────────────────
  if (subView === "sessionHistory") {
    return (
      <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
        <BackButton onClick={() => setSubView(null)} t={t} dir={dir} />
        <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", marginBottom: 4 }}>
          {t("profile.sessionHistory")}
        </h1>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginBottom: gap }}>
          {t("profile.sessionHistorySubtitle")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_SESSION_HISTORY.map((s) => (
            <Card key={s.id} variant="sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }}>
                  {loc(s.therapist, lang)}
                </p>
                <Tag color={s.status === "completed" ? "success" : "danger"}>
                  {t(`profile.session${s.status === "completed" ? "Completed" : "Cancelled"}`)}
                </Tag>
              </div>
              <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>
                {loc(s.topic, lang)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--ds-text-light)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Ic n="cal" s={12} c="var(--ds-text-light)" /> {loc(s.date, lang)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Ic n="clock" s={12} c="var(--ds-text-light)" /> {loc(s.time, lang)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Ic n="video" s={12} c="var(--ds-text-light)" /> {loc(s.duration, lang)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Main profile view ───────────────────────────────────
  return (
    <div style={{ direction: dir, padding: pad, paddingBottom: 100, maxWidth: isD ? 600 : undefined }}>
      {/* ── Header ──────────────────────────────────── */}
      <h1 className="ds-heading" style={{ fontSize: isD ? 26 : 22, color: "var(--ds-text)", marginBottom: gap }}>
        {t("profile.title")}
      </h1>

      {/* ── User card ─────────────────────────────────── */}
      <Card style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: gap }}>
        <Avatar initials="SM" size={isD ? 56 : 48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: isD ? 16 : 15, fontWeight: 700, color: "var(--ds-text)" }}>
            {profileForm.firstName} {profileForm.lastName}
          </p>
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginTop: 2 }}>
            {profileForm.email}
          </p>
        </div>
        <button
          onClick={() => setSubView("editProfile")}
          style={{
            padding: "6px 14px", borderRadius: RADIUS.pill,
            border: `1.5px solid ${COLORS.primary}`, background: "transparent",
            color: COLORS.primary, fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("profile.editProfile")}
        </button>
      </Card>

      {/* ── Account settings ──────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {t("profile.settingsTitle")}
        </p>

        <SettingsRow icon="user" label={t("profile.personalInfo")} onClick={() => setSubView("editProfile")} />
        <SettingsRow
          icon="globe"
          label={t("profile.language")}
          trailing={<LanguageToggle style={{ transform: "scale(0.85)", transformOrigin: dir === "rtl" ? "left center" : "right center" }} />}
        />
        <SettingsRow icon="bell" label={t("profile.notifications")} onClick={() => setSubView("notifications")} />
        <SettingsRow icon="clock" label={t("profile.sessionHistory")} onClick={() => setSubView("sessionHistory")} />
      </Card>

      {/* ── Timezone ───────────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text-mid)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {t("profile.timezone")}
        </p>
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginBottom: 10 }}>{t("profile.timezoneDesc")}</p>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          borderRadius: RADIUS.sm, background: "var(--ds-cream)",
        }}>
          <Ic n="globe" s={16} c={COLORS.primary} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)" }}>{timezone}</p>
            <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>
              UTC{getTimezoneOffset(timezone)} · {t("profile.timezoneDetected")}
            </p>
          </div>
          <button
            onClick={() => setShowTzEdit(!showTzEdit)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: COLORS.primary, fontFamily: "inherit",
            }}
          >
            {showTzEdit ? t("action.cancel") : t("profile.editSection")}
          </button>
        </div>
        {showTzEdit && (
          <div style={{ marginTop: 10 }}>
            <Select
              options={tzOptions}
              value={timezone}
              onChange={(v) => { setTimezone(v); setShowTzEdit(false); }}
              placeholder={t("onboarding.timezoneSelect")}
            />
          </div>
        )}
      </Card>

      {/* ── Help & more ───────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <SettingsRow
          icon="support"
          iconColor={COLORS.accent}
          label={t("profile.helpSupport")}
          onClick={() => navigate?.("support")}
        />
        <SettingsRow icon="shield" label={t("profile.privacy")} onClick={() => setSubView("privacy")} />
        <SettingsRow icon="download" label={t("profile.downloadData")} onClick={() => setSubView("downloadData")} />
      </Card>

      {/* ── Danger zone ───────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <SettingsRow icon="trash" label={t("profile.deleteAccount")} danger onClick={() => setSubView("deleteAccount")} />
        <SettingsRow
          icon="logout"
          label={t("profile.logout")}
          danger
          trailing={null}
          onClick={() => setSubView("logout")}
        />
      </Card>

      {/* ── App info ──────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>
          {t("profile.about")}
        </p>
        <p style={{ fontSize: 10, color: "var(--ds-text-light)", marginTop: 2 }}>
          {t("app.version")}
        </p>
      </div>

      {/* ── BottomSheet: Notifications ────────────────── */}
      {subView === "notifications" && (
        <BottomSheet onClose={closeSheet}>
          <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("profile.notifications")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            <Checkbox checked={notifSettings.sessionReminders} onChange={() => toggleNotif("sessionReminders")} label={t("profile.notifSessionReminders")} />
            <Checkbox checked={notifSettings.assignmentDue} onChange={() => toggleNotif("assignmentDue")} label={t("profile.notifAssignmentDue")} />
            <Checkbox checked={notifSettings.therapistMessages} onChange={() => toggleNotif("therapistMessages")} label={t("profile.notifTherapistMessages")} />
            <Checkbox checked={notifSettings.promotions} onChange={() => toggleNotif("promotions")} label={t("profile.notifPromotions")} />
            <Checkbox checked={notifSettings.weeklyReport} onChange={() => toggleNotif("weeklyReport")} label={t("profile.notifWeeklyReport")} />
          </div>
          <Button variant="primary" style={{ width: "100%" }} onClick={closeSheet}>
            {t("action.submit")}
          </Button>
        </BottomSheet>
      )}

      {/* ── BottomSheet: Privacy ──────────────────────── */}
      {subView === "privacy" && (
        <BottomSheet onClose={closeSheet}>
          <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 4 }}>
            {t("profile.privacy")}
          </h2>
          <p style={{ fontSize: 13, color: "var(--ds-text-mid)", marginBottom: 16 }}>
            {t("profile.privacyDescription")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            <Checkbox checked={privacySettings.shareProgress} onChange={() => togglePrivacy("shareProgress")} label={t("profile.privacyShareProgress")} />
            <Checkbox checked={privacySettings.anonymousAnalytics} onChange={() => togglePrivacy("anonymousAnalytics")} label={t("profile.privacyAnalytics")} />
            <Checkbox checked={privacySettings.showOnlineStatus} onChange={() => togglePrivacy("showOnlineStatus")} label={t("profile.privacyOnlineStatus")} />
          </div>
          <div style={{
            padding: 12, borderRadius: RADIUS.sm, background: "var(--ds-cream)",
            fontSize: 12, color: "var(--ds-text-mid)", lineHeight: 1.5, marginBottom: 20,
          }}>
            <Ic n="shield" s={14} c="var(--ds-text-mid)" style={{ marginInlineEnd: 6 }} />
            {t("profile.privacyInfo")}
          </div>
          <Button variant="primary" style={{ width: "100%" }} onClick={closeSheet}>
            {t("action.submit")}
          </Button>
        </BottomSheet>
      )}

      {/* ── BottomSheet: Download Data ────────────────── */}
      {subView === "downloadData" && (
        <BottomSheet onClose={closeSheet}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 12px",
              background: `${COLORS.primary}14`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic n={downloadStarted ? "check" : "download"} s={24} c={COLORS.primary} />
            </div>
            <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 8 }}>
              {t("profile.downloadDataTitle")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ds-text-mid)", lineHeight: 1.5 }}>
              {downloadStarted ? t("profile.downloadDataSuccess") : t("profile.downloadDataDesc")}
            </p>
          </div>
          {!downloadStarted ? (
            <Button variant="primary" style={{ width: "100%" }} onClick={() => setDownloadStarted(true)}>
              {t("profile.downloadDataAction")}
            </Button>
          ) : (
            <Button variant="ghost2" style={{ width: "100%" }} onClick={closeSheet}>
              {t("action.cancel")}
            </Button>
          )}
        </BottomSheet>
      )}

      {/* ── BottomSheet: Delete Account ───────────────── */}
      {subView === "deleteAccount" && (
        <BottomSheet onClose={closeSheet}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 12px",
              background: `${COLORS.danger}14`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic n="alert" s={24} c={COLORS.danger} />
            </div>
            <h2 className="ds-heading" style={{ fontSize: 18, color: COLORS.danger, marginBottom: 8 }}>
              {t("profile.deleteAccountTitle")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ds-text-mid)", lineHeight: 1.5, marginBottom: 12 }}>
              {t("profile.deleteAccountWarning")}
            </p>
          </div>
          <ul style={{ fontSize: 13, color: "var(--ds-text)", lineHeight: 1.8, paddingInlineStart: 20, marginBottom: 16 }}>
            <li>{t("profile.deleteAccountItem1")}</li>
            <li>{t("profile.deleteAccountItem2")}</li>
            <li>{t("profile.deleteAccountItem3")}</li>
            <li>{t("profile.deleteAccountItem4")}</li>
          </ul>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text-mid)", marginBottom: 6, display: "block" }}>
            {t("profile.deleteAccountType")}
          </label>
          <input
            style={{ ...inputStyle(dir), borderColor: deleteConfirmText.toLowerCase() === "delete" ? COLORS.danger : "var(--ds-sand)", marginBottom: 16 }}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
          />
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost2" style={{ flex: 1 }} onClick={closeSheet}>
              {t("action.cancel")}
            </Button>
            <Button
              variant="danger"
              style={{ flex: 1, opacity: deleteConfirmText.toLowerCase() === "delete" ? 1 : 0.4, pointerEvents: deleteConfirmText.toLowerCase() === "delete" ? "auto" : "none" }}
              onClick={closeSheet}
            >
              {t("profile.deleteAccountConfirm")}
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* ── BottomSheet: Logout ───────────────────────── */}
      {subView === "logout" && (
        <BottomSheet onClose={closeSheet}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 12px",
              background: `${COLORS.danger}14`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic n="logout" s={24} c={COLORS.danger} />
            </div>
            <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 8 }}>
              {t("profile.logoutTitle")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ds-text-mid)", lineHeight: 1.5 }}>
              {t("profile.logoutConfirm")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost2" style={{ flex: 1 }} onClick={closeSheet}>
              {t("action.cancel")}
            </Button>
            <Button variant="danger" style={{ flex: 1 }} onClick={closeSheet}>
              {t("profile.logoutAction")}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
