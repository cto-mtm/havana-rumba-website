# Code Review — Havana Rumba Website

How to review the pending changes. The subject is **the diff**, not the whole
site: `git diff` (unstaged) + `git diff --staged` + untracked files
(`git status --porcelain`). If the work spans commits, use
`git diff <base>...HEAD`. Start from `git diff --stat` to get the shape, then
read every changed file in full — a diff hunk without its surrounding file lies
about context.

This is a static Nuxt 4 marketing site for four Cuban restaurants in Louisville
(Middletown, Highlands, St. Matthews, Lyndon) plus one Cloud Function,
`submitForm`, behind the contact and careers forms (see
`docs/architecture.md`). It replaces a WordPress site whose URLs are indexed,
so most real defects here are **wrong restaurant facts** (hours, addresses,
phones, menu prices, ordering links), **broken URLs / missing 301s**,
**broken i18n** and **form/email mistakes** — review with that weighting.

## 1. DRY

- Does the new code duplicate something that already exists? Before accepting a
  new component, composable or CSS class, grep for a sibling: `PageHero`,
  `LocationCard`, `SiteHeader`, `SiteFooter`, `useSubmitForm`, and the
  depth/motion utilities in `main.css` (`shadow-soft` / `shadow-lift` /
  `shadow-deep`, `animate-float`, `animate-gradient`).
- Brand colours are semantic tokens in `www/app/app.config.ts` (`primary`,
  `secondary`, `accent`, …); fonts, shadows and motion live in `@theme` in
  `www/app/assets/css/main.css`. A raw palette class (`text-red-600`), a raw
  hex value or an arbitrary `shadow-[…]` in a template is a DRY violation —
  use the token.
- Restaurant facts have one home: `www/app/utils/locations.ts` (brand name,
  address, phone, hours, ordering links, logo, image) — the location pages,
  cards, footer and JSON-LD all read from it. A phone number, address or hour
  typed into a template or locale file is a finding. Menus live in
  `www/content/menus/`.
- Nav entries live in `nav` in `app.config.ts`; a link list hand-built in a
  header/footer instead is a finding.
- Every form posts through `useSubmitForm`. A second `fetch` to `submitForm`
  is a finding.
- Repeated Tailwind class strings across several pages that belong in a
  `main.css` class or a component. Two copies is a watch-list item; three is a
  finding.
- **Intentional duplication, do NOT flag:**
  - form fields in the page (`contact-us.vue`, `careers.vue`) and the zod
    schemas in `firebase/functions/src/models.ts` (browser and backend
    validate separately, on purpose),
  - the reCAPTCHA keys: the public site key in `www/nuxt.config.ts`
    (`NUXT_PUBLIC_RECAPTCHA_SITE_KEY`) and the secret used by `submitForm.ts`
    (Firebase secret `RECAPTCHA_SECRET_KEY`),
  - legacy redirects in `firebase/firebase.json` (the real 301s, the single
    source) tracked in `legacy_urls.md`. They are **not** mirrored in
    `routeRules`: several use partial-segment globs (`/menu-highlands-*`) that
    Nitro route rules can't express.

  DO flag a diff that changes **one** copy and not the others — see § 6.

## 2. Elegance / simplicity

- Is this the simplest change that solves the problem? Flag detours:
  client-side JS for something CSS already does, state that mirrors existing
  state, a composable wrapping a single `useRuntimeConfig()` read.
- Does it read like the surrounding code? Same page rhythm (`PageHero` +
  sections), same `useSeoMeta` pattern, same `{ en, es }` locale module shape,
  the same early-return style in `submitForm.ts`. A correct change in a
  foreign style is a finding.
- Prefer native elements and browser APIs: `<details>` for disclosures,
  `<input type="date">`, `<a href="tel:">` / `mailto:` for contact, a plain
  link out to the existing ordering / Heartland gift-card sites rather than
  embedding them.

## 3. Overengineering

