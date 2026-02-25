// ─────────────────────────────────────────────────────────────
// STORYBOOK — live showcase of every token and primitive.
// Run: VITE_APP_MODE=storybook npm run dev
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  COLORS, FONTS, SHADOW, RADIUS,
  makeGlobalCSS,
  Ic,
  useIsDesktop, layoutFor,
  useLang,
  Logo, Button, Card, Tag, Avatar, StarRating, ProgressBar,
  Modal, BottomSheet, LanguageToggle,
  SidebarNavItem, BottomNavItem,
  StatCard, SessionCard,
} from "@ds";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      color: COLORS.textLight, marginBottom: 12, paddingBottom: 8,
      borderBottom: `1px solid ${COLORS.cream}`,
    }}>
      {title}
    </div>
    {children}
  </div>
);

const Row = ({ children, gap = 10, wrap = true }) => (
  <div style={{ display: "flex", gap, flexWrap: wrap ? "wrap" : "nowrap", alignItems: "center" }}>{children}</div>
);

const Swatch = ({ color, name, textColor }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ width: 56, height: 56, background: color, borderRadius: 12, marginBottom: 5, border: `1px solid rgba(0,0,0,0.06)` }} />
    <p style={{ fontSize: 9, color: COLORS.textLight, fontFamily: "monospace" }}>{name}</p>
    <p style={{ fontSize: 9, color: COLORS.textMid, fontFamily: "monospace" }}>{color}</p>
  </div>
);

