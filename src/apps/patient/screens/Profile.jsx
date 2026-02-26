// ─────────────────────────────────────────────────────────────
// PATIENT / Profile
// ─────────────────────────────────────────────────────────────
// Props: navigate
// ─────────────────────────────────────────────────────────────
import { useLang, useIsDesktop, Card, Avatar, Ic, LanguageToggle } from "@ds";
import { COLORS, RADIUS } from "@ds";

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
            Sara Mohammadi
          </p>
          <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginTop: 2 }}>
            sara@example.com
          </p>
        </div>
        <button
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

        <SettingsRow icon="user" label={t("profile.personalInfo")} />
        <SettingsRow
          icon="globe"
          label={t("profile.language")}
          trailing={<LanguageToggle style={{ transform: "scale(0.85)", transformOrigin: dir === "rtl" ? "left center" : "right center" }} />}
        />
        <SettingsRow icon="bell" label={t("profile.notifications")} />
        <SettingsRow icon="clock" label={t("profile.sessionHistory")} />
      </Card>

      {/* ── Help & more ───────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <SettingsRow
          icon="support"
          iconColor={COLORS.accent}
          label={t("profile.helpSupport")}
          onClick={() => navigate?.("support")}
        />
        <SettingsRow icon="shield" label={t("profile.privacy")} />
        <SettingsRow icon="download" label={t("profile.downloadData")} />
      </Card>

      {/* ── Danger zone ───────────────────────────────── */}
      <Card style={{ marginBottom: gap }}>
        <SettingsRow icon="trash" label={t("profile.deleteAccount")} danger />
        <SettingsRow
          icon="logout"
          label={t("profile.logout")}
          danger
          trailing={null}
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
    </div>
  );
};
