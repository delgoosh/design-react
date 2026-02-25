# دلگوش — Delgoosh

Persian-language mental health platform for Persian-speaking refugees and immigrants.

## Project structure

```
delgoosh/
├── src/
│   ├── design-system/          ← Shared design system (import via @ds)
│   │   ├── tokens.js           ← COLORS, FONTS, SPACING, RADIUS, SHADOW
│   │   ├── css.js              ← makeGlobalCSS(lang) — direction-aware CSS
│   │   ├── icons.jsx           ← <Ic n="home" s={20} c="#3BAFA0" />
│   │   ├── layout.jsx          ← useIsDesktop(), layoutFor(dir)
│   │   ├── primitives.jsx      ← Button, Card, Tag, Modal, SessionCard…
│   │   ├── index.js            ← Barrel export (use this)
│   │   └── i18n/
│   │       ├── fa.js           ← Persian strings
│   │       ├── en.js           ← English strings (mirror key structure)
│   │       └── LanguageContext.jsx  ← useLang() hook
│   │
│   ├── apps/
│   │   ├── patient/            ← Patient-facing app
│   │   │   ├── App.jsx         ← Shell + nav router
│   │   │   ├── screens/        ← One file per screen
│   │   │   │   ├── Auth.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Therapists.jsx
│   │   │   │   ├── Tickets.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── components/     ← Patient-only sub-components
│   │   │
│   │   └── therapist/          ← Therapist panel
│   │       ├── App.jsx         ← Shell + nav router
│   │       ├── screens/        ← One file per screen
│   │       │   ├── Auth.jsx
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Patients.jsx
│   │       │   ├── Resources.jsx
│   │       │   ├── Calendar.jsx
│   │       │   ├── Earnings.jsx
│   │       │   ├── Profile.jsx
│   │       │   └── Support.jsx
│   │       └── components/     ← Therapist-only sub-components
│   │
│   ├── shared/
│   │   └── components/         ← Used by both apps
│   │       ├── CancelSessionModal.jsx
│   │       ├── ProfileCard.jsx     (TODO)
│   │       ├── ResourceCard.jsx    (TODO)
│   │       └── SupportTicketModal.jsx (TODO)
│   │
│   ├── storybook/
│   │   └── Storybook.jsx       ← Live design system showcase
│   │
│   └── main.jsx                ← Entry point (reads VITE_APP_MODE)
│
├── public/
├── .env.example
├── vite.config.js              ← Path aliases: @ds @patient @therapist @shared
├── package.json
└── index.html
```

## Quick start

```bash
npm install

# View design system storybook
VITE_APP_MODE=storybook npm run dev

# Run patient app
VITE_APP_MODE=patient npm run dev

# Run therapist panel
VITE_APP_MODE=therapist npm run dev
```

## Path aliases

| Alias | Resolves to |
|---|---|
| `@ds` | `src/design-system` |
| `@patient` | `src/apps/patient` |
| `@therapist` | `src/apps/therapist` |
| `@shared` | `src/shared` |

## i18n / RTL

Language state lives in `LanguageContext`. Components never branch on `lang` for text — they always call `t("key")`. Layout branching on `dir` (RTL/LTR) is expected and correct.

```jsx
const { lang, dir, t, n, fmtDate, fmtCurrency, setLang } = useLang();
```

## Build sequence

See conversation history for the planned build order. Each screen is its own Claude conversation — paste `src/design-system/index.js` + the target screen stub and say "build this screen".
