<script setup lang="ts">
// Masonry gallery with category filters and a native <dialog> lightbox.
definePageMeta({ heroOverlay: true })

import { IMAGES, type ImageId } from '~/utils/images'

const { t } = useI18n()

useSeoMeta({
  title: () => t('PageGallery.seoTitle'),
  description: () => t('PageGallery.seoDescription'),
  ogImage: '/images/ambience/table-spread-mural.webp'
})

type Category = 'food' | 'drinks' | 'ambience'
interface Photo { id: ImageId, category: Category }

const photos: Photo[] = [
  { id: 'tableSpreadMural', category: 'ambience' },
  { id: 'churrasco', category: 'food' },
  { id: 'bloodyMary', category: 'drinks' },
  { id: 'roastChicken', category: 'food' },
  { id: 'appetizerSpread', category: 'food' },
  { id: 'mojito', category: 'drinks' },
  { id: 'cubanSandwich', category: 'food' },
  { id: 'croquetas', category: 'food' },
  { id: 'bar', category: 'ambience' },
  { id: 'chickenPeppers', category: 'food' },
  { id: 'sangria', category: 'drinks' },
  { id: 'layerCake', category: 'food' },
  { id: 'steakOnions', category: 'food' },
  { id: 'garlicShrimp', category: 'food' },
  { id: 'cocktailsPair', category: 'drinks' },
  { id: 'grilledFish', category: 'food' },
  { id: 'diningRoomYellow', category: 'ambience' },
  { id: 'empanadas', category: 'food' },
  { id: 'breadPudding', category: 'food' },
  { id: 'coconutCocktail', category: 'drinks' },
  { id: 'seafoodStew', category: 'food' },
  { id: 'chickenStew', category: 'food' },
  { id: 'cafeConLeche', category: 'drinks' },
  { id: 'tamal', category: 'food' },
  { id: 'shrimpCeviche', category: 'food' },
  { id: 'diningRoom', category: 'ambience' }
]

const filters = ['all', 'food', 'drinks', 'ambience'] as const
const active = ref<(typeof filters)[number]>('all')
const visible = computed(() => active.value === 'all' ? photos : photos.filter(p => p.category === active.value))

const dialog = useTemplateRef<HTMLDialogElement>('lightbox')
const current = ref<Photo | null>(null)

function open(photo: Photo) {
  current.value = photo
  dialog.value?.showModal()
}
function close() {
  dialog.value?.close()
}
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('PageGallery.eyebrow')"
      :title="t('PageGallery.title')"
      :intro="t('PageGallery.intro')"
      image-id="appetizerSpread"
    />

    <section class="section-overlap px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div role="group" :aria-label="t('PageGallery.filterLabel')" class="flex flex-wrap justify-center gap-2">
          <button
            v-for="f in filters"
            :key="f"
            type="button"
            :aria-pressed="active === f"
            class="btn-menu px-5 py-2 text-sm"
            :class="active === f ? 'frame-dark-sm' : 'frame-sm text-muted hover:text-highlighted'"
            @click="active = f"
          >
            {{ t(`PageGallery.filters.${f}`) }}
          </button>
        </div>

        <ul class="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          <li v-for="p in visible" :key="p.id" class="mb-4 break-inside-avoid">
            <figure class="frame group relative p-2.5">
              <button
                type="button"
                class="block w-full cursor-zoom-in overflow-hidden"
                :aria-label="t('PageGallery.open', { name: t(`Images.${p.id}.caption`) })"
                @click="open(p)"
              >
                <img
                  :src="IMAGES[p.id]"
                  :alt="t(`Images.${p.id}.alt`)"
                  loading="lazy"
                  class="w-full transition-transform duration-500 group-hover:scale-105"
                >
              </button>
              <figcaption class="pointer-events-none absolute inset-x-2.5 bottom-2.5 translate-y-2 bg-gradient-to-t from-black/75 to-transparent p-4 font-display text-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {{ t(`Images.${p.id}.caption`) }}
              </figcaption>
            </figure>
          </li>
        </ul>
      </div>
    </section>

    <dialog
      ref="lightbox"
      class="m-auto max-h-[92dvh] max-w-[min(92vw,1200px)] overflow-visible bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      :aria-label="current ? t(`Images.${current.id}.caption`) : undefined"
      @click.self="close"
    >
      <figure v-if="current" class="relative">
        <img :src="IMAGES[current.id]" :alt="t(`Images.${current.id}.alt`)" class="frame-sm max-h-[85dvh] w-auto p-2 shadow-deep">
        <figcaption class="mt-3 text-center font-display text-xl text-white">
          {{ t(`Images.${current.id}.caption`) }}
        </figcaption>
        <button
          type="button"
          class="frame-dark-sm absolute -right-3 -top-3 inline-flex size-11 items-center justify-center transition-transform hover:rotate-90"
          :aria-label="t('PageGallery.close')"
          @click="close"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </figure>
    </dialog>
  </div>
</template>
