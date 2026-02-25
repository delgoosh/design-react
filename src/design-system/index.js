// ─────────────────────────────────────────────────────────────
// DESIGN SYSTEM — barrel export
// Import path alias: @ds
//
// Usage in any screen file:
//   import { Button, Card, Tag, useLang } from "@ds";
//   import { COLORS, FONTS }              from "@ds/tokens.js";
//   import { makeGlobalCSS }              from "@ds/css.js";
//   import { Ic }                         from "@ds/icons.jsx";
//   import { useIsDesktop, layoutFor }    from "@ds/layout.jsx";
// ─────────────────────────────────────────────────────────────

// Tokens (pure data)
export * from "./tokens.js";

// CSS factory
export { makeGlobalCSS } from "./css.js";

// Icons
export { Ic } from "./icons.jsx";

// Layout helpers
export { useIsDesktop, layoutFor } from "./layout.jsx";

// i18n
export { LanguageProvider, useLang } from "./i18n/LanguageContext.jsx";

// UI primitives
export {
  Logo,
  Button,
  Card,
  Tag,
  Avatar,
  StarRating,
  ProgressBar,
  Modal,
  BottomSheet,
  LanguageToggle,
  SidebarNavItem,
  BottomNavItem,
  StatCard,
  SessionCard,
} from "./primitives.jsx";
