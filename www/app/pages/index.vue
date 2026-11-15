<script setup lang="ts">
// Home: parent-brand landing page that routes visitors to one of the four
// restaurants. Styled after the in-house drink menu (parchment, framed boxes,
// espresso title banners, palm line art). Section order follows the old home
// page (Donde / Que / Como → cuisine → favorites → reviews → history) so
// returning visitors find things where they expect them.
// The hero is light parchment, so the header stays solid (no heroOverlay).
import { IMAGES, type ImageId } from '~/utils/images'

const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('PageIndex.seoTitle'),
  description: () => t('PageIndex.seoDescription'),
  ogImage: '/images/ambience/table-spread-mural.webp'
})

const cuisineBody = computed(() => (tm('PageIndex.cuisine.body') as unknown[]).map(m => rt(m as never)))

// Menu-style art per card (colour engravings, utils/art.ts): a Havana landmark
// for "where", a Cubano for the menus, the '57 car for pickup/delivery.
const trio = [
  { key: 'where', art: 'capitolio', href: '#locations' },
  { key: 'what', art: 'cubano', href: '#locations' },
  { key: 'how', art: 'classic-car', popover: 'order-menu' }
] as const

// Only photos known to show the named dish (see utils/images.ts).
const favorites: ImageId[] = [
  'mojito', 'garlicShrimp', 'churrasco', 'croquetas',
  'cubanSandwich', 'empanadas', 'roastChicken', 'cafeConLeche'
]

// Google reviews quoted on the old home page — verbatim, do not edit.
const reviews = [
  {
    author: 'Cassandra Swayzer-Bradleigh',
    quote: 'A wonderful place to eat and enjoy great food with family or friends. They make excellent Margaritas. I had the Chicken and rice dish with Platans. The platens were so sweet and juicy. My husband had the Cuban Sandwich. We truly enjoyed out experience. I am sure you will to.'
  },
  {
    author: 'Dread Shimmra',
    quote: 'Went here for a late lunch/early dinner. There was a 20 minute wait, but it was over quickly, and we were shown to a freshly cleaned table. All of the staff we interacted with were polite, kind and altogether pleasant. The food was amazing. We split an appetizer sampler, and a Cuban sandwich. The house sangria was lovely, at a good price.'
  },
  {
    author: 'Monyet',
    quote: 'Waiter was super friendly, live music, great atmosphere, and good food. I\'d like to say thank you. All these food options brought back tons on memories of my Cuban restaurants down in Florida. Boiled yuca, fried plantains, Empanadas yummy. Club Cuban sandwich and grilled beef. Oh man I was stuffed when I felt. Parking lot was so packed and hard to find a spot.'
  }
]

const yearsOpen = new Date().getFullYear() - 2004

// Favorites carousel: native scroll-snap; buttons just nudge the scroller.
const track = useTemplateRef<HTMLUListElement>('track')

// Hero film: autoplay is muted + decorative, but honour reduced motion.
const heroVideo = useTemplateRef<HTMLVideoElement>('heroVideo')
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.value?.pause()
})
function scrollFavorites(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  const card = el.querySelector('li')
  el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 24), behavior: 'smooth' })
}
</script>

