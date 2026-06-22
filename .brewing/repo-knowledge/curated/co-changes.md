# File co-change map (mined from git history)

Pairs of files that historically change together. When a spec / PR touches one, also consider the other — co-change ≥3 usually signals coupling the type system can't see.

| File A | File B | Co-changes |
|---|---|---|
| `src/design-system/i18n/en.js` | `src/design-system/i18n/fa.js` | 21 |
| `src/apps/patient/App.jsx` | `src/design-system/i18n/en.js` | 9 |
| `src/apps/patient/App.jsx` | `src/design-system/i18n/fa.js` | 9 |
| `src/apps/patient/App.jsx` | `src/apps/therapist/App.jsx` | 6 |
| `src/design-system/i18n/en.js` | `src/design-system/primitives.jsx` | 6 |
| `src/design-system/i18n/fa.js` | `src/design-system/primitives.jsx` | 6 |
| `src/design-system/i18n/en.js` | `src/shared/components/onboarding/mockData.js` | 6 |
| `src/design-system/i18n/fa.js` | `src/shared/components/onboarding/mockData.js` | 6 |
| `src/apps/patient/screens/Therapists.jsx` | `src/design-system/i18n/fa.js` | 5 |
| `src/design-system/i18n/en.js` | `src/shared/components/onboarding/StepPatientMatch.jsx` | 4 |
| `src/design-system/i18n/fa.js` | `src/shared/components/onboarding/StepPatientMatch.jsx` | 4 |
| `src/shared/components/onboarding/StepAiChat.jsx` | `src/shared/components/onboarding/StepQuestionnaire.jsx` | 4 |
| `src/apps/patient/App.jsx` | `src/apps/patient/screens/Therapists.jsx` | 4 |
| `src/apps/patient/App.jsx` | `src/shared/components/onboarding/mockData.js` | 4 |
| `src/apps/patient/screens/Therapists.jsx` | `src/design-system/i18n/en.js` | 4 |
| `src/apps/patient/screens/Therapists.jsx` | `src/shared/components/onboarding/mockData.js` | 4 |
| `src/apps/therapist/screens/Dashboard.jsx` | `src/design-system/i18n/en.js` | 4 |
| `src/apps/therapist/screens/Dashboard.jsx` | `src/design-system/i18n/fa.js` | 4 |
| `src/apps/patient/App.jsx` | `src/shared/components/Auth.jsx` | 3 |
| `src/apps/DemoRouter.jsx` | `src/design-system/i18n/en.js` | 3 |
| `src/apps/DemoRouter.jsx` | `src/design-system/i18n/fa.js` | 3 |
| `src/apps/DemoRouter.jsx` | `src/design-system/primitives.jsx` | 3 |
| `src/apps/therapist/App.jsx` | `src/design-system/i18n/en.js` | 3 |
| `src/apps/therapist/App.jsx` | `src/design-system/i18n/fa.js` | 3 |
| `src/design-system/i18n/fa.js` | `src/shared/components/Auth.jsx` | 3 |
| `src/design-system/i18n/en.js` | `src/design-system/icons.jsx` | 3 |
| `src/design-system/i18n/en.js` | `src/shared/components/onboarding/OnboardingShell.jsx` | 3 |
| `src/design-system/i18n/en.js` | `src/shared/components/onboarding/StepQuestionnaire.jsx` | 3 |
| `src/design-system/i18n/en.js` | `src/shared/components/onboarding/StepTherapistSchedule.jsx` | 3 |
| `src/design-system/i18n/fa.js` | `src/design-system/icons.jsx` | 3 |
| `src/design-system/i18n/fa.js` | `src/shared/components/onboarding/OnboardingShell.jsx` | 3 |
| `src/design-system/i18n/fa.js` | `src/shared/components/onboarding/StepQuestionnaire.jsx` | 3 |
| `src/design-system/i18n/fa.js` | `src/shared/components/onboarding/StepTherapistSchedule.jsx` | 3 |
| `src/design-system/primitives.jsx` | `src/shared/components/onboarding/OnboardingShell.jsx` | 3 |
| `src/design-system/primitives.jsx` | `src/shared/components/onboarding/StepPatientMatch.jsx` | 3 |
| `src/design-system/primitives.jsx` | `src/shared/components/onboarding/StepProfile.jsx` | 3 |
| `src/shared/components/onboarding/OnboardingShell.jsx` | `src/shared/components/onboarding/StepPatientMatch.jsx` | 3 |
| `src/shared/components/onboarding/OnboardingShell.jsx` | `src/shared/components/onboarding/StepProfile.jsx` | 3 |
| `src/shared/components/onboarding/StepPatientMatch.jsx` | `src/shared/components/onboarding/StepQuestionnaire.jsx` | 3 |
| `src/shared/components/onboarding/StepPatientMatch.jsx` | `src/shared/components/onboarding/StepTherapistSchedule.jsx` | 3 |
| `src/apps/patient/App.jsx` | `src/apps/patient/screens/Credits.jsx` | 3 |
| `src/apps/patient/screens/Credits.jsx` | `src/design-system/i18n/en.js` | 3 |
| `src/apps/patient/screens/Credits.jsx` | `src/design-system/i18n/fa.js` | 3 |
| `src/apps/patient/screens/Dashboard.jsx` | `src/design-system/i18n/en.js` | 3 |
| `src/apps/patient/screens/Dashboard.jsx` | `src/design-system/i18n/fa.js` | 3 |
| `src/design-system/css.js` | `src/design-system/i18n/en.js` | 3 |
| `src/design-system/css.js` | `src/design-system/i18n/fa.js` | 3 |
| `src/design-system/i18n/fa.js` | `vite.config.js` | 3 |
| `src/apps/patient/screens/Profile.jsx` | `src/design-system/i18n/en.js` | 3 |
| `src/apps/patient/screens/Profile.jsx` | `src/design-system/i18n/fa.js` | 3 |
| `src/apps/therapist/screens/Dashboard.jsx` | `src/apps/therapist/screens/Patients.jsx` | 3 |
| `src/apps/therapist/screens/Calendar.jsx` | `src/design-system/i18n/fa.js` | 3 |