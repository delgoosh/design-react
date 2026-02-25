import { useState, useRef } from 'react'
import {
  useLang, makeGlobalCSS, useIsDesktop, layoutFor,
  COLORS, FONTS, RADIUS, SHADOW,
  Logo, Button, Ic, LanguageToggle,
} from '@ds'

// ─────────────────────────────────────────────────────────────────────────────
// Shared Auth — used by both patient and therapist apps.
//
// Props:
//   mode      'patient' | 'therapist'
//   onLogin   () => void   called after successful OTP verify
//
// Usage in patient/App.jsx:
//   import Auth from '@shared/components/Auth.jsx'
//   <Auth mode="patient" onLogin={() => setAuthed(true)} />
//
// Usage in therapist/App.jsx:
//   import Auth from '@shared/components/Auth.jsx'
//   <Auth mode="therapist" onLogin={() => setAuthed(true)} />
//
// Flow: language → oauth buttons → email input → OTP → onLogin()
// ─────────────────────────────────────────────────────────────────────────────

// ── OTP Input — 6 boxes with auto-advance ────────────────────────────────────
function OtpInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null))

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!value[i] && i > 0) {
        refs[i - 1].current?.focus()
        const next = value.split('')
        next[i - 1] = ''
        onChange(next.join(''))
      } else {
        const next = value.split('')
        next[i] = ''
        onChange(next.join(''))
      }
      return
    }
    if (!/^\d$/.test(e.key)) return
    const next = value.split('')
    next[i] = e.key
    onChange(next.join(''))
    if (i < 5) refs[i + 1].current?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text.padEnd(6, '').slice(0, 6))
    refs[Math.min(text.length, 5)].current?.focus()
    e.preventDefault()
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', direction: 'ltr' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44, height: 52, textAlign: 'center',
            fontSize: 20, fontWeight: 700, borderRadius: RADIUS.md,
            border: `1.5px solid ${value[i] ? COLORS.primary : COLORS.sand}`,
            background: value[i] ? COLORS.primaryGhost : 'white',
            color: COLORS.textDark,
            boxShadow: value[i] ? `0 0 0 3px rgba(59,175,160,0.13)` : 'none',
            transition: 'all 0.15s',
            outline: 'none',
          }}
        />
      ))}
    </div>
  )
}

