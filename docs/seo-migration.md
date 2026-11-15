# SEO Migration — havanarumbaonline.com (WordPress → Nuxt/Firebase)

Audited 2026-11-14 from `robots.txt`, `wp-sitemap.xml`, the WordPress REST API,
and a crawl of every listed URL.

## Current site

- **Stack:** WordPress + Elementor on Apache/PHP 8.0. "Managed by PRStore and built by MTM."
- **Host:** `https://www.havanarumbaonline.com` is canonical. The apex domain and
  plain `http://` both 301 to it.
- **URL style:** a trailing slash on every page (`/about/`).
- **Sitemap:** `/wp-sitemap.xml` lists 47 pages and 1 author archive. There are no posts.

### Live pages (11). **Keep these exact paths.**

| Path | Title today | Content | New route file |
| --- | --- | --- | --- |
| `/` | Havana Rumba – Delicious Cuban Food in Louisville | Hero, 3 Google reviews, Cuban cuisine copy, favorites, short history | `pages/index.vue` |
| `/about/` | About | Owner story (Marcos Lorenzo), timeline 2004–2019, Cuban cuisine | `pages/about.vue` |
| `/gallery/` | Gallery | ~33 dish photos | `pages/gallery.vue` |
| `/catering/` | Catering | Rules, delivery fees, notice periods, catering PDF | `pages/catering.vue` |
| `/gift-cards/` | Gift Cards | 4 links to Heartland gift card shops | `pages/gift-cards.vue` |
| `/careers/` | Careers | Employment application form (Elementor + reCAPTCHA) | `pages/careers.vue` |
| `/contact-us/` | Contact Us | Contact form (Elementor + reCAPTCHA) | `pages/contact-us.vue` ✅ |
| `/middletown/` | Havana Rumba \| Middletown | Hours, address, phone, ordering links, specials, menu **as images** | location page |
| `/highlands/` | Havana Rumba \| Highlands | Same structure; menu **as images** | location page |
| `/st-matthews/` | Mojito in Havana \| St. Matthews | Same structure; menu **as images** | location page |
| `/lyndon/` | Mojitos Tapas \| Lyndon | Same structure; **full HTML menu with prices** (~1,900 words) | location page |

The header items "Locations", "Specials", "Menus" and "Order Online" are Elementor
popups, not URLs. Nothing needs redirecting for them.

### Hidden-but-indexable pages (36): `/home-legacy/**`

The 2022 rebuild moved every old page under `/home-legacy/`. They still return 200, still
self-canonicalize, and **are still listed in the sitemap**. Some carry more text
than the live site: the old dinner menus run 6,800–8,000 words of HTML. They
may still rank for dish names. All of them get a 301 (see `legacy_urls.md`).

WordPress also 301s the pre-2022 root slugs (`/our-story/`, `/menu/`,
`/specials/`, `/menu-highlands-dinner/` …) into `/home-legacy/…`. We redirect
those directly to their final destination so there are no redirect chains.

## Location data (from the live pages)

| Location | Brand | Address | Phone | Hours | Order online (ChowNow) | Heartland POS / gift card |
| --- | --- | --- | --- | --- | --- | --- |
| Middletown | Havana Rumba | 12003 Shelbyville Rd, Louisville, KY 40243 | 502-244-5375 | Mon–Thu 5–9pm · Fri 11:30am–10pm · Sat 12–10pm · Sun 12–8:30pm | `/order/42125/locations/63686` | `havanarumbamiddletown` |
| Highlands | Havana Rumba & Tapas Bar | 2210 Bardstown Rd, Louisville, KY 40205 | 502-749-4600 | Mon–Thu 5–9pm · Fri–Sat 12–10pm · Sun 12–8:30pm | `/order/42125/locations/63801` | `havanarumbaexpress` |
| St. Matthews | Mojito in Havana Restaurant & Bar | 3939 Shelbyville Rd, Louisville, KY 40207 | 502-897-1959 | Mon–Thu 5–9pm · Fri 11:30am–9:30pm · Sat 12–9:30pm · Sun 12–8:30pm | `/order/42125/locations/63687` | `mojitoinhavana` |
| Lyndon | Mojitos Tapas | 2231 Holiday Manor Center, Louisville, KY 40222 | 502-425-0949 | Mon–Thu 5–9pm · Fri–Sat 12–9:30pm · Sun 12–8:30pm | `/order/42125/locations/63802` | `mojitostapas` |

