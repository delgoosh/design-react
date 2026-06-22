// ─────────────────────────────────────────────────────────────
// THERAPIST / Premium
// ─────────────────────────────────────────────────────────────
// For a therapist activated for "premium" by an admin. She sets
// her per-session take-home rate, optionally offers therapist-
// funded bundle discounts, and invites her own clients (premium
// is invite-only). Editing happens in a BottomSheet, mirroring
// Profile.jsx's draft/openEdit/saveDraft pattern.
//
// Business rules:
//  • rate = therapist take-home (£). Delgoosh adds 20% on top,
//    so patient pays = rate × 1.2. She always receives her rate.
//  • Bundles (therapist-funded, toggleable): 4-pack = −10%,
//    6-pack = −20% off the patient all-in price.
//
// TODO(backend-integration): replace mock state with API data
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  useLang, useIsDesktop,
  Card, Button, Tag, Ic, BottomSheet, Checkbox,
} from "@ds";
import { COLORS, RADIUS } from "@ds";

// ── Mock state (simulates admin-activated premium account) ──
const INITIAL_INVITES = [
  { name: { en: "Sara Mohammadi", fa: "سارا محمدی" }, contact: "sara.m@email.com", status: "joined",  sessions: 6 },
  { name: { en: "Ali Rezaei",      fa: "علی رضایی" }, contact: "ali.rezaei@email.com", status: "joined",  sessions: 2 },
  { name: { en: "Maryam Hosseini", fa: "مریم حسینی" }, contact: "+44 7700 900123", status: "pending", sessions: 0 },
];

// ── Helpers ──────────────────────────────────────────────────
const loc = (obj, lang) => (typeof obj === "string" ? obj : (obj?.[lang] || obj?.en || ""));

const SectionHeader = ({ title, onEdit, t }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{title}</p>
    {onEdit && (
      <button
        onClick={onEdit}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: COLORS.primary, fontWeight: 600,
          fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <Ic n="pen" s={12} c={COLORS.primary} /> {t("premium.editRate")}
      </button>
    )}
  </div>
);

const FieldRow = ({ label, value, emphasize }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid var(--ds-card-border)",
  }}>
    <p style={{ fontSize: 13, color: emphasize ? "var(--ds-text)" : "var(--ds-text-mid)", fontWeight: emphasize ? 700 : 400 }}>{label}</p>
    <p style={{ fontSize: emphasize ? 16 : 13, color: emphasize ? COLORS.primary : "var(--ds-text)", fontWeight: emphasize ? 700 : 600 }}>{value}</p>
  </div>
);