// ── OAuth button ──────────────────────────────────────────────────────────────
function OAuthButton({ icon, label, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '11px 20px', borderRadius: RADIUS.md,
        border: `1.5px solid ${hover ? COLORS.sand : 'rgba(184,216,212,0.5)'}`,
        background: hover ? COLORS.cream : 'white',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
        fontWeight: 600, color: COLORS.textDark, transition: 'all 0.18s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ── Google / Apple SVG logos ──────────────────────────────────────────────────
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.textDark}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

// ── Main Auth component ───────────────────────────────────────────────────────
export default function Auth({ mode = 'patient', onLogin }) {
  const { lang, dir, t, n } = useLang()
  const isD = useIsDesktop()
  const L   = layoutFor(dir)

  // step: 'email' | 'otp'
  const [step,  setStep]  = useState('email')
  const [email, setEmail] = useState('')
  const [otp,   setOtp]   = useState('')

  const isTherapist = mode === 'therapist'

  const emailPlaceholder = isTherapist ? t('auth.emailTherapist') : t('auth.emailPlaceholder')

  const handleSendCode = () => {
    if (!email.includes('@')) return
    setStep('otp')
  }

  const handleVerify = () => {
    if (otp.length < 6) return
    onLogin()
  }

  // ── Branding panel (desktop only) ──────────────────────────────────────────
  const BrandPanel = () => (
    <div style={{
      width: 420, flexShrink: 0,
      background: `linear-gradient(160deg, ${COLORS.bgDark} 0%, #1e3d38 60%, #2A5C52 100%)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '48px 44px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -80, insetInlineEnd: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(59,175,160,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, insetInlineStart: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(232,160,122,0.1)', pointerEvents: 'none' }} />

      {/* Logo + name */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <Logo size={42} />
          <div>
            <p className="ds-heading" style={{ fontSize: 26, color: 'white', lineHeight: 1 }}>
              {t('app.name')}
            </p>
            <p style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700, letterSpacing: '0.08em', marginTop: 3 }}>
              {isTherapist ? t('app.therapistPanel').toUpperCase() : t('app.patientPanel').toUpperCase()}
            </p>
          </div>
        </div>

        <h2 className="ds-heading" style={{ fontSize: 34, color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
          {t('app.tagline')}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
          {t('app.taglineShort')}
        </p>
      </div>

      {/* Feature bullets */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {(isTherapist ? [
          ['shield', lang === 'fa' ? 'پروفایل تأیید شده' : 'Verified profile'],
          ['cal',    lang === 'fa' ? 'مدیریت تقویم هوشمند' : 'Smart calendar management'],
          ['money',  lang === 'fa' ? 'درآمد شفاف بلاکچین' : 'Transparent blockchain earnings'],
        ] : [
          ['heart',  lang === 'fa' ? 'درمانگر متناسب با شما' : 'Therapist matched for you'],
          ['shield', lang === 'fa' ? 'فضای کاملاً محرمانه' : 'Fully confidential space'],
          ['video',  lang === 'fa' ? 'جلسات آنلاین ساده' : 'Simple online sessions'],
        ]).map(([icon, label], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, ...L.marginStart(0) }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(59,175,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic n={icon} s={14} c={COLORS.primaryLight} />
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Form panel ─────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: isD ? '48px 56px' : '32px 24px',
      background: isD ? 'white' : 'transparent',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Language toggle — always first */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <LanguageToggle style={{
            background: isD ? COLORS.cream : 'rgba(255,255,255,0.12)',
          }} />
        </div>

        {step === 'email' ? (
          <>
            {/* Title */}
            <h1 className="ds-heading" style={{
              fontSize: 28, color: isD ? COLORS.textDark : 'white',
              marginBottom: 6, textAlign: L.text,
            }}>
              {t('auth.welcome')}
            </h1>
            <p style={{
              fontSize: 13, color: isD ? COLORS.textLight : 'rgba(255,255,255,0.55)',
              marginBottom: 28, textAlign: L.text,
            }}>
              {t('auth.welcomeSub')}
            </p>

            {/* OAuth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <OAuthButton icon={<GoogleLogo />} label={t('auth.loginGoogle')} onClick={onLogin} />
              <OAuthButton icon={<AppleLogo />}  label={t('auth.loginApple')}  onClick={onLogin} />
            </div>

            {/* Divider */}
            <div className="ds-divider" style={{ marginBottom: 20 }}>
              {t('auth.orDivider')}
            </div>

            {/* Email input */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: isD ? COLORS.textMid : 'rgba(255,255,255,0.6)' }}>
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                style={{
                  background: isD ? 'white' : 'rgba(255,255,255,0.1)',
                  color: isD ? COLORS.textDark : 'white',
                  borderColor: isD ? COLORS.sand : 'rgba(255,255,255,0.2)',
                }}
              />
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
              onClick={handleSendCode}
            >
              {t('auth.sendCode')}
            </Button>

            {/* Therapist disclaimer */}
            {isTherapist && (
              <div style={{
                background: isD ? COLORS.warnGhost : 'rgba(212,144,10,0.15)',
                borderRadius: RADIUS.md, padding: '10px 12px',
                display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16,
              }}>
                <Ic n="alert" s={14} c={COLORS.warn} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: isD ? COLORS.warn : '#F5C842', lineHeight: 1.6 }}>
                  {t('auth.therapistDisclaimer')}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p style={{ fontSize: 11, color: isD ? COLORS.textLight : 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.7 }}>
              {t('auth.disclaimer')}
            </p>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => { setStep('email'); setOtp('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: isD ? COLORS.textMid : 'rgba(255,255,255,0.55)',
                fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                marginBottom: 24, padding: 0,
                flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
              }}
            >
              <div style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)' }}>
                <Ic n="chev" s={14} c={isD ? COLORS.textMid : 'rgba(255,255,255,0.55)'} />
              </div>
              {t('auth.back')}
            </button>

            {/* OTP heading */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: isD ? COLORS.primaryGhost : 'rgba(59,175,160,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Ic n="mail" s={22} c={COLORS.primary} />
              </div>
              <h2 className="ds-heading" style={{ fontSize: 24, color: isD ? COLORS.textDark : 'white', marginBottom: 6 }}>
                {t('auth.verifyTitle')}
              </h2>
              <p style={{ fontSize: 12, color: isD ? COLORS.textLight : 'rgba(255,255,255,0.5)' }}>
                {t('auth.verifySub')}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: isD ? COLORS.primary : COLORS.primaryLight, marginTop: 4 }}>
                {email}
              </p>
            </div>

            {/* OTP boxes */}
            <div style={{ marginBottom: 20 }}>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 14,
                opacity: otp.length < 6 ? 0.55 : 1,
              }}
              onClick={handleVerify}
            >
              <Ic n="check" s={15} c="white" />
              {t('auth.verifyAction')}
            </Button>

            <button
              onClick={() => setOtp('')}
              style={{
                width: '100%', textAlign: 'center', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                color: isD ? COLORS.textLight : 'rgba(255,255,255,0.45)',
                fontWeight: 600,
              }}
            >
              {t('auth.resendCode')}
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{makeGlobalCSS(lang)}</style>

      {isD ? (
        // Desktop: branding panel + form panel side by side
        <div style={{
          minHeight: '100vh', display: 'flex',
          flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
          direction: dir,
        }}>
          <BrandPanel />
          <FormPanel />
        </div>
      ) : (
        // Mobile: form floats over dark gradient background
        <div style={{
          minHeight: '100vh', direction: dir,
          background: `linear-gradient(160deg, ${COLORS.bgDark} 0%, #1e3d38 60%, #2A5C52 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px 48px',
        }}>
          {/* Logo on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <Logo size={38} />
            <div>
              <p className="ds-heading" style={{ fontSize: 24, color: 'white', lineHeight: 1 }}>
                {t('app.name')}
              </p>
              <p style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700, letterSpacing: '0.08em', marginTop: 2 }}>
                {isTherapist ? t('app.therapistPanel').toUpperCase() : t('app.patientPanel').toUpperCase()}
              </p>
            </div>
          </div>

          {/* Glass card */}
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            borderRadius: RADIUS.xl,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 22px',
          }}>
            <FormPanel />
          </div>
        </div>
      )}
    </>
  )
}
