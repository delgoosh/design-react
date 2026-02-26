// ─────────────────────────────────────────────────────────────
// CSS — makeGlobalCSS(lang) returns a complete CSS string.
// Inject once at the app root via <style> tag.
// Never hardcode direction or font-family inside components.
// ─────────────────────────────────────────────────────────────
import { COLORS, FONTS, SHADOW, RADIUS } from "./tokens.js";

export const makeGlobalCSS = (lang) => {
  const f   = FONTS[lang];
  const dir = lang === "fa" ? "rtl" : "ltr";

  return `
    @import url('${f.import}');

    /* ── Theme tokens (CSS custom properties) ──── */
    :root {
      --ds-bg: ${COLORS.bg};
      --ds-card-bg: ${COLORS.white};
      --ds-card-border: ${COLORS.cardBorder};
      --ds-text: ${COLORS.textDark};
      --ds-text-mid: ${COLORS.textMid};
      --ds-text-light: ${COLORS.textLight};
      --ds-cream: ${COLORS.cream};
      --ds-sand: ${COLORS.sand};
      --ds-sidebar-bg: ${COLORS.sidebar};
      --ds-sidebar-border: ${COLORS.sidebarBorder};
      --ds-shadow-card: ${SHADOW.card};
      --ds-shadow-stat: ${SHADOW.stat};
      --ds-shadow-nav: ${SHADOW.nav};
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --ds-bg: ${COLORS.bgDark};
        --ds-card-bg: ${COLORS.bgDarker};
        --ds-card-border: rgba(78,196,179,0.15);
        --ds-text: ${COLORS.textOnDark};
        --ds-text-mid: rgba(255,255,255,0.6);
        --ds-text-light: ${COLORS.textOnDarkSub};
        --ds-cream: rgba(78,196,179,0.08);
        --ds-sand: rgba(78,196,179,0.2);
        --ds-sidebar-bg: ${COLORS.bgDarker};
        --ds-sidebar-border: rgba(78,196,179,0.15);
        --ds-shadow-card: 0 2px 18px rgba(0,0,0,0.3);
        --ds-shadow-stat: 0 2px 12px rgba(0,0,0,0.25);
        --ds-shadow-nav: 0 -3px 16px rgba(0,0,0,0.3);
      }
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      direction: ${dir};
      font-family: ${f.body};
      background: var(--ds-bg);
      color: var(--ds-text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .ds-heading { font-family: ${f.heading}; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--ds-cream); }
    ::-webkit-scrollbar-thumb { background: var(--ds-sand); border-radius: 3px; }

    /* ── Animations ─────────────────────────────── */
    @keyframes ds-fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ds-fadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes ds-float   { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
    @keyframes ds-pulse   { 0%,100%{opacity:1;} 50%{opacity:0.45;} }
    @keyframes ds-spin    { to { transform: rotate(360deg); } }
    @keyframes ds-credit-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(232,160,112,0.45); }
      50%      { box-shadow: 0 0 0 6px rgba(232,160,112,0); }
    }
    @keyframes ds-credit-pulse-danger {
      0%, 100% { box-shadow: 0 0 0 0 rgba(198,96,96,0.45); }
      50%      { box-shadow: 0 0 0 6px rgba(198,96,96,0); }
    }

    .ds-anim-fadeUp { animation: ds-fadeUp 0.4s ease both; }
    .ds-anim-fadeIn { animation: ds-fadeIn 0.4s ease both; }
    .ds-anim-float  { animation: ds-float  3s ease-in-out infinite; }
    .ds-anim-pulse  { animation: ds-pulse  1.6s ease infinite; }
    .ds-credit-pulse       { animation: ds-credit-pulse 2s ease infinite; }
    .ds-credit-pulse-danger { animation: ds-credit-pulse-danger 1.5s ease infinite; }

    /* Staggered children — add .ds-stagger on parent */
    .ds-stagger > *:nth-child(1) { animation-delay: 0.05s; }
    .ds-stagger > *:nth-child(2) { animation-delay: 0.10s; }
    .ds-stagger > *:nth-child(3) { animation-delay: 0.15s; }
    .ds-stagger > *:nth-child(4) { animation-delay: 0.20s; }
    .ds-stagger > *:nth-child(5) { animation-delay: 0.25s; }
    .ds-stagger > *:nth-child(6) { animation-delay: 0.30s; }

    /* ── Layout ─────────────────────────────────── */
    .ds-sidebar {
      width: 230px; flex-shrink: 0;
      background: var(--ds-sidebar-bg);
      border-${dir === "rtl" ? "left" : "right"}: 1px solid var(--ds-sidebar-border);
      display: flex; flex-direction: column;
      position: fixed; top: 0;
      ${dir === "rtl" ? "right" : "left"}: 0;
      bottom: 0; z-index: 50;
      padding: 28px 0 20px; overflow-y: auto;
    }
    .ds-main {
      flex: 1;
      margin-${dir === "rtl" ? "right" : "left"}: 230px;
      min-height: 100vh;
    }
    .ds-page-header {
      padding: 32px 36px 24px;
      border-bottom: 1px solid var(--ds-card-border);
      background: var(--ds-card-bg);
      display: flex; justify-content: space-between; align-items: center;
      position: sticky; top: 0; z-index: 40;
    }
    .ds-page-header-mobile {
      padding: 48px 16px 14px;
      background: var(--ds-card-bg);
      border-bottom: 1px solid var(--ds-cream);
      display: flex; justify-content: space-between; align-items: center;
    }
    .ds-bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--ds-card-bg); border-top: 1px solid var(--ds-cream);
      display: flex;
      flex-direction: row;
      padding: 5px 0 16px;
      box-shadow: var(--ds-shadow-nav);
      z-index: 100;
    }

    /* ── Forms ──────────────────────────────────── */
    input, textarea, select {
      font-family: ${f.body}; outline: none;
      border: 1.5px solid var(--ds-sand); border-radius: ${RADIUS.md}px;
      padding: 10px 14px; font-size: 13px; color: var(--ds-text);
      background: var(--ds-card-bg); transition: border-color 0.2s, box-shadow 0.2s;
      width: 100%; direction: ${dir};
      text-align: ${dir === "rtl" ? "right" : "left"};
    }
    input:focus, textarea:focus, select:focus {
      border-color: ${COLORS.primary};
      box-shadow: 0 0 0 3px rgba(59,175,160,0.13);
    }
    label {
      font-size: 12px; color: var(--ds-text-mid); font-weight: 600;
      display: block; margin-bottom: 5px;
    }

    /* ── Tab bar ────────────────────────────────── */
    .ds-tab-bar {
      display: flex; gap: 3px;
      background: var(--ds-cream); padding: 3px; border-radius: 11px;
    }
    .ds-tab-btn {
      flex: 1; padding: 8px 14px; border-radius: 9px; border: none;
      background: transparent; font-family: ${f.body};
      font-size: 12px; font-weight: 600; color: var(--ds-text-mid);
      cursor: pointer; transition: all 0.18s;
    }
    .ds-tab-btn.active {
      background: var(--ds-card-bg); color: ${COLORS.primary};
      box-shadow: 0 1px 6px rgba(59,175,160,0.15);
    }

    /* ── Divider ────────────────────────────────── */
    .ds-divider {
      display: flex; align-items: center; gap: 10px;
      color: var(--ds-text-light); font-size: 11px;
    }
    .ds-divider::before, .ds-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--ds-sand);
    }

    /* ── Session gradient card ──────────────────── */
    .ds-session-card {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, #4EC4B3 100%);
      border-radius: 20px; padding: 22px; color: white;
      position: relative; overflow: hidden;
    }
    .ds-session-card::before {
      content: ''; position: absolute; top: -40px;
      ${dir === "rtl" ? "left" : "right"}: -40px;
      width: 160px; height: 160px; border-radius: 50%;
      background: rgba(255,255,255,0.06); pointer-events: none;
    }
    .ds-session-card::after {
      content: ''; position: absolute; bottom: -20px;
      ${dir === "rtl" ? "right" : "left"}: 16px;
      width: 90px; height: 90px; border-radius: 50%;
      background: rgba(232,160,122,0.2); pointer-events: none;
    }

    /* ── Progress bar ───────────────────────────── */
    .ds-progress-bar  { background: var(--ds-cream); border-radius: 100px; overflow: hidden; }
    .ds-progress-fill {
      height: 100%;
      background: linear-gradient(${dir === "rtl" ? "270deg" : "90deg"}, ${COLORS.primary}, ${COLORS.primaryLight});
      border-radius: 100px; transition: width 0.4s ease;
    }

    /* ── Star row ───────────────────────────────── */
    .ds-star-row {
      display: flex;
      flex-direction: ${dir === "rtl" ? "row-reverse" : "row"};
      gap: 2px; align-items: center;
    }
  `;
};