// ══════════════════════════════════════════════════════════════
export const Premium = () => {
  const { t, lang, dir, n } = useLang();
  const isD = useIsDesktop();

  // £ display helper (fmtCurrency is USD-only — do not use it)
  const gbp = (v) => "£" + n(Math.round(v));

  // State (mock — design mock)
  const [premiumActive] = useState(true); // admin-activated; default active so the full design shows
  const [rate, setRate] = useState(150);
  const [offerBundles, setOfferBundles] = useState(true);
  const [invites, setInvites] = useState(INITIAL_INVITES);
  const [inviteInput, setInviteInput] = useState("");
  const [justSent, setJustSent] = useState(false);

  // Edit BottomSheet (mirrors Profile's draft/openEdit/saveDraft)
  const [editSection, setEditSection] = useState(null);
  const [draft, setDraft] = useState({});

  const openEdit = (section) => {
    if (section === "rate") setDraft({ rate });
    setEditSection(section);
  };
  const saveDraft = () => {
    if (editSection === "rate") {
      const v = Number(draft.rate);
      if (!Number.isNaN(v) && v > 0) setRate(v);
    }
    setEditSection(null);
  };

  // Derived pricing
  const patientPays = rate * 1.2;

  // Invites (mock): sending unshifts a pending entry + clears input
  const sendInvite = () => {
    const contact = inviteInput.trim();
    if (!contact) return;
    setInvites((prev) => [
      { name: { en: contact, fa: contact }, contact, status: "pending", sessions: 0 },
      ...prev,
    ]);
    setInviteInput("");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2000);
  };

  const pending = invites.filter((i) => i.status === "pending");
  const joined  = invites.filter((i) => i.status === "joined");

  // ── notActive empty-state (admin hasn't enabled premium yet) ──
  // Default is active; this branch is kept for the full design surface.
  if (!premiumActive) {
    return (
      <div style={containerStyle(isD, dir)}>
        <Card>
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
              background: "var(--ds-cream)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ic n="star" s={26} c={COLORS.primary} />
            </div>
            <h2 className="ds-heading" style={{ fontSize: 18, color: "var(--ds-text)", marginBottom: 8 }}>
              {t("premium.notActiveTitle")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ds-text-mid)", lineHeight: 1.6 }}>
              {t("premium.notActiveDesc")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyle(isD, dir)}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 className="ds-heading" style={{ fontSize: 22, color: "var(--ds-text)" }}>{t("premium.title")}</h1>
          <Tag color="success" style={{ fontSize: 10 }}>{t("premium.activeTag")}</Tag>
        </div>
        <p style={{ fontSize: 13, color: "var(--ds-text-mid)" }}>{t("premium.subtitle")}</p>
      </div>

      {/* ── Rate ─────────────────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("premium.pricingTitle")} onEdit={() => openEdit("rate")} t={t} />
        <FieldRow label={t("premium.takeHome")} value={gbp(rate)} />
        <FieldRow label={t("premium.commission")} value={gbp(rate * 0.2)} />
        <FieldRow label={t("premium.patientPays")} value={gbp(patientPays)} emphasize />
        <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 10, lineHeight: 1.5 }}>
          {t("premium.commissionNote")}
        </p>
      </Card>

      {/* ── Bundles ──────────────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("premium.bundleTitle")} t={t} />
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 12, lineHeight: 1.5 }}>
          {t("premium.bundleDesc")}
        </p>
        <Checkbox
          checked={offerBundles}
          onChange={() => setOfferBundles((v) => !v)}
          label={t("premium.offerBundles")}
        />
        {offerBundles ? (
          <div style={{ marginTop: 12 }}>
            <FieldRow label={t("premium.pack4Label")} value={`${gbp(patientPays * 0.9)} · ${t("premium.bundlePrice")}`} />
            <FieldRow label={t("premium.pack6Label")} value={`${gbp(patientPays * 0.8)} · ${t("premium.bundlePrice")}`} />
          </div>
        ) : (
          <div style={{
            marginTop: 12, padding: "10px 12px", borderRadius: RADIUS.sm,
            background: "var(--ds-cream)", display: "flex", alignItems: "center", gap: 8,
          }}>
            <Ic n="info" s={14} c={COLORS.textMid} />
            <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{t("premium.bundlesOff")}</p>
          </div>
        )}
      </Card>

      {/* ── Invites ──────────────────────────────────────────── */}
      <Card>
        <SectionHeader title={t("premium.invitesTitle")} t={t} />
        <p style={{ fontSize: 12, color: "var(--ds-text-mid)", marginBottom: 12, lineHeight: 1.5 }}>
          {t("premium.invitesDesc")}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder={t("premium.invitePlaceholder")}
            style={{ ...inputStyle, marginTop: 0, flex: 1 }}
          />
          <Button variant="primary" size="sm" onClick={sendInvite}>
            <Ic n="send" s={13} c="#fff" /> {t("premium.inviteSend")}
          </Button>
        </div>
        {justSent && (
          <p style={{ fontSize: 12, color: COLORS.success, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <Ic n="check" s={13} c={COLORS.success} /> {t("premium.inviteSent")}
          </p>
        )}

        {/* Pending invites */}
        {pending.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 11, color: "var(--ds-text-light)", fontWeight: 600, marginBottom: 8 }}>
              {t("premium.pendingInvites")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pending.map((inv, i) => (
                <div key={`p-${i}`} style={inviteRowStyle}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--ds-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loc(inv.name, lang)}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>{inv.contact}</p>
                  </div>
                  <Tag color="warn" style={{ fontSize: 10 }}>{t("premium.statusPending")}</Tag>
                  <Button variant="ghost" size="xs">{t("premium.resend")}</Button>
                  <Button variant="ghost2" size="xs">{t("premium.revoke")}</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active clients */}
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: 11, color: "var(--ds-text-light)", fontWeight: 600, marginBottom: 8 }}>
            {t("premium.activeClients")}
          </p>
          {joined.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ds-text-light)" }}>{t("premium.noClients")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {joined.map((inv, i) => (
                <div key={`j-${i}`} style={inviteRowStyle}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--ds-text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loc(inv.name, lang)}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--ds-text-light)" }}>{inv.contact}</p>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
                    {n(inv.sessions)} {t("premium.sessionsCount")}
                  </p>
                  <Tag color="success" style={{ fontSize: 10 }}>{t("premium.statusJoined")}</Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ═══ EDIT BOTTOM SHEET — Rate ═════════════════════════ */}
      {editSection === "rate" && (
        <BottomSheet onClose={() => setEditSection(null)}>
          <h3 className="ds-heading" style={{ fontSize: 17, color: "var(--ds-text)", marginBottom: 16 }}>
            {t("premium.pricingTitle")}
          </h3>
          <label style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>
            {t("premium.perSessionRate")}
            <input
              type="number"
              value={draft.rate ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, rate: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 6, lineHeight: 1.5 }}>
            {t("premium.rateHint")}
          </p>
          {/* Live patient-pays preview */}
          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: RADIUS.sm,
            background: "var(--ds-cream)", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <p style={{ fontSize: 12, color: "var(--ds-text-mid)", fontWeight: 600 }}>{t("premium.patientPays")}</p>
            <p style={{ fontSize: 16, color: COLORS.primary, fontWeight: 700 }}>
              {gbp((Number(draft.rate) || 0) * 1.2)}
            </p>
          </div>
          <SheetButtons onCancel={() => setEditSection(null)} onSave={saveDraft} t={t} />
        </BottomSheet>
      )}
    </div>
  );
};

// ── Shared styles ────────────────────────────────────────────
const containerStyle = (isD, dir) => ({
  direction: dir,
  maxWidth: isD ? 700 : 480,
  margin: "0 auto",
  padding: isD ? 28 : 14, paddingBottom: 100,
  display: "flex", flexDirection: "column", gap: 16,
});

const inputStyle = {
  display: "block", width: "100%", marginTop: 4,
  padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
  border: "1px solid var(--ds-sand)",
  borderRadius: RADIUS.sm, outline: "none",
  background: "var(--ds-bg)", color: "var(--ds-text)",
};

const inviteRowStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 12px", borderRadius: RADIUS.sm,
  background: "var(--ds-cream)",
};

const SheetButtons = ({ onCancel, onSave, t }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
    <Button variant="ghost2" onClick={onCancel} style={{ flex: 1 }}>
      {t("action.cancel")}
    </Button>
    <Button variant="primary" onClick={onSave} style={{ flex: 2 }}>
      {t("premium.saveChanges")}
    </Button>
  </div>
);
