<script setup lang="ts">
// Smart navbar: sticky, hides while scrolling down, reappears on scroll up.
// On pages that declare `heroOverlay` it sits transparent over the dark hero
// with light text at scroll 0; otherwise (and once scrolled) it is a frosted bar.
//
// Menus use the native Popover API (built-in light-dismiss + Esc, top layer,
// no JS library). Desktop dropdowns use CSS anchor positioning; the mobile
// menu is a full-screen popover with staggered entrance animations.
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const appConfig = useAppConfig()
const route = useRoute()

const headerNav = computed(() => appConfig.nav.filter(i => !i.footerOnly))
const otherLocale = computed(() => locales.value.find(l => l.code !== locale.value))

const hidden = ref(false)
const scrolled = ref(false)
const mobileNav = useTemplateRef<HTMLElement>('mobileNav')
const locationsMenu = useTemplateRef<HTMLElement>('locationsMenu')
const orderMenu = useTemplateRef<HTMLElement>('orderMenu')

const SHOW_THRESHOLD = 8 // px of upward scroll before revealing
const HIDE_AFTER = 120 // px from top before hiding is allowed

let lastY = 0
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const y = window.scrollY
    scrolled.value = y > 8
    if (y > lastY && y > HIDE_AFTER) hidden.value = true
    else if (lastY - y > SHOW_THRESHOLD || y <= HIDE_AFTER) hidden.value = false
    lastY = y
    ticking = false
  })
}

function closeMenus() {
  for (const el of [mobileNav.value, locationsMenu.value, orderMenu.value]) {
    if (el?.matches(':popover-open')) el.hidePopover()
  }
}

// Close any open popover after navigation
watch(() => route.fullPath, closeMenus)

