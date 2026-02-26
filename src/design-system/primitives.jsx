// ─────────────────────────────────────────────────────────────
// PRIMITIVES — shared UI atoms consumed by every screen.
// All components use useLang() for dir/fonts.
// ─────────────────────────────────────────────────────────────
import { useRef } from "react";
import { useLang } from "./i18n/LanguageContext.jsx";
import { Ic }     from "./icons.jsx";
import { COLORS, FONTS, RADIUS, SHADOW } from "./tokens.js";

const LOGO_SRC = "data:image/jpeg;base64,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";

export const Logo = ({ size = 38 }) => (
  <img src={LOGO_SRC} alt="Delgoosh" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
);

// ── Button ────────────────────────────────────────────────────
// variant: "primary" | "accent" | "ghost" | "ghost2" | "danger" | "warn"
// size:    "md" (default) | "sm" | "xs"
export const Button = ({ variant = "primary", size = "md", children, style, ...props }) => {
  const { dir } = useLang();
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
    transition: "all 0.18s", whiteSpace: "nowrap", lineHeight: 1,
    direction: dir,
  };
  const sizes = {
    md: { padding: "10px 20px", fontSize: 13, borderRadius: RADIUS.md },
    sm: { padding:  "6px 13px", fontSize: 12, borderRadius: RADIUS.sm },
    xs: { padding:  "4px 10px", fontSize: 11, borderRadius: 7 },
  };
  const variants = {
    primary: { background: COLORS.primary,  color: "#fff", boxShadow: SHADOW.btn },
    accent:  { background: COLORS.accent,   color: "#fff", boxShadow: SHADOW.btnAccent },
    ghost:   { background: "transparent",   color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    ghost2:  { background: "transparent",   color: "var(--ds-text-mid)", border: "1.5px solid var(--ds-sand)" },
    danger:  { background: COLORS.danger,   color: "#fff" },
    warn:    { background: COLORS.warn,     color: "#fff" },
    dark:    { background: COLORS.bgDark,   color: "#fff" },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────────────────────
// variant: "default" | "sm" | "ghost" | "tinted"
export const Card = ({ variant = "default", children, style, ...props }) => {
  const base = {
    background: "var(--ds-card-bg)",
    borderRadius: variant === "sm" ? RADIUS.md : RADIUS.lg,
    padding: variant === "sm" ? "14px 16px" : 20,
    border: "1px solid var(--ds-card-border)",
    boxShadow: "var(--ds-shadow-card)",
  };
  const variants = {
    default: {},
    sm:      {},
    ghost:   { background: "transparent", boxShadow: "none", border: "1.5px dashed var(--ds-sand)" },
    tinted:  { background: "var(--ds-cream)",  boxShadow: "none", border: "none" },
  };
  return <div style={{ ...base, ...variants[variant], ...style }} {...props}>{children}</div>;
};

// ── Tag ───────────────────────────────────────────────────────
// color: "primary" | "success" | "warn" | "danger" | "neutral" | "accent"
export const Tag = ({ color = "primary", children, style }) => {
  const palettes = {
    primary: { background: COLORS.primaryGhost, color: COLORS.primary },
    success: { background: COLORS.successGhost, color: COLORS.success },
    warn:    { background: COLORS.warnGhost,     color: COLORS.warn    },
    danger:  { background: COLORS.dangerGhost,   color: COLORS.danger  },
    accent:  { background: COLORS.accentGhost,   color: "#C97040"      },
    neutral: { background: "rgba(122,173,167,0.18)", color: COLORS.textMid },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "3px 9px", borderRadius: RADIUS.pill,
      fontSize: 11, fontWeight: 700,
      ...palettes[color], ...style,
    }}>
      {children}
    </span>
  );
};

// ── Avatar ────────────────────────────────────────────────────
// Shows initials; src prop optional for photo
export const Avatar = ({ initials = "?", src, size = 44, style }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: src ? "transparent" : `linear-gradient(135deg, ${COLORS.primaryGhost}, ${COLORS.accentGhost})`,
    border: "2px solid var(--ds-cream)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: Math.round(size * 0.28), fontWeight: 700, color: COLORS.primary,
    overflow: "hidden", flexShrink: 0, ...style,
  }}>
    {src ? <img src={src} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
  </div>
);

