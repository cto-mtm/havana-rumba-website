import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Ports are declared once in ports.json at the repo root (Node-side only).
const ports = JSON.parse(
  readFileSync(fileURLToPath(new URL('../ports.json', import.meta.url)), 'utf-8')
) as { app: { vite: number, tailscale: number } }
const tailscaleHost = process.env.TAILSCALE_HOST

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devServer: {
    host: '0.0.0.0',
    port: ports.app.vite
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: ports.app.vite,
      strictPort: true,
      allowedHosts: true,
      hmr: tailscaleHost
        ? { protocol: 'wss', host: tailscaleHost, clientPort: ports.app.tailscale }
        : undefined
    }
  },

  devtools: {
    enabled: true,
    timeline: { enabled: true }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    'nuxt-gtag',
    '@nuxtjs/i18n'
  ],

  // ── i18n ─────────────────────────────────────────────────────
  // English is the default (no prefix); Spanish lives under /es/.
  // Always link with localePath() — see docs/architecture.md.
  // The vueI18n path is resolved relative to the www/i18n/ directory.
  i18n: {
    vueI18n: './i18n.config.ts',
    // Needed for absolute hreflang / og:locale alternates (see app.vue)
    baseUrl: 'https://www.havanarumbaonline.com',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
    }
  },

  runtimeConfig: {
    public: {
      // Full URL of the deployed submitForm Cloud Function, e.g.
      // https://us-central1-<project>.cloudfunctions.net/submitForm
      submitFormUrl: 'REPLACE_ME',
      // reCAPTCHA v3 *site* key (public). Required in production: the
      // Cloud Function rejects submissions without a token. Set at build
      // time via NUXT_PUBLIC_RECAPTCHA_SITE_KEY.
      recaptchaSiteKey: ''
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  gtag: {
    id: 'REPLACE_ME_GA_ID'
  },

  // The current WordPress site uses www + trailing slashes on every URL
  // (e.g. /about/). Keep both so canonicals and sitemap URLs match what
  // Google already has indexed. See docs/seo-migration.md.
  site: {
    url: 'https://www.havanarumbaonline.com',
    name: 'Havana Rumba',
    description: 'Authentic Cuban cuisine at four Louisville restaurants: Havana Rumba Middletown, Havana Rumba & Tapas Bar Highlands, Mojito in Havana St. Matthews and Mojitos Tapas Lyndon.',
    defaultLocale: 'en',
    trailingSlash: true
  },

  // Parent organization for structured data; each location page adds its
  // own Restaurant JSON-LD (see pages/[location].vue).
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Havana Rumba',
      logo: '/images/brand/flag-round.webp'
    }
  },

  // Make sure every page is pre-rendered even if no link points to it yet.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/', '/about/', '/gallery/', '/catering/', '/gift-cards/', '/careers/', '/contact-us/',
        '/middletown/', '/highlands/', '/st-matthews/', '/lyndon/'
      ],
      // @nuxtjs/seo's AI-ready index lists pages without the trailing slash
      // (/careers, /es/careers…). Prerendering both spellings makes two
      // renders race on one payload cache file (EPERM on Windows) and emits
      // duplicate pages. Only the slashed URL is public (Firebase
      // trailingSlash: true redirects the other), so skip the bare ones.
      ignore: [
        (path: string) => /^(?:\/es)?\/(?:about|gallery|catering|gift-cards|careers|contact-us|middletown|highlands|st-matthews|lyndon)$/.test(path) || path === '/es'
      ]
    }
  },

  experimental: {
    defaults: {
      // Emit /about/ instead of /about from <NuxtLink>, avoiding an extra
      // Firebase trailing-slash redirect on every internal click.
      nuxtLink: { trailingSlash: 'append' }
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  image: {
    provider: 'none'
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'neutral']
    }
  },

  routeRules: {
    // ────────────────────────────────────────────────────────────
    // LEGACY URL REDIRECTS
    // ⚠️ This site is statically generated (nuxt generate). Redirects here
    // only become <meta http-equiv="refresh"> pages, NOT real HTTP 301s.
    // The production 301s for the old WordPress URLs live in
    // firebase/firebase.json → hosting.redirects. Add new ones THERE and
    // record them in /legacy_urls.md. Use routeRules only for dev-time
    // convenience.
    //
    // Pattern A — single page:
    //   '/old-path': { redirect: { to: '/new-path', statusCode: 301 } },
    //
    // Pattern B — directory with wildcard:
    //   '/old-section/**': { redirect: { to: '/new-section', statusCode: 301 } },
    //
    // Pattern C — section merged into another:
    //   '/team': { redirect: { to: '/about#team', statusCode: 301 } },
    // ────────────────────────────────────────────────────────────

    // '/example-old': { redirect: { to: '/', statusCode: 301 } },
  }
})
