<script setup lang="ts">
definePageMeta({ heroOverlay: true })

const { t, tm, rt } = useI18n()

useSeoMeta({
  title: () => t('PageCatering.seoTitle'),
  description: () => t('PageCatering.seoDescription'),
  ogImage: '/images/ambience/table-spread-overhead.webp'
})

// TODO: add the catering PDF to public/ (old URL:
// /wp-content/uploads/2026/03/Havana-Rumba-Catering-.pdf) and set its path here.
// Then repoint that URL's redirect in firebase/firebase.json to this file.
const CATERING_PDF = ''

const list = (key: string) => computed(() => (tm(key) as unknown[]).map(m => rt(m as never)))

const cards = [
  { key: 'chafing', icon: 'i-lucide-flame', items: list('PageCatering.chafing') },
  { key: 'delivery', icon: 'i-lucide-truck', items: list('PageCatering.delivery') },
  { key: 'notice', icon: 'i-lucide-calendar-clock', items: list('PageCatering.notice') }
]
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageCatering.eyebrow')"
      :title="t('PageCatering.title')"
      :intro="t('PageCatering.intro')"
      image-id="tableSpreadOverhead"
    >
      <UButton
        v-if="CATERING_PDF"
        :to="CATERING_PDF"
        target="_blank"
        size="xl"
        color="primary"
        icon="i-lucide-file-down"
        class="reveal reveal-delay-2 mt-8"
      >
        <BrandText :text="t('PageCatering.downloadMenu')" />
      </UButton>
    </PageHero>

    <section class="section-overlap px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <p class="reveal mx-auto max-w-3xl text-center text-lg leading-relaxed text-muted">
          <BrandText :text="t('PageCatering.body')" />
        </p>

        <ul class="mt-14 grid gap-6 md:grid-cols-3">
          <li
            v-for="(c, i) in cards"
            :key="c.key"
            class="frame reveal group p-8 transition-transform duration-300 hover:-translate-y-1.5"
            :class="i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''"
          >
            <span class="frame-dark-sm inline-flex size-12 items-center justify-center text-gold-300 transition-transform duration-300 group-hover:rotate-6">
              <UIcon :name="c.icon" class="size-6" aria-hidden="true" />
            </span>
            <h2 class="mt-6 font-display text-2xl font-semibold text-highlighted">
              <BrandText :text="t(`PageCatering.${c.key}Title`)" />
            </h2>
            <ul class="mt-4 space-y-2 text-muted">
              <li v-for="line in c.items.value" :key="line" class="flex gap-2">
                <UIcon name="i-lucide-check" class="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span><BrandText :text="line" /></span>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </section>

    <section class="px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="call-title">
      <div class="mx-auto max-w-7xl">
        <h2 id="call-title" class="reveal text-center font-display text-3xl font-semibold text-highlighted">
          <BrandText :text="t('PageCatering.callTitle')" />
        </h2>
        <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="l in LOCATIONS" :key="l.slug" class="reveal">
            <a
              :href="telHref(l.phone)"
              class="frame group flex items-center gap-4 p-5 transition-transform hover:-translate-y-1"
            >
              <span class="frame-dark-sm inline-flex size-11 shrink-0 items-center justify-center text-gold-300 transition-transform group-hover:rotate-12">
                <UIcon name="i-lucide-phone" class="size-5" aria-hidden="true" />
              </span>
              <span>
                <span class="block font-semibold text-highlighted"><BrandText :text="l.brand" /></span>
                <span class="block text-sm text-muted">{{ l.area }} · {{ l.phone }}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
