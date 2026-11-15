<script setup lang="ts">
// lang/dir on <html>, plus hreflang alternates (en, es, x-default) and
// og:locale tags for every page — required for the bilingual SEO setup.
const i18nHead = useLocaleHead({ seo: true })

// Every public URL ends in "/" (matches canonicals + Firebase trailingSlash).
// i18n emits alternates without it, which would point Google at redirects.
const withSlash = (href?: string) =>
  href && !href.endsWith('/') && !/[?#]/.test(href) ? `${href}/` : href

useHead({
  htmlAttrs: computed(() => i18nHead.value.htmlAttrs ?? {}),
  link: computed(() => [
    // Parent mark: the round Cuban flag — brand-neutral across all four restaurants
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    ...(i18nHead.value.link ?? [])
      .filter(l => l.rel !== 'canonical')
      .map(l => ({ ...l, href: withSlash(l.href) }))
  ]),
  meta: computed(() => i18nHead.value.meta ?? [])
})
</script>

<template>
  <UApp>
    <!-- Route-change progress bar (tobacco, the menu's ink) -->
    <NuxtLoadingIndicator color="#6E4A2A" :height="3" />

    <!-- 0.5 s first-load curtain: the flag mark spins in, then the curtain
         lifts. Pure CSS (works on the prerendered HTML, no JS needed);
         skipped entirely for reduced-motion users. Styles: main.css. -->
    <div class="site-loader" aria-hidden="true">
      <img src="/images/brand/flag-round.webp" alt="" width="72" height="72" class="site-loader__mark">
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
