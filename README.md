# Megaplug Dashboard ⚡️

> A command center for electric-vehicle charging networks — blending live fleet intelligence, customer care, and ops automation into a single Angular experience. 🚗🔋

![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white) ![Material](https://img.shields.io/badge/Material%20Design-2024-3DDC84?logo=material-design&logoColor=white)

## Table of contents 📚
1. [Overview](#overview)
2. [Feature highlights](#feature-highlights)
3. [Architecture at a glance](#architecture-at-a-glance)
4. [Quick start](#quick-start)
5. [Configuration](#configuration)
6. [Scripts & developer tasks](#scripts--developer-tasks)
7. [Project layout](#project-layout)
8. [UX, theming & i18n](#ux-theming--i18n)
9. [Mock APIs & data contracts](#mock-apis--data-contracts)
10. [Testing & quality](#testing--quality)
11. [Deployment](#deployment)
12. [Troubleshooting & tips](#troubleshooting--tips)
13. [License](#license)

## Overview 🌍
Megaplug is a web portal for operators that manage EV charging stations, either as a CPO (Charge Point Operator) or as an energy/utility partner. It ships with a curated set of operational modules, role-aware navigation, and an instantly-brandable presentation layer powered by the Fuse Angular template.

The dashboard unifies:
- network health and grid-aware telemetry charts powered by ApexCharts and RxJS streams;
- charging hardware inventory (connector types, charger bays, firmware batches);
- customer & driver care workflows, including account eligibility and loyalty details;
- teams & access governance, including fine-grained role templates; and
- service desks for unassigned charging points and treatment categories to route field crews.

## Feature highlights ✨
- **Mission control dashboards** — High-level KPIs, charging sessions, and revenue insights surfaced through the Fuse dashboard widgets (`src/app/mock-api/dashboards`).
- **Charging asset library** — Manage connector definitions, firmware compatibility, and availability via `src/app/modules/connector-types`.
- **Customer success cockpit** — Onboard fleets, review contracts, and trigger rewards inside `src/app/modules/customers`.
- **Driver & staff directory** — Dedicated user management module (`src/app/modules/users`) with search, filtering, and role assignment.
- **Roles & permissions** — Policy-driven access stored under `src/app/modules/roles-and-permissions`, ensuring NERC/FERC-friendly segregation of duties.
- **Operations inbox** — Resolve orphaned plugs and maintenance tickets through `src/app/modules/unassigned-charging-points`.
- **Configurable settings** — White-label assets, partner toggles, and environment-specific rules inside `src/app/modules/settings`.
- **Public landing site** — `src/app/modules/landing` doubles as a marketing funnel, letting you pitch new chargers before login.

## Architecture at a glance 🧠
| Layer | Description |
| --- | --- |
| **Framework** | Angular 18 with standalone APIs, lazy-loaded feature modules, and Angular Router for shell/layout orchestration. |
| **Design system** | Angular Material + Tailwind CSS (`styles.scss`, `tailwind.config.js`) + Fuse UI kit for responsive layouts. |
| **State & data** | RxJS services, mock-data providers in `src/app/mock-api`, and reusable models under `src/app/models`. |
| **Maps & geospatial** | `@angular/google-maps` for station geofencing and drop-in map cards. |
| **Charts & analytics** | ApexCharts via `ng-apexcharts` for KPIs such as utilization, occupancy, dwell time, and revenue. |
| **Notifications** | Firebase Cloud Messaging service worker (`src/firebase-messaging-sw.js`) + optional Angular Service Worker integration. |
| **Localization** | Transloco (`transloco.config.js`) enabling multi-lingual rollouts. |

```
┌────────────┐      ┌─────────────┐      ┌─────────────────────────────┐
│ UI Shell   │─────▶│ Feature Mod │─────▶│ Domain services & adapters  │
│ (Fuse)     │      │ (EV ops)    │      │ (REST, Firebase, mock APIs) │
└────────────┘      └─────────────┘      └─────────────────────────────┘
        ▲                    │                        │
        │                    ▼                        ▼
        │              Mock API layer          External EV ecosystem
        │              (demo/dev mode)         (CPO backends, billing)
```

## Quick start 🛠️
Prerequisites:
- Node.js 18+ (Docker image uses 20.18.x)
- npm 10+

### 1. Install dependencies
```bash
npm install
```

### 2. Launch the dev server
```bash
npm start            # default configuration
# or npm run start:dev | start:staging | start:prod
```
Visit `http://localhost:4200/`. Hot reload keeps components and styles in sync.

### 3. Build for production
```bash
npm run build:prod
# output: dist/fuse/browser
```

## Configuration 🧩
- **Environment files** live in `src/environments/` (`environment.ts`, `.staging.ts`, `.prod.ts`). Configure API hosts, feature flags, Firebase tokens, and TransLoco language defaults there.
- **Service Worker & push**: update `firebase-messaging-sw.js` and enable Angular Service Worker modules when you need offline caching.
- **Branding assets**: set theme colors in `tailwind.config.js` / `styles.scss` and update marketing copy under `src/app/modules/landing`.
- **Nginx overrides**: tweak SPA caching and routing behavior in `nginx.conf` when deploying with the provided Dockerfile.

## Scripts & developer tasks 📟
| Command | Purpose |
| --- | --- |
| `npm start` | Serve the dashboard locally with the default environment. |
| `npm run start:dev` | Dev-flavored config (wider logging, stubbed auth). |
| `npm run start:staging` | Stage your release against staging APIs. |
| `npm run start:prod` | Preview production toggles locally. |
| `npm run build` | Standard Angular build (respects `configuration=production`). |
| `npm run build:dev` / `build:staging` / `build:prod` | Tier-specific builds, embedding the matching environment file. |
| `npm run watch` | Continuous build watching file changes. |
| `npm run test` | Execute Karma + Jasmine unit specs. |
| `npm run deploy:staging` | Copy `dist/fuse/browser` to the referenced remote host (scp). Update the host/IP before using in production. |

## Project layout 🗂️
```
mp-dashboard/
├─ src/
│  ├─ app/
│  │  ├─ core/                  # auth guards, interceptors, config providers
│  │  ├─ layout/                # Fuse layouts, navigation, and UI shell
│  │  ├─ mock-api/              # demo data sources + fixtures
│  │  └─ modules/               # feature slices (auth, customers, connectors…)
│  ├─ configs/                  # Fuse-specific runtime configuration
│  ├─ styles/ & styles.scss     # Tailwind + Material theming
│  └─ main.ts                   # Angular bootstrap entry
├─ public/                      # static assets surfaced via /public
├─ tailwind.config.js           # design tokens and utilities
├─ transloco.config.js          # i18n scopes
├─ Dockerfile                   # multi-stage build → nginx
└─ nginx.conf                   # SPA-friendly nginx defaults
```

## UX, theming & i18n 🎨
- **Fuse UI kit** brings responsive page templates, navigation, and micro-interaction primitives.
- **Angular Material tokens** live side-by-side with Tailwind utility classes; this lets you mix component-driven and utility-driven styling.
- **Transloco** organizes copy by feature scope; drop new translations in `src/assets/i18n` (or your configured path) and register them in `transloco.config.js`.
- **Dark mode / density** toggles are already wired through Fuse layout services — expose them inside Settings to let operators adjust ergonomics for control rooms.

## Mock APIs & data contracts 🧪
During development, `src/app/mock-api/**` intercepts requests and serves deterministic data sets (apps, dashboards, pages, ui). This enables full UI exploration before wiring live OCCP/OCPI backends. Replace mock handlers gradually by:
1. Creating an Angular service in the relevant module (e.g., `src/app/modules/customers/Services`).
2. Swapping the mock provider with a real HTTP client / Firebase call.
3. Guarding features behind environment flags to keep demo data available for storybook-style reviews.

## Testing & quality ✅
- Run `npm test` to execute unit specs with Karma + Jasmine.
- Keep linting and formatting aligned with the provided Prettier configuration (`prettier` + Tailwind & organize-imports plugins). Many editors pick this up automatically.
- Complex UX (drag-and-drop schedules, bulk edits) benefit from Cypress/Playwright. Add those under `e2e/` when you need smoke tests for releases.
- For localization regressions, run Transloco extraction to ensure all keys are translated.

## Deployment 🚀
### Static hosting / CDN
1. `npm run build:prod`
2. Serve `dist/fuse/browser` through your CDN (S3 + CloudFront, Firebase Hosting, Azure Static Web Apps, …).

### Docker + Nginx
Use the provided multi-stage Dockerfile:
```bash
docker build -t megaplug-dashboard .
docker run -p 8080:80 megaplug-dashboard
```
The container builds the Angular app with Node 20, copies the assets into an `nginx:alpine` image, and ships the SPA with caching headers from `nginx.conf`.

### Service worker & PWA
- Register Angular Service Worker and configure the manifest (`src/manifest.json`) to enable offline caching, background sync, and installable experiences for field tablets.

## Troubleshooting & tips 🧰
- **White screen?** Ensure the correct environment export is referenced in `main.ts` and check the browser console for CSP or i18n loading issues.
- **Google Maps blank?** Provide a Maps API key via the environment config and whitelist your domains in Google Cloud Console.
- **Push fails locally?** Firebase messaging requires HTTPS (or `localhost`). Use `npm run start:prod` plus `ng serve --ssl` for local push notifications.
- **Large builds?** Enable Angular's built-in `ng build --configuration=production --stats-json` and analyze with `ng build --stats-json` + `npx source-map-explorer`.

## License 📄
This project inherits the Fuse Angular template licensing terms — review [`LICENSE.md`](LICENSE.md) and ensure your usage complies with the ThemeForest Standard License associated with your purchase.
