# Havana Rumba

## Project Structure

- `www/` — Nuxt 4 marketing website
- `firebase/` — Firebase Hosting config + Cloud Functions
- `docs/` — Internal documentation (`architecture.md`, `seo-migration.md`, `content-inventory.md`; read `code-review.md` before reviewing any diff)
- `scripts/deploy.mjs` — the only deploy path (`npm run deploy`): guard → compile functions → generate → stage into `firebase/www/` → deploy → `deploys/LEDGER.md`. Flags: `--only-hosting`, `--only-functions`, `--dry-run`.
- `legacy_urls.md` — old WordPress URL → new URL map; real 301s live in `firebase/firebase.json`
- `ports.json` — the only source of dev ports

## Email

This is a client project, so form email goes out through **the client's own
Gmail** (nodemailer + app password, secrets `GMAIL_USER` / `GMAIL_APP_PASSWORD`
/ `GMAIL_SENDER`) — **not** MTM's shared mtmcya-mailer. Notifications go to the
hardcoded `notifyEmail` in `models.ts` with the visitor in `replyTo`; no
personal data in logs.

## Development

- Never hardcode a port; every port comes from `ports.json` (repo root); browser code never imports it. One tolerated exception: `.claude/launch.json` (Claude's preview tool needs a literal `port`) — keep it equal to `app.vite` in `ports.json`.

- **Do not** run `nuxi build`, `npm run build`, or any build commands unless explicitly asked.
- **Do not** prompt the user asking if they would like to run a build.
- The dev server (`npm run dev`) is managed by the user separately.
- Use `npm` as the package manager (not yarn or pnpm).

## Nuxt & i18n Guardrails
- **Internationalized Routing:** NEVER hardcode standard links (e.g., `<NuxtLink to="/about">`). You must ALWAYS use `localePath()` for internal navigation (e.g., `<NuxtLink :to="localePath('about')">`) so the i18n module can correctly route users based on their active language.

- **URL continuity (SEO):** Existing public routes (`/about/`, `/gallery/`, `/catering/`, `/gift-cards/`, `/careers/`, `/contact-us/`, `/highlands/`, `/st-matthews/`, `/lyndon/`, `/middletown/`) must keep their exact paths, including the trailing slash. Never rename a page file without adding a 301 in `firebase/firebase.json` and a row in `legacy_urls.md`. See `docs/seo-migration.md`.

## Where things live (single sources of truth)
- **Restaurant facts** (brand, address, phone, hours, ordering/gift-card links, logo, photo, weekly specials) — `www/app/utils/locations.ts`. Never type them into templates or locale files.
- **Menus** — `www/content/menus/<slug>.json` (`menus` collection in `content.config.ts`).
- **Photos** — `www/app/utils/images.ts` (`IMAGES` registry); alt text and captions in i18n `Images.<id>`. No literal `alt="…"` text in templates.
- **Forms** — every form uses `useFormSubmission` → `useSubmitForm` (adds the reCAPTCHA v3 token automatically).
- **Pages with a dark `PageHero`** declare `definePageMeta({ heroOverlay: true })`; the header is solid otherwise.

## Agent Guidance (Modern Web Standards)
- **Zero Legacy Bloat:** You must prioritize modern, native browser APIs over legacy libraries or polyfills. 
- **WebMCP:** When building forms or interactive components, utilize WebMCP annotations (Declarative API) so the site's features are exposed as structured tools for browser-based AI agents.
