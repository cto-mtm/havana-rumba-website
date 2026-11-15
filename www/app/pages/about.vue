<script setup lang="ts">
definePageMeta({ heroOverlay: true })

import { IMAGES } from '~/utils/images'

const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('PageAbout.seoTitle'),
  description: () => t('PageAbout.seoDescription'),
  ogImage: '/images/ambience/dining-room.webp'
})

const story = computed(() => (tm('PageAbout.story') as unknown[]).map(m => rt(m as never)))
const cuisine = computed(() => (tm('PageAbout.cuisine') as unknown[]).map(m => rt(m as never)))
const timeline = computed(() =>
  (tm('PageAbout.timeline') as { year: unknown, text: unknown }[]).map(e => ({ year: rt(e.year as never), text: rt(e.text as never) }))
)
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageAbout.eyebrow')"
      :title="t('PageAbout.title')"
      :intro="t('PageAbout.intro')"
      image-id="diningRoom"
    />

    <!-- Story + timeline -->
    <section class="section-overlap px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="timeline-title">
      <div class="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.2fr_1fr]">
        <div class="space-y-6 text-lg leading-relaxed text-muted">
          <p v-for="(p, i) in story" :key="i" class="reveal">
            <BrandText :text="p" />
          </p>
          <p class="reveal eyebrow-script text-4xl">
            <BrandText :text="t('PageAbout.signoff')" />
          </p>
        </div>

        <div>
          <h2 id="timeline-title" class="reveal font-display text-3xl font-semibold text-highlighted">
            <BrandText :text="t('PageAbout.timelineTitle')" />
          </h2>
          <ol class="relative mt-8 space-y-8 border-l-2 border-primary/30 pl-8">
            <li v-for="e in timeline" :key="e.year" class="reveal group relative">
              <span
                class="absolute -left-[2.6rem] top-1 size-4 rotate-45 bg-primary ring-4 ring-default transition-transform duration-300 group-hover:scale-125"
                aria-hidden="true"
              />
              <p class="font-display text-2xl font-semibold text-highlighted">
                <time :datetime="e.year">{{ e.year }}</time>
              </p>
              <p class="mt-1 text-muted">
                {{ e.text }}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Cuban cuisine -->
    <section class="section-fade px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="cuisine-title">
      <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div class="reveal relative">
          <img
            :src="IMAGES.tableSpreadMuralWide"
            :alt="t('Images.tableSpreadMuralWide.alt')"
            loading="lazy"
            class="frame-sm aspect-[4/3] w-full object-cover p-2 shadow-deep"
          >
          <img
            :src="IMAGES.cafeConLeche"
            :alt="t('Images.cafeConLeche.alt')"
            loading="lazy"
            class="parallax-fast frame-sm absolute -bottom-10 -right-4 hidden w-40 rotate-3 object-cover p-2 shadow-lift sm:block"
          >
        </div>
        <div>
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageAbout.cuisineEyebrow')" />
          </p>
          <h2 id="cuisine-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageAbout.cuisineTitle')" />
          </h2>
          <div class="mt-6 space-y-4 leading-relaxed text-muted">
            <p v-for="(p, i) in cuisine" :key="i" class="reveal">
              <BrandText :text="p" />
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Locations -->
    <section id="locations" class="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="locations-title">
      <div class="mx-auto max-w-7xl">
        <p class="reveal eyebrow-script text-2xl">
          <BrandText :text="t('PageAbout.locationsEyebrow')" />
        </p>
        <h2 id="locations-title" class="reveal font-display text-4xl font-semibold text-highlighted">
          <BrandText :text="t('PageAbout.locationsTitle')" />
        </h2>
        <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="l in LOCATIONS" :key="l.slug" class="reveal">
            <LocationCard :location="l" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
