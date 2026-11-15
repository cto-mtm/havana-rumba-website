<script setup lang="ts">
definePageMeta({ heroOverlay: true })

const { t } = useI18n()

useSeoMeta({
  title: () => t('PageGiftCards.seoTitle'),
  description: () => t('PageGiftCards.seoDescription'),
  ogImage: '/images/drinks/cocktails-pair.webp'
})
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageGiftCards.eyebrow')"
      :title="t('PageGiftCards.title')"
      :intro="t('PageGiftCards.intro')"
      image-id="cocktailsPair"
    />

    <section class="section-overlap px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <p class="reveal flex items-center justify-center gap-2 text-center font-semibold text-primary">
          <UIcon name="i-lucide-badge-check" class="size-5" aria-hidden="true" />
          <BrandText :text="t('PageGiftCards.validEverywhere')" />
        </p>

        <ul class="mt-10 grid gap-6 sm:grid-cols-2">
          <li v-for="(l, i) in LOCATIONS" :key="l.slug" class="reveal min-w-0" :class="i % 2 ? 'reveal-delay-1' : ''">
            <!-- Badge stacks above the text on phones; side by side from sm up. -->
            <a
              :href="l.giftCardUrl"
              target="_blank"
              rel="noopener"
              class="frame group relative flex flex-col items-start gap-4 p-6 transition-transform duration-300 hover:-translate-y-1.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-6"
            >
              <!-- Card-shaped badge with the location's own logo -->
              <span class="frame-sm flex aspect-[1.6] w-36 shrink-0 items-center justify-center p-3 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                <img
                  :src="l.logo ?? '/images/brand/flag-round.webp'"
                  :alt="t('Images.logo', { brand: l.brand })"
                  class="max-h-full w-auto"
                >
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-display text-2xl font-semibold text-highlighted"><BrandText :text="l.brand" /></span>
                <span class="block text-sm text-muted">{{ l.area }}</span>
                <span class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <BrandText :text="t('PageGiftCards.buyAt', { brand: l.brand })" />
                  <UIcon name="i-lucide-external-link" class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  <span class="sr-only"><BrandText :text="t('PageLocation.opensExternal')" /></span>
                </span>
              </span>
            </a>
          </li>
        </ul>

        <p class="reveal mt-10 text-center text-muted">
          <BrandText :text="t('PageGiftCards.orderingNote')" />
        </p>
      </div>
    </section>
  </div>
</template>
