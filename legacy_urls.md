# Legacy URLs

301 redirects from the old WordPress site (audit: 2026-11-14, see
`docs/seo-migration.md`). The real redirects live in
`firebase/firebase.json` → `hosting.redirects`. Keep this table in sync with them.

Unchanged paths (no redirect needed): `/`, `/about/`, `/gallery/`, `/catering/`,
`/gift-cards/`, `/careers/`, `/contact-us/`, `/middletown/`, `/highlands/`,
`/st-matthews/`, `/lyndon/`.

| Old URL | New URL | Notes |
| ------- | ------- | ----- |
| `/home-legacy/` | `/` |  |
| `/home-legacy/our-story/` | `/about/` |  |
| `/home-legacy/cuban-cuisine/` | `/about/` |  |
| `/home-legacy/locations-and-hours/` | `/about/` |  |
| `/home-legacy/reviews/` | `/` |  |
| `/home-legacy/happenings-specials/` | `/` |  |
| `/home-legacy/specials/` | `/` |  |
| `/home-legacy/live-music/` | `/` |  |
| `/home-legacy/online-ordering/` | `/` |  |
| `/home-legacy/menu-kids/` | `/` |  |
| `/home-legacy/catering-and-private-parties/` | `/catering/` |  |
| `/home-legacy/gallery-legacy/` | `/gallery/` |  |
| `/home-legacy/photo-gallery/` | `/gallery/` |  |
| `/home-legacy/contact-us-legacy/` | `/contact-us/` |  |
| `/home-legacy/career-opportunities/` | `/careers/` |  |
| `/home-legacy/gift-cards-legacyy/` | `/gift-cards/` |  |
| `/home-legacy/gift-card-legacy/` | `/gift-cards/` |  |
| `/home-legacy/shop/` | `/gift-cards/` |  |
| `/home-legacy/cart/` | `/gift-cards/` |  |
| `/home-legacy/checkout/` | `/gift-cards/` |  |
| `/home-legacy/middletown-legacy/` | `/middletown/` |  |
| `/home-legacy/menu/` | `/middletown/` |  |
| `/home-legacy/menu-middletown-*/` | `/middletown/` |  |
| `/home-legacy/highlands-legacy/` | `/highlands/` |  |
| `/home-legacy/menu-highlands-*/` | `/highlands/` |  |
| `/home-legacy/st-matthews-legacy/` | `/st-matthews/` |  |
| `/home-legacy/menu-st-matthews-*/` | `/st-matthews/` |  |
| `/home-legacy/lyndon-legacy/` | `/lyndon/` |  |
| `/home-legacy/mojito-tapas/` | `/lyndon/` |  |
| `/home-legacy/menu-lyndon-*/` | `/lyndon/` |  |
| `/home-legacy/**` | `/` | catch-all |
| `/our-story/` | `/about/` | WP root slug (pre-2022) |
| `/cuban-cuisine/` | `/about/` | WP root slug (pre-2022) |
| `/locations-and-hours/` | `/about/` | WP root slug (pre-2022) |
| `/reviews/` | `/` | WP root slug (pre-2022) |
| `/happenings-specials/` | `/` | WP root slug (pre-2022) |
| `/specials/` | `/` | WP root slug (pre-2022) |
| `/live-music/` | `/` | WP root slug (pre-2022) |
| `/online-ordering/` | `/` | WP root slug (pre-2022) |
| `/menu-kids/` | `/` | WP root slug (pre-2022) |
| `/catering-and-private-parties/` | `/catering/` | WP root slug (pre-2022) |
| `/photo-gallery/` | `/gallery/` | WP root slug (pre-2022) |
| `/contact/` | `/contact-us/` | WP root slug (pre-2022) |
| `/career-opportunities/` | `/careers/` | WP root slug (pre-2022) |
| `/gift-card/` | `/gift-cards/` | WP root slug (pre-2022) |
| `/shop/` | `/gift-cards/` | WP root slug (pre-2022) |
| `/cart/` | `/gift-cards/` | WP root slug (pre-2022) |
| `/checkout/` | `/gift-cards/` | WP root slug (pre-2022) |
| `/menu/` | `/middletown/` | WP root slug (pre-2022) |
| `/menu-middletown-*/` | `/middletown/` | WP root slug (pre-2022) |
| `/menu-highlands-*/` | `/highlands/` | WP root slug (pre-2022) |
| `/menu-st-matthews-*/` | `/st-matthews/` | WP root slug (pre-2022) |
| `/mojito-tapas/` | `/lyndon/` | WP root slug (pre-2022) |
| `/menu-lyndon-*/` | `/lyndon/` | WP root slug (pre-2022) |
| `/author/**` | `/` | catch-all |
| `/feed/**` | `/` | catch-all |
| `/comments/feed/**` | `/` | catch-all |
| `/wp-sitemap.xml`, `/wp-sitemap-*.xml` | `/sitemap.xml` | single rule `/wp-sitemap{,-*}.xml` |
| `/wp-content/uploads/2026/03/Havana-Rumba-Catering-.pdf` | `/catering/` | Catering PDF — re-host before launch |