// ── StarRating ────────────────────────────────────────────────
export const StarRating = ({ value = 5, max = 5, size = 13 }) => {
  const { dir } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: dir === "rtl" ? "row-reverse" : "row", gap: 2, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <Ic key={i} n={i < Math.floor(value) ? "star" : "starEmpty"} s={size} c={i < Math.floor(value) ? COLORS.accent : COLORS.sand} />
      ))}
    </div>
  );
};

// ── ProgressBar ───────────────────────────────────────────────
export const ProgressBar = ({ value = 0, height = 6, style }) => (
  <div className="ds-progress-bar" style={{ height, ...style }}>
    <div className="ds-progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%" }} />
  </div>
);

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ onClose, title, children, wide = false }) => {
  const { t, dir } = useLang();
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "ds-fadeIn 0.2s ease", direction: dir }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--ds-card-bg)", borderRadius: 22, padding: 28, width: "100%", maxWidth: wide ? 680 : 520, maxHeight: "90vh", overflowY: "auto", animation: "ds-fadeUp 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textLight, display: "flex" }}>
            <Ic n="x" s={18} c={COLORS.textMid} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── BottomSheet ───────────────────────────────────────────────
export const BottomSheet = ({ onClose, children }) => {
  const { dir } = useLang();
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.42)", zIndex: 999, display: "flex", alignItems: "flex-end", animation: "ds-fadeIn 0.2s ease", direction: dir }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--ds-card-bg)", borderRadius: "22px 22px 0 0", padding: "24px 22px 36px", width: "100%", maxWidth: 600, margin: "0 auto", animation: "ds-fadeUp 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: "var(--ds-sand)", borderRadius: 2, margin: "0 auto 22px" }} />
        {children}
      </div>
    </div>
  );
};