Shared across locations: specials (Mon half-price wine bottles · Tue half-price
beer · Wed half-price house mojitos/margaritas/sangria; Lyndon doesn't list them),
the catering policy, and gift cards valid at all four locations.

Other details: `jobs@havanarumbaonline.com`. The St. Matthews logo
(`HR-St-Matthews-logo.png`) is on the live server but was **not** in the zip.

## SEO gaps on the current site (easy wins)

| Gap | Today | New site |
| --- | --- | --- |
| Meta descriptions | none on any page | write per page (via `useSeoMeta`) |
| Open Graph / social images | none | `@nuxtjs/seo` OG images per page |
| Structured data | none | `Restaurant` JSON-LD per location (address, hours, phone, `hasMenu`, `servesCuisine: Cuban`) and an `Organization` on the parent |
| Menus | images for 3 of 4 locations (Google can't read them) | HTML menus for every location |
| Image alt text | empty almost everywhere | descriptive alts |
| Headings | multiple `<h1>`s per page; footer uses `<h1>` | one `<h1>` per page |
| Sitemap | includes `/home-legacy/**` and the author archive | only real pages, both locales |
| Spanish | decorative Spanish headings only | full `/es/` locale with `hreflang` |

Status 2026-11-14: all of these are implemented except OG images. `nuxt-og-image`
is installed but no renderer is enabled, so pages use their hero photo as the
`og:image`.

## What's implemented

- **301 redirects** for every legacy URL: `firebase/firebase.json` → `hosting.redirects`
  (59 rules, including catch-alls for `/home-legacy/**`, `/author/**`, `/feed/`, and
  `wp-sitemap*.xml` → `/sitemap.xml`). These are real HTTP 301s at the CDN.
  Nuxt `routeRules` redirects would only produce meta-refresh pages in a static build.
- **Trailing slashes:** Firebase `trailingSlash: true` + `cleanUrls: true`; Nuxt
  `site.trailingSlash: true`. `<NuxtLink>` appends the slash so internal links
  don't trigger a redirect hop.
- **Canonical host:** `site.url = https://www.havanarumbaonline.com`.
- `pages/contact.vue` renamed to `pages/contact-us.vue` to keep `/contact-us/`.
- **Restaurant JSON-LD** on each location page (address, hours, phone, menu link)
  and an Organization identity for the parent site. Location pages keep the old
  `<title>` shape, e.g. "Havana Rumba | Middletown".
- **Meta descriptions** on every page (en + es).
- **hreflang** alternates (`en`, `es`, `x-default`) and `og:locale` on every page
  via `useLocaleHead` in `app.vue`, normalized to the trailing-slash URLs.
- **Alt text** for every photo in both languages (`Images.*` in i18n).
- `priceRange` / `acceptsReservations` are deliberately **not** in the
  Restaurant JSON-LD until the client confirms them.
- **Careers form** now posts to the `careers` form type (emails
  jobs@havanarumbaonline.com). It no longer asks for date of birth or gender.

## Launch checklist

1. ~~Build the remaining routes.~~ Done 2026-11-14. All 11 routes exist, and the
   locations come from `app/utils/locations.ts` → `pages/[location].vue`. All four
   menus are HTML now (`content/menus/<slug>.json`). Lyndon's came from the old site;
   Middletown, Highlands and St. Matthews were taken on 2026-11-14 from each
   restaurant's Heartland online-ordering menu (the "ONLINE MENU" group, food and
   non-alcoholic drinks only, items marked out of stock left off). Many items have
   no description there, so they show name and price only — ask the client to
   fill those in. Prices change: re-check against the ordering site before launch.
2. Re-host the catering PDF (`/wp-content/uploads/2026/03/Havana-Rumba-Catering-.pdf`).
   Either keep that exact path under `www/public/` or point its redirect at the new file.
   It currently redirects to `/catering/`.
3. Before switching DNS, take a final crawl and export of the top pages from Google Search
   Console (Performance → Pages) to catch URLs this audit missed, especially
   anything under `/wp-content/uploads/` that gets image-search traffic.
4. In Firebase Hosting, add both `www.havanarumbaonline.com` and the apex domain,
   and set the apex to redirect to www.
5. After DNS cutover, spot-check redirects (one command):
   ```bash
   curl -sI https://www.havanarumbaonline.com/home-legacy/menu-highlands-dinner/ | grep -i location
   ```
6. In Search Console, submit `/sitemap.xml`, remove the old `wp-sitemap.xml`, and
   watch Coverage → "Page with redirect" and 404s for 2–4 weeks.
7. Keep redirects in place for at least 12 months.

## Open decisions

- **Specials / reviews / online-ordering / kids menu** currently redirect to `/`.
  If we add `/specials/` or `/menus/` pages later, repoint those rules there.
  New URLs are SEO-neutral.
- **Spanish locale:** `/es/…` routes are new, so they add pages. That's fine for SEO with `hreflang`.
