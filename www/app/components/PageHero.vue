<script setup lang="ts">
// Interior-page header: Spanish eyebrow + main <h1> (the live site's
// "Nuestra Historia / About Us" pattern), with an optional photo backdrop.
// The photo is decorative (alt="") — the heading carries the meaning.
import { IMAGES, type ImageId } from '~/utils/images'

const props = defineProps<{
  eyebrow?: string
  title: string
  intro?: string
  imageId?: ImageId
}>()

const image = computed(() => props.imageId ? IMAGES[props.imageId] : undefined)
</script>

<template>
  <section
    class="relative -mt-16 flex min-h-[55svh] items-end overflow-hidden pb-28 pt-32 sm:pb-32"
    :class="image ? 'text-white' : 'bg-muted text-highlighted'"
  >
    <div v-if="image" class="plane-back" aria-hidden="true">
      <img
        :src="image"
        alt=""
        class="parallax-slow size-full scale-110 object-cover"
        fetchpriority="high"
      >
      <div class="scrim absolute inset-0" />
    </div>

    <div class="plane-front mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <p
        v-if="eyebrow"
        class="reveal mb-2 font-script text-2xl sm:text-3xl"
        :class="image ? 'text-(--brand-accent)' : 'text-primary'"
      >
        {{ eyebrow }}
      </p>
      <h1 class="reveal font-display text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
        <BrandText :text="title" />
      </h1>
      <p
        v-if="intro"
        class="reveal reveal-delay-1 mt-5 max-w-2xl text-lg"
        :class="image ? 'text-white/85' : 'text-muted'"
      >
        <BrandText :text="intro" />
      </p>
      <slot />
    </div>
  </section>
</template>