- Abstractions need ≥2 real consumers **in this diff or already in the tree**.
  A generic section builder, props for variants nothing uses, or config for a
  page that exists once is a finding.
- The backend is one function. A database, a second function, auth, a queue,
  online ordering, a gift-card checkout or storing submissions added without an
  explicit request is a finding — ordering and gift cards stay on the client's
  existing providers.
- New dependencies need a reason the existing stack (Nuxt UI, Iconify,
  `@nuxt/content`, `@nuxt/image`, native CSS, zod) can't cover. Animation,
  carousel or lightbox libraries are almost never justified here. In
  `firebase/functions`, a second mail path next to nodemailer + the client's
  Gmail is a guardrail hit, not a judgement call (§ 6).

## 4. Dead code & stale files

Check both directions:

- **Introduced by the diff:** components never rendered, i18n keys never
  resolved, CSS classes nothing uses, public files nothing references,
  commented-out blocks, `console.log` leftovers, ownerless TODOs, leftover
  boilerplate (`REPLACE_ME`, `example.com`, the `boilerplate-*` package
  names) in code the diff touches.
- **Orphaned by the diff:** if the change replaces something, did the old
  version go? A removed page whose nav entry, locale module or redirect stays
  behind is incomplete. A removed form type whose `models.ts` entry stays
  behind is too.

