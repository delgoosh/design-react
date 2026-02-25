// ─────────────────────────────────────────────────────────────
// LAYOUT — responsive hook + direction-aware style helpers.
// Usage:
//   const isD = useIsDesktop();
//   const L   = layoutFor(dir);
//   <div style={{ textAlign: L.text }}>
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

export const useIsDesktop = () => {
  const [v, setV] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 900 : true
  );
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
};

/**
 * layoutFor(dir) — returns directional shorthands.
 *
 * L.text           →  "right" | "left"
 * L.start          →  "right" | "left"   (the reading-start edge)
 * L.end            →  "left"  | "right"  (the reading-end edge)
 * L.rowDir         →  "row"   | "row-reverse"
 * L.chevron        →  CSS transform for <Ic n="chev" />
 * L.marginStart(n) →  { marginRight: n } | { marginLeft: n }
 * L.marginEnd(n)   →  { marginLeft: n }  | { marginRight: n }
 * L.paddingStart(n)→  { paddingRight:n } | { paddingLeft: n }
 * L.paddingEnd(n)  →  { paddingLeft: n } | { paddingRight:n }
 * L.borderStart(…) →  { borderRight:… }  | { borderLeft:… }
 */
export const layoutFor = (dir) => ({
  text:    dir === "rtl" ? "right"       : "left",
  start:   dir === "rtl" ? "right"       : "left",
  end:     dir === "rtl" ? "left"        : "right",
  rowDir:  dir === "rtl" ? "row"         : "row-reverse",
  chevron: dir === "rtl" ? "scaleX(-1)"  : "scaleX(1)",

  marginStart:  (n) => dir === "rtl" ? { marginRight:  n } : { marginLeft:   n },
  marginEnd:    (n) => dir === "rtl" ? { marginLeft:   n } : { marginRight:  n },
  paddingStart: (n) => dir === "rtl" ? { paddingRight: n } : { paddingLeft:  n },
  paddingEnd:   (n) => dir === "rtl" ? { paddingLeft:  n } : { paddingRight: n },
  borderStart:  (w, s, c) =>
    dir === "rtl"
      ? { borderRight: `${w}px ${s} ${c}` }
      : { borderLeft:  `${w}px ${s} ${c}` },
});
