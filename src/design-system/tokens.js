// ─────────────────────────────────────────────────────────────
// TOKENS — pure data, zero JSX, zero imports.
// Import anywhere without circular dependency risk.
// ─────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary:       "#3BAFA0",
  primaryLight:  "#4EC4B3",
  primaryDark:   "#2A8F82",
  primaryGhost:  "rgba(59,175,160,0.12)",

  accent:        "#E8A07A",
  accentLight:   "#F0B898",
  accentGhost:   "rgba(232,160,122,0.15)",

  // Semantic
  success:       "#2E9E72",
  successGhost:  "rgba(46,158,114,0.12)",
  danger:        "#C26060",
  dangerGhost:   "rgba(194,96,96,0.12)",
  warn:          "#D4900A",
  warnGhost:     "#FFF8E6",

  // Surfaces
  bg:            "#F5F9F8",
  bgDark:        "#152825",
  bgDarker:      "#0E2620",
  white:         "#FDFBFC",
  sidebar:       "#EEF8F6",

  // Borders & neutrals
  cardBorder:    "rgba(184,216,212,0.45)",
  sidebarBorder: "rgba(184,216,212,0.5)",
  sand:          "#B8D8D4",
  cream:         "#E8F5F3",

  // Text
  textDark:      "#1A3D38",
  textMid:       "#3D6B64",
  textLight:     "#7AADA7",
  textOnDark:    "rgba(255,255,255,0.85)",
  textOnDarkSub: "rgba(255,255,255,0.45)",
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  14,
  lg:  20,
  xl:  28,
  xxl: 40,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   17,
  xl:   22,
  pill: 100,
  full: "50%",
};

export const SHADOW = {
  card:      "0 2px 18px rgba(59,175,160,0.07)",
  stat:      "0 2px 12px rgba(59,175,160,0.06)",
  btn:       "0 3px 12px rgba(59,175,160,0.28)",
  btnAccent: "0 3px 12px rgba(232,160,122,0.30)",
  nav:       "0 -3px 16px rgba(59,175,160,0.10)",
};

export const FONTS = {
  fa: {
    heading: "'Lalezar', cursive",
    body:    "'Vazirmatn', sans-serif",
    import:  "https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@300;400;500;600;700&display=swap",
  },
  en: {
    heading: "'DM Serif Display', serif",
    body:    "'DM Sans', sans-serif",
    import:  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap",
  },
  note: {
    family: "'Parastoo', serif",
    import: "https://fonts.googleapis.com/css2?family=Parastoo&display=swap",
  },
};
