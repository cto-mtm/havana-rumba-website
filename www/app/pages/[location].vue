<script setup lang="ts">
// Location page: /middletown/, /highlands/, /st-matthews/, /lyndon/
// These four URLs carry over unchanged from the WordPress site.
import { IMAGES } from '~/utils/images'
import { LOCATIONS, LOCATION_SLUGS, WEEKLY_SPECIALS, getLocation, type DayOfWeek } from '~/utils/locations'

definePageMeta({
  heroOverlay: true,
  validate: route => LOCATION_SLUGS.includes(route.params.location as never)
})

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.params.location as string)
const loc = computed(() => getLocation(slug.value)!)
const others = computed(() => LOCATIONS.filter(l => l.slug !== slug.value))

const { data: menu } = await useAsyncData(
  () => `menu-${slug.value}`,
  () => queryCollection('menus').where('location', '=', slug.value).first()
)

const fullAddress = computed(() => {
  const a = loc.value.address
  return `${a.street}, ${a.city}, ${a.region} ${a.postalCode}`
})

// Keep the old <title> shape ("Havana Rumba | Middletown") — it's what Google has indexed.
useSeoMeta({
  title: () => `${loc.value.brand} | ${loc.value.area}`,
  description: () => t('PageLocation.seoDescription', {
    brand: loc.value.brand,
    area: loc.value.area,
    street: loc.value.address.street
  }),
  ogImage: () => IMAGES[loc.value.imageId]
})

// Restaurant structured data (the old site had none).
const site = useSiteConfig()
useHead({
  script: [{
    key: 'ld-restaurant',
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `${site.url}/${loc.value.slug}/#restaurant`,
      'name': loc.value.brand,
      'url': `${site.url}/${loc.value.slug}/`,
      'image': `${site.url}${IMAGES[loc.value.imageId]}`,
      'logo': loc.value.logo ? `${site.url}${loc.value.logo}` : undefined,
      'telephone': `+1-${loc.value.phone}`,
      'servesCuisine': ['Cuban', 'Spanish', 'Tapas'],
      'hasMenu': `${site.url}/${loc.value.slug}/#menu`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': loc.value.address.street,
        'addressLocality': loc.value.address.city,
        'addressRegion': loc.value.address.region,
        'postalCode': loc.value.address.postalCode,
        'addressCountry': 'US'
      },
      'openingHoursSpecification': loc.value.hours.map(h => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': h.days.map((d: DayOfWeek) => `https://schema.org/${d}`),
        'opens': h.opens,
        'closes': h.closes
      })),
      'parentOrganization': { '@type': 'Organization', 'name': 'Havana Rumba', 'url': site.url }
    }))
  }]
})
</script>

