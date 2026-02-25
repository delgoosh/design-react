# Shared Components

Components used by **both** the patient app and the therapist panel.
Each component accepts a `mode` or variant prop to switch between contexts.

## Planned components

| File | Used in | Description |
|---|---|---|
| `SessionCard.jsx` | patient + therapist | Gradient session card — patient sees join/cancel, therapist sees join/cancel(penalty)/notes |
| `ProfileCard.jsx` | patient (read) + therapist (edit) | Therapist profile display — read-only for patients, editable for therapist |
| `ResourceCard.jsx` | patient (receive) + therapist (create/share) | Book, film, questionnaire, or exercise card |
| `CancelSessionModal.jsx` | patient + therapist | Shared cancellation flow with penalty logic |
| `SupportTicketModal.jsx` | patient + therapist | New support ticket form |

## Convention

```jsx
// mode prop controls which actions are available
<ProfileCard mode="view"  therapist={t} />   // patient sees this
<ProfileCard mode="edit"  therapist={t} />   // therapist sees this
```
