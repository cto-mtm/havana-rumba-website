<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative mt-24 overflow-hidden border-t-[3px] border-double border-default bg-muted">
    <!-- Palm fronds hanging into the corners, like the drink menu -->
    <MenuArt name="palm-cluster" class="pointer-events-none absolute -right-20 -top-12 hidden w-80 -scale-x-100 rotate-[6deg] md:block" />

    <div class="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr_1fr] lg:px-8">
      <!-- Parent brand -->
      <div>
        <NuxtLink :to="localePath('index')" class="group inline-flex items-center gap-3 leading-none" :aria-label="t('Site.name')">
          <img
            src="/images/brand/flag-round.webp"
            alt=""
            width="48"
            height="48"
            loading="lazy"
            class="size-12 rounded-full shadow-soft transition-transform duration-500 group-hover:rotate-[20deg]"
          >
          <span class="font-script text-2xl text-primary" aria-hidden="true"><BrandText :text="t('Site.motto')" /></span>
        </NuxtLink>
        <p class="mt-3 max-w-xs text-sm text-muted">
          <BrandText :text="t('Site.tagline')" />
        </p>
        <ul v-if="appConfig.social.length" class="flex gap-3 pt-4" :aria-label="t('AppFooter.followUs')">
          <li v-for="s in appConfig.social" :key="s.href">
            <a
              :href="s.href"
              :aria-label="s.label"
              target="_blank"
              rel="noopener"
              class="frame-sm inline-flex size-10 items-center justify-center text-highlighted transition-transform hover:-translate-y-0.5"
            >
              <UIcon :name="s.icon" class="size-4" />
            </a>
          </li>
        </ul>
      </div>

      <!-- Locations (NAP: name, address, phone — consistent for local SEO) -->
      <section :aria-label="t('AppFooter.locations')">
        <p class="mb-4 font-eurostar text-xs uppercase tracking-wider text-dimmed">
          <BrandText :text="t('AppFooter.locations')" />
        </p>
        <ul class="grid gap-6 sm:grid-cols-2">
          <li v-for="l in LOCATIONS" :key="l.slug">
            <address class="not-italic">
              <NuxtLink
                :to="localePath({ name: 'location', params: { location: l.slug } })"
                class="group inline-flex items-center gap-1.5 font-semibold text-highlighted hover:text-primary"
              >
                <BrandText :text="l.brand" />
                <UIcon name="i-lucide-arrow-right" class="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
              </NuxtLink>
              <span class="block text-sm text-muted">{{ l.address.street }}, {{ l.address.city }}, {{ l.address.region }} {{ l.address.postalCode }}</span>
              <a :href="telHref(l.phone)" class="text-sm text-muted hover:text-highlighted">{{ l.phone }}</a>
            </address>
          </li>
        </ul>
      </section>

      <!-- Explore -->
      <nav :aria-label="t('AppFooter.explore')">
        <p class="mb-4 font-eurostar text-xs uppercase tracking-wider text-dimmed">
          <BrandText :text="t('AppFooter.explore')" />
        </p>
        <ul class="space-y-2">
          <li v-for="item in appConfig.nav" :key="item.name">
            <NuxtLink
              :to="localePath(item.name)"
              class="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-highlighted"
            >
              <UIcon :name="item.icon" class="size-3.5 text-primary transition-transform duration-200 group-hover:scale-125" />
              <BrandText :text="t(item.labelKey)" />
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="border-t border-default">
      <p class="mx-auto max-w-7xl px-4 py-6 text-xs text-dimmed sm:px-6 lg:px-8">
        © {{ year }} <BrandText :text="t('Site.name')" />. <BrandText :text="t('AppFooter.rights')" />
      </p>
    </div>
  </footer>
</template>