<template>
  <div>
    <!-- ── HERO ───────────────────────────────────────────────
         Parchment + palm fronds; the headline sits in a menu frame,
         the house mojito in an arched print beside it. -->
    <section class="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14" aria-labelledby="hero-title">
      <div class="pointer-events-none" aria-hidden="true">
        <MenuArt name="palm-cluster" eager class="palm-sway absolute -left-24 -top-16 w-64 rotate-[-6deg] sm:w-96" />
        <MenuArt name="palm-cluster" eager class="palm-sway-slow absolute -right-24 -top-14 w-64 -scale-x-100 rotate-[4deg] sm:w-96" />
        <MenuArt name="palm-frond" class="parallax-fast absolute -bottom-6 -right-10 hidden w-48 rotate-[55deg] lg:block" />
      </div>

      <div class="frame relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:gap-14">
        <div>
          <p class="reveal font-eurostar text-xs uppercase tracking-[0.12em] text-muted">
            <BrandText :text="t('PageIndex.hero.eyebrow')" />
          </p>
          <h1 id="hero-title" class="reveal mt-3">
            <span class="eyebrow-script block text-3xl sm:text-5xl"><BrandText :text="t('PageIndex.hero.titleLead')" /></span>
            <span class="block font-display text-6xl font-black leading-[0.95] text-highlighted sm:text-8xl lg:text-9xl"><BrandText :text="t('PageIndex.hero.titleAccent')" /></span>
            <span class="eyebrow-script mt-3 block text-3xl sm:text-5xl"><BrandText :text="t('PageIndex.hero.drinkLead')" /></span>
            <span class="block font-display text-6xl font-black leading-[0.95] text-secondary sm:text-8xl lg:text-9xl"><BrandText :text="t('PageIndex.hero.drinkAccent')" /></span>
          </h1>
          <p class="reveal reveal-delay-1 mt-6 max-w-xl text-lg text-default sm:text-xl">
            <BrandText :text="t('PageIndex.hero.subtitle')" />
          </p>
          <div class="reveal reveal-delay-2 mt-8 flex flex-wrap gap-4">
            <a href="#locations" class="btn-menu frame-dark-sm text-base">
              <UIcon name="i-lucide-map-pin" class="size-5" aria-hidden="true" />
              <BrandText :text="t('PageIndex.hero.ctaLocations')" />
            </a>
            <!-- Opens the header's order-online popover (same document) -->
            <button type="button" popovertarget="order-menu" class="btn-menu frame-sm text-base text-highlighted">
              <UIcon name="i-lucide-shopping-bag" class="size-5" aria-hidden="true" />
              <BrandText :text="t('PageIndex.hero.ctaOrder')" />
            </button>
          </div>
        </div>

        <!-- The restaurant's own brand film (from the old site's hero), cropped
             to the arch: dishes, cocktails and Havana street scenes. Silent,
             decorative; paused for reduced-motion users (see script). -->
        <div class="reveal mx-auto w-60 sm:w-72 lg:w-80" aria-hidden="true">
          <div class="aspect-[4/5] overflow-hidden rounded-t-full border-2 border-inverted outline outline-1 outline-offset-4 outline-parchment-900">
            <video
              ref="heroVideo"
              class="size-full object-cover"
              src="/videos/hero-havana-rumba.mp4"
              poster="/videos/hero-havana-rumba-poster.webp"
              autoplay
              muted
              loop
              playsinline
              disablepictureinpicture
              preload="auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── DÓNDE / QUÉ / CÓMO ─────────────────────────────── -->
    <section id="trio" class="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <ul class="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <li
          v-for="(item, i) in trio"
          :key="item.key"
          class="reveal"
          :class="i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''"
        >
          <article class="frame group relative flex h-full flex-col items-center px-6 pb-8 pt-7 text-center transition-transform duration-300 hover:-translate-y-1.5">
            <MenuBanner class="self-stretch text-2xl">
              <BrandText :text="t(`PageIndex.trio.${item.key}.title`)" />
            </MenuBanner>
            <p class="eyebrow-script mt-3 text-3xl">
              <BrandText :text="t(`PageIndex.trio.${item.key}.eyebrow`)" />
            </p>
            <div class="my-5 flex h-28 items-center justify-center text-highlighted transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <MenuArt :name="item.art" class="max-h-28 w-auto max-w-full object-contain" />
            </div>
            <p class="text-muted">
              <BrandText :text="t(`PageIndex.trio.${item.key}.body`)" />
            </p>
            <p class="mt-auto pt-6">
              <button
                v-if="'popover' in item"
                type="button"
                :popovertarget="item.popover"
                class="btn-menu frame-dark-sm text-sm after:absolute after:inset-0 after:content-['']"
              >
                <BrandText :text="t(`PageIndex.trio.${item.key}.cta`)" />
              </button>
              <a
                v-else
                :href="item.href"
                class="btn-menu frame-sm text-sm text-highlighted after:absolute after:inset-0 after:content-['']"
              >
                <BrandText :text="t(`PageIndex.trio.${item.key}.cta`)" />
              </a>
            </p>
          </article>
        </li>
      </ul>
    </section>

    <!-- ── LOCATIONS ───────────────────────────────────────── -->
    <section id="locations" class="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="locations-title">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageIndex.locations.eyebrow')" />
          </p>
          <h2 id="locations-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageIndex.locations.title')" />
          </h2>
          <p class="reveal reveal-delay-1 mt-4 text-lg text-muted">
            <BrandText :text="t('PageIndex.locations.intro')" />
          </p>
        </div>
        <ul class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="(l, i) in LOCATIONS" :key="l.slug" class="reveal" :class="i % 2 ? 'reveal-delay-1' : ''">
            <LocationCard :location="l" />
          </li>
        </ul>
      </div>
    </section>

    <!-- ── AUTHENTIC CUBAN CUISINE ─────────────────────────── -->
    <section class="section-fade relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="cuisine-title">
      <div class="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <!-- Layered photo collage: each layer scrolls at its own speed -->
        <div class="relative mx-auto aspect-square w-full max-w-lg" aria-hidden="true">
          <img
            src="/images/food/mains/roast-chicken.webp"
            alt=""
            loading="lazy"
            class="reveal frame-sm absolute inset-0 left-[12%] top-[6%] size-[78%] object-cover p-2 shadow-deep"
          >
          <img
            src="/images/food/appetizers/empanadas.webp"
            alt=""
            loading="lazy"
            class="parallax-fast frame-sm absolute bottom-0 left-0 w-[46%] -rotate-3 object-cover p-2 shadow-lift"
          >
          <img
            src="/images/drinks/cafe-con-leche.webp"
            alt=""
            loading="lazy"
            class="parallax-slow frame-sm absolute right-0 top-0 w-[34%] rotate-3 object-cover p-2 shadow-lift"
          >
          <MenuArt name="palm-frond" class="absolute -bottom-8 -right-10 w-36 rotate-[-30deg]" />
        </div>

        <div>
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageIndex.cuisine.eyebrow')" />
          </p>
          <h2 id="cuisine-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageIndex.cuisine.title')" />
          </h2>
          <div class="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            <p v-for="(p, i) in cuisineBody" :key="i" class="reveal">
              <BrandText :text="p" />
            </p>
          </div>
          <UButton
            :to="localePath('about')"
            size="lg"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
            class="reveal mt-8"
          >
            <BrandText :text="t('PageIndex.cuisine.cta')" />
          </UButton>
        </div>
      </div>
    </section>

    <!-- ── FAVORITES (scroll-snap carousel) ────────────────── -->
    <section class="py-20" aria-labelledby="favorites-title">
      <div class="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div>
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageIndex.favorites.eyebrow')" />
          </p>
          <h2 id="favorites-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageIndex.favorites.title')" />
          </h2>
        </div>
        <div class="hidden gap-2 sm:flex">
          <button
            type="button"
            class="frame-sm inline-flex size-12 items-center justify-center text-highlighted transition-transform hover:-translate-x-0.5"
            :aria-label="t('PageIndex.favorites.prev')"
            @click="scrollFavorites(-1)"
          >
            <UIcon name="i-lucide-arrow-left" class="size-5" />
          </button>
          <button
            type="button"
            class="frame-sm inline-flex size-12 items-center justify-center text-highlighted transition-transform hover:translate-x-0.5"
            :aria-label="t('PageIndex.favorites.next')"
            @click="scrollFavorites(1)"
          >
            <UIcon name="i-lucide-arrow-right" class="size-5" />
          </button>
        </div>
      </div>

      <ul
        ref="track"
        class="favorites-track mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-6 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        tabindex="0"
        :aria-label="t('PageIndex.favorites.title')"
      >
        <li v-for="f in favorites" :key="f" class="w-[75vw] max-w-xs shrink-0 snap-start sm:w-72">
          <figure class="frame group relative p-3 transition-transform duration-300 hover:-translate-y-1">
            <div class="overflow-hidden border-2 border-inverted">
              <img
                :src="IMAGES[f]"
                :alt="t(`Images.${f}.alt`)"
                loading="lazy"
                class="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              >
            </div>
            <figcaption class="px-1 pb-1 pt-3 text-center font-display text-xl font-bold text-highlighted">
              <BrandText :text="t(`Images.${f}.caption`)" />
            </figcaption>
          </figure>
        </li>
      </ul>
    </section>

    <!-- ── HAPPY HOUR (the drink menu's dark panel) ────────── -->
    <section class="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="specials-title">
      <div class="frame-dark reveal relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-8 py-10 sm:px-12 lg:flex-row lg:gap-12">
        <!-- Hibiscus sprays in the bottom corners, as on the printed menu -->
        <MenuArt name="hibiscus" class="animate-float-slow pointer-events-none absolute -bottom-10 -left-14 hidden w-44 rotate-[-8deg] xl:block" />
        <MenuArt name="hibiscus" class="pointer-events-none absolute -bottom-10 -right-14 hidden w-44 -scale-x-100 rotate-[8deg] xl:block" />
        <MenuArt name="martini" class="relative hidden h-40 w-auto shrink-0 xl:block" />
        <div class="shrink-0 text-center">
          <p class="font-script text-2xl text-gold-300">
            <BrandText :text="t('Specials.eyebrow')" />
          </p>
          <h2 id="specials-title" class="font-display text-5xl font-black leading-none sm:text-6xl">
            <BrandText :text="t('Specials.title')" />
          </h2>
        </div>
        <div class="hidden w-px self-stretch bg-parchment-400/60 lg:block" aria-hidden="true" />
        <div class="flex-1">
          <ul class="space-y-3 font-condensed text-lg sm:text-xl">
            <li v-for="s in WEEKLY_SPECIALS" :key="s.key">
              <span class="font-eurostar text-base uppercase tracking-[0.06em] text-gold-400">{{ formatDay(s.day, locale) }}</span>
              <span aria-hidden="true"> · </span>
              <BrandText :text="t(`Specials.${s.key}`)" />
            </li>
          </ul>
          <p class="mt-4 text-sm text-parchment-300">
            <BrandText :text="t('PageIndex.specials.where')" />
          </p>
        </div>
        <MenuArt name="mojito" class="relative hidden h-44 w-auto shrink-0 xl:block" />
      </div>
    </section>

    <!-- ── REVIEWS ─────────────────────────────────────────── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="reviews-title">
      <div class="mx-auto max-w-7xl">
        <div class="text-center">
          <p class="reveal eyebrow-script text-2xl">
            <BrandText :text="t('PageIndex.reviews.eyebrow')" />
          </p>
          <h2 id="reviews-title" class="reveal font-display text-4xl font-semibold text-highlighted sm:text-5xl">
            <BrandText :text="t('PageIndex.reviews.title')" />
          </h2>
        </div>
        <ul class="mt-14 grid gap-6 md:grid-cols-3">
          <li
            v-for="(r, i) in reviews"
            :key="r.author"
            class="reveal"
            :class="i === 1 ? 'reveal-delay-1 md:translate-y-8' : i === 2 ? 'reveal-delay-2' : ''"
          >
            <figure class="frame relative flex h-full flex-col p-8 transition-transform duration-300 hover:-translate-y-1">
              <UIcon name="i-lucide-quote" class="absolute right-7 top-7 size-10 text-primary/25" aria-hidden="true" />
              <blockquote class="flex-1 leading-relaxed text-default">
                <p>“{{ r.quote }}”</p>
              </blockquote>
              <figcaption class="mt-6 border-t border-default pt-4">
                <span class="block font-semibold text-highlighted">{{ r.author }}</span>
                <span class="flex items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-map-pin" class="size-3" aria-hidden="true" />
                  <BrandText :text="t('PageIndex.reviews.source')" />
                </span>
              </figcaption>
            </figure>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── STORY STRIP ─────────────────────────────────────── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8" :aria-label="t('PageIndex.story.cta')">
      <div class="frame-dark mx-auto grid max-w-7xl items-center gap-12 px-8 py-14 sm:px-14 lg:grid-cols-[1.2fr_1fr]">
        <dl class="grid grid-cols-3 gap-6">
          <div class="reveal flex flex-col-reverse">
            <dt class="mt-1 text-sm opacity-70">
              <BrandText :text="t('PageIndex.story.years')" />
            </dt>
            <dd class="font-display text-5xl font-black text-gold-400 sm:text-6xl">
              {{ yearsOpen }}
            </dd>
          </div>
          <div class="reveal reveal-delay-1 flex flex-col-reverse">
            <dt class="mt-1 text-sm opacity-70">
              <BrandText :text="t('PageIndex.story.restaurants')" />
            </dt>
            <dd class="font-display text-5xl font-black text-gold-400 sm:text-6xl">
              {{ LOCATIONS.length }}
            </dd>
          </div>
          <div class="reveal reveal-delay-2 flex flex-col-reverse">
            <dt class="mt-1 text-sm opacity-70">
              <BrandText :text="t('PageIndex.story.since')" />
            </dt>
            <dd class="font-display text-5xl font-black text-gold-400 sm:text-6xl">
              2004
            </dd>
          </div>
        </dl>
        <div>
          <p class="reveal text-lg leading-relaxed opacity-85">
            <BrandText :text="t('PageIndex.story.body')" />
          </p>
          <UButton
            :to="localePath('about')"
            size="lg"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
            class="reveal mt-6"
          >
            <BrandText :text="t('PageIndex.story.cta')" />
          </UButton>
        </div>
      </div>
    </section>

    <!-- ── CATERING + GIFT CARDS ───────────────────────────── -->
    <section class="px-4 pb-8 sm:px-6 lg:px-8">
      <ul class="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
        <li
          v-for="(x, i) in [
            { key: 'catering', to: 'catering', img: '/images/ambience/table-spread-overhead.webp', icon: 'i-lucide-chef-hat' },
            { key: 'giftCards', to: 'gift-cards', img: '/images/drinks/cocktails-pair.webp', icon: 'i-lucide-gift' }
          ]"
          :key="x.key"
          class="reveal"
          :class="i ? 'reveal-delay-1' : ''"
        >
          <article class="frame group relative isolate flex min-h-80 flex-col p-3 text-white transition-transform duration-300 hover:-translate-y-1">
            <div class="relative isolate flex flex-1 flex-col justify-end overflow-hidden border-2 border-inverted p-7">
            <img :src="x.img" alt="" loading="lazy" class="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <UIcon :name="x.icon" class="size-9 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />
            <h2 class="mt-3 font-display text-3xl font-bold">
              <NuxtLink :to="localePath(x.to)" class="after:absolute after:inset-0 after:content-['']">
                <BrandText :text="t(`PageIndex.extras.${x.key}.title`)" />
              </NuxtLink>
            </h2>
            <p class="mt-1 text-white/85">
              <BrandText :text="t(`PageIndex.extras.${x.key}.body`)" />
            </p>
            <span class="mt-4 inline-flex items-center gap-1.5 font-semibold">
              <BrandText :text="t(`PageIndex.extras.${x.key}.cta`)" />
              <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
            </div>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Slow Ken Burns drift on the hero photo (disabled for reduced motion below) */
.hero-kenburns {
  animation: kenburns 24s ease-in-out infinite alternate;
}

@keyframes kenburns {
  from { transform: scale(1.05) translate3d(0, 0, 0); }
  to { transform: scale(1.15) translate3d(-2%, -1%, 0); }
}

/* Hand-drawn underline draws itself in on load */
.hero-underline {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: draw 1.2s 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

/* Thin, unobtrusive scrollbar for the favorites track */
.favorites-track {
  scrollbar-width: thin;
  scrollbar-color: var(--ui-border-accented) transparent;
}

@media (prefers-reduced-motion: reduce) {
  .hero-kenburns,
  .hero-underline {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
