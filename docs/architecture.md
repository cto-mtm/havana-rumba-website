# Architecture

One-page brief on how the pieces fit together.

```
 Browser ──▶ Firebase Hosting (static files from firebase/www/)
    │
    └── form POST (JSON) ──▶ Cloud Function `submitForm` (us-central1)
                                 ├─ CORS allow-list check
                                 ├─ reCAPTCHA v3 verify (score ≥ 0.5)
                                 ├─ zod validation (models.ts)
                                 └─ nodemailer + Gmail SMTP
                                      ├─ notification → internal inbox (has the data)
                                      └─ confirmation → submitter (generic, no data)
```

## Site (`www/`)

- **Nuxt 4** app, source in `www/app/` (pages, layouts, components, composables).
- **Static output.** `npm run generate` pre-renders the site to `www/.output/public/`.
  The deploy flow copies that output into **`firebase/www/`**, which is why
  `firebase/firebase.json` sets `"hosting.public": "www"`. `firebase/www/` is
  gitignored — it is a build artifact, never edit it by hand.
- **Content** lives in `www/content/` and is queried with `@nuxt/content` v3
  (collections in `www/content.config.ts`): `menus` (one JSON file per location,
  rendered as HTML on the location page) and `news` (placeholder, not used by
  any page yet).
- **Restaurant data** — the four locations (brand, address, phone, hours,
  ordering and gift-card links, logo, photo) and the weekly specials live in
  `www/app/utils/locations.ts`. `pages/[location].vue` serves
  `/middletown/`, `/highlands/`, `/st-matthews/` and `/lyndon/` from it,
  including the `Restaurant` JSON-LD.
- **Photos** are registered in `www/app/utils/images.ts`; their alt text and
  captions are translated in `www/i18n/locales/configs/Images.ts`.
- **Images** live in `www/public/images/`. Run `npm run optimize:images` to
  convert them to `.webp`.
- **UI** is Nuxt UI v4 (Tailwind v4). Brand colors are tokens in
  `www/app/app.config.ts`; fonts and depth/motion utilities live in
  `www/app/assets/css/main.css`.
- **Legacy redirects** are real 301s in `firebase/firebase.json`
  (`hosting.redirects`), tracked in `/legacy_urls.md`. Nuxt `routeRules`
  redirects would only become meta-refresh pages in a static build.
- **URL shape:** `https://www.havanarumbaonline.com`, trailing slash on every
  route (`/about/`), the same as the old WordPress site. See `docs/seo-migration.md`.

## Routing & i18n — read this before adding a page

The site is bilingual (`en` default, `es` under `/es/...`) via `@nuxtjs/i18n`.

**Every internal link must go through `localePath()`.** A hardcoded
`<NuxtLink to="/menu">` silently drops a Spanish visitor back into English.

```vue
<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath('menu')">…</NuxtLink>
</template>
```

When creating a new page:

1. Add `www/app/pages/<name>.vue` (route name = file name). If it opens with a
   `PageHero` photo, add `definePageMeta({ heroOverlay: true })` so the header
   sits transparent over it.
2. Add `www/i18n/locales/pages/<Name>.ts` with `en` and `es` strings.
3. Register it in `www/i18n/i18n.config.ts`.
4. Link to it only with `localePath('<name>')`; add it to the nav in
   `www/app/app.config.ts` if it belongs there.
5. Add the path to `nitro.prerender.routes` in `www/nuxt.config.ts`.

## Forms (`firebase/functions/`)

- The static site has no server. Pages build forms with `useFormSubmission`
  (validation, messages, focus, WebMCP agent bridge), which calls
  `useSubmitForm(formType, data)`. That fetches a reCAPTCHA v3 token (site key
  from `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`, script loaded on first submit) and
  POSTs to `runtimeConfig.public.submitFormUrl`.
- `submitForm` only accepts requests from origins in its **CORS allow-list**
  (`firebase/functions/src/submitForm.ts`: www + apex of havanarumbaonline.com).
  The Functions emulator ignores the list and allows any origin.
- Each form type is a `FormConfig` in `src/models.ts` (zod schema + recipient +
  subjects). Unknown types get a 400 listing valid types.
- **reCAPTCHA v3** guards every submission; it is skipped automatically in the
  Functions emulator.
- **Secrets** (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GMAIL_SENDER`,
  `RECAPTCHA_SECRET_KEY`) live in Firebase Secret Manager, never in the repo.
- The confirmation email is a generic bilingual thank-you with **no submitted
  content** (the address is unverified). It is best-effort: if it fails after
  the notification went out, the visitor still gets success. Mail errors are
  logged as code/responseCode only — never the message, which quotes addresses.
- Emails are plain inline-styled HTML (`src/templates/`). Preview them with
  `npm run preview:emails` → `firebase/functions/preview/*.html`.