Verify before flagging (grep, don't guess):

1. Pages → routes come from `www/app/pages/` filenames (`[location].vue`
   serves the four location slugs from `locations.ts`); grep the route name in
   `localePath('…')` calls and in `nav` in `app.config.ts`.
2. Components → Nuxt auto-imports by path, so grep the **tag name**
   (`<PageHero`, `<LocationCard`) as well as explicit `import` lines.
3. i18n keys → grep the key path in `www/app/`; some are read as lists with
   `tm()` / `rt()`, so check those before calling a key dead. New locale
   modules must be registered in `www/i18n/i18n.config.ts`.
4. Public assets → grep the filename under `www/app/` and `www/content/`.
   The raw WordPress export (`*.zip`) is gitignored and never deployed.
5. Docs → if the diff changes behaviour `README.md`, `CLAUDE.md`,
   `docs/architecture.md`, `docs/seo-migration.md`,
   `docs/content-inventory.md` or `legacy_urls.md` describes, they're stale.

## 5. Checks this change needs

There is no automated test suite; the deploy script's only gate is the
functions compile. The review therefore names the **manual** check each change
needs — it doesn't claim them done:

| The diff touches… | Then the review requires… |
|---|---|
| Any user-facing string | Key present in **both** `en` and `es`; `{'@'}` for `@`, no bare `\|` (vue-i18n plural separator). |
| A new page or link | Works in both locales (`/catering/` and `/es/catering/`), and switching language on it keeps you on the same page. Trailing slash present. |
| Layout or a new section | Phone width (375px) without horizontal scroll, touch targets ≥ 44px, keyboard focus visible, text contrast. |
| An animation | Only `transform` / `opacity`; disabled under `prefers-reduced-motion`; content still visible if it never fires. |
| `firebase/functions/src/**` | `npx tsc --noEmit` in `firebase/functions` passes. |
| A form field or `models.ts` | Field exists in **both** the page form and the zod schema, with the same name and required/optional status; submit each affected form once against the emulator and confirm a 200. |
| Email templates or `sendMail` calls | Notification `to` is the hardcoded `notifyEmail` with the visitor in `replyTo`; every interpolated value goes through `escapeHtml`; subject has CR/LF stripped. `npm run preview:emails` in `firebase/functions` to look at the result. |
| Restaurant facts (hours, address, phone, menu prices, ordering links) | `locations.ts`, `www/content/menus/`, the i18n copy and the `Restaurant` JSON-LD in `[location].vue` all agree, and the diff says where the fact came from. |
| A URL or slug change | 301 added in `firebase/firebase.json` (catch-alls last) and recorded in `legacy_urls.md`. |
| `nuxt.config.ts`, content, routes | `npm run generate` succeeds (prerenders both locales — a broken link or a 404 thrown during prerender fails here). |
| `scripts/deploy.mjs` | `npm run deploy:dry-run` prints the expected steps for the default run and for `--only-hosting` / `--only-functions`. |

Also check the inverse: a guard **removed or weakened** (reCAPTCHA
verification, the CORS allow-list, zod validation, the deploy
script's `REPLACE_ME` check) is a finding unless the diff says why.

## 6. Guardrails (quick pass, always)

Scan the diff for these — from `CLAUDE.md`. Any hit is automatically HIGH:

- A hardcoded user-facing string (must be an i18n key in **both** `en` and
  `es`).
- An internal link not built with `localePath()` (`to="/gallery/"`,
  `href="/contact-us/"`) — it silently drops Spanish visitors into English.
  Markdown links inside `www/content/` are the one exception.
- **A changed public URL.** `/about/`, `/gallery/`, `/catering/`,
  `/gift-cards/`, `/careers/`, `/contact-us/`, `/middletown/`, `/highlands/`,
  `/st-matthews/`, `/lyndon/` keep their exact path and trailing slash. A
  renamed page file or slug with no 301 and no `legacy_urls.md` row is a
  finding.
- A hardcoded port. Every port comes from `ports.json`; browser code and
  Cloud Functions never import it.
- **Untrusted input in an email's `to`.** Form notifications go to the
  hardcoded `notifyEmail` in `models.ts`. The only mail sent to a
  visitor-typed address is the confirmation; a new send to a typed address,
  or a confirmation that grows beyond a copy of the submission, is a finding.
- Email sent any other way than the transporter in
  `firebase/functions/src/helpers/mailer.ts` (nodemailer over the client's
  Gmail). This is a client project: wiring it into MTM's mtmcya-mailer, SES or
  any MTM-owned sender is a finding.
- Marketing, newsletter or bulk mail sent through the Gmail account — Gmail
  caps daily sends and will lock the client's mailbox.
- Personal data in logs: a name, email, phone, message or résumé detail passed
  to `logger`. Log `formType`, status, score and error codes only.
- A secret in the repo (Gmail app password, reCAPTCHA secret, any token).
  They live in Firebase secrets; `.env` / `.secret.local` are git-ignored.
- A form, or a `submitForm` branch, that skips reCAPTCHA or zod
  validation.
- A new form or interactive control without WebMCP annotations
  (`toolname` / `tooldescription` / `toolparamdescription`).
- **A claim the restaurants can't back.** Hours, menu items and prices,
  catering rules and fees, specials, live-music nights and history come from
  the client or the old site — never invented or "improved" in copy. If the
  diff changes one and doesn't say where the new fact came from, ask.
- A restaurant fact changed in one place and not the others (§ 1, § 5).
- Location branding mixed up: each location keeps its own brand name
  (Havana Rumba, Mojito in Havana, Mojitos Tapas) and logo from
  `locations.ts`.
- Off-brand styling: raw palette classes or hex values instead of the
  `app.config.ts` tokens, the display serif on long body text.
- Legacy bloat: a polyfill or library for something the platform already does.

## Output format

1. **Blocking** — guardrail hits and missing required checks. file:line + what
   to do.
2. **DRY / simplification / overengineering** — ranked HIGH/MEDIUM/LOW with the
   suggested shape of the fix.
3. **Dead code & stale files/docs** — table: path, status (dead / orphaned /
   stale doc), evidence (the grep that proved it).
4. **Checks to run** — which rows of § 5 apply, and which were actually done
   (say so plainly when they weren't).
5. **Watch list** — fine today, worth a note (e.g. a second copy of a class
   string that becomes a DRY violation on the third).

Keep it concise and actionable. Identify problems and point at the fix — the
review is not the place to redesign the site.
