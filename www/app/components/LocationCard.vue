<script setup lang="ts">
// Location card in the drink-menu frame. Each restaurant keeps its own logo
// inside the shared parent frame (brand architecture: parent system, own marks).
import type { RestaurantLocation } from '~/utils/locations'
import { IMAGES } from '~/utils/images'

defineProps<{ location: RestaurantLocation }>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <article :data-brand="location.theme" class="frame group relative flex h-full flex-col p-4 transition-transform duration-300 hover:-translate-y-1.5">
    <div class="relative aspect-[16/10] overflow-hidden border-2 border-inverted">
      <img
        :src="IMAGES[location.imageId]"
        :alt="t(`Images.${location.imageId}.alt`)"
        loading="lazy"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
      <span class="frame-dark-sm absolute left-2 top-2 px-3 py-1 font-eurostar text-[0.65rem] uppercase tracking-wider">
        {{ location.area }}
      </span>
    </div>

    <div class="flex flex-1 flex-col px-2 pb-2 pt-5">
      <img
        v-if="location.logo"
        :src="location.logo"
        alt=""
        loading="lazy"
        class="mb-3 h-10 w-auto self-start mix-blend-multiply"
      >
      <h3 class="font-display text-2xl font-bold text-highlighted">
        <!-- Stretched link: whole card is clickable, one accessible link -->
        <NuxtLink
          :to="localePath({ name: 'location', params: { location: location.slug } })"
          class="after:absolute after:inset-0 after:content-['']"
        >
          <BrandText :text="location.brand" />
        </NuxtLink>
      </h3>
      <p class="mt-1 font-condensed text-base text-muted">
        {{ location.address.street }}, {{ location.address.city }}
      </p>
      <p class="mt-auto flex items-center justify-between pt-6">
        <span class="font-script text-xl text-primary"><BrandText :text="t('PageLocation.since', { year: location.since })" /></span>
        <UIcon name="i-lucide-arrow-right" class="size-5 text-primary transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </p>
    </div>
  </article>
</template>
