# Havana Rumba — Website

## What's in the box

- **`www/`** — Nuxt 4 marketing site (Nuxt UI v4, Nuxt Content v3, i18n en/es, SEO, gtag).
- **`firebase/`** — Firebase Hosting config + a `submitForm` Cloud Function that
  validates form posts, checks reCAPTCHA v3, and emails via Gmail SMTP.
- **`docs/architecture.md`** — how the pieces fit together.

## Quick start

```bash
cd www && npm install && npm run dev          # site on the port in ports.json (8450)
```

```bash
cd firebase/functions && npm install && npm run build
```

```bash
firebase emulators:start --only functions     # run from firebase/functions
```

## Routing note

All internal navigation goes through `@nuxtjs/i18n`. Always link with
`localePath()` — e.g. `<NuxtLink :to="localePath('contact-us')">` — so the
visitor's language (`/` for English, `/es/` for Spanish) persists across pages.
Never hardcode `to="/contact"`.

## Image optimization

Drop images into `www/public/images/`, then from `www/`:

```bash
npm run optimize:images
```

Preview what would be converted without writing anything:

```bash
npm run optimize:images -- --dry-run
```

Options: `--quality=78`, `--max-width=1920`. Originals are kept; delete them
once you've checked the `.webp` output.

## Adding a new form type

1. Add an entry to `formConfigs` in `firebase/functions/src/models.ts`
   (zod schema, `notifyEmail`, subjects, field lists).
2. Redeploy functions: `cd firebase/functions && npm run deploy`.
3. Build the page form with `useFormSubmission({ formType: 'your-type', i18nNs, idPrefix, validate, payload, reset })`
   (see `contact-us.vue` / `careers.vue`). It handles validation messages, focus,
   the reCAPTCHA token and the WebMCP agent bridge. Keep the field names and
   required/optional status identical to the zod schema, and give every control a
   `toolparamdescription`.

## Adding a legacy redirect

The site is static, so real 301s are served by Firebase Hosting, not Nuxt.

1. Add an entry to `hosting.redirects` in `firebase/firebase.json`, e.g.
   `{ "source": "/old-page{,/}", "destination": "/new-page/", "type": 301 }`.
   Order matters, because the first match wins. Keep catch-alls such as `/home-legacy/**` last in their group.
2. Add a matching row to `legacy_urls.md`.

All URLs end in a trailing slash (`/about/`), matching the old WordPress
site. See `docs/seo-migration.md`.

## Secrets (set before deploying functions)

```bash
firebase functions:secrets:set GMAIL_USER
```

```bash
firebase functions:secrets:set GMAIL_APP_PASSWORD
```

```bash
firebase functions:secrets:set GMAIL_SENDER
```

```bash
firebase functions:secrets:set RECAPTCHA_SECRET_KEY
```

`GMAIL_APP_PASSWORD` is a Google App Password, not the account password.

For the emulator, put local values in `firebase/functions/.secret.local`
(gitignored), one `KEY=value` per line. reCAPTCHA is skipped in the emulator,
but the secret still needs a placeholder value.

## Deploy

`scripts/deploy.mjs` is the only deploy path. From the repo root:

```bash
npm run deploy
```

It checks that `firebase/.firebaserc` has a real project id and that
`node_modules` is installed, compiles the functions (`tsc`, the only pre-deploy
gate), runs `nuxt generate`, copies `www/.output/public` into `firebase/www/`,
deploys, and appends an entry to the gitignored `deploys/LEDGER.md`.

```bash
npm run deploy -- --only-hosting
```

```bash
npm run deploy -- --only-functions
```

```bash
npm run deploy:dry-run
```

Before the first deploy, set the `REPLACE_ME` values: Firebase project id
(`firebase/.firebaserc`), GA id and `submitFormUrl` (`www/nuxt.config.ts`), the
contact form's `notifyEmail` (`models.ts`) and the company address in
`templates/notificationEmail.ts`, plus the secrets above. Requires `firebase login`.

The reCAPTCHA v3 **site** key (public) is a build-time variable — without it,
every form submission is rejected by the function:

```bash
NUXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key npm run deploy
```

## Keeping dependencies fresh

> **Note (2026-11-14):** the originally pinned set no longer installed together
> (`@nuxtjs/seo` 3 needs unhead v2; Nuxt ≥ 4.5 ships unhead v3), so the baseline
> was moved to Nuxt 4.6, `@nuxtjs/seo` 6, `@nuxtjs/i18n` 10 and `@nuxt/fonts` 1.
> Some of these packages ask for Node ≥ 22.22.

Versions in `package.json` are pinned to the dates this boilerplate was
generated. They're intentionally NOT auto-updated on install — the goal is
that `npm install && npm run dev` always works on day one.

Recommended workflow when starting a new project from this scaffold:

1. `npm install` in both `www/` and `firebase/functions/` and confirm
   `npm run dev` boots cleanly.
2. Commit the scaffold as your baseline (`git commit -m "initial scaffold"`).
3. Run `npm outdated` in each folder to see drift, and `npm audit` for
   security issues.
4. Upgrade deliberately — one major version at a time, testing between each.
   Watch especially for breaking changes in Nuxt, Nuxt UI, Firebase
   Functions, and zod (these have all shipped breaking majors in the past).
5. After upgrading, re-run `npm run dev` and click through the key pages /
   submit the contact form before committing.

Avoid running `npm update` blindly — it will pull breaking majors without
warning and you'll lose the "clean baseline" property.
