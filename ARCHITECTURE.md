# Cardogen — Website Architecture

## Overview
Cardogen is a Vue 3 SPA for creating, sharing, and managing digital wedding invitations with RSVP tracking. Positioned as free-forever, WhatsApp-first sharing.

## Tech Stack
- **Frontend**: Vue 3 (Composition API) + Vite 8
- **Routing**: vue-router 4 (HTML5 history, lazy-loaded routes)
- **State**: Pinia (auth, invitations, rsvp, templates)
- **Backend**: Firebase — Auth (Google), Firestore, Storage, Realtime DB
- **UI/UX**: lucide-vue-next, GSAP, vue-toastification
- **Utils**: nanoid (shortCode generation)

## Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  Views (pages) — route-level components         │
│  ├─ public/     Home, Login, WeddingCard, 404   │
│  ├─ user/       Dashboard, MyInvitations,       │
│  │              InvitationDetails, CreateWizard │
│  └─ admin/      Dashboard, Templates, Users,    │
│                 RSVPs, Invitations              │
├─────────────────────────────────────────────────┤
│  Layouts        Default / Admin / Blank         │
├─────────────────────────────────────────────────┤
│  Components                                     │
│  ├─ card/       CountdownTimer, RsvpForm,       │
│  │              ShareButtons                    │
│  ├─ templates/  FloralDream, MinimalWhite,      │
│  │              ModernLove, RoyalGold,          │
│  │              TraditionalClassic,             │
│  │              TemplateRenderer                │
│  └─ common/     StepIndicator, Icon             │
├─────────────────────────────────────────────────┤
│  Stores (Pinia)  auth · invitation · rsvp ·     │
│                  template                       │
├─────────────────────────────────────────────────┤
│  Composables    useCountdown                    │
├─────────────────────────────────────────────────┤
│  Config         firebase.js (auth/db/storage)   │
└─────────────────────────────────────────────────┘
```

## Route Map & Access Control

| Path | Layout | Guard | Purpose |
|---|---|---|---|
| `/` | default | public | Marketing home |
| `/login` | blank | guestOnly | Google sign-in |
| `/w/:shortCode` | blank | public | Public invite + RSVP |
| `/dashboard` | default | auth | User home |
| `/my-invitations` | default | auth | List user's cards |
| `/invitation/:id` | default | auth | Detail + RSVP analytics |
| `/create` | default | auth | 6-step wizard |
| `/admin` | admin | auth+admin | Admin dashboard |
| `/admin/templates` | admin | auth+admin | Template CMS |
| `/admin/users` | admin | auth+admin | User management |
| `/admin/rsvps` | admin | auth+admin | Global RSVP view |
| `/admin/invitations` | admin | auth+admin | Global invites |
| `/:pathMatch(.*)*` | blank | public | 404 |

Guards run in `router.beforeEach` after `authStore.initAuth()` resolves. See [src/router/index.js](src/router/index.js).

## Create Wizard Flow
`StepTemplate → StepNames → StepDateTime → StepVenue → StepMessage → StepPreview`

Wizard state is held in `invitationStore` and committed to Firestore on finish; `nanoid` mints the public `shortCode`. See [src/views/user/create/](src/views/user/create/).

## Data Model (Firestore, inferred)
- `users/{uid}` — profile, `role: 'user' | 'admin'`
- `invitations/{id}` — `ownerUid`, `shortCode` (indexed), templateId, couple names, date, venue, message, createdAt
- `templates/{id}` — design metadata (admin-managed)
- `rsvps/{id}` — `invitationId`, guest name, status, guests count, timestamp

## Public Share Flow
1. User completes wizard → invitation saved, `shortCode` generated
2. [ShareButtons.vue](src/components/card/ShareButtons.vue) produces WhatsApp deep link to `/w/:shortCode`
3. Guest opens link → `WeddingCard` view (Blank layout)
4. `TemplateRenderer` dispatches to the selected template component
5. `CountdownTimer` + `RsvpForm` render; RSVP writes to `rsvps` collection

## Auth Flow
- `authStore.initAuth()` subscribes to Firebase `onAuthStateChanged`
- `loading` gate in [App.vue](src/App.vue) prevents route flashes
- `isAuthenticated` / `isAdmin` computed from user document role

## Recommended Next Additions
1. **Env config** — move Firebase keys to `.env` (`VITE_FIREBASE_*`); currently hardcoded in [src/config/firebase.js](src/config/firebase.js).
2. **Firestore security rules** — enforce `ownerUid` on invitations, public read restricted to `shortCode` lookups, admin role checks.
3. **Composables expansion** — `useInvitation`, `useShare`, `useUpload` to slim down stores.
4. **Image pipeline** — couple photos via Firebase Storage + client-side resize.
5. **SEO / OpenGraph per card** — prerender meta for `/w/:shortCode` via Cloud Function or SSR so WhatsApp previews render correctly.
6. **Tests** — Vitest for stores, Playwright for wizard + RSVP happy path.
7. **PWA** — offline shell + install prompt (manifest hinted in [index.html](index.html)).
