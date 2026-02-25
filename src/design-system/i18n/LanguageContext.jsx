// ─────────────────────────────────────────────────────────────
// LANGUAGE CONTEXT
// The single source of truth for lang, dir, t(), n().
//
// Wrap your entire app once:
//   <LanguageProvider><App /></LanguageProvider>
//
// Then in any component:
//   const { lang, dir, t, n, fmtDate, fmtCurrency, setLang } = useLang();
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useState } from "react";
import fa from "./fa.js";
import en from "./en.js";

const STRINGS = { fa, en };

const LanguageContext = createContext(null);

const toFarsiNumerals = (n) =>
  String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export const LanguageProvider = ({ children }) => {
  const stored =
    (typeof localStorage !== "undefined" && localStorage.getItem("delgoosh_lang")) || "fa";
  const [lang, setLangRaw] = useState(stored);

  const setLang = (l) => {
    setLangRaw(l);
    if (typeof localStorage !== "undefined") localStorage.setItem("delgoosh_lang", l);
  };

  const dir = lang === "fa" ? "rtl" : "ltr";

  /** t("auth.welcome") → translated string */
  const t = (key) => {
    const parts = key.split(".");
    let node = STRINGS[lang];
    for (const p of parts) {
      if (node == null) return key;
      node = node[p];
    }
    return typeof node === "string" ? node : key;
  };

  /** n(1403) → "۱۴۰۳" (fa) | "1403" (en) */
  const n = (num) => (lang === "fa" ? toFarsiNumerals(num) : String(num));

  /** Intl date formatter using locale */
  const fmtDate = (dateObj) =>
    new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }).format(dateObj);

  /** Intl currency formatter (always USD) */
  const fmtCurrency = (amount) =>
    new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(amount);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t, n, fmtDate, fmtCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

/** The hook every component imports — nothing else needed. */
export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang() must be used inside <LanguageProvider>");
  return ctx;
};