<template>
  <div :data-brand="loc.theme">
    <!-- Each location wears its own brand inside the parent menu frames -->
    <!-- ── HERO ─────────────────────────────────────────────── -->
    <PageHero
      :eyebrow="loc.area"
      :title="loc.brand"
      :image-id="loc.imageId"
    >
      <img
        v-if="loc.logo"
        :src="loc.logo"
        :alt="loc.brand"
        class="frame-sm reveal mt-6 h-20 w-auto p-3 mix-blend-normal"
      >
      <div class="reveal reveal-delay-1 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85">
        <span class="inline-flex items-center gap-2">
          <UIcon name="i-lucide-map-pin" class="size-4" aria-hidden="true" />
          {{ fullAddress }}
        </span>
        <span class="inline-flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          <BrandText :text="t('PageLocation.since', { year: loc.since })" />
        </span>
      </div>

      <div class="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3">
        <UButton
          :to="loc.ordering.pickup"
          target="_blank"
          rel="noopener"
          size="xl"
          color="primary"
          icon="i-lucide-shopping-bag"
          
        >
          <BrandText :text="t('PageLocation.orderPickup')" />
          <span class="sr-only"><BrandText :text="t('PageLocation.opensExternal')" /></span>
        </UButton>
        <UButton
          :to="loc.ordering.delivery"
          target="_blank"
          rel="noopener"
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-lucide-bike"
          
        >
          <BrandText :text="t('PageLocation.orderDelivery')" />
          <span class="sr-only"><BrandText :text="t('PageLocation.opensExternal')" /></span>
        </UButton>
      </div>
    </PageHero>

    <!-- ── INFO: logo · hours · visit · specials ───────────── -->
    <section class="section-overlap px-4 py-16 sm:px-6 lg:px-8" :aria-label="t('PageLocation.visitTitle')">
      <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        <!-- Visit -->
        <!-- The logo already leads the hero; this box just gets an icon,
             matching the Hours box beside it. -->
        <div class="frame reveal p-8">
          <h2 class="flex items-center gap-2 font-display text-2xl font-semibold text-highlighted">
            <UIcon name="i-lucide-map-pin" class="size-6 text-primary" aria-hidden="true" />
            <BrandText :text="t('PageLocation.visitTitle')" />
          </h2>
          <address class="mt-4 space-y-3 not-italic text-muted">
            <p>{{ loc.address.street }}<br>{{ loc.address.city }}, {{ loc.address.region }} {{ loc.address.postalCode }}</p>
            <p class="flex flex-col gap-2">
              <a
                :href="telHref(loc.phone)"
                class="group inline-flex items-center gap-2 font-semibold text-highlighted hover:text-primary"
              >
                <UIcon name="i-lucide-phone" class="size-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
                <BrandText :text="t('PageLocation.call', { phone: loc.phone })" />
              </a>
              <a
                :href="directionsHref(loc)"
                target="_blank"
                rel="noopener"
                class="group inline-flex items-center gap-2 font-semibold text-highlighted hover:text-primary"
              >
                <UIcon name="i-lucide-navigation" class="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                <BrandText :text="t('PageLocation.directions')" />
                <span class="sr-only"><BrandText :text="t('PageLocation.opensExternal')" /></span>
              </a>
            </p>
          </address>
        </div>

        <!-- Hours -->
        <div class="frame reveal reveal-delay-1 p-8">
          <h2 class="flex items-center gap-2 font-display text-2xl font-semibold text-highlighted">
            <UIcon name="i-lucide-clock" class="size-6 text-primary" aria-hidden="true" />
            <BrandText :text="t('PageLocation.hoursTitle')" />
          </h2>
          <dl class="mt-6 divide-y divide-default">
            <div
              v-for="(h, i) in loc.hours"
              :key="i"
              class="flex items-baseline justify-between gap-4 py-3"
            >
              <dt class="font-medium text-highlighted">
                {{ formatDayRange(h.days, locale) }}
              </dt>
              <dd class="text-right tabular-nums text-muted">
                <time :datetime="h.opens">{{ formatTime(h.opens, locale) }}</time>
                –
                <time :datetime="h.closes">{{ formatTime(h.closes, locale) }}</time>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Specials -->
        <div
          v-if="loc.hasWeeklySpecials"
          class="frame-dark reveal reveal-delay-2 p-8"
        >
          <h2 class="flex items-center gap-2 font-display text-2xl font-semibold">
            <UIcon name="i-lucide-party-popper" class="size-6" aria-hidden="true" />
            <BrandText :text="t('Specials.title')" />
          </h2>
          <ul class="mt-6 space-y-4">
            <li v-for="s in WEEKLY_SPECIALS" :key="s.key" class="flex gap-3">
              <UIcon :name="s.icon" class="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden="true" />
              <p>
                <strong class="block font-eurostar text-sm uppercase tracking-[0.06em] text-(--brand-accent)">{{ formatDay(s.day, locale) }}</strong>
                <span class="opacity-85"><BrandText :text="t(`Specials.${s.key}`)" /></span>
              </p>
            </li>
          </ul>
        </div>
        <div
          v-else
          class="frame reveal reveal-delay-2 p-3"
        >
          <img
            :src="IMAGES.mojito"
            :alt="t('Images.mojito.alt')"
            loading="lazy"
            class="size-full object-cover"
          >
        </div>
      </div>
    </section>

    <!-- ── HOUSE SPECIALTIES ───────────────────────────────── -->
    <section class="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="specialties-title">
      <div class="mx-auto max-w-7xl text-center">
        <p class="reveal eyebrow-script text-2xl">
          <BrandText :text="t('PageLocation.specialtiesEyebrow')" />
        </p>
        <h2 id="specialties-title" class="reveal font-display text-4xl font-semibold text-highlighted">
          <BrandText :text="t('PageLocation.specialtiesTitle')" />
        </h2>
        <ul class="reveal reveal-delay-1 mt-8 flex flex-wrap justify-center gap-3">
          <li
            v-for="dish in loc.specialties"
            :key="dish"
            class="frame-sm px-5 py-2.5 font-condensed text-lg font-bold text-highlighted transition-transform hover:-translate-y-0.5"
          >
            {{ dish }}
          </li>
        </ul>
      </div>
    </section>

    <!-- ── FOOD PHOTOS ─────────────────────────────────────── -->
    <!-- Per-location picks from loc.foodPhotos; the first one leads large. -->
    <section class="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="photos-title">
      <div class="mx-auto max-w-7xl">
        <header class="text-center">
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageLocation.photosEyebrow')" />
          </p>
          <h2 id="photos-title" class="reveal font-display text-4xl font-semibold text-highlighted">
            <BrandText :text="t('PageLocation.photosTitle')" />
          </h2>
        </header>

        <ul class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <li
            v-for="(id, i) in loc.foodPhotos"
            :key="id"
            class="reveal"
            :class="i === 0
              ? 'col-span-2 row-span-2'
              : i === loc.foodPhotos.length - 1 && loc.foodPhotos.length % 2 === 0
                ? 'col-span-2 aspect-[2/1] lg:aspect-auto'
                : 'aspect-square'"
          >
            <figure class="frame group relative size-full p-2">
              <div class="relative size-full overflow-hidden">
                <img
                  :src="IMAGES[id]"
                  :alt="t(`Images.${id}.alt`)"
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                >
              </div>
              <figcaption
                class="pointer-events-none absolute inset-x-2 bottom-2 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 font-display font-bold text-white"
                :class="i === 0 ? 'text-xl sm:px-5 sm:pb-4' : 'text-sm sm:text-base'"
              >
                {{ t(`Images.${id}.caption`) }}
              </figcaption>
            </figure>
          </li>
        </ul>

        <p class="reveal mt-8 text-center">
          <UButton
            :to="localePath('gallery')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            <BrandText :text="t('PageLocation.photosGallery')" />
          </UButton>
        </p>
      </div>
    </section>

    <!-- ── MENU ────────────────────────────────────────────── -->
    <section id="menu" class="section-fade scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="menu-title">
      <div class="mx-auto max-w-6xl">
        <header class="text-center">
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageLocation.menuEyebrow')" />
          </p>
          <h2 id="menu-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageLocation.menuTitle')" />
          </h2>
          <p class="reveal reveal-delay-1 mx-auto mt-4 max-w-2xl text-muted">
            <BrandText :text="t('PageLocation.menuCatering')" />
          </p>
        </header>

        <template v-if="menu?.sections?.length">
          <!-- Section jump links -->
          <nav :aria-label="t('PageLocation.menuJump')" class="sticky top-16 z-30 -mx-4 mt-10 overflow-x-auto border-y-[3px] border-double border-default bg-default/95 px-4 py-2 backdrop-blur-md sm:mx-0">
            <ul class="flex w-max gap-2">
              <li v-for="section in menu.sections" :key="section.id">
                <a
                  :href="`#menu-${section.id}`"
                  class="block whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 font-condensed text-sm font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:border-primary hover:text-highlighted"
                >
                  {{ section.title }}
                </a>
              </li>
            </ul>
          </nav>

          <div class="mt-12 space-y-16">
            <section
              v-for="section in menu.sections"
              :id="`menu-${section.id}`"
              :key="section.id"
              class="frame scroll-mt-36 px-6 pb-8 pt-7 sm:px-10"
              :aria-labelledby="`menu-${section.id}-title`"
            >
              <MenuBanner :id="`menu-${section.id}-title`" as="h3" class="reveal mx-auto max-w-md text-2xl">
                {{ section.title }}
              </MenuBanner>
              <ul class="mt-6 grid gap-x-12 gap-y-7 md:grid-cols-2">
                <li v-for="item in section.items" :key="item.name" class="reveal">
                  <p class="flex items-baseline gap-3">
                    <span class="font-condensed text-lg font-bold text-highlighted">{{ item.name }}</span>
                    <span class="flex-1 border-b border-dotted border-accented" aria-hidden="true" />
                    <span class="shrink-0 font-condensed text-lg font-bold tabular-nums text-primary">{{ item.price }}</span>
                  </p>
                  <p v-if="item.description" class="mt-1 text-sm leading-relaxed text-muted">
                    {{ item.description }}
                  </p>
                </li>
              </ul>
              <p
                v-for="note in section.notes.filter(n => !n.startsWith('Notice:'))"
                :key="note"
                class="mt-6 text-sm italic text-muted"
              >
                {{ note }}
              </p>
            </section>
          </div>
        </template>

        <div v-else class="frame reveal mx-auto mt-10 max-w-xl p-8 text-center">
          <UIcon name="i-lucide-book-open" class="size-10 text-primary" aria-hidden="true" />
          <p class="mt-4 text-muted">
            <BrandText :text="t('PageLocation.menuPending')" />
          </p>
          <UButton
            :to="loc.ordering.pickup"
            target="_blank"
            rel="noopener"
            color="primary"
            trailing-icon="i-lucide-external-link"
            class="mt-6"
          >
            <BrandText :text="t('PageLocation.menuPendingCta')" />
            <span class="sr-only"><BrandText :text="t('PageLocation.opensExternal')" /></span>
          </UButton>
        </div>

        <p class="mt-12 text-center text-xs text-dimmed">
          * <BrandText :text="t('PageLocation.rawNotice')" />
        </p>
      </div>
    </section>

    <!-- ── CATERING CTA ────────────────────────────────────── -->
    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="frame-dark reveal relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-8 py-14 text-center sm:flex-row sm:text-left">
        <UIcon name="i-lucide-chef-hat" class="animate-float size-16 shrink-0 text-(--brand-accent)" aria-hidden="true" />
        <div class="flex-1">
          <h2 class="font-display text-3xl font-semibold">
            <BrandText :text="t('PageLocation.cateringTitle')" />
          </h2>
          <p class="mt-2 opacity-80">
            <BrandText :text="t('PageLocation.cateringBody')" />
          </p>
        </div>
        <UButton
          :to="localePath('catering')"
          size="xl"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          <BrandText :text="t('PageLocation.cateringCta')" />
        </UButton>
      </div>
    </section>

    <!-- ── OTHER LOCATIONS ─────────────────────────────────── -->
    <section class="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="others-title">
      <div class="mx-auto max-w-7xl">
        <h2 id="others-title" class="reveal font-display text-3xl font-semibold text-highlighted">
          <BrandText :text="t('PageLocation.otherLocations')" />
        </h2>
        <ul class="mt-8 grid gap-6 md:grid-cols-3">
          <li v-for="o in others" :key="o.slug" class="reveal">
            <LocationCard :location="o" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