export const Storybook = () => {
  const { lang, dir, setLang, t, n, fmtDate, fmtCurrency } = useLang();
  const isD = useIsDesktop();
  const L = layoutFor(dir);

  const [showModal, setShowModal]   = useState(false);
  const [showBS, setShowBS]         = useState(false);
  const [progress, setProgress]     = useState(65);

  return (
    <>
      <style>{makeGlobalCSS(lang)}</style>
      <div style={{ minHeight: "100vh", background: COLORS.bg, direction: dir }}>

        {/* ── Fixed header ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: COLORS.bgDark, padding: "14px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          direction: dir,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={34} />
            <div>
              <p className="ds-heading" style={{ fontSize: 20, color: "white", lineHeight: 1 }}>
                {t("app.name")}
              </p>
              <p style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.06em", marginTop: 2 }}>
                DESIGN SYSTEM · {lang === "fa" ? "سیستم طراحی" : "Component Library"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {lang === "fa" ? "زبان" : "Language"}
            </span>
            <LanguageToggle />
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: isD ? "40px 40px 80px" : "24px 16px 60px" }}>

          {/* ── Live i18n proof ── */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, #1A3D38 100%)`,
            borderRadius: 20, padding: isD ? 32 : 22, marginBottom: 40, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -60, insetInlineEnd: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(59,175,160,0.1)", pointerEvents: "none" }} />
            <Tag color="primary" style={{ marginBottom: 14 }}>
              {lang === "fa" ? "۱ — اثبات زنده i18n" : "1 — Live i18n proof"}
            </Tag>
            <h2 className="ds-heading" style={{ fontSize: isD ? 36 : 26, color: "white", marginBottom: 8 }}>
              {t("app.tagline")}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
              {lang === "fa"
                ? "هر رشته، عدد، تاریخ و ارز از Context می‌آید — هرگز hardcode نیست"
                : "Every string, numeral, date, and currency comes from Context — never hardcoded"}
            </p>
            <div style={{ display: "flex", gap: isD ? 24 : 14, flexWrap: "wrap" }}>
              {[
                { label: lang === "fa" ? "عدد فارسی" : "Numeral", value: n(1403) },
                { label: lang === "fa" ? "تاریخ" : "Date", value: fmtDate(new Date("2025-02-25")) },
                { label: lang === "fa" ? "ارز" : "Currency", value: fmtCurrency(1250) },
                { label: lang === "fa" ? "جهت" : "Direction", value: dir.toUpperCase() },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontSize: 15, color: "white", fontWeight: 700, direction: "ltr", textAlign: dir === "rtl" ? "right" : "left" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── COLORS ── */}
          <Section title={lang === "fa" ? "۲ — رنگ‌ها" : "2 — Colors"}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                ["primary",      COLORS.primary],
                ["primaryLight", COLORS.primaryLight],
                ["primaryDark",  COLORS.primaryDark],
                ["accent",       COLORS.accent],
                ["accentLight",  COLORS.accentLight],
                ["success",      COLORS.success],
                ["danger",       COLORS.danger],
                ["warn",         COLORS.warn],
                ["textDark",     COLORS.textDark],
                ["textMid",      COLORS.textMid],
                ["textLight",    COLORS.textLight],
                ["bg",           COLORS.bg],
                ["bgDark",       COLORS.bgDark],
                ["sidebar",      COLORS.sidebar],
                ["cream",        COLORS.cream],
                ["sand",         COLORS.sand],
                ["white",        COLORS.white],
              ].map(([name, color]) => <Swatch key={name} color={color} name={name} />)}
            </div>
          </Section>

          {/* ── TYPOGRAPHY ── */}
          <Section title={lang === "fa" ? "۳ — تایپوگرافی" : "3 — Typography"}>
            <Card style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 10 }}>
                {lang === "fa" ? `فونت نمایشی: ${FONTS[lang].heading}` : `Display font: ${FONTS[lang].heading}`}
              </p>
              {[48, 36, 28, 22, 17].map(size => (
                <p key={size} className="ds-heading" style={{ fontSize: size, color: COLORS.textDark, lineHeight: 1.2, marginBottom: 6 }}>
                  {t("app.name")} — {size}px
                </p>
              ))}
            </Card>
            <Card>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 10 }}>
                {lang === "fa" ? `فونت متن: ${FONTS[lang].body}` : `Body font: ${FONTS[lang].body}`}
              </p>
              {[15, 13, 12, 11].map(size => (
                <p key={size} style={{ fontSize: size, color: COLORS.textDark, lineHeight: 1.8, marginBottom: 4 }}>
                  {size}px — {t("app.tagline")}
                </p>
              ))}
            </Card>
          </Section>

          {/* ── BUTTONS ── */}
          <Section title={lang === "fa" ? "۴ — دکمه‌ها" : "4 — Buttons"}>
            <Card style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 12 }}>size="md"</p>
              <Row>
                {["primary","accent","ghost","ghost2","danger","warn"].map(v => (
                  <Button key={v} variant={v}>{v}</Button>
                ))}
              </Row>
            </Card>
            <Card style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 12 }}>size="sm"</p>
              <Row>
                {["primary","accent","ghost","ghost2","danger"].map(v => (
                  <Button key={v} variant={v} size="sm">{v}</Button>
                ))}
              </Row>
            </Card>
            <Card>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 12 }}>with icons</p>
              <Row>
                <Button variant="primary"><Ic n="plus" s={14} c="white"/>{t("action.add")}</Button>
                <Button variant="ghost"><Ic n="share" s={14} c={COLORS.primary}/>{t("action.share")}</Button>
                <Button variant="ghost2" size="sm"><Ic n="pen" s={13} c={COLORS.textMid}/>{t("action.edit")}</Button>
                <Button variant="danger" size="sm"><Ic n="trash" s={13} c="white"/>{t("action.delete")}</Button>
              </Row>
            </Card>
          </Section>

          {/* ── TAGS ── */}
          <Section title={lang === "fa" ? "۵ — برچسب‌ها" : "5 — Tags"}>
            <Card>
              <Row>
                <Tag color="primary">{t("tag.active")}</Tag>
                <Tag color="success">{t("tag.done")}</Tag>
                <Tag color="warn">{t("tag.pending")}</Tag>
                <Tag color="danger">{t("tag.cancelled")}</Tag>
                <Tag color="accent">{t("tag.today")}</Tag>
                <Tag color="neutral">{t("tag.shared")}</Tag>
                <Tag color="primary">{t("tag.verified")}</Tag>
                <Tag color="neutral">{t("tag.private")}</Tag>
              </Row>
            </Card>
          </Section>

          {/* ── CARDS ── */}
          <Section title={lang === "fa" ? "۶ — کارت‌ها" : "6 — Cards"}>
            <div style={{ display: "grid", gridTemplateColumns: isD ? "repeat(3,1fr)" : "1fr", gap: 12, marginBottom: 12 }}>
              <Card><p style={{ fontSize: 13, color: COLORS.textMid }}>variant="default"</p></Card>
              <Card variant="tinted"><p style={{ fontSize: 13, color: COLORS.textMid }}>variant="tinted"</p></Card>
              <Card variant="ghost" style={{ minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Ic n="plus" s={20} c={COLORS.sand} />
              </Card>
            </div>
          </Section>

          {/* ── ICONS ── */}
          <Section title={lang === "fa" ? "۷ — آیکون‌ها" : "7 — Icons"}>
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {[
                  "home","users","user","cal","clock","video","book","ticket","money",
                  "support","check","x","plus","minus","pen","trash","share","star","starEmpty",
                  "download","upload","bell","mail","chev","heart","wind","activity",
                  "camera","film","link","shield","wallet","alert","info","external",
                  "history","search","settings","globe","logout",
                ].map(name => (
                  <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 36, height: 36, background: COLORS.cream, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ic n={name} s={18} c={COLORS.primary} />
                    </div>
                    <p style={{ fontSize: 9, color: COLORS.textLight, textAlign: "center", maxWidth: 48 }}>{name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* ── AVATAR & STAR RATING ── */}
          <Section title={lang === "fa" ? "۸ — آواتار و رتبه‌بندی" : "8 — Avatar & Star rating"}>
            <Row>
              {[32, 44, 56, 72].map(size => (
                <Avatar key={size} initials="ب.ن" size={size} />
              ))}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, ...L.marginStart(12) }}>
                <StarRating value={5} />
                <StarRating value={3.5} />
                <StarRating value={1} />
              </div>
            </Row>
          </Section>

          {/* ── PROGRESS BAR ── */}
          <Section title={lang === "fa" ? "۹ — نوار پیشرفت" : "9 — Progress bar"}>
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[25, 50, 75, 100].map(v => (
                <div key={v}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMid }}>{lang === "fa" ? "پیشرفت" : "Progress"}</span>
                    <span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 700 }}>{n(v)}%</span>
                  </div>
                  <ProgressBar value={v} height={6} />
                </div>
              ))}
            </Card>
          </Section>

          {/* ── STAT CARDS ── */}
          <Section title={lang === "fa" ? "۱۰ — کارت‌های آماری" : "10 — Stat cards"}>
            <div style={{ display: "grid", gridTemplateColumns: isD ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12 }}>
              <StatCard icon="cal"   label={t("dashboard.sessionsDone")}   value={n(12)}    sub={`${n(2)} ${lang === "fa" ? "این هفته" : "this week"}`}  accentColor={COLORS.primary} />
              <StatCard icon="users" label={t("dashboard.activePatients")} value={n(8)}     sub={`${n(3)} ${lang === "fa" ? "جلسه این ماه" : "sessions this month"}`} accentColor={COLORS.accent}  />
              <StatCard icon="pen"   label={t("dashboard.tasks")}          value={n(2)}     badge={<Tag color="warn">{lang === "fa" ? "فوری" : "Urgent"}</Tag>}  accentColor={COLORS.warn}    />
              <StatCard icon="money" label={t("dashboard.monthEarnings")}  value={fmtCurrency(600)}  sub={`${n(6)} ${lang === "fa" ? "جلسه" : "sessions"}`}         accentColor={COLORS.success} />
            </div>
          </Section>

          {/* ── SESSION CARD ── */}
          <Section title={lang === "fa" ? "۱۱ — کارت جلسه" : "11 — Session card"}>
            <SessionCard
              patientName={lang === "fa" ? "سارا احمدی" : "Sara Ahmadi"}
              initials="S.A"
              topic={lang === "fa" ? "اضطراب و درمان شناختی‌رفتاری" : "Anxiety & CBT"}
              time={lang === "fa" ? "۳:۰۰ بعد از ظهر" : "3:00 PM"}
              date={lang === "fa" ? "شنبه ۳ اسفند" : "Sat, Feb 22"}
              hoursUntil={2}
              onJoin={() => {}}
              onCancel={() => {}}
            />
          </Section>

          {/* ── NAVIGATION ── */}
          <Section title={lang === "fa" ? "۱۲ — ناوبری" : "12 — Navigation"}>
            <Card style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
              <div style={{ background: COLORS.sidebar, padding: "16px 0", borderRadius: 17 }}>
                <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${COLORS.sidebarBorder}`, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Logo size={32} />
                    <div>
                      <p className="ds-heading" style={{ fontSize: 18, color: COLORS.primary, lineHeight: 1 }}>{t("app.name")}</p>
                      <p style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.04em" }}>THERAPIST</p>
                    </div>
                  </div>
                </div>
                {[
                  { id:"home",    icon:"home",    label:t("nav.home")     },
                  { id:"patients",icon:"users",   label:t("nav.patients") },
                  { id:"cal",     icon:"cal",     label:t("nav.calendar") },
                  { id:"earn",    icon:"money",   label:t("nav.earnings") },
                  { id:"support", icon:"support", label:t("nav.support"), badge:"1" },
                ].map((item, i) => (
                  <SidebarNavItem key={item.id} icon={item.icon} label={item.label} active={i === 0} badge={item.badge} onClick={() => {}} />
                ))}
              </div>
            </Card>

            {/* Bottom nav preview */}
            <Card>
              <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 12 }}>
                {lang === "fa" ? "ناوبری پایین (موبایل)" : "Bottom nav (mobile)"}
              </p>
              <div style={{ background: "white", borderTop: `1px solid ${COLORS.cream}`, display: "flex", flexDirection: dir === "rtl" ? "row" : "row-reverse", padding: "8px 0", borderRadius: 12, boxShadow: SHADOW.nav }}>
                {[
                  { id:"home",    icon:"home",    label:t("nav.home"),     active:true  },
                  { id:"patients",icon:"users",   label:t("nav.patients"), active:false },
                  { id:"cal",     icon:"cal",     label:t("nav.calendar"), active:false },
                  { id:"earn",    icon:"money",   label:t("nav.earnings"), active:false },
                  { id:"support", icon:"support", label:t("nav.support"),  active:false, badge:true },
                ].map(item => (
                  <BottomNavItem key={item.id} icon={item.icon} label={item.label} active={item.active} badge={item.badge} onClick={() => {}} />
                ))}
              </div>
            </Card>
          </Section>

          {/* ── TAB BAR ── */}
          <Section title={lang === "fa" ? "۱۳ — نوار تب" : "13 — Tab bar"}>
            <Card>
              <div className="ds-tab-bar" style={{ direction: dir }}>
                {[
                  lang === "fa" ? "📋 پرسشنامه‌ها" : "📋 Questionnaires",
                  lang === "fa" ? "🎬 کتاب و فیلم" : "🎬 Books & Films",
                  lang === "fa" ? "🏃 تمرین‌ها"   : "🏃 Exercises",
                ].map((label, i) => (
                  <button key={i} className={`ds-tab-btn ${i === 0 ? "active" : ""}`}>{label}</button>
                ))}
              </div>
            </Card>
          </Section>

          {/* ── MODAL & BOTTOM SHEET ── */}
          <Section title={lang === "fa" ? "۱۴ — مدال و باتم‌شیت" : "14 — Modal & BottomSheet"}>
            <Row>
              <Button variant="ghost" onClick={() => setShowModal(true)}>
                {lang === "fa" ? "باز کردن مدال" : "Open Modal"}
              </Button>
              <Button variant="ghost2" onClick={() => setShowBS(true)}>
                {lang === "fa" ? "باز کردن باتم‌شیت" : "Open BottomSheet"}
              </Button>
            </Row>
          </Section>

          {/* ── LANGUAGE TOGGLE ── */}
          <Section title={lang === "fa" ? "۱۵ — تغییر زبان" : "15 — Language toggle"}>
            <Card>
              <p style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 16, lineHeight: 1.8 }}>
                {lang === "fa"
                  ? "این ویجت در صفحه ورود و پروفایل ظاهر می‌شود. تغییر زبان، تمام متون، جهت و فونت‌ها را به صورت آنی تغییر می‌دهد."
                  : "This widget appears on the login screen and in profile settings. Switching language instantly updates all text, direction, and fonts."}
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: COLORS.bgDark, padding: "16px 20px", borderRadius: 14 }}>
                <Ic n="globe" s={16} c="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {t("app.chooseLanguage")}
                </span>
                <LanguageToggle style={{ marginInlineStart: "auto" }} />
              </div>
            </Card>
          </Section>

          {/* ── layoutFor() helpers ── */}
          <Section title={lang === "fa" ? "۱۶ — کمک‌کننده‌های layoutFor()" : "16 — layoutFor() helpers"}>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["L.text",        L.text,        lang === "fa" ? "جهت متن" : "text-align"],
                  ["L.start",       L.start,       lang === "fa" ? "شروع" : "start edge"],
                  ["L.end",         L.end,         lang === "fa" ? "پایان" : "end edge"],
                  ["L.rowDir",      L.rowDir,      lang === "fa" ? "جهت ردیف" : "flex row direction"],
                  ["L.chevron",     L.chevron,     lang === "fa" ? "تبدیل فلش" : "chevron transform"],
                ].map(([key, value, label]) => (
                  <div key={key} style={{ display: "flex", gap: 16, alignItems: "center", padding: "8px 12px", background: COLORS.cream, borderRadius: 9 }}>
                    <code style={{ fontSize: 11, color: COLORS.primary, minWidth: 140, fontFamily: "monospace" }}>{key}</code>
                    <code style={{ fontSize: 11, color: COLORS.textDark, flex: 1, fontFamily: "monospace" }}>"{value}"</code>
                    <span style={{ fontSize: 11, color: COLORS.textLight }}>{label}</span>
                    {key === "L.chevron" && (
                      <div style={{ transform: L.chevron }}>
                        <Ic n="chev" s={16} c={COLORS.primary} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: 20, borderTop: `1px solid ${COLORS.cream}` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Logo size={24} />
              <p className="ds-heading" style={{ fontSize: 18, color: COLORS.primary }}>{t("app.name")}</p>
            </div>
            <p style={{ fontSize: 11, color: COLORS.textLight }}>{t("app.version")} · Design System</p>
          </div>

        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={lang === "fa" ? "مثال مدال" : "Modal example"}>
          <p style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.8, marginBottom: 20 }}>
            {lang === "fa"
              ? "این یک مدال نمونه است. مدال با کلیک روی پس‌زمینه یا دکمه بستن بسته می‌شود."
              : "This is a sample modal. It closes on backdrop click or the close button."}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost2" style={{ flex: 1 }} onClick={() => setShowModal(false)}>{t("action.cancel")}</Button>
            <Button variant="primary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>{t("action.confirm")}</Button>
          </div>
        </Modal>
      )}

      {showBS && (
        <BottomSheet onClose={() => setShowBS(false)}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            {lang === "fa" ? "مثال باتم‌شیت" : "BottomSheet example"}
          </h3>
          <p style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.8, marginBottom: 20 }}>
            {lang === "fa"
              ? "باتم‌شیت برای موبایل بهتر است. با کلیک روی پس‌زمینه بسته می‌شود."
              : "BottomSheet is preferred on mobile. Closes on backdrop click."}
          </p>
          <Button variant="primary" style={{ width: "100%" }} onClick={() => setShowBS(false)}>{t("action.close")}</Button>
        </BottomSheet>
      )}
    </>
  );
};