// ── LanguageToggle ────────────────────────────────────────────
// Compact two-option pill toggle for auth screen + settings
export const LanguageToggle = ({ dark, style }) => {
  const { lang, setLang } = useLang();
  return (
    <div style={{
      display: "inline-flex", background: dark ? "rgba(255,255,255,0.1)" : COLORS.cream,
      borderRadius: RADIUS.pill, padding: 3, gap: 2, direction: "ltr", ...style,
    }}>
      {[["en","English"],["fa","فارسی"]].map(([l, label]) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "6px 14px", borderRadius: RADIUS.pill, border: "none", cursor: "pointer",
            background: lang === l ? "var(--ds-card-bg)" : "transparent",
            color: lang === l ? COLORS.primary : dark ? "rgba(255,255,255,0.55)" : COLORS.textLight,
            fontFamily: l === "fa" ? FONTS.fa.body : FONTS.en.body,
            fontSize: 12, fontWeight: 700,
            transition: "all 0.18s",
            boxShadow: lang === l ? "0 1px 6px rgba(0,0,0,0.15)" : "none",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// ── NavItem (sidebar) ─────────────────────────────────────────
export const SidebarNavItem = ({ icon, label, active, badge, onClick }) => {
  const { dir } = useLang();
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 20px", margin: "1px 10px", borderRadius: 11,
        cursor: "pointer", border: "none",
        background: active ? COLORS.primaryGhost : "none",
        fontFamily: "inherit", fontSize: 13, fontWeight: 600,
        color: active ? COLORS.primary : "var(--ds-text-mid)",
        transition: "all 0.18s",
        textAlign: dir === "rtl" ? "right" : "left",
        width: "calc(100% - 20px)",
        direction: dir,
      }}
    >
      <Ic n={icon} s={17} c={active ? COLORS.primary : "var(--ds-text-mid)"} />
      {label}
      {badge && (
        <span style={{
          background: COLORS.accent, color: "white", fontSize: 10, fontWeight: 700,
          padding: "1px 6px", borderRadius: 10, marginInlineStart: "auto",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
};

// ── BottomNavItem ─────────────────────────────────────────────
export const BottomNavItem = ({ icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2, padding: 5, cursor: "pointer", transition: "all 0.18s",
      fontSize: 9, color: active ? COLORS.primary : "var(--ds-text-light)",
      fontWeight: 600, border: "none", background: "none", fontFamily: "inherit",
    }}
  >
    <div style={{
      width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 7, background: active ? COLORS.primaryGhost : "transparent",
      position: "relative",
    }}>
      <Ic n={icon} s={19} c={active ? COLORS.primary : "var(--ds-text-light)"} />
      {badge && (
        <span style={{
          position: "absolute", top: -3, right: -3, width: 8, height: 8,
          background: COLORS.accent, borderRadius: "50%", border: "1.5px solid var(--ds-card-bg)",
        }} />
      )}
    </div>
    {label}
  </button>
);

// ── StatCard ──────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, accentColor, badge, style }) => {
  const color = accentColor || COLORS.primary;
  return (
    <div style={{
      background: "var(--ds-card-bg)", borderRadius: 14, padding: "18px 20px",
      border: "1px solid var(--ds-card-border)", boxShadow: "var(--ds-shadow-stat)", ...style,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, background: `${color}14`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic n={icon} s={17} c={color} />
        </div>
        {badge}
      </div>
      <p className="ds-heading" style={{ fontSize: 28, color: "var(--ds-text)", lineHeight: 1, marginBottom: 3 }}>{value}</p>
      <p style={{ fontSize: 12, color: "var(--ds-text-mid)" }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--ds-text-light)", marginTop: 2 }}>{sub}</p>}
    </div>
  );
};

// ── SessionCard (gradient) ────────────────────────────────────
export const SessionCard = ({ patientName, initials, topic, time, date, hoursUntil, onJoin, onCancel, style }) => {
  const { t, dir } = useLang();
  const isPenalty = hoursUntil !== undefined && hoursUntil < 24;
  return (
    <div className="ds-session-card" style={{ direction: dir, ...style }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h4 style={{ fontSize: 15, color: "white", fontWeight: 700 }}>{patientName}</h4>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{topic}</p>
          </div>
          <Avatar initials={initials} size={44} style={{ background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.25)", color: "white" }} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {[["clock", time], ["cal", date], ["video", t("session.online")]].map(([ic, tx], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic n={ic} s={12} c="rgba(255,255,255,0.55)" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{tx}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {onJoin && <Button variant="accent" size="sm" style={{ flex: 1 }} onClick={onJoin}>{t("dashboard.joinSession")}</Button>}
          {onCancel && (
            <Button size="sm" onClick={onCancel} style={{ background: "rgba(255,255,255,0.14)", color: "white", border: "1.5px solid rgba(255,255,255,0.22)" }}>
              {isPenalty ? t("dashboard.cancelPenalty") : t("dashboard.cancelSession")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


// ── Checkbox ──────────────────────────────────────────────────
// Simple toggle checkbox: checked square with white check mark
export const Checkbox = ({ checked, onChange, label, disabled, style }) => {
  const { dir } = useLang();
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 8,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      direction: dir, ...style,
    }} onClick={(e) => { if (!disabled) { e.preventDefault(); onChange?.(!checked); } }}>
      <span style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${checked ? COLORS.primary : "var(--ds-sand)"}`,
        background: checked ? COLORS.primary : "var(--ds-card-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <Ic n="check" s={13} c="white" />}
      </span>
      {label && <span style={{ fontSize: 13, color: "var(--ds-text)" }}>{label}</span>}
    </label>
  );
};

// ── RadioGroup ───────────────────────────────────────────────
// options: [{ value, label }], direction: "vertical" | "horizontal"
export const RadioGroup = ({ options = [], value, onChange, direction = "vertical", style }) => {
  const { dir } = useLang();
  return (
    <div style={{
      display: "flex",
      flexDirection: direction === "horizontal" ? (dir === "rtl" ? "row-reverse" : "row") : "column",
      gap: direction === "horizontal" ? 16 : 10,
      ...style,
    }}>
      {options.map((opt) => (
        <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", direction: dir }}
          onClick={(e) => { e.preventDefault(); onChange?.(opt.value); }}>
          <span style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${value === opt.value ? COLORS.primary : "var(--ds-sand)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {value === opt.value && (
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.primary }} />
            )}
          </span>
          <span style={{ fontSize: 13, color: "var(--ds-text)" }}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

// ── Select ───────────────────────────────────────────────────
// Styled native <select> with chevron
export const Select = ({ options = [], value, onChange, placeholder, style }) => {
  const { dir } = useLang();
  return (
    <div style={{ position: "relative", direction: dir, ...style }}>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%", appearance: "none", WebkitAppearance: "none",
          padding: "10px 36px 10px 14px", fontSize: 13,
          borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
          background: "var(--ds-card-bg)", color: value ? "var(--ds-text)" : "var(--ds-text-light)",
          fontFamily: "inherit", cursor: "pointer",
          direction: dir,
          paddingInlineEnd: 36, paddingInlineStart: 14,
        }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
      <span style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        ...(dir === "rtl" ? { left: 12 } : { right: 12 }),
        pointerEvents: "none",
      }}>
        <Ic n="chev" s={14} c={COLORS.textLight} />
      </span>
    </div>
  );
};

// ── Textarea ─────────────────────────────────────────────────
export const Textarea = ({ value, onChange, placeholder, rows = 3, style }) => {
  const { dir } = useLang();
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "10px 14px", fontSize: 13,
        borderRadius: RADIUS.sm, border: "1.5px solid var(--ds-sand)",
        background: "var(--ds-card-bg)", color: "var(--ds-text)",
        fontFamily: "inherit", resize: "vertical",
        direction: dir, ...style,
      }}
    />
  );
};

// ── AvatarUpload ─────────────────────────────────────────────
// Clickable avatar with camera overlay + hidden file input
export const AvatarUpload = ({ src, onFileSelect, size = 96, style }) => {
  const ref = useRef(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      style={{
        position: "relative", width: size, height: size, borderRadius: "50%",
        cursor: "pointer", overflow: "hidden",
        background: src ? "transparent" : `linear-gradient(135deg, ${COLORS.primaryGhost}, ${COLORS.accentGhost})`,
        border: `2.5px solid ${COLORS.cream}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Ic n="user" s={Math.round(size * 0.4)} c={COLORS.textLight} />
      )}
      {/* Camera overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.25)", display: "flex",
        alignItems: "center", justifyContent: "center",
        opacity: 0, transition: "opacity 0.18s",
      }} onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
         onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}>
        <Ic n="camera" s={Math.round(size * 0.26)} c="white" />
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            onFileSelect?.(url, file);
          }
        }}
      />
    </div>
  );
};

// ── StepIndicator ────────────────────────────────────────────
// Numbered circles connected by lines, with optional labels
export const StepIndicator = ({ steps = 4, current = 0, labels = [], style }) => {
  const { dir } = useLang();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      direction: dir, ...style,
    }}>
      {Array.from({ length: steps }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {/* Connector line (before circle, skip first) */}
            {i > 0 && (
              <div style={{
                width: 32, height: 2,
                background: done ? COLORS.primary : COLORS.sand,
                transition: "background 0.2s",
              }} />
            )}
            {/* Circle + label */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? COLORS.primary : "var(--ds-card-bg)",
                border: `2px solid ${done || active ? COLORS.primary : "var(--ds-sand)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: done ? "white" : active ? COLORS.primary : COLORS.textLight,
                transition: "all 0.2s",
              }}>
                {done ? <Ic n="check" s={14} c="white" /> : i + 1}
              </div>
              {labels[i] && (
                <span style={{
                  fontSize: 10, fontWeight: 600, whiteSpace: "nowrap",
                  color: done || active ? COLORS.primary : COLORS.textLight,
                }}>
                  {labels[i]}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