onMounted(() => {
  lastY = window.scrollY
  scrolled.value = lastY > 8
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// Transparent + light text only while at the top of a page that opted in
// with definePageMeta({ heroOverlay: true }); solid everywhere else.
const solid = computed(() => scrolled.value || !route.meta.heroOverlay)

const linkTone = computed(() => solid.value
  ? 'text-muted hover:text-highlighted'
  : 'text-white/80 hover:text-white')
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-[transform,background-color,box-shadow] duration-300 ease-out"
    :class="[
      hidden ? '-translate-y-full' : 'translate-y-0',
      solid ? 'border-b-[3px] border-double border-default bg-default/95 shadow-soft backdrop-blur-md' : 'bg-gradient-to-b from-black/40 to-transparent'
    ]"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <!-- Parent mark: round Cuban flag + the menu's motto. Deliberately
           brand-neutral so Mojito guests don't think they're on the wrong site. -->
      <NuxtLink
        :to="localePath('index')"
        class="group flex shrink-0 items-center gap-2.5 leading-none"
        :aria-label="t('Site.name')"
      >
        <img
          src="/images/brand/flag-round.webp"
          alt=""
          width="40"
          height="40"
          class="size-10 rounded-full shadow-soft transition-transform duration-500 group-hover:rotate-[20deg]"
        >
        <!-- Hidden on the narrowest phones (<360px): with the order and menu
             buttons it would push the header past the screen edge. -->
        <span
          class="hidden font-script text-lg min-[360px]:inline"
          :class="solid ? 'text-primary' : 'text-white/85'"
          aria-hidden="true"
        ><BrandText :text="t('Site.motto')" /></span>
      </NuxtLink>

      <!-- Desktop nav (xl+: 7 items need the room) -->
      <nav :aria-label="t('AppHeader.mainNav')" class="hidden xl:block">
        <ul class="flex items-center gap-0.5">
          <li>
            <button
              type="button"
              popovertarget="locations-menu"
              class="group relative inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-2 font-copperplate text-[0.9rem] tracking-[0.03em] transition-colors"
              :class="linkTone"
              style="anchor-name: --locations-btn"
            >
              <UIcon name="i-lucide-map-pin" class="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              <BrandText :text="t('AppHeader.locations')" />
              <UIcon name="i-lucide-chevron-down" class="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>
          </li>
          <li v-for="item in headerNav" :key="item.name">
            <NuxtLink
              :to="localePath(item.name)"
              class="group relative inline-flex items-center whitespace-nowrap px-2 py-2 font-copperplate text-[0.9rem] tracking-[0.03em] transition-colors"
              :class="linkTone"
            >
              <BrandText :text="t(item.labelKey)" />
              <span
                class="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <!-- Language switch -->
        <NuxtLink
          v-if="otherLocale"
          :to="switchLocalePath(otherLocale.code)"
          :aria-label="t('AppHeader.switchLanguageLabel')"
          class="btn-menu frame-sm group hidden whitespace-nowrap px-3 py-1.5 text-xs text-highlighted sm:inline-flex"
        >
          <UIcon name="i-lucide-languages" class="size-4 transition-transform duration-300 group-hover:rotate-12" />
          <span aria-hidden="true">{{ otherLocale.code.toUpperCase() }}</span>
        </NuxtLink>

        <!-- Order online -->
        <button
          type="button"
          popovertarget="order-menu"
          class="btn-menu frame-dark-sm group whitespace-nowrap px-4 py-2 text-sm"
          style="anchor-name: --order-btn"
          :aria-label="t('AppHeader.orderOnline')"
        >
          <UIcon name="i-lucide-shopping-bag" class="size-4 transition-transform group-hover:-rotate-12" aria-hidden="true" />
          <span class="hidden sm:inline"><BrandText :text="t('AppHeader.orderOnline')" /></span>
        </button>

        <!-- Mobile menu trigger -->
        <button
          type="button"
          popovertarget="mobile-nav"
          class="inline-flex size-10 items-center justify-center rounded-full transition-colors xl:hidden"
          :class="solid ? 'text-highlighted hover:bg-elevated' : 'text-white hover:bg-white/10'"
          :aria-label="t('AppHeader.openMenu')"
        >
          <UIcon name="i-lucide-menu" class="size-6" />
        </button>
      </div>
    </div>

    <!-- Locations dropdown (desktop) -->
    <div
      id="locations-menu"
      ref="locationsMenu"
      popover
      class="anchored-menu frame w-[22rem] bg-transparent p-3 drop-shadow-xl"
      style="position-anchor: --locations-btn"
    >
      <ul>
        <li v-for="l in LOCATIONS" :key="l.slug">
          <NuxtLink
            :to="localePath({ name: 'location', params: { location: l.slug } })"
            class="group flex items-center gap-3 p-3 transition-colors hover:bg-muted"
          >
            <span class="flex h-10 w-16 shrink-0 items-center justify-center">
              <img :src="l.logo ?? '/images/brand/flag-round.webp'" alt="" class="max-h-10 w-auto mix-blend-multiply">
            </span>
            <span class="flex-1">
              <span class="block font-semibold text-highlighted"><BrandText :text="l.brand" /></span>
              <span class="block text-xs text-muted">{{ l.area }} · {{ l.address.street }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-4 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Order online dropdown -->
    <div
      id="order-menu"
      ref="orderMenu"
      popover
      class="anchored-menu anchored-menu--end frame w-[min(22rem,calc(100vw-2rem))] bg-transparent p-3 drop-shadow-xl"
      style="position-anchor: --order-btn"
    >
      <ul>
        <li v-for="l in LOCATIONS" :key="l.slug" class="p-3 transition-colors hover:bg-muted">
          <p class="font-semibold text-highlighted">
            <BrandText :text="l.brand" /> <span class="text-xs font-normal text-muted">· {{ l.area }}</span>
          </p>
          <p class="mt-2 flex gap-2">
            <a
              :href="l.ordering.pickup"
              target="_blank"
              rel="noopener"
              class="btn-menu frame-dark-sm gap-1 px-3 py-1.5 text-xs"
            >
              <UIcon name="i-lucide-shopping-bag" class="size-3.5" aria-hidden="true" />
              <BrandText :text="t('AppHeader.pickup')" />
            </a>
            <a
              :href="l.ordering.delivery"
              target="_blank"
              rel="noopener"
              class="btn-menu frame-sm gap-1 px-3 py-1.5 text-xs text-highlighted"
            >
              <UIcon name="i-lucide-bike" class="size-3.5" aria-hidden="true" />
              <BrandText :text="t('AppHeader.delivery')" />
            </a>
          </p>
        </li>
      </ul>
    </div>

    <!-- ── Mobile nav: full-screen popover ─────────────────── -->
    <nav
      id="mobile-nav"
      ref="mobileNav"
      popover
      :aria-label="t('AppHeader.mainNav')"
      class="mobile-nav m-0 h-dvh max-h-none w-screen max-w-none overflow-x-clip overflow-y-auto bg-inverted p-0 text-inverted"
    >
      <!-- Palm fronds in the corner, like the drink menu -->
      <MenuArt name="palm-cluster" class="pointer-events-none absolute -right-20 -top-10 w-72 -scale-x-100 opacity-60" />

      <div class="relative flex min-h-full flex-col px-6 pb-8 pt-4">
        <!-- Top bar -->
        <div class="flex h-12 items-center justify-between">
          <NuxtLink :to="localePath('index')" class="flex items-center gap-2.5 leading-none" :aria-label="t('Site.name')">
            <img src="/images/brand/flag-round.webp" alt="" class="size-10 rounded-full">
            <span class="font-script text-lg text-gold-300" aria-hidden="true"><BrandText :text="t('Site.motto')" /></span>
          </NuxtLink>
          <button
            type="button"
            popovertarget="mobile-nav"
            popovertargetaction="hide"
            class="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-transform hover:rotate-90"
            :aria-label="t('AppHeader.closeMenu')"
          >
            <UIcon name="i-lucide-x" class="size-6" />
          </button>
        </div>

        <!-- Primary links: big display type, staggered in -->
        <ul class="mt-10 space-y-1">
          <li
            v-for="(item, i) in appConfig.nav"
            :key="item.name"
            class="mobile-nav-item"
            :style="{ '--i': i }"
          >
            <NuxtLink
              :to="localePath(item.name)"
              class="group flex items-center justify-between py-2 font-display text-4xl font-semibold tracking-tight"
              active-class="text-primary"
            >
              <BrandText :text="t(item.labelKey)" />
              <UIcon name="i-lucide-arrow-right" class="size-6 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>

        <!-- Locations -->
        <p class="mobile-nav-item mt-10 text-xs font-semibold uppercase tracking-[0.2em] opacity-60" :style="{ '--i': appConfig.nav.length }">
          <BrandText :text="t('AppHeader.locations')" />
        </p>
        <ul class="mt-3 grid grid-cols-2 gap-3">
          <li
            v-for="(l, i) in LOCATIONS"
            :key="l.slug"
            class="mobile-nav-item"
            :style="{ '--i': appConfig.nav.length + 1 + i }"
          >
            <NuxtLink
              :to="localePath({ name: 'location', params: { location: l.slug } })"
              class="frame-dark-sm flex h-full flex-col p-4 transition-colors hover:text-gold-300"
              active-class="ring-primary"
            >
              <span class="font-semibold leading-tight"><BrandText :text="l.brand" /></span>
              <span class="mt-1 text-xs opacity-60">{{ l.area }}</span>
            </NuxtLink>
          </li>
        </ul>

        <!-- Bottom actions -->
        <div class="mobile-nav-item mt-auto flex flex-col gap-3 pt-10" :style="{ '--i': appConfig.nav.length + 6 }">
          <button
            type="button"
            popovertarget="order-menu"
            class="btn-menu frame-sm w-full py-4 text-lg text-highlighted"
          >
            <UIcon name="i-lucide-shopping-bag" class="size-5" aria-hidden="true" />
            <BrandText :text="t('AppHeader.orderOnline')" />
          </button>
          <NuxtLink
            v-if="otherLocale"
            :to="switchLocalePath(otherLocale.code)"
            :aria-label="t('AppHeader.switchLanguageLabel')"
            class="btn-menu w-full border-2 border-parchment-400/40 py-3"
          >
            <UIcon name="i-lucide-languages" class="size-5" aria-hidden="true" />
            <BrandText :text="t('AppHeader.switchLanguage')" />
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* ── Desktop dropdowns: CSS anchor positioning ─────────────
   Browsers without it fall back to the UA popover default
   (centered in the viewport) — still usable. */
@supports (position-anchor: --a) {
  .anchored-menu {
    margin: 0;
    inset: auto;
    top: calc(anchor(bottom) + 0.5rem);
    left: anchor(left);
    position-try-fallbacks: flip-inline;
  }

  .anchored-menu--end {
    left: auto;
    right: anchor(right);
  }
}

.anchored-menu {
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.18s ease-out, transform 0.18s ease-out, overlay 0.18s allow-discrete, display 0.18s allow-discrete;
}

.anchored-menu:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .anchored-menu:popover-open {
    opacity: 0;
    transform: translateY(-6px);
  }
}

/* ── Mobile full-screen menu ─────────────────────────────── */
.mobile-nav {
  inset: 0;
  opacity: 0;
  clip-path: circle(0% at calc(100% - 2.5rem) 2rem);
  transition:
    opacity 0.3s ease-out,
    clip-path 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.45s allow-discrete,
    display 0.45s allow-discrete;
}

.mobile-nav:popover-open {
  opacity: 1;
  clip-path: circle(150% at calc(100% - 2.5rem) 2rem);
}

@starting-style {
  .mobile-nav:popover-open {
    opacity: 0;
    clip-path: circle(0% at calc(100% - 2.5rem) 2rem);
  }
}

.mobile-nav::backdrop {
  background: transparent;
}

/* Staggered item entrance, driven by --i */
.mobile-nav-item {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(0.12s + var(--i, 0) * 0.04s);
}

.mobile-nav:popover-open .mobile-nav-item {
  opacity: 1;
  transform: none;
}

@starting-style {
  .mobile-nav:popover-open .mobile-nav-item {
    opacity: 0;
    transform: translateY(16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-nav,
  .mobile-nav-item,
  .anchored-menu {
    transition: none;
    clip-path: none;
  }
}
</style>
